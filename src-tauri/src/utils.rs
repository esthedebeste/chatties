use std::{fs::create_dir_all, io, path::PathBuf};

use tauri::AppHandle;

pub fn get_data_dir(app: &AppHandle) -> io::Result<PathBuf> {
    let dir = app
        .path_resolver()
        .app_data_dir()
        .expect("Couldn't get app data dir");
    create_dir_all(&dir)?;
    Ok(dir)
}
