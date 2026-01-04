/**
 * ChordPro Lexer / Tokenizer
 * Converts raw ChordPro text into structured tokens
 */

export type TokenType =
  | "directive"
  | "songline"
  | "chord"
  | "text"
  | "empty"
  | "comment"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(input: string) {
    // Normalize line endings
    this.input = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.scanToken();
    }

    this.tokens.push({
      type: "eof",
      value: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

  private scanToken(): void {
    const startLine = this.line;
    const startColumn = this.column;

    // Skip whitespace (except newlines)
    if (this.match(/[ \t]/)) {
      while (this.match(/[ \t]/)) {
        // Keep skipping
      }
      return;
    }

    // Newline
    if (this.match(/\n/)) {
      this.line++;
      this.column = 1;
      this.tokens.push({
        type: "empty",
        value: "\n",
        line: startLine,
        column: startColumn,
      });
      return;
    }

    // Directive: {key:value} or {key} 
    if (this.peek() === "{") {
      this.position++;
      this.column++;
      const directiveStart = this.position;

      // Find closing }
      while (this.position < this.input.length && this.peek() !== "}") {
        if (this.peek() === "\n") {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        this.position++;
      }

      if (this.peek() === "}") {
        const directiveContent = this.input.substring(
          directiveStart,
          this.position
        );
        this.position++; // Skip closing }
        this.column++;

        this.tokens.push({
          type: "directive",
          value: directiveContent,
          line: startLine,
          column: startColumn,
        });
      }
      return;
    }

    // Comment line (starts with #)
    if (this.peek() === "#") {
      const commentStart = this.position;
      while (
        this.position < this.input.length &&
        this.peek() !== "\n"
      ) {
        this.position++;
        this.column++;
      }

      const commentText = this.input.substring(commentStart, this.position);
      this.tokens.push({
        type: "comment",
        value: commentText,
        line: startLine,
        column: startColumn,
      });
      return;
    }

    // Song line (contains text and potentially chords)
    const lineStart = this.position;
    const lineStartColumn = this.column;

    while (
      this.position < this.input.length &&
      this.peek() !== "\n"
    ) {
      this.position++;
      this.column++;
    }

    const lineContent = this.input.substring(lineStart, this.position);
    if (lineContent.trim().length > 0) {
      this.tokens.push({
        type: "songline",
        value: lineContent,
        line: startLine,
        column: lineStartColumn,
      });
    }
  }

  private peek(): string {
    if (this.position >= this.input.length) {
      return "\0"; // EOF marker
    }
    return this.input[this.position];
  }

  private match(pattern: RegExp): boolean {
    const regex = new RegExp("^" + pattern.source);
    const substring = this.input.substring(this.position);

    if (regex.test(substring)) {
      const match = substring.match(regex);
      if (match) {
        const matchedText = match[0];
        this.position += matchedText.length;

        // Handle line/column tracking
        for (const char of matchedText) {
          if (char === "\n") {
            this.line++;
            this.column = 1;
          } else {
            this.column++;
          }
        }

        return true;
      }
    }

    return false;
  }
}
