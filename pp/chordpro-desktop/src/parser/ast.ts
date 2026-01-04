/**
 * ChordPro Abstract Syntax Tree (AST) Type Definitions
 * Matches the structure of lib/ChordPro/Song.pm
 */

export interface ChordInfo {
  key: string;
  name: string;
  root: string;
  root_canon: string;
  root_ord: number; // 0-11
  root_mod: -1 | 0 | 1; // -1 (flat), 0 (natural), 1 (sharp)
  qual: string; // quality: m, dim, aug, etc.
  qual_canon: string;
  ext: string; // extension: 7, 9, 11, 13, etc.
  ext_canon: string;
  bass?: string;
  bass_canon?: string;
  bass_ord?: number;
  bass_mod?: -1 | 0 | 1;
  system: "common" | "nashville" | "roman" | "solfege";
  display?: string; // Formatted display name
}

export interface ChordAppearance {
  key: string; // Lookup key in chordsinfo
  info: ChordInfo;
  orig: string; // Original text as written
  format?: string; // Markup format string
}

export type BodyElement =
  | SongLine
  | Comment
  | Empty
  | Image
  | Tabline
  | Gridline
  | Rechorus
  | Set
  | Control
  | ChordDef
  | NewPage;

export interface SongLine {
  type: "songline";
  context: string; // "default", "chorus", "verse", "bridge", "tab", "grid"
  phrases: string[]; // Text between chords
  chords: (ChordAppearance | null)[]; // Chords or empty positions
  line?: number; // Source line number
}

export interface Comment {
  type: "comment" | "comment_italic" | "comment_box";
  text: string;
  chords?: ChordAppearance[];
  phrases?: string[];
  context: string;
  line?: number;
}

export interface Empty {
  type: "empty";
  context: string;
  line?: number;
}

export interface Image {
  type: "image";
  src: string; // File path or data URI
  alt?: string;
  width?: number;
  height?: number;
  context: string;
  line?: number;
}

export interface Tabline {
  type: "tab";
  text: string;
  context: string;
  line?: number;
}

export interface GridToken {
  type: "bar" | "chord" | "chords" | "repeat1" | "repeat2" | "slash" | "space";
  symbol?: string; // For bars, repeats, slash, space
  chord?: ChordAppearance; // For single chord
  chords?: ChordAppearance[]; // For multiple chords in cell
  class?: string; // CSS class
}

export interface Gridline {
  type: "gridline";
  tokens: GridToken[];
  margin?: {
    text: string;
    chords?: ChordAppearance[];
  };
  comment?: {
    text: string;
  };
  context: string;
  line?: number;
}

export interface Rechorus {
  type: "rechorus";
  chorus?: BodyElement[];
  context?: string;
  line?: number;
}

export interface Set {
  type: "set";
  name: string;
  value: unknown;
  context: string;
  line?: number;
}

export interface Control {
  type: "control";
  name: string;
  value: unknown;
  previous?: unknown;
  context?: string;
  line?: number;
}

export interface ChordDef {
  type: "chord_def";
  name: string;
  definition: {
    base?: string;
    basefret?: number;
    strings?: number[];
    frets?: number[][];
  };
  display?: string;
  context?: string;
  line?: number;
}

export interface NewPage {
  type: "new_page" | "new_physical_page" | "column_break";
  context?: string;
  line?: number;
}

export interface Song {
  title?: string;
  subtitle?: string[];
  artist?: string;
  composer?: string;
  lyricist?: string;
  copyright?: string;
  album?: string;
  year?: string;
  key?: string;
  time?: string;
  tempo?: string;
  duration?: string;
  capo?: number | null;
  meta: Record<string, string[]>; // All metadata
  settings: {
    columns?: number;
    titles?: "left" | "center" | "right";
    diagrams?: boolean;
    transpose?: number;
    capo?: number | null;
    decapo?: number | null;
    grid?: boolean;
    gridsystem?: "common" | "solfege" | "nashville" | "roman";
    [key: string]: unknown;
  };
  body: BodyElement[];
  chordsinfo: Record<string, ChordInfo>;
  define?: ChordDef[];
  source?: {
    file: string;
    line: number;
  };
  structure: "linear" | "structured";
  system: "common" | "nashville" | "roman" | "solfege";
}

export interface ParseError {
  line: number;
  column?: number;
  message: string;
  type: "error" | "warning";
}

export interface ParseResult {
  song?: Song;
  errors: ParseError[];
  success: boolean;
}
