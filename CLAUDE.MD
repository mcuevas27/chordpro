# ChordPro - Claude AI Assistant Guide

## Project Overview

ChordPro is a professional lyrics and chords formatting program that generates sheet music from text files containing lyrics and chord information. It implements ChordPro language version 6 and supports multiple output formats including PDF, HTML, LaTeX, Markdown, and more.

**Primary Language:** Perl (requires v5.26+)
**License:** Artistic License 2.0
**Main Repository:** https://github.com/ChordPro/chordpro

## Core Technologies

- **Perl 5.26+** - Core language
- **PDF::API2** (or PDF::Builder) - PDF generation
- **Text::Layout** - Advanced text layout
- **HarfBuzz::Shaper** - Font shaping
- **Object::Pad** - Modern Perl OO
- **JavaScript::QuickJS** - JavaScript integration
- **JSON::PP/JSON::XS** - Configuration handling
- **wxPerl** - GUI support (wxchordpro)

## Project Structure

```
chordpro/
├── lib/ChordPro/          # Main library code
│   ├── Config/            # Configuration handling
│   ├── Chords/            # Chord definitions and processing
│   ├── Output/            # Output format generators (PDF, HTML, etc.)
│   ├── Delegate/          # Delegated processors (ABC, LilyPond)
│   ├── Wx/                # wxWidgets GUI components
│   └── res/               # Resources (configs, fonts, icons)
├── script/                # Executable scripts (chordpro, wxchordpro)
├── t/                     # Test suite
├── pp/                    # Packaging and distribution
│   ├── chordpro-desktop/  # Desktop app packaging
│   ├── docker/            # Docker configurations
│   ├── appimage/          # AppImage packaging
│   └── macos/             # macOS packaging
├── docs/                  # Documentation
├── Cases/                 # Test cases and examples
└── wiki/                  # Wiki content
```

## Key Components

### Core Modules

