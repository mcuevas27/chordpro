# ChordPro Desktop - Development Roadmap

## Current Status: MVP Complete ✅

**Project**: pp/chordpro-desktop/  
**Start Date**: January 3, 2026  
**MVP Release**: January 3, 2026  
**Status**: Ready for testing and Phase 2 development

---

## Completed (MVP)

### Phase 1: Core Functionality ✅

- [x] Tauri + React + TypeScript scaffold
- [x] ChordPro Lexer/Tokenizer
- [x] ChordPro Parser with state machine
- [x] Chord notation parser (Common)
- [x] HTML renderer with CSS styling
- [x] React UI (split-pane, toolbar, sidebar)
- [x] Local storage (localStorage API)
- [x] Tauri Rust backend for PDF subprocess
- [x] Transposition via +/- buttons
- [x] 20+ directive support
- [x] Configuration (tauri.conf.json, permissions)

---

## Phase 2: Parser Enhancements (Planned: 4-6 weeks)

### Parser Completeness
- [ ] Tab line parsing (currently recognized but ignored)
- [ ] Grid/Grille parsing (for chord diagrams)
- [ ] Chord definition/display directives
- [ ] Rechorus recall (%) feature
- [ ] Memorization system for grids
- [ ] Conditional directives ({if_instrument:...})
- [ ] Additional metadata directives (duration, language, etc.)
- [ ] Escape sequence handling
- [ ] Unicode notation support improvements

### Test Suite
- [ ] Port t/30_basic01_cho.t (basic songs)
- [ ] Port t/100_basic.t (directives)
- [ ] Port t/101_directives.t (all directives)
- [ ] Port t/103_title.t (metadata)
- [ ] Port t/114_songline.t (lyrics + chords)
- [ ] Port t/116_chorus.t (chorus sections)
- [ ] Create unit tests for each parser module
- [ ] Create integration tests
- [ ] Add CI/CD pipeline (GitHub Actions)

### Edge Cases
- [ ] Line continuation with backslash
- [ ] Parenthesized optional chords
- [ ] NC (no chord) notation
- [ ] Chord alterations (7#9, 7b5, etc.)
- [ ] Multiple chords in same bracket
- [ ] Inline directives
- [ ] Comments within sections

**Estimated Effort**: 40-50 hours

---

## Phase 3: Extended Parsing (Planned: 4-6 weeks)

### Advanced Features
- [ ] Grid/Grille display with proper formatting
- [ ] Tab parsing and styling
- [ ] Chord diagram definitions
- [ ] Multiple chord notation systems:
  - [ ] Nashville notation (1, 4, 5, etc.)
  - [ ] Roman numerals (I, IV, V, etc.)
  - [ ] Solfege (Do, Re, Mi, etc.)
- [ ] Transcode between notation systems
- [ ] ABC music notation delegation
- [ ] LilyPond notation delegation
- [ ] Directive abbreviations (t, st, soc, eoc, etc.)

### Storage Enhancements
- [ ] IndexedDB for larger storage capacity
- [ ] Folder/collection organization
- [ ] Tags/categories for songs
- [ ] Search and filter functionality
- [ ] Duplicate detection (same title/artist)
- [ ] Version history (track edits)
- [ ] Backup/restore functionality

**Estimated Effort**: 50-60 hours

---

## Phase 4: UI/UX Polish (Planned: 3-4 weeks)

### Editor Features
- [ ] Keyboard shortcuts (Ctrl+S save, Ctrl+N new, etc.)
- [ ] Syntax highlighting for directives and chords
- [ ] Auto-complete for directives
- [ ] Undo/Redo (Ctrl+Z/Ctrl+Y)
- [ ] Find/Replace (Ctrl+F/Ctrl+H)
- [ ] Line numbers
- [ ] Code folding (collapse sections)
- [ ] Minimap (code overview)
- [ ] Bracket matching/highlighting

### Preview Enhancements
- [ ] Chord diagrams (guitar, ukulele, mandolin, keyboard)
- [ ] Configurable columns per view mode
- [ ] Print preview with page breaks
- [ ] Export to PDF button
- [ ] Export to other formats (HTML, plain text)
- [ ] Configurable fonts and spacing

### UI Improvements
- [ ] Dark theme
- [ ] Theme switcher
- [ ] Font size controls
- [ ] Settings/Preferences panel
- [ ] Help/Documentation sidebar
- [ ] Drag-drop file import
- [ ] Recent files quick access
- [ ] Song templates/wizards
- [ ] Status bar with song info
- [ ] Tooltips and help text

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] ARIA labels
- [ ] High contrast mode
- [ ] Text scaling support

