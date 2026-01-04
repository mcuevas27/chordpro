# ChordPro Desktop - Setup Guide

## Current Status

The **frontend is running** at http://localhost:5173/ with Vite dev server.

To get the full **desktop app with Tauri**, you need to install Rust.

## Installing Rust (One-time setup)

### Windows

1. **Download Rust installer**:
   - Visit: https://www.rust-lang.org/tools/install
   - Download and run `rustup-init.exe`

2. **Installation steps**:
   - Choose option `1` (Default installation)
   - Press Enter to install
   - Verify installation: Open new PowerShell and run:
     ```powershell
     rustc --version
     cargo --version
     ```

3. **Install required components for Tauri**:
   ```powershell
   rustup target add x86_64-pc-windows-msvc
   ```

4. **System requirements check**:
   - Windows 7+ (64-bit)
   - Visual C++ redistributable (usually pre-installed)

### macOS

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify
rustc --version
cargo --version

# Set up environment
source $HOME/.cargo/env
```

### Linux (Ubuntu/Debian)

```bash
# Install system dependencies
sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev \
  patchelf curl wget file libssl-dev pkg-config build-essential

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

## Running the Desktop App (After Rust Installation)

### Start Development Mode

```bash
cd pp/chordpro-desktop
npm run dev
```

This will:
1. Start Vite frontend dev server (http://localhost:3000)
2. Compile Rust backend
3. Launch native desktop window with the app
4. Enable hot-reload for both frontend and backend changes

### Building for Release

```bash
npm run build
```

Creates standalone executable in:
- **Windows**: `src-tauri/target/release/chordpro-desktop.exe`
- **macOS**: `src-tauri/target/release/bundle/macos/chordpro-desktop.dmg`
- **Linux**: `src-tauri/target/release/bundle/appimage/chordpro-desktop.AppImage`

## Current Browser Dev Mode

You can test the frontend **right now** at http://localhost:5173/:

### Features Working
- ✅ Editor/preview split pane
- ✅ Live HTML preview
- ✅ Transpose buttons (+/-)
- ✅ Song saving to localStorage
- ✅ Chord parsing and rendering
- ✅ View mode switching

### Features Not Working (Need Tauri Backend)
- ❌ PDF export (requires Perl subprocess via Rust)
- ❌ System file dialogs
- ❌ Native window chrome

## Troubleshooting

### "cargo not found" after Rust install
- Restart PowerShell/Terminal
- Or add Rust to PATH: `$env:PATH += ";$env:USERPROFILE\.cargo\bin"`

### Build fails with "MSVC not found" (Windows)
- Install Visual Studio Build Tools:
  - Download: https://visualstudio.microsoft.com/downloads/
  - Check "Desktop development with C++" workload

### "Cannot find chordpro.pl"
- Update path in `src-tauri/src/lib.rs`
- Or add ChordPro to system PATH

## Feature Validation

### Test the Parser

In browser console (F12):
```javascript
import { parseChordPro } from './parser/parser.js';

const result = parseChordPro(`{title:Test}
[C]Hello [G]world`);

console.log(result.song);
```

### Test Live Preview

1. Open app at http://localhost:5173/
2. Click "New"
3. Type:
   ```
   {title:Amazing Grace}
   [G]Amazing [D]grace how [G]sweet the sound
   ```
4. See HTML preview update in real-time on right pane

### Test Transposition

1. Type some chords: `[C]` `[G]` `[D]`
2. Click `+` button → chords shift up
3. Click `−` button → chords shift down

### Test Song Saving

1. Type song content
2. Change title field
3. Click "Save"
4. See song appear in sidebar under "Recent Songs"
5. Refresh page → song still there

## Next Steps

1. **Install Rust** (5-10 minutes)
2. **Run** `npm run dev` (builds desktop app)
3. **Validate** all features working
4. **Complete test suite** (Phase 2)

## Documentation

- **User Guide**: See QUICK_START.md
- **Technical Details**: See IMPLEMENTATION_SUMMARY.md
- **Roadmap**: See ROADMAP.md

## Support

**For Tauri issues**:
- https://tauri.app/start/prerequisites/

**For ChordPro issues**:
- https://chordpro.org

**For this app issues**:
- Check browser console (F12) for errors
- Look at Vite dev server output for warnings

---

**Status**: Frontend ✅ | Backend setup pending Rust installation
