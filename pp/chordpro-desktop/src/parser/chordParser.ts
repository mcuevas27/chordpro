/**
 * ChordPro Chord Parser
 * Parses chord notation (e.g., "Dm7", "C/G", "Am7b5") into structured ChordInfo
 */

import type { ChordInfo } from "./ast";

export type ChordSystem = "common" | "nashville" | "roman" | "solfege";

export class ChordParser {
  private system: ChordSystem;
  private noteMap: Map<string, number>;
  private noteNames: string[];
  private qualityMap: Map<string, string>;

  constructor(system: ChordSystem = "common") {
    this.system = system;

    // Note to semitone mapping (C=0, C#=1, D=2, etc.)
    this.noteMap = new Map([
      // English
      ["C", 0],
      ["D", 2],
      ["E", 4],
      ["F", 5],
      ["G", 7],
      ["A", 9],
      ["B", 11],
      // German
      ["H", 11], // B is called H in German
      ["Bes", 10], // Bb
      ["Ces", 11], // B (enharmonic)
      ["Des", 1], // Db
      ["Es", 3], // Eb
      ["Fes", 4], // E (enharmonic)
      ["Ges", 6], // Gb
      ["As", 8], // Ab
      ["Ases", 7], // G# (enharmonic)
      ["Eis", 5], // F (enharmonic)
      // Solfege
      ["Do", 0],
      ["Re", 2],
      ["Mi", 4],
      ["Fa", 5],
      ["Sol", 7],
      ["La", 9],
      ["Si", 11],
    ]);

    this.noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // Quality mappings
    this.qualityMap = new Map([
      ["", ""],
      ["maj", "maj"],
      ["min", "-"],
      ["m", "-"],
      ["-", "-"],
      ["dim", "o"],
      ["°", "o"],
      ["aug", "+"],
      ["+", "+"],
      ["sus", "sus"],
      ["sus2", "sus2"],
      ["sus4", "sus4"],
      ["add", "add"],
      ["add2", "add2"],
      ["add4", "add4"],
      ["add9", "add9"],
    ]);
  }

