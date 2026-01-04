/**
 * ChordPro Parser
 * Main parser that converts tokens into a Song AST
 */

import { Lexer } from "./lexer";
import type { Token } from "./lexer";
import { ChordParser } from "./chordParser";
import type { ChordSystem } from "./chordParser";
import type {
  Song,
  SongLine,
  Comment,
  ChordAppearance,
  ParseResult,
  ParseError,
  Empty,
  ChordDef,
} from "./ast";

interface ParserState {
  context: "default" | "chorus" | "verse" | "bridge" | "tab" | "grid";
  xpose: number;
  capo: number | null;
  memchords: Map<string, string[]>;
  memorizing: boolean;
  usedChords: Set<string>;
  line: number;
}

export class Parser {
  private tokens: Token[];
  private position: number = 0;
  private state: ParserState;
  private chordParser: ChordParser;
  private errors: ParseError[] = [];
  private song: Partial<Song> = {
    meta: {},
    settings: {},
    body: [],
    chordsinfo: {},
    system: "common",
    structure: "linear",
  };

  constructor(tokens: Token[], system: ChordSystem = "common") {
    this.tokens = tokens;
    this.chordParser = new ChordParser(system);
    this.state = {
      context: "default",
      xpose: 0,
      capo: null,
      memchords: new Map(),
      memorizing: false,
      usedChords: new Set(),
      line: 0,
    };
  }