**Estimated Effort**: 40-50 hours

---

## Phase 5: Configuration & Presets (Planned: 2-3 weeks)

### Config Builder UI
- [ ] Visual form for common settings
- [ ] Instrument selection (Guitar, Ukulele, Mandolin, Keyboard)
- [ ] Preset manager (save/load configurations)
- [ ] Default presets:
  - [ ] Guitar (6-string standard tuning)
  - [ ] Ukulele (4-string)
  - [ ] Mandolin (8-string pairs)
  - [ ] Keyboard
  - [ ] Lyrics only (no chords)
  - [ ] Chord chart (chords only)
- [ ] Font selection and sizing
- [ ] Color scheme customization
- [ ] Paper size and orientation
- [ ] Margins and spacing adjustment
- [ ] JSON config editor (advanced mode)

### Built-in Configuration Management
- [ ] Import ChordPro default config
- [ ] Merge with custom config
- [ ] Config validation
- [ ] Config documentation/help

**Estimated Effort**: 25-35 hours

---

## Phase 6: Advanced Features (Planned: 4-6 weeks)

### Chord Diagrams
- [ ] Guitar chord diagram rendering
- [ ] Ukulele diagram rendering
- [ ] Mandolin diagram rendering
- [ ] Keyboard/piano diagram rendering
- [ ] Chord diagram library
- [ ] Custom chord definitions
- [ ] SVG export for diagrams

### Additional Notations
- [ ] ASCII tab parsing and display
- [ ] Fingering annotations
- [ ] Strum patterns
- [ ] Capo handling in diagrams
- [ ] Alternate tunings

### Multi-song Projects
- [ ] Song collections/setlists
- [ ] Transposition per song
- [ ] Print entire setlist
- [ ] Performance mode (large text, click-through)
- [ ] Song metadata (duration, key, BPM)

**Estimated Effort**: 50-70 hours

---

## Phase 7: Distribution & Polish (Planned: 2-3 weeks)

### Building & Packaging
- [ ] Platform-specific installers:
  - [ ] Windows (.exe/.msi)
  - [ ] macOS (.dmg)
  - [ ] Linux (.AppImage/.deb)
- [ ] Code signing for macOS and Windows
- [ ] Auto-update mechanism
- [ ] Version management
- [ ] Release notes generation

### Deployment
- [ ] GitHub releases
- [ ] Download page on chordpro.org
- [ ] Chocolatey package (Windows)
- [ ] Homebrew formula (macOS)
- [ ] Snap package (Linux)

### Documentation
- [ ] User manual (PDF)
- [ ] Video tutorials
- [ ] FAQ page
- [ ] Troubleshooting guide
- [ ] Keyboard shortcut reference
- [ ] Plugin/extension guide (if applicable)

**Estimated Effort**: 30-40 hours

---

## Known Issues & Tech Debt

### Current
- [ ] Perl path hardcoded in src-tauri/src/lib.rs
- [ ] No error recovery in parser
- [ ] Minimal CSS (needs color scheme refinement)
- [ ] No tests implemented
- [ ] Limited logging

### Medium Priority
- [ ] Performance optimization (large files)
- [ ] Memory usage optimization
- [ ] Concurrent parsing (for large songs)
- [ ] Asset management (inline base64 images)

---

## Priority Checklist

