# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChordPro is a professional lyrics and chords formatting program written in Perl. It reads text files containing song lyrics with chord information and generates professional sheet music in multiple output formats (PDF, HTML, LaTeX, Markdown, etc.). This is the reference implementation of ChordPro language version 6, succeeding the older Chord and Chordii programs.

- **Language**: Perl 5.26+ with modern features (signatures, state variables)
- **Version**: 6.090.1
- **License**: Artistic License 2.0
- **Website**: https://chordpro.org

## Development Commands

### Build and Setup
```bash
# Generate Makefile from Makefile.PL
perl Makefile.PL

# Build the project (also regenerates resources)
make

# Build using GNU make (preferred for development)
gmake

# Regenerate configuration data from JSON
perl script/cfgboot.pl lib/ChordPro/res/config/chordpro.json -o lib/ChordPro/Config/Data.pm
```

### Testing
```bash
# Run full test suite (106 test files)
make test

# Run tests with prove (more verbose)
prove -b t/

# Run extended tests
make tests

# Run a single test file
perl -Ilib t/100_basic.t

# Run tests with custom PERL5LIB (for development)
env PERL5LIB=$(pwd)/CPAN:$(pwd)/aux make test
```

### Running the Application
```bash
# CLI version (from source)
perl -Ilib script/chordpro [options] [file...]

# After installation
chordpro [options] [file...]

# GUI version
perl -Ilib script/wxchordpro

# Other utilities
perl -Ilib script/a2crd    # ASCII to ChordPro converter
perl -Ilib script/rrjson   # JSON format converter
perl -Ilib script/ttc      # TrueType collection viewer
```

### Packaging
```bash
# Create distribution tarball
make dist

# Install to system
make install

# Build resources (Config/Data.pm, POD files, etc.)
make resources

# Validate all JSON configuration files
make checkjson
```

## Architecture

### Core Processing Pipeline

1. **Entry Point** ([script/chordpro.pl](script/chordpro.pl))
   - Sets up module paths (@INC)
   - Calls `ChordPro::run()` for main processing

2. **Initialization** ([lib/ChordPro.pm](lib/ChordPro.pm))
   - Parse command-line arguments
   - Load hierarchical configuration (system → user → project → song)
   - Initialize logging and output backend

3. **Parsing Phase** ([lib/ChordPro/Song.pm](lib/ChordPro/Song.pm) - 2,774 lines)
   - Auto-detect ChordPro vs. ASCII format
   - Parse directives: `{title}`, `{define}`, `{start_of_chorus}`, etc.
   - Parse lyrics with embedded chords: `I [D]looked over Jordan`
   - Build internal song structure as nested data

4. **Chord Management** ([lib/ChordPro/Chords.pm](lib/ChordPro/Chords.pm), [lib/ChordPro/Chords/Parser.pm](lib/ChordPro/Chords/Parser.pm))
   - Parse and validate chord names
   - Load chord definitions from configuration
   - Handle user-defined chords via `{define}` directive
   - Support multiple notations (Nashville, Roman numerals, etc.)

5. **Output Generation** ([lib/ChordPro/Output/](lib/ChordPro/Output/))
   - Backend selected by file extension or `--generate` flag
   - Each backend is independent and modular
   - PDF backend ([lib/ChordPro/Output/PDF.pm](lib/ChordPro/Output/PDF.pm)) uses PDF::API2 or PDF::Builder with Text::Layout

### Key Architectural Patterns

**Configuration-Driven Design**: Nearly everything is configurable via JSON files with hierarchical merging:
- Pristine (built-in): [lib/ChordPro/res/config/chordpro.json](lib/ChordPro/res/config/chordpro.json)
- System: `/etc/chordpro.json` (Linux), etc.
- User: `~/.config/chordpro/chordpro.json`
- Project: `./chordpro.json`
- Song: via `{__config}` directive

**Delegate System**: Extensible directive handling via plugins in [lib/ChordPro/Delegate/](lib/ChordPro/Delegate/):
- ABC notation ([ABC.pm](lib/ChordPro/Delegate/ABC.pm))
- LilyPond ([Lilypond.pm](lib/ChordPro/Delegate/Lilypond.pm))
- Chord grilles ([Grille.pm](lib/ChordPro/Delegate/Grille.pm))
- SVG images ([SVG.pm](lib/ChordPro/Delegate/SVG.pm))
- Custom delegates can be added

**Parser Context**: Song parser maintains state machine with contexts (verse, chorus, bridge, etc.) and properties stack for nested formatting.

**Parse Once, Render Many**: Songs are parsed into an intermediate data structure, then rendered to any output format without re-parsing.

