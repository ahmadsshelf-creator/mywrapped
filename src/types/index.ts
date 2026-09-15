// Music and Playback Types
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArt?: string; // base64 or data URL
  file?: File | Blob; // actual audio file
  fileUrl?: string; // object URL for playback
  genre?: string;
  year?: number;
  dateAdded: number; // timestamp
  lastPlayed?: number; // timestamp
  playCount: number;
  isFavorite: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  coverArt?: string;
}

export interface ListeningSession {
  id: string;
  songId: string;
  startTime: number;
  endTime?: number;
  listeningDuration: number; // in seconds
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  counted: boolean; // whether it counts toward stats
}

export interface SongStats {
  playCount: number;
  totalListeningTime: number; // in seconds
  lastPlayed?: number; // timestamp
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  songsPlayed: number;
  minutesListened: number;
  uniqueSongs: number;
  uniqueArtists: number;
  topSong?: string; // song ID
  topArtist?: string;
  mostActiveHour?: number; // 0-23
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  condition: string;
  unlockedAt?: number; // timestamp
  unlocked: boolean;
}

export interface QueueItem {
  songId: string;
  addedAt: number;
}

export interface LibraryMetadata {
  totalSongs: number;
  totalDuration: number;
  importedAt: number;
  lastScanned: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  volume: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffleEnabled: boolean;
  lastPlayedSongId?: string;
  lastPlayedTime?: number;
}

export enum PlaybackState {
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
}
