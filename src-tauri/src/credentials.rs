use std::{
    convert::Infallible,
    fs::File,
    io::{self, BufReader, BufWriter},
};

use anyhow::Result;
use async_trait::async_trait;
use macros::command_struct;
use tauri::{App, AppHandle};
use twitch_irc::login::{CredentialsPair, LoginCredentials};

use crate::utils::get_data_dir;

#[command_struct]
pub struct Credentials {
    pub login: String,
    pub token: Option<String>,
    pub client_id: Option<String>,
}

impl Credentials {
    pub fn write(&self, app: &AppHandle) -> Result<()> {
        let path = get_data_dir(app)?.join("credentials.json");
        let file = File::create(path)?;
        let writer = BufWriter::new(file);
        serde_json::to_writer(writer, &self)?;
        Ok(())
    }

    pub fn read(app: &App) -> io::Result<Credentials> {
        let path = get_data_dir(&app.handle())?.join("credentials.json");
        if !path.exists() {
            return Ok(Credentials::anonymous());
        }
        let file = File::open(path)?;
        let reader = BufReader::new(file);
        Ok(serde_json::from_reader(reader).unwrap_or_default())
    }

    pub fn anonymous() -> Credentials {
        Credentials {
            login: "justinfan1".to_owned(),
            token: None,
            client_id: None,
        }
    }
}

#[async_trait]
impl LoginCredentials for Credentials {
    type Error = Infallible;

    async fn get_credentials(&self) -> Result<CredentialsPair, Infallible> {
        Ok(CredentialsPair {
            login: self.login.clone(),
            token: self.token.clone(),
        })
    }
}

impl Default for Credentials {
    fn default() -> Self {
        Credentials::anonymous()
    }
}
