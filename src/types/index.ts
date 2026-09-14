export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file: File | Blob;
  fileUrl: string;
  albumArt?: string;
  plays: number;
  lastPlayed?: number;
  totalListenTime: number;
  dateAdded: number;
  isFavorite: boolean;
  genre?: string;
  year?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  artwork?: string;
}

export interface ListeningSession {
  id: string;
  songId: string;
  startTime: number;
  endTime: number;
  duration: number;
  playedAt: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  condition: string;
}

export interface Statistics {
  totalPlays: number;
  totalListenTime: number;
  uniqueSongs: number;
  uniqueArtists: number;
  mostPlayedSong?: Song;
  mostPlayedArtist?: string;
  listeningStreak: number;
  lastListenDate?: number;
}

export interface WrappedData {
  date: string;
  totalMinutes: number;
  songsPlayed: number;
  topSong?: Song;
  topArtist?: string;
  topHour: number;
  uniqueArtists: number;
  listeningStreak: number;
  sessions: ListeningSession[];
}
