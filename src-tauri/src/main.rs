#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod credentials;
mod message_history;
mod utils;

use anyhow::Result;
use credentials::Credentials;
use message_history::get_recent_messages;
use std::fs::create_dir_all;
use tauri::async_runtime::Mutex;
use tauri::{AppHandle, Manager, Window};
use twitch_irc::login::StaticLoginCredentials;
use twitch_irc::message::ServerMessage;
use twitch_irc::TwitchIRCClient as GTwitchIRCClient;
use twitch_irc::{ClientConfig, SecureTCPTransport};
use utils::get_data_dir;

type TwitchIRCClient = GTwitchIRCClient<SecureTCPTransport, StaticLoginCredentials>;
struct TwitchState {
    read_client: TwitchIRCClient,
    credentials: Mutex<Credentials>,
    write_client: Mutex<TwitchIRCClient>,
    reqwest: reqwest::Client,
}

#[tauri::command]
async fn get_credentials(state: tauri::State<'_, TwitchState>) -> Result<Credentials, ()> {
    Ok(state.credentials.lock().await.clone())
}

#[tauri::command]
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
        .read_client
        .join(channel.to_owned())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn leave_channel(state: tauri::State<TwitchState>, channel: String) {
    state.read_client.part(channel)
}

#[tauri::command]
async fn log_in(
    app: AppHandle,
    state: tauri::State<'_, TwitchState>,
    login: String,
    token: String,
    client_id: String,
) -> Result<(), String> {
    let login_creds = StaticLoginCredentials::new(login, Some(token));
    let creds = Credentials {
        creds: login_creds.clone(),
        client_id: Some(client_id),
    };
    creds.write(&app).map_err(|e| e.to_string())?;
    *state.credentials.lock().await = creds;
    let (mut inc, write_client) = TwitchIRCClient::new(ClientConfig::new_simple(login_creds));
    inc.close();
    *state.write_client.lock().await = write_client;
    Ok(())
}

#[tauri::command]
async fn log_out(app: AppHandle, state: tauri::State<'_, TwitchState>) -> Result<(), String> {
    let creds = Credentials::anonymous();
    creds.write(&app).map_err(|e| e.to_string())?;
    *state.credentials.lock().await = creds;
    let (mut inc, write_client) = TwitchIRCClient::new(ClientConfig::default());
    inc.close();
    *state.write_client.lock().await = write_client;
    Ok(())
}

#[tauri::command]
async fn send_message(
    state: tauri::State<'_, TwitchState>,
    message: String,
    channel: String,
) -> Result<(), String> {
    state
        .write_client
        .lock()
        .await
        .say(channel, message)
        .await
        .map_err(|e| e.to_string())
}

fn emit_irc(window: &Window, message: ServerMessage) -> Result<()> {
    match message {
        ServerMessage::Privmsg(msg) => window.emit("priv-msg", msg)?,
        _ => println!("Unhandled message: {:?}", message),
    }
    Ok(())
}

#[tauri::command]
async fn open_login() -> Result<(), String> {
    open::that("https://chatties-auth.esthe.live/").map_err(|err| err.to_string())
}

#[tauri::command]
async fn open_plugin_dir(app: AppHandle) -> Result<(), String> {
    let plugins_dir = get_data_dir(&app)
        .map_err(|err| err.to_string())?
        .join("plugins");
    create_dir_all(&plugins_dir).map_err(|err| err.to_string())?;
    open::that(plugins_dir).map_err(|err| err.to_string())
}

#[tauri::command]
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

#[tokio::main]
async fn main() -> Result<()> {
    tauri::Builder::default()
        .setup(|app| {
            let credentials = Credentials::read(app)?;
            let (mut incoming_messages, read_client) =
                TwitchIRCClient::new(ClientConfig::default());
            let (mut incoming_write_messages, write_client) =
                TwitchIRCClient::new(ClientConfig::new_simple(credentials.creds.clone()));
            incoming_write_messages.close();
            app.manage(TwitchState {
                credentials: Mutex::new(credentials),
                read_client,
                write_client: Mutex::new(write_client),
                reqwest: reqwest::Client::new(),
            });
            let main_window = app.get_window("main").expect("Failed to get main window");
            tauri::async_runtime::spawn(async move {
                while let Some(message) = incoming_messages.recv().await {
                    if let Err(error) = emit_irc(&main_window, message.clone()) {
                        eprintln!("Error while emitting IRC message: {}", error);
                    }
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
            send_message,
            open_login,
            get_plugins,
            open_plugin_dir
        ])
        .run(tauri::generate_context!())?;
    Ok(())
}
