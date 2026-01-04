# ChordPro Desktop - Quick Start Guide

## Installation & Setup (5 minutes)

### Prerequisites
1. **Node.js 16+**: https://nodejs.org/
2. **npm** (comes with Node.js)
3. **Rust** (for building): https://www.rust-lang.org/tools/install
4. **Perl** (for PDF generation): Already installed on macOS/Linux; [Strawberry Perl](https://strawberryperl.com) for Windows

### First Run

```bash
# Navigate to project
cd pp/chordpro-desktop

# Install dependencies
npm install

# Start dev server with hot-reload
npm run tauri dev
```

A window should open with the ChordPro Desktop app!

## Using the App

### 1. Create a New Song
```
Click "New" button
→ Blank ChordPro editor opens
```

### 2. Write ChordPro Format
```
{title:Twinkle Twinkle Little Star}
{artist:Jane Taylor}
{key:C}

[C]Twinkle, twinkle, [G]little star
[C]How I wonder [G]what you [C]are
[F]Up above the [C]world so high
[F]Like a diamond [C]in the sky
```

### 3. Watch Live Preview
- Right panel updates instantly as you type
- Chords display in red, lyrics in black
- See layout/columns in real-time

### 4. Transpose the Song
- Use **+/−** buttons in toolbar
- All chords shift by that many semitones
- Transposition resets on save

### 5. Save Your Work
```
1. Enter song title in the title field
2. Click "Save" button
3. Song appears in Recent Songs sidebar
4. Stored in browser localStorage (no server needed)
```

### 6. View Modes
- **Editor**: Full-width code editor
- **Preview**: Full-width HTML preview
- **Split**: Side-by-side (default)

## Supported ChordPro Format

### Basic Directives
```
{title:Song Name}              ← Required
{subtitle:Subtitle}            ← Optional
{artist:Artist Name}
{composer:Composer Name}
{key:G}                        ← Musical key
{capo:2}                       ← Capo fret
{tempo:120}                    ← BPM
{time:4/4}                     ← Time signature
```

### Sections
```
{start_of_verse}               ← Begin verse
  [C]Verse [G]lyrics here
{end_of_verse}

{start_of_chorus}              ← Begin chorus
  [C]Chorus [F]lyrics
{end_of_chorus}

{start_of_bridge}              ← Begin bridge
  [Am]Bridge [G]section
{end_of_bridge}
```

### Chord Notation
```
[C]             ← Simple major
[Cm]            ← Minor
[C7]            ← Dominant 7th
[Cmaj7]         ← Major 7th
[Cm7b5]         ← Minor 7 flat 5
[C/G]           ← C with G bass
[C#]            ← C sharp (also C♯)
[Db]            ← D flat (also D♭)
```

### Comments & Special
```
{comment:This part is tricky}  ← Comment line
{new_page}                      ← Page break
```

## Keyboard Tips

| Action | How |
|--------|-----|
| New Song | Click "New" or Ctrl+N (coming soon) |
| Save | Click "Save" or Ctrl+S (coming soon) |
| Transpose Up | Click + or Ctrl+= (coming soon) |
| Transpose Down | Click − or Ctrl+- (coming soon) |
| Switch View | Click Editor/Preview/Split |

## Troubleshooting

### Parser Shows Errors
- **Check syntax**: Make sure directives use `{key:value}` format
- **Check chords**: Chords must be in `[chord]` brackets
- **View DevTools**: Press F12 to see detailed error messages

### Recent Songs Not Showing
- localStorage might be disabled
- Try another browser (Chrome, Firefox, Safari)
- Songs data is in `Application → LocalStorage` in DevTools

### No Live Preview
- JavaScript might be disabled
- Try refreshing the app (F5)
- Check browser console for errors (F12)

### PDF Generation Fails
- **Perl not installed**: Download [Strawberry Perl](https://strawberryperl.com) (Windows)
- **chordpro.pl not found**: Update path in `src-tauri/src/lib.rs`
- **Permission denied**: Check file permissions on temp directory

## Example Songs

### Simple Love Song
```
{title:All My Loving}
{artist:The Beatles}
{key:Dm}
{capo:0}

{start_of_verse}
Close your [Dm]eyes and I'll close mine
[G]Knowledge is finding out something you do not want to know
[Dm]Previously my heart was dominated by astronomy
{end_of_verse}

{start_of_chorus}
[G]All my loving, I will send to [C]you
[F]All my loving, darling I'll be [Dm]true
{end_of_chorus}
```

### Hymn with Multiple Sections
```
{title:Amazing Grace}
{subtitle:Traditional Hymn}
{artist:John Newton}
{key:G}

{start_of_verse}
A-[G]mazing grace, how [D]sweet the sound
That [G]saved a wretch like [D]me
I [G]once was lost, but [D]now am found
Was [G]blind but now I [D]see
{end_of_verse}

{start_of_verse}
Through [G]many dangers, toils and [D]snares
I [G]have already [D]come
'Twas [G]grace that brought me [D]safe thus far
And [G]grace will lead me [D]home
{end_of_verse}
```

## Next Steps

- **Explore ChordPro format**: See https://chordpro.org/chordpro/
- **Save multiple songs**: Click "New" to create more
- **Export songs**: Coming soon - bulk export as JSON
- **Advanced features**: Chord diagrams, multiple notation systems (planned)

## Getting Help

1. **ChordPro Documentation**: https://chordpro.org
2. **GitHub Issues**: https://github.com/ChordPro/chordpro/issues
3. **Browser DevTools**: F12 to debug parser errors
4. **Check IMPLEMENTATION_SUMMARY.md** for technical details

## Reporting Issues

When reporting a problem, please include:
1. ChordPro input that causes the issue
2. Expected vs actual output
3. Browser/OS version
4. Error messages from DevTools (F12)

---

**Happy songwriting! 🎵**
