use std::{
    fs::{create_dir_all, File},
    io::{BufReader, BufWriter},
};

use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle};
use twitch_irc::login::StaticLoginCredentials;

#[derive(Serialize, Deserialize, Clone)]
pub struct Credentials {
    pub creds: StaticLoginCredentials,
    pub client_id: Option<String>,
}

impl Credentials {
    pub fn write(&self, app: &AppHandle) {
        let app_data_dir = app.path_resolver().app_data_dir().unwrap();
        create_dir_all(&app_data_dir).expect("failed to create app data dir");
        let path = app_data_dir.join("credentials.json");
        let file = File::create(path).unwrap();
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &self).unwrap();
    }

    pub fn read(app: &App) -> Credentials {
        let path = app
            .path_resolver()
            .app_data_dir()
            .unwrap()
            .join("credentials.json");
        if !path.exists() {
            return Credentials {
                creds: StaticLoginCredentials::anonymous(),
                client_id: None,
            };
        }
        let file = File::open(path).unwrap();
        let reader = BufReader::new(file);
        serde_json::from_reader(reader).unwrap()
    }
}
