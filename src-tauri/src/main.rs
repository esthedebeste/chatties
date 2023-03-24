#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
colon_3_init!();

mod credentials;
mod irc_types;
mod message_history;
mod utils;

use anyhow::Result;
use credentials::Credentials;
use irc_types::{Names, PrivMsg, TwitchChannelBasics};
use macros::{colon_3_init, command};
use message_history::get_recent_messages;
use std::fs::create_dir_all;
use std::sync::Arc;
use tauri::async_runtime::Mutex;
use tauri::{AppHandle, Manager, Window};
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender};
use tokio::{select, try_join};
use twitch_irc::message::{IRCMessage, IRCTags, ServerMessage};
use twitch_irc::TwitchIRCClient as GTwitchIRCClient;
use twitch_irc::{ClientConfig, SecureTCPTransport};
use utils::get_data_dir;

use crate::irc_types::{Join, Part};

type TwitchIRCClient = GTwitchIRCClient<SecureTCPTransport, Credentials>;

struct TwitchState {
    credentials: Mutex<Credentials>,
    logged_in_messages: Arc<Mutex<UnboundedReceiver<ServerMessage>>>,
    anon_client: TwitchIRCClient,
    logged_in_client: Mutex<TwitchIRCClient>,
    log_out_sender: UnboundedSender<()>,
    reqwest: reqwest::Client,
}

#[command]
async fn get_credentials(state: tauri::State<'_, TwitchState>) -> Result<Credentials, ()> {
    Ok(state.credentials.lock().await.clone())
}

#[command]
async fn join_channel(
    window: Window,
    state: tauri::State<'_, TwitchState>,
    channel: &str,
) -> Result<(), String> {
    let messages = get_recent_messages(&state.reqwest, channel).await;
    if let Ok(messages) = messages {
        for message in messages {
            emit_irc(&window, message).map_err(|err| err.to_string())?;
        }
    } else {
        eprintln!("Failed to get recent messages: {:?}", messages);
        // allow error to pass through, history is not critical
    }
    state
        .anon_client
        .join(channel.to_owned())
        .map_err(|e| e.to_string())
}

#[command]
async fn leave_channel(state: tauri::State<'_, TwitchState>, channel: String) -> Result<(), ()> {
    state.anon_client.part(channel);
    Ok(())
}

#[command]
async fn log_in(
    app: AppHandle,
    state: tauri::State<'_, TwitchState>,
    login: String,
    token: String,
    client_id: String,
) -> Result<(), String> {
    let creds = Credentials {
        login: login.clone(),
        token: Some(token),
        client_id: Some(client_id),
    };
    creds.write(&app).map_err(|e| e.to_string())?;
    *state.credentials.lock().await = creds.clone();
    let (messages, client) = TwitchIRCClient::new(ClientConfig::new_simple(creds));
    state.log_out_sender.send(()).map_err(|e| e.to_string())?;
    *state.logged_in_client.lock().await = client;
    *state.logged_in_messages.lock().await = messages;
    println!("Logged in as {login}");
    Ok(())
}

#[command]
async fn log_out(app: AppHandle, state: tauri::State<'_, TwitchState>) -> Result<(), String> {
    let creds = Credentials::anonymous();
    creds.write(&app).map_err(|e| e.to_string())?;
    *state.credentials.lock().await = creds.clone();
    let (mut inc, logged_in_client) = TwitchIRCClient::new(ClientConfig::new_simple(creds));
    inc.close();
    state.log_out_sender.send(()).map_err(|e| e.to_string())?;
    *state.logged_in_client.lock().await = logged_in_client;
    println!("Logged out");
    Ok(())
}

#[command]
async fn send_message(
    state: tauri::State<'_, TwitchState>,
    message: String,
    channel: String,
) -> Result<(), String> {
    state
        .logged_in_client
        .lock()
        .await
        .say(channel, message)
        .await
        .map_err(|e| e.to_string())
}

