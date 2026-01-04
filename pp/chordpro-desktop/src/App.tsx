import { useState, useEffect } from 'react'
import './App.css'
import { parseChordPro } from './parser/parser'
import type { ParseError, ChordDef } from './parser/ast'
import { renderSongToHTML } from './renderers/htmlRenderer'
import { LocalStorage, generateSongId, type StoredSong } from './storage/localStorage'
import { invoke } from '@tauri-apps/api/core'
import { save } from '@tauri-apps/plugin-dialog'

function App() {
  const [content, setContent] = useState('')
  const [htmlPreview, setHtmlPreview] = useState('')
  const [currentSongId, setCurrentSongId] = useState<string | null>(null)
  const [songs, setSongs] = useState<StoredSong[]>([])
  const [title, setTitle] = useState('Untitled')
  const [transpose, setTranspose] = useState(0)
  const [previewMode, setPreviewMode] = useState<'split' | 'editor' | 'preview'>('split')
  const [isExporting, setIsExporting] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [parseErrors, setParseErrors] = useState<ParseError[]>([])
  const hasErrors = parseErrors.some((e) => e.type === 'error')
  const errorCount = parseErrors.length
  const [chordDefs, setChordDefs] = useState<ChordDef[]>([])

  const samples = [
    {
      title: 'Amazing Grace',
      content: '{title: Amazing Grace}\n{artist: John Newton}\n{key: G}\n\n{start_of_verse}\nAmazing [G]grace, how [G7]sweet the [C]sound\nThat [G]saved a wretch like [D]me\nI [G]once was lost, but [G7]now I\'m [C]found\nWas [G]blind but [D]now I [G]see\n{end_of_verse}\n\n{start_of_chorus}\n\'Twas [G]grace that taught my [C]heart to fear\nAnd [G]grace my fears re[D]lieved\nHow [G]precious did that [G7]grace ap[C]pear\nThe [G]hour I [D]first be[G]lieved\n{end_of_chorus}'
    },
    {
      title: 'Let It Be',
      content: '{title: Let It Be}\n{artist: The Beatles}\n{key: C}\n\n{start_of_verse}\nWhen I [C]find myself in [G]times of trouble\n[Am]Mother Mary [F]comes to me\n[C]Speaking words of [G]wisdom, let it [F]be [C]\n{end_of_verse}\n\n{start_of_chorus}\nLet it [Am]be, let it [G]be, let it [F]be, let it [C]be\n[C]Whisper words of [G]wisdom, let it [F]be [C]\n{end_of_chorus}'
    }
  ]

  // Load songs and theme on mount
  useEffect(() => {
    const allSongs = LocalStorage.getAllSongs()
    setSongs(allSongs)
    
    const savedTheme = localStorage.getItem('chordpro-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Ctrl+N: New song
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        handleNewSong()
      }
      // Ctrl+E: Export PDF
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault()
        handleExportPDF()
      }
      // Ctrl+Up: Transpose up
      if (e.ctrlKey && e.key === 'ArrowUp') {
        e.preventDefault()
        setTranspose(t => t + 1)
      }
      // Ctrl+Down: Transpose down
      if (e.ctrlKey && e.key === 'ArrowDown') {
        e.preventDefault()
        setTranspose(t => t - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSongId]) // Re-bind when currentSongId changes

  // Debounced preview + errors when content, transpose, or theme changes
  useEffect(() => {
    const handle = setTimeout(() => {
      if (content.trim()) {
        let input = content
        if (transpose !== 0 && !content.includes('{transpose:')) {
          input = `{transpose:${transpose}}\n${content}`
        }
        const result = parseChordPro(input)
        setParseErrors(result.errors || [])
        if (result.success && result.song) {
          setHtmlPreview(renderSongToHTML(result.song, { columns: 2, theme }))
          setChordDefs(result.song.define || [])
        } else {
          setChordDefs([])
        }
      } else {
        setHtmlPreview('')
        setParseErrors([])
        setChordDefs([])
      }
    }, 200)

    return () => clearTimeout(handle)
  }, [content, transpose, theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('chordpro-theme', newTheme)
  }

  const handleNewSong = () => {
    const newId = generateSongId()
    setCurrentSongId(newId)
    setContent('{title:Untitled}\n\n')
    setTitle('Untitled')
    setTranspose(0)
  }

  const handleOpenSong = (songId: string) => {
    const song = LocalStorage.getSong(songId)
    if (song) {
      setCurrentSongId(songId)
      setContent(song.content)
      setTitle(song.title)
    }
  }

  const handleSave = () => {
    // Auto-create song ID if none exists
    if (!currentSongId) {
      const newId = generateSongId()
      setCurrentSongId(newId)
    }

    const song: StoredSong = {
      id: currentSongId || generateSongId(),
      title,
      content,
      lastModified: Date.now(),
      createdAt: Date.now(),
    }

    LocalStorage.saveSong(song)
    const allSongs = LocalStorage.getAllSongs()
    setSongs(allSongs)
  }

  const handleLoadSample = (sampleContent: string, sampleTitle: string) => {
    setContent(sampleContent)
    setTitle(sampleTitle)
    // Don't change currentSongId to keep drafts safe
  }

  const chordDefToDirective = (def: ChordDef): string => {
    const frets = (def.definition.strings || []).map((v) => (v === -1 ? 'x' : String(v))).join(' ')
    const base = def.definition.basefret ? ` base-fret ${def.definition.basefret}` : ''
    return `{define: ${def.name}${base} frets ${frets}}`
  }

  const handleInsertChordDef = (def: ChordDef) => {
    const directive = chordDefToDirective(def)
    const sep = content.endsWith('\n') || content.length === 0 ? '' : '\n'
    setContent(prev => `${prev}${sep}${directive}\n`)
  }

  const handleDelete = (songId: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      LocalStorage.deleteSong(songId)
      const allSongs = LocalStorage.getAllSongs()
      setSongs(allSongs)
      
      // If deleting current song, clear editor
      if (songId === currentSongId) {
        handleNewSong()
      }
    }
  }

  const handleExportPDF = async () => {
    console.log('Export PDF clicked')
    if (!content.trim()) {
      console.log('No content, showing alert')
      alert('Please enter some content first')
      return
    }

    try {
      setIsExporting(true)
      console.log('Starting export...')

      // Prepare content with transpose
      let exportContent = content
      if (transpose !== 0 && !content.includes('{transpose:')) {
        exportContent = `{transpose:${transpose}}\n${content}`
      }

      console.log('Attempting to call save dialog...')
      
      // Always try to use Tauri APIs directly when running in dev mode
      try {
        // Show save dialog
        const filePath = await save({
          defaultPath: `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          filters: [{
            name: 'PDF',
            extensions: ['pdf']
          }]
        })

        console.log('File path selected:', filePath)

        if (!filePath) {
          setIsExporting(false)
          return
        }

        // Call Rust backend to generate PDF
        console.log('Calling generate_pdf...')
        const result = await invoke<string>('generate_pdf', {
          songContent: exportContent,
          outputPath: filePath
        })

        console.log('PDF generation result:', result)
        alert(result)
      } catch (tauriError) {
        // Not in Tauri context
        console.error('Not in Tauri context:', tauriError)
        alert('PDF export only works in the Tauri app. Run "npm run dev" instead of "npm run vite:dev"')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert(`Failed to export PDF: ${error}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`app ${theme}`}>
      <div className="toolbar">
        <div className="toolbar-left">
          <h1>ChordPro Desktop</h1>
        </div>
        <div className="toolbar-right">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Song Title"
            className="title-input"
          />
          <button onClick={handleNewSong} className="btn btn-primary">New</button>
          <button onClick={handleSave} className="btn btn-primary">Save</button>
          <button 
            onClick={handleExportPDF} 
            className="btn btn-success"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          
          <div className="transpose-control">
            <label>Transpose:</label>
            <button onClick={() => setTranspose(t => t - 1)}>−</button>
            <span className="transpose-value">{transpose > 0 ? '+' : ''}{transpose}</span>
            <button onClick={() => setTranspose(t => t + 1)}>+</button>
          </div>

          <div className="view-selector">
            <button 
              className={`btn ${previewMode === 'editor' ? 'active' : ''}`}
              onClick={() => setPreviewMode('editor')}
            >
              Editor
            </button>
            <button 
              className={`btn ${previewMode === 'split' ? 'active' : ''}`}
              onClick={() => setPreviewMode('split')}
            >
              Split
            </button>
            <button 
              className={`btn ${previewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setPreviewMode('preview')}
            >
              Preview
            </button>
          </div>

          <button 
            onClick={toggleTheme} 
            className="btn btn-theme"
            title="Toggle Dark Mode"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {errorCount > 0 && (
            <span className="error-badge" title="Parse issues">{errorCount}</span>
          )}
        </div>
      </div>

      {parseErrors.length > 0 && (
        <div className="error-panel">
          <div className="error-title">Parse issues:</div>
          <ul>
            {parseErrors.map((err, idx) => (
              <li key={idx}>
                <span className="error-line">Line {err.line}</span> — {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Recent Songs</h3>
            <div className="samples-row">
              {samples.map((sample) => (
                <button
                  key={sample.title}
                  className="btn btn-sample"
                  onClick={() => handleLoadSample(sample.content, sample.title)}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
          <div className="songs-list">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`song-item ${currentSongId === song.id ? 'active' : ''}`}
              >
                <div className="song-info" onClick={() => handleOpenSong(song.id)}>
                  <div className="song-title">{song.title}</div>
                  <div className="song-date">
                    {new Date(song.lastModified).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(song.id)
                  }}
                  title="Delete song"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {chordDefs.length > 0 && (
            <div className="chorddefs-panel">
              <div className="chorddefs-title">Chord Diagrams</div>
              <div className="chorddefs-grid">
                {chordDefs.map((def) => (
                  <div key={def.name} className="chord-card">
                    <div className="chord-card-header">
                      <span className="chord-name">{def.name}</span>
                      <button className="btn btn-mini" onClick={() => handleInsertChordDef(def)}>Insert</button>
                    </div>
                    <div className="chord-frets">{chordDefToDirective(def)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="content-area">
          {(previewMode === 'editor' || previewMode === 'split') && (
            <div className={`editor-pane ${previewMode === 'split' ? 'split' : 'full'}`}>
              <div className="editor-with-lines">
                <pre className="line-numbers" aria-hidden>
                  {Array.from({ length: Math.max(content.split('\n').length, 1) }, (_, i) => i + 1).join('\n')}
                </pre>
                <textarea
                  className={hasErrors ? 'has-errors' : ''}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter ChordPro format..."
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {(previewMode === 'preview' || previewMode === 'split') && (
            <div className={`preview-pane ${previewMode === 'split' ? 'split' : 'full'}`}>
              <iframe
                srcDoc={htmlPreview || `<html><body style="background:${theme === 'dark' ? '#1a1a1a' : '#ffffff'};"></body></html>`}
                title="preview"
                className="preview-frame"
                style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