### Directory Structure

- `lib/ChordPro/` - Core modules (54 total)
  - `Output/` - Output backends (PDF, HTML, LaTeX, Text, ChordPro, JSON, etc.)
  - `Delegate/` - Extensible directive handlers
  - `Wx/` - wxPerl GUI modules (~11 files)
  - `Chords/` - Chord parsing and rendering
  - `Config/` - Configuration system
  - `lib/` - Bundled third-party libraries (SVGPDF, JSON::Relaxed, etc.)
  - `res/` - Resources (config files, fonts, icons, templates, ABC tools)
- `script/` - Entry points for executables
- `t/` - Test suite (106 .t files)
- `pp/` - Packaging scripts for various platforms
- `docs/` - Hugo-based documentation website

### Important Implementation Details

**UTF-8 Throughout**: All text processing uses UTF-8. Input files are decoded, internal processing is UTF-8, output is encoded properly.

**Cross-Platform File Handling**: [lib/ChordPro/Files.pm](lib/ChordPro/Files.pm) abstracts file I/O with special handling for Windows LongPath support.

**Font and Text Layout**: PDF output uses advanced text shaping via HarfBuzz::Shaper and Text::Layout for professional typography, kerning, and OpenType features.

**Resource Bootstrap**: [lib/ChordPro/Config/Data.pm](lib/ChordPro/Config/Data.pm) is auto-generated from [lib/ChordPro/res/config/chordpro.json](lib/ChordPro/res/config/chordpro.json) by [script/cfgboot.pl](script/cfgboot.pl). Always regenerate after changing the JSON config.

**ABC Integration**: Bundled abc2svg (JavaScript library) converts ABC music notation to SVG, which is then embedded in output via SVGPDF.

**Reference Mode**: Use `--reference` or `-R` flag for consistent regression testing with restricted config options.

## Code Conventions

**Module Organization**: Each major component is a separate .pm module. Use package-scoped state variables and lexical `my` variables for parser state.

**Error Handling**: Use ChordPro::Logger for warnings and errors. Logging levels: error, warning, info, debug, trace.

**Naming**:
- Directives in config use underscores: `start_of_chorus`
- Perl subs use underscores: `parse_song()`
- Config properties use hyphens: `"text-font"`

**State Management**: The song parser maintains complex state. When modifying [lib/ChordPro/Song.pm](lib/ChordPro/Song.pm), be aware of:
- Context stack (`$in_context`, `$skip_context`)
- Transposition state (`$xpose`, `$xpose_dir`, `$capo`)
- Chord memorization (`%memchords`, `$memorizing`)
- Property stack (`%propstack`)

**Configuration Changes**: After modifying [lib/ChordPro/res/config/chordpro.json](lib/ChordPro/res/config/chordpro.json), run `make resources` to regenerate [lib/ChordPro/Config/Data.pm](lib/ChordPro/Config/Data.pm).

**Testing**: When adding features, add corresponding test files in `t/`. Follow existing test patterns. Tests use Perl's standard Test::More framework.

## PDF Backend Selection

ChordPro supports two PDF libraries:
- **PDF::API2** (default, version 2.045+)
- **PDF::Builder** (alternative, version 3.025+)

Set via environment variable before running `perl Makefile.PL`:
```bash
export CHORDPRO_PDF_API=PDF::Builder
perl Makefile.PL
```

Both APIs are functionally equivalent for ChordPro's purposes.

## External Dependencies

Key CPAN modules required:
- PDF::API2 or PDF::Builder - PDF generation
- Text::Layout (0.045+) - Advanced text rendering
- HarfBuzz::Shaper (0.026+) - Text shaping
- JSON::XS, JSON::PP - JSON parsing
- JavaScript::QuickJS (0.18+) - JavaScript execution for delegates
- String::Interpolate::Named - String interpolation
- File::LoadLines, File::HomeDir - File handling
- Object::Pad (0.818+) - Modern OOP features

GUI-specific:
- wxPerl - Cross-platform desktop GUI framework

See [Makefile.PL](Makefile.PL) for complete list.

## Platform-Specific Notes

**Windows**: Requires Win32::LongPath for proper Unicode filename support.

**macOS/Linux**: Standard Perl module installation via CPAN or system package manager.

**Packaging**: Platform-specific packaging scripts in [pp/](pp/):
- [pp/windows/](pp/windows/) - Windows installer
- [pp/macos/](pp/macos/) - macOS .dmg
- [pp/appimage/](pp/appimage/) - Linux AppImage
- [pp/linux/](pp/linux/), [pp/debian/](pp/debian/) - Linux packages