  parse(): ParseResult {
    try {
      while (!this.isAtEnd()) {
        const token = this.peek();

        switch (token.type) {
          case "directive":
            this.parseDirective(token);
            break;
          case "songline":
            this.parseSongLine(token);
            break;
          case "comment":
            this.parseComment(token);
            break;
          case "empty":
            this.song.body!.push({ type: "empty", context: this.state.context, line: token.line });
            break;
          case "eof":
            break;
        }

        this.advance();
      }

      return {
        song: this.song as Song,
        errors: this.errors,
        success: this.errors.filter((e) => e.type === "error").length === 0,
      };
    } catch (error) {
      this.errors.push({
        line: this.state.line,
        message: `Parse error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
      });

      return {
        errors: this.errors,
        success: false,
      };
    }
  }

  private parseDirective(token: Token): void {
    const content = token.value.trim();
    const colonIndex = content.indexOf(":");

    let key: string;
    let value: string;

    if (colonIndex > -1) {
      key = content.substring(0, colonIndex).trim().toLowerCase();
      value = content.substring(colonIndex + 1).trim();
    } else {
      key = content.toLowerCase();
      value = "";
    }

    // Handle directives
    switch (key) {
      case "t":
      case "title":
        this.song.title = value;
        if (!this.song.meta!) {
          this.song.meta = {};
        }
        this.song.meta[key] = [value];
        break;

      case "st":
      case "subtitle":
        if (!this.song.subtitle) this.song.subtitle = [];
        this.song.subtitle.push(value);
        if (!this.song.meta!) {
          this.song.meta = {};
        }
        this.song.meta[key] = this.song.subtitle;
        break;

      case "artist":
        this.song.artist = value;
        break;

      case "composer":
        this.song.composer = value;
        break;

      case "lyricist":
        this.song.lyricist = value;
        break;

      case "copyright":
        this.song.copyright = value;
        break;

      case "album":
        this.song.album = value;
        break;

      case "year":
        this.song.year = value;
        break;

      case "key":
        this.song.key = value;
        break;

      case "time":
        this.song.time = value;
        break;

      case "tempo":
        this.song.tempo = value;
        break;

      case "duration":
        this.song.duration = value;
        break;

      case "capo":
        this.state.capo = parseInt(value) || null;
        this.song.capo = this.state.capo;
        break;

      case "transpose":
        this.state.xpose = parseInt(value) || 0;
        break;

      case "columns":
      case "col":
        this.song.settings!.columns = parseInt(value);
        break;

      case "column_break":
      case "colb":
        this.song.body!.push({
          type: "column_break",
          line: token.line,
        });
        break;

      case "start_of_chorus":
      case "soc":
        this.state.context = "chorus";
        this.state.memorizing = true;
        break;

      case "end_of_chorus":
      case "eoc":
        this.state.context = "default";
        this.state.memorizing = false;
        break;

      case "start_of_verse":
      case "sov":
        this.state.context = "verse";
        break;

      case "end_of_verse":
      case "eov":
        this.state.context = "default";
        break;

      case "start_of_bridge":
      case "sob":
        this.state.context = "bridge";
        break;

      case "end_of_bridge":
      case "eob":
        this.state.context = "default";
        break;

      case "start_of_tab":
      case "sot":
        this.state.context = "tab";
        break;

      case "end_of_tab":
      case "eot":
        this.state.context = "default";
        break;

      case "start_of_grid":
      case "sog":
        this.state.context = "grid";
        this.state.memorizing = true;
        break;

      case "end_of_grid":
      case "eog":
        this.state.context = "default";
        this.state.memorizing = false;
        break;

      case "comment":
      case "c":
        this.song.body!.push({
          type: "comment",
          text: value,
          context: this.state.context,
          line: token.line,
        } as Comment);
        break;

      case "comment_italic":
      case "ci":
        this.song.body!.push({
          type: "comment_italic",
          text: value,
          context: this.state.context,
          line: token.line,
        } as Comment);
        break;

      case "comment_box":
      case "cb":
        this.song.body!.push({
          type: "comment_box",
          text: value,
          context: this.state.context,
          line: token.line,
        } as Comment);
        break;

      case "new_page":
      case "np":
        this.song.body!.push({
          type: "new_page",
          line: token.line,
        });
        break;

      case "new_physical_page":
      case "npp":
        this.song.body!.push({
          type: "new_physical_page",
          line: token.line,
        });
        break;

      case "define":
        // Parse chord definition: {define: Am base-fret 1 frets 0 0 2 2 1 0}
        this.parseChordDefinition(value);
        break;

      default:
        // Store in meta if unknown
        if (!this.song.meta!) {
          this.song.meta = {};
        }
        if (!this.song.meta![key]) {
          this.song.meta![key] = [];
        }
        this.song.meta![key].push(value);

        // Record a warning for unknown directive
        this.errors.push({
          line: token.line,
          message: `Unknown directive: {${key}}`,
          type: "warning",
        });
    }
  }

  private parseSongLine(token: Token): void {
    const line = token.value;

    // Skip empty lines
    if (!line.trim()) {
      this.song.body!.push({
        type: "empty",
        context: this.state.context,
        line: token.line,
      } as Empty);
      return;
    }

    // In tab context, treat as tab line
    if (this.state.context === "tab") {
      this.song.body!.push({
        type: "tab",
        text: line,
        context: this.state.context,
        line: token.line,
      });
      return;
    }

    // Extract chords and lyrics
    const { phrases, chords } = this.extractChordsFromLine(line);

    // Store used chords
    chords.forEach((chord) => {
      if (chord) {
        this.state.usedChords.add(chord.key);
        if (!this.song.chordsinfo![chord.key]) {
          this.song.chordsinfo![chord.key] = chord.info;
        }
      }
    });

    // Store memorized chords if in memorization mode
    if (this.state.memorizing && chords.length > 0) {
      const chordKeys = chords.map((c) => c?.key || "");
      if (!this.state.memchords.has(this.state.context)) {
        this.state.memchords.set(this.state.context, []);
      }
      this.state.memchords.set(this.state.context, chordKeys);
    }

    const songLine: SongLine = {
      type: "songline",
      context: this.state.context,
      phrases,
      chords,
      line: token.line,
    };

    this.song.body!.push(songLine);
  }

  private extractChordsFromLine(line: string): {
    phrases: string[];
    chords: (ChordAppearance | null)[];
  } {
    const phrases: string[] = [];
    const chords: (ChordAppearance | null)[] = [];

    const chordPattern = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = chordPattern.exec(line)) !== null) {
      // Text before chord
      const phrase = line.substring(lastIndex, match.index);
      phrases.push(phrase);

      // Parse chord
      const chordStr = match[1];
      const chordInfo = this.chordParser.parseChord(chordStr);

      let chord: ChordAppearance | null = null;
      if (chordInfo) {
        // Apply transposition
        if (this.state.xpose !== 0) {
          const transposed = this.chordParser.transposeChord(chordInfo, this.state.xpose);
          chord = {
            key: transposed.key,
            info: transposed,
            orig: chordStr,
          };
        } else {
          chord = {
            key: chordInfo.key,
            info: chordInfo,
            orig: chordStr,
          };
        }
      }

      chords.push(chord);
      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    const lastPhrase = line.substring(lastIndex);
    phrases.push(lastPhrase);

    return { phrases, chords };
  }

  private parseChordDefinition(value: string): void {
    // Parse: "Am base-fret 1 frets 0 0 2 2 1 0" or "Am frets 0 0 2 2 1 0"
    const parts = value.split(/\s+/);
    if (parts.length < 2) return;

    const name = parts[0];
    const definition: {
      base?: string;
      basefret?: number;
      strings?: number[];
      frets?: number[][];
    } = {};

    let i = 1;
    while (i < parts.length) {
      const key = parts[i];
      
      if (key === "base-fret" && i + 1 < parts.length) {
        definition.basefret = parseInt(parts[i + 1]);
        i += 2;
      } else if (key === "frets" && i + 1 < parts.length) {
        // Remaining values are fret positions
        definition.strings = [];
        for (let j = i + 1; j < parts.length; j++) {
          const val = parts[j];
          if (val === "x" || val === "X") {
            definition.strings.push(-1); // Muted
          } else {
            definition.strings.push(parseInt(val));
          }
        }
        break;
      } else {
        i++;
      }
    }

    const chordDef: ChordDef = {
      type: "chord_def",
      name,
      definition,
      display: name,
    };

    if (!this.song.define) {
      this.song.define = [];
    }
    this.song.define.push(chordDef);
  }

  private parseComment(token: Token): void {
    const text = token.value.substring(1).trim(); // Remove # prefix
    this.song.body!.push({
      type: "comment",
      text,
      context: this.state.context,
      line: token.line,
    } as Comment);
  }

  private peek(): Token {
    return this.tokens[this.position] || { type: "eof", value: "", line: 0, column: 0 };
  }

  private advance(): void {
    if (!this.isAtEnd()) {
      this.position++;
    }
  }

  private isAtEnd(): boolean {
    return this.peek().type === "eof";
  }
}

/**
 * Main parsing function
 */
export function parseChordPro(input: string, system: ChordSystem = "common"): ParseResult {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, system);
  return parser.parse();
}