fn emit_irc(window: &Window, message: ServerMessage) -> Result<()> {
    match message {
        ServerMessage::Privmsg(msg) => {
            let privmsg = PrivMsg {
                channel: TwitchChannelBasics {
                    id: &msg.channel_id,
                    login: &msg.channel_login,
                },
                message_text: &msg.message_text,
                sender: (&msg.sender).into(),
                badges: msg.badges.iter().map(|badge| badge.into()).collect(),
                bits: msg.bits,
                name_hex: msg.name_color.map(|color| color.into()),
                emotes: msg.emotes.iter().map(|emote| emote.into()).collect(),
                message_id: &msg.message_id,
                server_timestamp_str: &msg.server_timestamp.to_rfc3339(),
            };
            window.emit("priv-msg", privmsg)?;
        }
        ServerMessage::Join(msg) => {
            window.emit(
                "join",
                Join {
                    channel: msg.channel_login.trim_start_matches('#'),
                    user: &msg.user_login,
                },
            )?;
        }
        ServerMessage::Part(msg) => {
            window.emit(
                "part",
                Part {
                    channel: msg.channel_login.trim_start_matches('#'),
                    user: &msg.user_login,
                },
            )?;
        }
        ServerMessage::Ping(_) | ServerMessage::Pong(_) => {}
        _ => {
            #[cfg(debug_assertions)]
            let irc = IRCMessage::from(message.clone());
            #[cfg(not(debug_assertions))]
            let irc = IRCMessage::from(message);
            match irc.command.as_str() {
                "353" => {
                    let names = irc.params[3].split(' ').collect();
                    window.emit(
                        "names",
                        Names {
                            channel: &irc.params[2],
                            names,
                        },
                    )?;
                }
                // welcome & motd
                "001" | "002" | "003" | "004" | "372" | "375" | "376" => {}
                _ => {
                    #[cfg(debug_assertions)]
                    eprintln!("Unhandled IRC message: {:?}", message);
                }
            }
        }
    }
    Ok(())
}

#[command]
async fn open_login() -> Result<(), String> {
    open::that("https://chatties-auth.esthe.live/").map_err(|err| err.to_string())
}

#[command]
async fn open_plugin_dir(app: AppHandle) -> Result<(), String> {
    let plugins_dir = get_data_dir(&app)
        .map_err(|err| err.to_string())?
        .join("plugins");
    create_dir_all(&plugins_dir).map_err(|err| err.to_string())?;
    open::that(plugins_dir).map_err(|err| err.to_string())
}

#[command]
async fn get_plugins(app: AppHandle) -> Result<Vec<String>, String> {
    let plugins_dir = get_data_dir(&app)
        .map_err(|err| err.to_string())?
        .join("plugins");
    if !plugins_dir.exists() {
        return Ok(vec![]);
    }
    let mut plugins = vec![];
    for entry in std::fs::read_dir(plugins_dir).map_err(|err| err.to_string())? {
        let entry = entry.map_err(|err| err.to_string())?;
        let path = entry.path();
        let ext = path.extension();
        if matches!(ext, Some(ext) if ext=="js") && path.is_file() {
            plugins.push(path.to_str().unwrap().to_string());
        }
    }
    Ok(plugins)
}

async fn request_twitch_capability(client: &TwitchIRCClient, str: &str) -> Result<()> {
    client
        .send_message(IRCMessage {
            tags: IRCTags::new(),
            prefix: None,
            command: "CAP".to_owned(),
            params: vec!["REQ".to_owned(), str.to_owned()],
        })
        .await?;
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_credentials,
            log_in,
            log_out,
            join_channel,
            leave_channel,
            send_message,
            open_login,
            get_plugins,
            open_plugin_dir
        ])
        .build(tauri::generate_context!())?;

    let credentials = Credentials::read(&app)?;
    let (mut anon_messages, anon_client) =
        TwitchIRCClient::new(ClientConfig::new_simple(Credentials::anonymous()));
    let (logged_in_messages, logged_in_client) =
        TwitchIRCClient::new(ClientConfig::new_simple(credentials.clone()));
    let logged_in_messages = Arc::new(Mutex::new(logged_in_messages));
    let main_window = app.get_window("main").expect("Failed to get main window");
    let logged_in_messages_handle = logged_in_messages.clone();
    let main_window_handle = main_window.clone();
    let (log_out_sender, mut log_out_receiver) = tokio::sync::mpsc::unbounded_channel();
    tauri::async_runtime::spawn(async move {
        while let Some(message) = anon_messages.recv().await {
            if let Err(error) = emit_irc(&main_window_handle, message.clone()) {
                eprintln!("Error while emitting IRC message: {}", error);
            }
        }
    });
    tauri::async_runtime::spawn(async move {
        loop {
            let mut messages = logged_in_messages_handle.lock().await;
            select! {
                Some(_) = log_out_receiver.recv() => continue,
                message = messages.recv() => {
                    if let Some(message) = message {
                        if let Err(error) = emit_irc(&main_window, message.clone()) {
                            eprintln!("Error while emitting IRC message: {}", error);
                        }
                    } else {
                        continue;
                    }
                }
            }
        }
    });

    try_join!(
        request_twitch_capability(&anon_client, "twitch.tv/membership"), // for names, join, part
        request_twitch_capability(&logged_in_client, "twitch.tv/tags"), // to know info about self, not channel-specific
        request_twitch_capability(&logged_in_client, "twitch.tv/commands") // to know info about self, not channel-specific
    )?;
    app.manage(TwitchState {
        credentials: Mutex::new(credentials),
        logged_in_messages,
        logged_in_client: Mutex::new(logged_in_client),
        log_out_sender,
        anon_client,
        reqwest: reqwest::Client::new(),
    });
    app.run(|_app, _event| {});
    Ok(())
}
