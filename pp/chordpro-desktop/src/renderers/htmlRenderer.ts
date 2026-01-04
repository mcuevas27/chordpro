/**
 * ChordPro HTML Renderer
 * Converts parser AST to styled HTML
 */

import type { Song, SongLine, Comment, ChordAppearance } from "../parser/ast";

export interface RenderOptions {
  showChordDiagrams?: boolean;
  showTOC?: boolean;
  columns?: number;
  theme?: "light" | "dark";
}

export class HTMLRenderer {
  private song: Song;
  private options: RenderOptions;

  constructor(song: Song, options: RenderOptions = {}) {
    this.song = song;
    this.options = {
      showChordDiagrams: true,
      showTOC: true,
      columns: 1,
      theme: "light",
      ...options,
    };
  }

  render(): string {
    const html = [
      this.renderHead(),
      "<body>",
      this.renderHeader(),
      this.renderChordDefinitions(),
      this.renderBody(),
      "</body>",
      "</html>",
    ];

    return html.join("\n");
  }

  private renderHead(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(this.song.title || "ChordPro")}</title>
  <style>${this.renderCSS()}</style>
</head>`;
  }

  private renderCSS(): string {
    const theme = this.options.theme === "dark"
      ? { bg: "#1e1e1e", text: "#e0e0e0", border: "#333" }
      : { bg: "#ffffff", text: "#000000", border: "#ddd" };

    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: Georgia, serif; 
        background: ${theme.bg};
        color: ${theme.text};
        line-height: 1.6;
        padding: 40px;
      }
      
      .song-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid ${theme.border};
        padding-bottom: 20px;
      }
      
      .title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .subtitle {
        font-size: 16px;
        color: #666;
        margin: 5px 0;
      }
      
      .meta {
        font-size: 12px;
        color: #888;
        margin-top: 10px;
      }
      
      .meta-item {
        display: inline-block;
        margin-right: 20px;
      }
      
      .meta-label {
        font-weight: bold;
      }
      
      .song-body {
        columns: ${this.options.columns};
        column-gap: 30px;
      }
      
      .songline {
        margin: 8px 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 2.5em;
      }
      
      .chord {
        display: inline-block;
        position: relative;
        vertical-align: baseline;
      }
      
      .chord-text {
        position: absolute;
        top: -1.3em;
        left: 0;
        color: #d9534f;
        font-weight: bold;
        font-family: monospace;
        font-size: 0.85em;
        white-space: nowrap;
      }
      
      .lyric-text {
        display: inline;
      }
      
      .context-label {
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 5px;
        color: #666;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 1px;
      }
      
      .verse { }
      .chorus { 
        background: rgba(255, 200, 50, 0.1);
        padding: 10px;
        border-left: 3px solid #ffc832;
      }
      .bridge {
        background: rgba(100, 150, 255, 0.1);
        padding: 10px;
        border-left: 3px solid #6496ff;
      }
      .tab {
        font-family: monospace;
        background: ${this.options.theme === "dark" ? "#2a2a2a" : "#f5f5f5"};
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
      }
      
      .comment {
        font-style: italic;
        color: #666;
        margin: 10px 0;
        padding-left: 20px;
        border-left: 2px solid #ccc;
      }
      
      .comment-italic {
        font-style: italic;
        color: #666;
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .comment-box {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        margin: 10px 0;
        background: rgba(0,0,0,0.05);
        font-weight: bold;
      }

      .chord-defs {
        margin: 20px 0 10px;
        padding: 12px;
        border: 1px solid ${theme.border};
        border-radius: 6px;
        background: ${this.options.theme === "dark" ? "#222" : "#fafafa"};
      }

      .chord-defs-title {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 14px;
      }

      .chord-defs-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
      }

      .chord-def-card {
        padding: 8px;
        border: 1px solid ${theme.border};
        border-radius: 4px;
        background: ${this.options.theme === "dark" ? "#1b1b1b" : "#fff"};
      }

      .chord-def-name {
        font-weight: 700;
        margin-bottom: 4px;
      }

      .chord-def-frets {
        font-family: "Courier New", monospace;
        font-size: 12px;
        color: ${this.options.theme === "dark" ? "#ccc" : "#555"};
        word-break: break-all;
      }

      .chord-def-diagram {
        font-family: "Courier New", monospace;
        font-size: 12px;
        margin-top: 6px;
        white-space: pre;
      }
      
      @media print {
        body { padding: 20px; }
        .song-body { columns: ${this.options.columns}; }
      }
    `;
  }

  private renderHeader(): string {
    const header = [
      '<div class="song-header">',
      this.song.title ? `<div class="title">${this.escapeHtml(this.song.title)}</div>` : "",
      this.song.subtitle
        ? this.song.subtitle.map((st) => `<div class="subtitle">${this.escapeHtml(st)}</div>`).join("\n")
        : "",
    ];

    // Render metadata
    const metaItems = [];
    if (this.song.artist) metaItems.push(`<span class="meta-item"><span class="meta-label">Artist:</span> ${this.escapeHtml(this.song.artist)}</span>`);
    if (this.song.composer) metaItems.push(`<span class="meta-item"><span class="meta-label">Composer:</span> ${this.escapeHtml(this.song.composer)}</span>`);
    if (this.song.album) metaItems.push(`<span class="meta-item"><span class="meta-label">Album:</span> ${this.escapeHtml(this.song.album)}</span>`);
    if (this.song.year) metaItems.push(`<span class="meta-item"><span class="meta-label">Year:</span> ${this.escapeHtml(this.song.year)}</span>`);
    if (this.song.key) metaItems.push(`<span class="meta-item"><span class="meta-label">Key:</span> ${this.escapeHtml(this.song.key)}</span>`);
    if (this.song.time) metaItems.push(`<span class="meta-item"><span class="meta-label">Time:</span> ${this.escapeHtml(this.song.time)}</span>`);
    if (this.song.tempo) metaItems.push(`<span class="meta-item"><span class="meta-label">Tempo:</span> ${this.escapeHtml(this.song.tempo)}</span>`);
    if (this.song.duration) metaItems.push(`<span class="meta-item"><span class="meta-label">Duration:</span> ${this.escapeHtml(this.song.duration)}</span>`);
    if (this.song.capo) metaItems.push(`<span class="meta-item"><span class="meta-label">Capo:</span> ${this.song.capo}</span>`);

    if (metaItems.length > 0) {
      header.push(`<div class="meta">${metaItems.join(" ")}</div>`);
    }

    header.push("</div>");
    return header.join("\n");
  }

  private renderChordDefinitions(): string {
    if (!this.song.define || this.song.define.length === 0) return "";

    const cards = this.song.define.map((def) => {
      const fretsArr = def.definition.strings || [];
      const basefret = def.definition.basefret || 1;
      const diagram = this.renderAsciiDiagram(fretsArr, basefret);
      const frets = fretsArr.map((v) => (v === -1 ? "x" : String(v))).join(" ");
      const base = def.definition.basefret ? `base-fret ${def.definition.basefret} ` : "";
      const directive = `{define: ${def.name} ${base}frets ${frets}}`;

      return `<div class="chord-def-card">
        <div class="chord-def-name">${this.escapeHtml(def.name)}</div>
        <div class="chord-def-frets">${this.escapeHtml(directive)}</div>
        <pre class="chord-def-diagram">${diagram}</pre>
      </div>`;
    });

    return `<div class="chord-defs">
      <div class="chord-defs-title">Chord Diagrams</div>
      <div class="chord-defs-list">${cards.join("")}</div>
    </div>`;
  }

  private renderAsciiDiagram(strings: number[], basefret: number): string {
    if (strings.length === 0) return "";

    const labels = ["e", "B", "G", "D", "A", "E"]; // show from high e down to low E
    const stringsReversed = [...strings].reverse();
    const lines: string[] = [];
    const nut = basefret === 1 ? "┌─┬─┬─┬─┐" : `(${basefret}fr)`;
    const fretLine = "├─┼─┼─┼─┤";

    lines.push(nut);
    for (let idx = 0; idx < stringsReversed.length; idx++) {
      const val = stringsReversed[idx];
      const label = labels[idx] || "";
      const cell = val === -1 ? "x" : val === 0 ? "0" : String(val);
      lines.push(`${label} | ${cell}`);
      if (idx === stringsReversed.length - 1) {
        lines.push(fretLine);
      }
    }
    return lines.join("\n");
  }

  private renderBody(): string {
    let currentContext = "";
    const body = ['<div class="song-body">'];
    let insideContextDiv = false;

    for (const element of this.song.body) {
      // Add context label if context changes
      const context = element.context ?? "default";
      if (context !== currentContext && element.type !== "empty") {
        // Close previous context div if open
        if (insideContextDiv) {
          body.push("</div>");
          insideContextDiv = false;
        }
        
        // Open new context if not default
        if (context !== "default") {
          body.push(`<div class="context-label">${context}</div>`);
          body.push(`<div class="${context}">`);
          insideContextDiv = true;
        }
        currentContext = context;
      }

      switch (element.type) {
        case "songline":
          body.push(this.renderSongLine(element as SongLine));
          break;
        case "comment":
        case "comment_italic":
        case "comment_box":
          body.push(this.renderComment(element as Comment));
          break;
        case "tab":
          body.push(this.renderTab(element));
          break;
        case "empty":
          body.push("<div class='songline'></div>");
          break;
        case "new_page":
        case "new_physical_page":
          body.push('<div style="page-break-after: always;"></div>');
          break;
        case "column_break":
          body.push('<div style="column-break-after: always;"></div>');
          break;
      }
    }

    // Close final context div if open
    if (insideContextDiv) {
      body.push("</div>");
    }

    body.push("</div>");
    return body.join("\n");
  }

  private renderSongLine(line: SongLine): string {
    const html: string[] = ['<div class="songline">'];

    // In ChordPro, chord[i] should appear above phrase[i+1]
    // phrase[0] is text before first chord
    // chord[0] goes with phrase[1], chord[1] with phrase[2], etc.
    
    // First phrase has no chord above it
    if (line.phrases.length > 0) {
      html.push(`<span class="lyric-text">${this.escapeHtml(line.phrases[0])}</span>`);
    }

    // Remaining phrases have chords
    for (let i = 0; i < line.chords.length; i++) {
      const chord = line.chords[i];
      const phrase = line.phrases[i + 1] || "";

      if (chord) {
        html.push(this.renderChordWithText(chord, phrase));
      } else {
        html.push(`<span class="lyric-text">${this.escapeHtml(phrase)}</span>`);
      }
    }

    html.push("</div>");
    return html.join("");
  }

  private renderChordWithText(chord: ChordAppearance, text: string): string {
    const lyric = text === "" ? "&nbsp;" : this.escapeHtml(text);
    return `<span class="chord"><span class="chord-text">${this.escapeHtml(chord.info.display || chord.key)}</span><span class="lyric-text">${lyric}</span></span>`;
  }

  private renderComment(comment: Comment): string {
    const className =
      comment.type === "comment_italic" ? "comment" : comment.type === "comment_box" ? "comment-box" : "comment";
    return `<div class="${className}">${this.escapeHtml(comment.text)}</div>`;
  }

  private renderTab(element: { text: string }): string {
    return `<div class="tab">${this.escapeHtml(element.text)}</div>`;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export function renderSongToHTML(song: Song, options?: RenderOptions): string {
  const renderer = new HTMLRenderer(song, options);
  return renderer.render();
}
