use anyhow::Result;
use serde::Deserialize;
use twitch_irc::message::{IRCMessage, ServerMessage};

#[derive(Deserialize)]
struct RecentMessagesResponse {
    messages: Vec<String>,
}

pub async fn get_recent_messages(
    client: &reqwest::Client,
    channel: &str,
) -> Result<Vec<ServerMessage>> {
    let messages = client
        .get(format!(
            "https://recent-messages.robotty.de/api/v2/recent-messages/{}?limit=50",
            channel.to_lowercase()
        ))
        .header("Accept", "application/json")
        .send()
        .await?
        .json::<RecentMessagesResponse>()
        .await?
        .messages
        .into_iter()
        .map(|msg| IRCMessage::parse(&msg).map(ServerMessage::try_from))
        .map(|res| -> Result<ServerMessage> {
            match res {
                Ok(Ok(msg)) => Ok(msg),
                Ok(Err(e)) => Err(e.into()),
                Err(e) => Err(e.into()),
            }
        })
        .collect::<Vec<_>>();
    let mut flat = vec![];
    flat.reserve_exact(messages.len());
    for message in messages {
        flat.push(message?);
    }
    Ok(flat)
}