  /**
   * Parse a chord string into ChordInfo
   * Examples: "D", "Dm7", "C/G", "Am7b5", "C#m7#11"
   */
  parseChord(chordStr: string): ChordInfo | null {
    if (!chordStr || !chordStr.trim()) {
      return null;
    }

    const normalized = chordStr.trim();

    // Handle special cases
    if (normalized.toUpperCase() === "NC" || normalized.toUpperCase() === "N.C.") {
      return this.createChordInfo(
        normalized,
        "",
        "",
        "",
        0,
        0,
        undefined
      );
    }

    // Split by slash for bass note
    const [mainPart, bassStr] = normalized.split("/");
    let bass: string | undefined;
    let bassOrd: number | undefined;
    let bassMod: -1 | 0 | 1 | undefined;

    if (bassStr) {
      const bassInfo = this.parseNote(bassStr.trim());
      if (bassInfo) {
        bass = bassInfo.name;
        bassOrd = bassInfo.ord;
        bassMod = bassInfo.mod;
      }
    }

    // Parse root and quality
    const rootMatch = mainPart.match(/^([A-Ga-g](?:[♯#♭b]|is|es)?)/);
    if (!rootMatch) {
      return null;
    }

    const rootStr = rootMatch[1];
    const rootInfo = this.parseNote(rootStr);
    if (!rootInfo) {
      return null;
    }

    const remainder = mainPart.substring(rootStr.length);

    // Parse quality and extension
    let quality = "";
    let qualityCanon = "";
    let extension = "";
    let extensionCanon = "";

    if (remainder) {
      // Try to extract quality (m, min, dim, aug, sus, etc.)
      const qualMatch = remainder.match(
        /^(maj|min|m|dim|°|aug|\+|sus|sus2|sus4|add2|add4|add9|add11)/i
      );
      if (qualMatch) {
        quality = qualMatch[1];
        qualityCanon = this.qualityMap.get(quality.toLowerCase()) || quality;
        const afterQual = remainder.substring(qualMatch[1].length);

        // Rest is extension
        extension = afterQual;
        extensionCanon = this.normalizeExtension(afterQual);
      } else {
        // No quality prefix, rest is extension
        extension = remainder;
        extensionCanon = this.normalizeExtension(remainder);
      }
    }

    const key = this.createChordKey(
      rootInfo.name,
      qualityCanon,
      extensionCanon
    );

    return this.createChordInfo(
      normalized,
      key,
      rootInfo.name,
      rootInfo.name, // root_canon
      rootInfo.ord,
      rootInfo.mod,
      quality,
      qualityCanon,
      extension,
      extensionCanon,
      bass,
      bassOrd,
      bassMod
    );
  }

  /**
   * Transpose a chord by semitones
   */
  transposeChord(chord: ChordInfo, semitones: number): ChordInfo {
    if (!chord || chord.key === "NC") {
      return chord;
    }

    const newRootOrd = (chord.root_ord + semitones) % 12;
    const newRootName = this.noteNames[newRootOrd < 0 ? newRootOrd + 12 : newRootOrd];

    const newBassOrd = chord.bass_ord !== undefined
      ? (chord.bass_ord + semitones) % 12
      : undefined;
    const newBassName = newBassOrd !== undefined
      ? this.noteNames[newBassOrd < 0 ? newBassOrd + 12 : newBassOrd]
      : undefined;

    const newKey = this.createChordKey(newRootName, chord.qual_canon, chord.ext_canon);

    return this.createChordInfo(
      `${newRootName}${chord.qual}${chord.ext}${newBassName ? "/" + newBassName : ""}`,
      newKey,
      newRootName,
      newRootName,
      newRootOrd < 0 ? newRootOrd + 12 : newRootOrd,
      0,
      chord.qual,
      chord.qual_canon,
      chord.ext,
      chord.ext_canon,
      newBassName,
      newBassOrd,
      0
    );
  }

  private parseNote(noteStr: string): { name: string; ord: number; mod: -1 | 0 | 1 } | null {
    const str = noteStr.toLowerCase();

    // Check direct mapping
    if (this.noteMap.has(str)) {
      const ord = this.noteMap.get(str)!;
      return { name: noteStr, ord, mod: 0 };
    }

    // Try with sharp/flat
    const sharpMatch = str.match(/^([a-g])(♯|#|is)?(.*)$/);
    if (sharpMatch) {
      const base = sharpMatch[1].toUpperCase();
      const sharp = sharpMatch[2];
      const modifier = sharpMatch[3];

      const baseOrd = this.noteMap.get(base);
      if (baseOrd === undefined) return null;

      let ord = baseOrd;
      let mod: -1 | 0 | 1 = 0;
      let name = base;

      if (sharp && (sharp === "#" || sharp === "♯" || sharp === "is")) {
        ord = (ord + 1) % 12;
        mod = 1;
        name += "#";
      } else if (modifier === "b" || modifier === "♭" || modifier === "es") {
        ord = (ord - 1 + 12) % 12;
        mod = -1;
        name += "b";
      }

      return { name, ord, mod };
    }

    return null;
  }

  private normalizeExtension(ext: string): string {
    if (!ext) return "";

    // Normalize common variations
    return ext
      .replace(/maj7/i, "maj7")
      .replace(/maj9/i, "maj9")
      .replace(/min7/i, "7")
      .replace(/7b5/i, "7b5")
      .replace(/7#9/i, "7#9")
      .toLowerCase();
  }

  private createChordKey(
    root: string,
    quality: string,
    extension: string
  ): string {
    return `${root}${quality}${extension}`;
  }

  private createChordInfo(
    name: string,
    key: string,
    root: string,
    rootCanon: string,
    rootOrd: number,
    rootMod: -1 | 0 | 1,
    quality: string = "",
    qualCanon: string = "",
    extension: string = "",
    extCanon: string = "",
    bass?: string,
    bassOrd?: number,
    bassMod?: -1 | 0 | 1
  ): ChordInfo {
    return {
      key,
      name,
      root,
      root_canon: rootCanon,
      root_ord: rootOrd,
      root_mod: rootMod,
      qual: quality,
      qual_canon: qualCanon,
      ext: extension,
      ext_canon: extCanon,
      bass,
      bass_canon: bass,
      bass_ord: bassOrd,
      bass_mod: bassMod,
      system: this.system as ChordSystem,
      display: name,
    };
  }
}