- **ChordPro.pm** - Main entry point
- **ChordPro/Songbook.pm** - Song collection processing
- **ChordPro/Config.pm** - Configuration management
- **ChordPro/Chords/*.pm** - Chord parsing and processing
- **ChordPro/Version.pm** - Version information

### Output Backends

- **Output/PDF.pm** - PDF output (primary format)
- **Output/HTML.pm** - HTML output
- **Output/Text.pm** - Plain text output
- **Output/LaTeX.pm** - LaTeX output
- **Output/ChordPro.pm** - ChordPro format output
- **Output/JSON.pm** - JSON export
- **Output/Markdown.pm** - Markdown output

### Parsing and Processing

The ChordPro format uses directives enclosed in curly braces:
- `{title}`, `{artist}` - Metadata
- `{start_of_chorus}`, `{end_of_chorus}` - Structure
- `[Am]`, `[G7]` - Chord annotations
- Text markup for formatting

## Development Workflow

### Building

```bash
# Standard Perl module build
perl Makefile.PL
make
make test
make install
```

### Testing

```bash
# Run test suite
make test

# Run specific tests
prove -v t/specific-test.t

# Extended tests
prove -v xt/*.t
```

### Running ChordPro

```bash
# Command-line usage
chordpro input.cho -o output.pdf

# With custom config
chordpro --config myconfig.json input.cho

# Generate different formats
chordpro --output=html input.cho
chordpro --output=text input.cho
```

## Configuration System

ChordPro uses JSON-based configuration files:
- Default config: `lib/ChordPro/res/config/chordpro.json`
- Config schema is comprehensive and supports:
  - Font definitions
  - Layout customization
  - Output format settings
  - Chord diagrams
  - PDF metadata

## Common Tasks

### Adding New Output Format

1. Create new module in `lib/ChordPro/Output/`
2. Implement output generation logic
3. Register in main ChordPro module
4. Add tests in `t/`
5. Update documentation

### Modifying PDF Output

- Main logic: `lib/ChordPro/Output/PDF.pm`
- Layout: `lib/ChordPro/Output/PDF/Song.pm`
- Graphics: `lib/ChordPro/Output/PDF/Writer.pm`

### Adding Chord Definitions

- Chord parsing: `lib/ChordPro/Chords/Parser.pm`
- Chord processing: `lib/ChordPro/Chords.pm`
- Diagrams: `lib/ChordPro/Output/PDF/StringDiagram.pm`

### Configuration Changes

1. Edit `lib/ChordPro/res/config/chordpro.json`
2. Run: `perl script/cfgboot.pl lib/ChordPro/res/config/chordpro.json -o lib/ChordPro/Config/Data.pm`
3. Test changes

## Coding Standards

### Perl Style

- Use `v5.26` or later features
- Use strict and warnings
- Use Object::Pad for OOP where appropriate
- Follow existing code style in the module
- Document public APIs with POD

### Naming Conventions

- Module files: CamelCase (e.g., `StringDiagram.pm`)
- Variables: lowercase with underscores (e.g., `$song_title`)
- Private methods: prefix with `_` (e.g., `_internal_method`)

### Error Handling

- Use `die` for fatal errors with descriptive messages
- Validate input parameters
- Provide helpful error context

## Testing Guidelines

- Write tests for new features in `t/`
- Use Test::More framework
- Provide test data in `Cases/` directory
- Test both success and failure paths
- Run full test suite before committing

## Documentation

- Main docs: `docs/` directory
- User documentation: https://chordpro.org
- API docs: POD in module files
- Keep `Changes` file updated

## Dependencies

All dependencies are listed in `Makefile.PL`. Key runtime dependencies:
- PDF::API2 (>= 2.045) or PDF::Builder (>= 3.025)
- Text::Layout (>= 0.045)
- HarfBuzz::Shaper (>= 0.026)
- Object::Pad (>= 0.818)
- See `Makefile.PL` for complete list

## Platform-Specific Notes

### Windows
- Requires Win32::LongPath for long path support
- Use `chordpro.bat` or compiled executable

### macOS
- See `pp/macos/` for packaging
- Native app available

### Linux
- AppImage available in `pp/appimage/`
- Docker support in `pp/docker/`

## Git Workflow

- Main branch: `master`
- Feature branches: Use descriptive names
- Commit messages: Clear and descriptive
- Test before pushing

## Support and Community

- User Forum: https://groups.io/g/ChordPro
- Issue Tracker: https://github.com/ChordPro/chordpro/issues
- Website: https://chordpro.org

## Quick Reference

### File Extensions
- `.cho`, `.crd`, `.chopro`, `.chord`, `.pro` - ChordPro format files
- `.json` - Configuration files
- `.pdf`, `.html`, `.txt`, `.tex` - Output formats

### Important Directories
- Config files: `lib/ChordPro/res/config/`
- Fonts: `lib/ChordPro/res/fonts/`
- Icons: `lib/ChordPro/res/icons/`
- ABC support: `lib/ChordPro/res/abc/`

### Version Information
- Version defined in: `lib/ChordPro/Version.pm`
- Release notes: `Changes` file

## Tips for AI Assistance

1. **Read Before Modifying**: Always read existing code before making changes
2. **Test Thoroughly**: Run the test suite after modifications
3. **Follow Patterns**: Maintain consistency with existing code structure
4. **Update Docs**: Keep documentation in sync with code changes
5. **Perl Best Practices**: Use modern Perl features appropriately
6. **Configuration**: Changes to config require regenerating Data.pm
7. **Cross-Platform**: Consider Windows, macOS, and Linux compatibility
8. **Performance**: ChordPro processes potentially large songbooks
9. **Unicode**: Full Unicode support is expected throughout
10. **PDF Quality**: PDF output is the primary format - maintain high quality

## Common Pitfalls

- Don't forget to update version numbers when releasing
- Always regenerate `Config/Data.pm` after config changes
- PDF rendering differences between PDF::API2 and PDF::Builder
- Font handling requires proper Unicode support
- Test with various ChordPro input files, not just simple cases
