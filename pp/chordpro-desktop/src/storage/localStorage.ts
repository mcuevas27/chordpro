/**
 * Local Storage Module
 * Handles saving/loading songs, preferences, and configuration
 */

export interface StoredSong {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  createdAt: number;
}

export interface UserPreferences {
  theme: "light" | "dark";
  fontSize: number;
  editorFontSize: number;
  previewColumns: number;
  autosave: boolean;
  autoSaveInterval: number;
}

const STORAGE_KEYS = {
  SONGS: "chordpro_songs",
  RECENT_FILES: "chordpro_recent_files",
  PREFERENCES: "chordpro_preferences",
  CURRENT_CONFIG: "chordpro_current_config",
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "light",
  fontSize: 14,
  editorFontSize: 13,
  previewColumns: 2,
  autosave: true,
  autoSaveInterval: 30000, // 30 seconds
};

export class LocalStorage {
  /**
   * Save a song
   */
  static saveSong(song: StoredSong): void {
    const songs = this.getAllSongs();
    const existingIndex = songs.findIndex((s) => s.id === song.id);

    if (existingIndex >= 0) {
      songs[existingIndex] = song;
    } else {
      songs.push(song);
    }

    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    this.addToRecentFiles(song.id, song.title);
  }

  /**
   * Get a song by ID
   */
  static getSong(id: string): StoredSong | null {
    const songs = this.getAllSongs();
    return songs.find((s) => s.id === id) || null;
  }

  /**
   * Get all saved songs
   */
  static getAllSongs(): StoredSong[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SONGS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Delete a song
   */
  static deleteSong(id: string): void {
    const songs = this.getAllSongs().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    this.removeFromRecentFiles(id);
  }

  /**
   * Add to recent files list
   */
  private static addToRecentFiles(id: string, title: string): void {
    const recent = this.getRecentFiles();
    const newRecent = [
      { id, title, accessedAt: Date.now() },
      ...recent.filter((r) => r.id !== id),
    ].slice(0, 10); // Keep last 10

    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(newRecent));
  }

  /**
   * Remove from recent files list
   */
  private static removeFromRecentFiles(id: string): void {
    const recent = this.getRecentFiles().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(recent));
  }

  /**
   * Get recent files list
   */
  static getRecentFiles(): Array<{ id: string; title: string; accessedAt: number }> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_FILES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user preferences
   */
  static getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save user preferences
   */
  static savePreferences(prefs: Partial<UserPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  }

  /**
   * Get current config (for chord diagrams, fonts, etc.)
   */
  static getCurrentConfig(): Record<string, unknown> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CONFIG);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Save current config
   */
  static saveCurrentConfig(config: Record<string, unknown>): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONFIG, JSON.stringify(config));
  }

  /**
   * Clear all data
   */
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Export all songs as JSON
   */
  static exportSongs(): string {
    const songs = this.getAllSongs();
    return JSON.stringify(songs, null, 2);
  }

  /**
   * Import songs from JSON
   */
  static importSongs(jsonData: string): void {
    try {
      const songs = JSON.parse(jsonData) as StoredSong[];
      const existing = this.getAllSongs();

      // Merge, keeping existing songs if IDs conflict
      const merged = new Map<string, StoredSong>();
      existing.forEach((s) => merged.set(s.id, s));
      songs.forEach((s) => {
        if (!merged.has(s.id)) {
          merged.set(s.id, s);
        }
      });

      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(Array.from(merged.values())));
    } catch (error) {
      throw new Error(`Failed to import songs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Generate a unique ID for new songs
 */
export function generateSongId(): string {
  return `song_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