### Critical Path (Do First)
1. **Testing** - Validate parser against t/ directory test files
2. **Parser Completion** - Tab and grid support
3. **UI Polish** - Keyboard shortcuts, syntax highlighting
4. **PDF Integration** - Full PDF generation pipeline

### High Priority
5. Chord diagrams
6. Multiple notation systems
7. Settings UI
8. Search/filter

### Medium Priority
9. Multi-song projects
10. Performance optimization
11. Advanced features (ABC, LilyPond)
12. Distribution packaging

### Low Priority
13. Plugin system
14. Extensibility
15. Advanced analytics
16. Cloud integration (optional)

---

## Time Estimates Summary

| Phase | Effort | Timeline |
|-------|--------|----------|
| 1 (MVP) | 60h | Done ✅ |
| 2 (Parser) | 45h | 4-6 weeks |
| 3 (Extended) | 55h | 4-6 weeks |
| 4 (UI/UX) | 45h | 3-4 weeks |
| 5 (Config) | 30h | 2-3 weeks |
| 6 (Advanced) | 60h | 4-6 weeks |
| 7 (Distribution) | 35h | 2-3 weeks |
| **Total** | **330h** | **~9 months** |

**Note**: Estimates assume 1 developer, 40h/week = ~8 weeks elapsed time with phases done sequentially.  
Can parallelize or prioritize specific phases.

---

## Open Questions & Decisions

1. **Parser Testing Strategy**
   - Should we aim for 100% compatibility with Perl ChordPro?
   - Or support MVP subset? Current decision: MVP first, extend later

2. **Chord Diagram Library**
   - Pre-define all common chords in database?
   - Or generate from fingering strings?
   - Current decision: TBD in Phase 6

3. **Cloud Integration**
   - Out of scope for local app?
   - Optional sync feature later?
   - Current decision: Local only (no cloud)

4. **Plugin System**
   - Should we allow custom renders/processors?
   - TypeScript plugins via @tauri/plugin?
   - Current decision: Not planned

5. **Collaboration Features**
   - Share songs/setlists with others?
   - Concurrent editing?
   - Current decision: Single-user local app

---

## Dependencies to Update

```json
{
  "nextVersion": "1.0.0",
  "dependencies": {
    "react": "^19.0.0",
    "@tauri-apps/api": "^1.5.0",
    "@tauri-apps/cli": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

---

## Metrics & Goals

### User Experience Goals
- [ ] Parse + render < 100ms for typical song
- [ ] UI responsive at 60 FPS
- [ ] App startup < 2 seconds
- [ ] Keyboard shortcuts for all common actions

### Code Quality Goals
- [ ] > 80% test coverage
- [ ] TypeScript strict mode throughout
- [ ] < 5% code duplication
- [ ] All critical functions documented

### Feature Completeness Goals
- [ ] 100% ChordPro format support (v6.0)
- [ ] Support all 50+ directives
- [ ] 4+ chord notation systems
- [ ] Chord diagrams for all instruments

---

## Release Checklist

### v0.1.0 (MVP - Current)
- [x] Parser MVP
- [x] HTML renderer
- [x] Local storage
- [x] PDF subprocess wrapper
- [ ] Basic tests

### v0.2.0 (Parser Complete)
- [ ] Full test suite passing
- [ ] All directives implemented
- [ ] Tab parsing
- [ ] Grid parsing

### v1.0.0 (Feature Complete)
- [ ] All phases 1-5 complete
- [ ] > 80% test coverage
- [ ] Full documentation
- [ ] Installers for all platforms
- [ ] Public release

---

## Contact & Support

**Project Lead**: Implementation notes for MVP completed.  
**Repository**: https://github.com/ChordPro/chordpro  
**Issues**: Report in GitHub issues with MVP tag  
**Questions**: See IMPLEMENTATION_SUMMARY.md for technical details

---

**Last Updated**: January 3, 2026  
**Next Review**: After Phase 2 completion or monthly checkup
