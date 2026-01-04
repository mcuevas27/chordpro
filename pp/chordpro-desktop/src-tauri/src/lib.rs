use std::fs;
use std::path::PathBuf;
use std::process::Command;
use tauri::command;

#[command]
fn generate_pdf(song_content: String, output_path: String) -> Result<String, String> {
  // Create a temporary file for the ChordPro input
  let temp_dir = std::env::temp_dir();
  let temp_file = temp_dir.join("chordpro_input.cho");
  
  // Write song content to temporary file
  fs::write(&temp_file, &song_content)
    .map_err(|e| format!("Failed to write temp file: {}", e))?;

  // Determine the chordpro script path relative to the project
  // In dev: use the workspace path
  // In production: could bundle or require CHORDPRO_HOME env var
  let script_path = r#"D:\VS Code Projects\chordpro\script\chordpro.pl"#;
  
  // Check if Perl is available
  let perl_check = Command::new("perl")
    .arg("--version")
    .output();
    
  if perl_check.is_err() {
    return Err("Perl is not installed or not in PATH. Please install Perl to generate PDFs.".to_string());
  }

  // Spawn chordpro process
  let output = Command::new("perl")
    .arg(script_path)
    .arg("--output")
    .arg(&output_path)
    .arg(temp_file.to_str().ok_or("Invalid temp file path")?)
    .output()
    .map_err(|e| format!("Failed to execute chordpro: {}", e))?;

  // Clean up temp file
  let _ = fs::remove_file(&temp_file);

  if !output.status.success() {
    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    return Err(format!("ChordPro error:\nStderr: {}\nStdout: {}", stderr, stdout));
  }

  Ok(format!("PDF generated successfully at: {}", output_path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![generate_pdf])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
