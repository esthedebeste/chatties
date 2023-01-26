#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod credentials;

use credentials::Credentials;

use tauri::{AppHandle, Manager, Window};
use twitch_irc::login::StaticLoginCredentials;
use twitch_irc::message::{IRCMessage, ServerMessage};
use twitch_irc::TwitchIRCClient;
use twitch_irc::{ClientConfig, SecureTCPTransport};

struct TwitchState {
    credentials: Credentials,
    read_client: TwitchIRCClient<SecureTCPTransport, StaticLoginCredentials>,
    write_client: TwitchIRCClient<SecureTCPTransport, StaticLoginCredentials>,
}

#[tauri::command]
fn get_credentials(state: tauri::State<TwitchState>) -> Credentials {
    state.credentials.clone()
}

#[tauri::command]
fn join_channel(state: tauri::State<TwitchState>, channel: String) -> Result<(), String> {
    state
        .read_client
        .join(channel.clone())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn leave_channel(state: tauri::State<TwitchState>, channel: String) {
    state.read_client.part(channel.clone());
}

#[tauri::command]
fn log_in(app: AppHandle, login: String, token: String, client_id: String) {
    Credentials {
        creds: StaticLoginCredentials::new(login, Some(token)),
        client_id: Some(client_id),
    }
    .write(&app);
    app.restart();
}

#[tauri::command]
fn log_out(app: AppHandle) {
    Credentials {
        creds: StaticLoginCredentials::anonymous(),
        client_id: None,
    }
    .write(&app);
    app.restart();
}

#[tauri::command]
async fn send_message(
    state: tauri::State<'_, TwitchState>,
    message: String,
    channel: String,
) -> Result<(), String> {
    let res = state
        .write_client
        .say(channel, message)
        .await
        .map_err(|e| e.to_string());
    if res.is_err() {
        println!("Error sending message: {:?}", res);
    }
    res
}

async fn emit_irc(window: &Window, message: ServerMessage) -> Result<(), String> {
    match message {
        ServerMessage::Privmsg(msg) => {
            window
                .emit("priv-msg", msg)
                .map_err(|err| format!("Failed to emit message: {err}"))?;
        }
        _ => {}
    }
    Ok(())
}

#[tauri::command]
async fn process_raw_irc(window: Window, raw_irc: &str) -> Result<(), String> {
    let irc_message = IRCMessage::parse(raw_irc).map_err(|err| err.to_string())?;
    let server_message = ServerMessage::try_from(irc_message).map_err(|err| err.to_string())?;
    emit_irc(&window, server_message).await?;
    Ok(())
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let credentials = Credentials::read(app);
            let (mut incoming_messages, read_client) =
                TwitchIRCClient::<SecureTCPTransport, StaticLoginCredentials>::new(
                    ClientConfig::new_simple(credentials.creds.clone()),
                );
            let (mut incoming_write_messages, write_client) =
                TwitchIRCClient::<SecureTCPTransport, StaticLoginCredentials>::new(
                    ClientConfig::new_simple(credentials.creds.clone()),
                );
            incoming_write_messages.close();
            app.manage(TwitchState {
                credentials: credentials.clone(),
                read_client,
                write_client,
            });
            let main_window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                while let Some(message) = incoming_messages.recv().await {
                    emit_irc(&main_window, message.clone()).await.unwrap();
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_credentials,
            log_in,
            log_out,
            join_channel,
            leave_channel,
            process_raw_irc,
            send_message
        ])
        .run(tauri::generate_context!())
        .expect("D:");
}
