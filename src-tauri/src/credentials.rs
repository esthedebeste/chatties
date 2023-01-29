use std::{
    fs::{create_dir_all, File},
    io::{BufReader, BufWriter},
};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::{App, AppHandle};
use twitch_irc::login::StaticLoginCredentials;

#[derive(Serialize, Deserialize, Clone)]
pub struct Credentials {
    pub creds: StaticLoginCredentials,
    pub client_id: Option<String>,
}

impl Credentials {
    pub fn write(&self, app: &AppHandle) -> Result<()> {
        let app_data_dir = app
            .path_resolver()
            .app_data_dir()
            .expect("Couldn't get app data dir");
        create_dir_all(&app_data_dir)?;
        let path = app_data_dir.join("credentials.json");
        let file = File::create(path)?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &self)?;
        Ok(())
    }

    pub fn read(app: &App) -> Result<Credentials> {
        let path = app
            .path_resolver()
            .app_data_dir()
            .expect("Couldn't get app data dir")
            .join("credentials.json");
        if !path.exists() {
            return Ok(Credentials::anonymous());
        }
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        Ok(serde_json::from_reader(reader)?)
    }

    pub fn anonymous() -> Credentials {
        Credentials {
            creds: StaticLoginCredentials::anonymous(),
            client_id: None,
        }
    }
}
