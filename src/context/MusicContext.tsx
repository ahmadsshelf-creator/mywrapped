// Fixed Music context for managing library and playback state

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Song,
  Playlist,
  ListeningSession,
  DailyStats,
  PlaybackState,
  QueueItem,
  AppSettings,
} from '../types';
import {
  saveToDB,
  getAllFromDB,
  getFromDB,
  deleteFromDB,
  DB_STORES,
} from '../utils/storage';
import { shouldCountAsPlayed } from '../utils/statistics';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

interface MusicContextType {
  // Songs
  songs: Song[];
  addSongs: (newSongs: Song[]) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  updateSongMetadata: (songId: string, updates: Partial<Song>) => Promise<void>;
  toggleFavorite: (songId: string) => Promise<void>;

  // Playback
  currentSongId: string | null;
  playbackState: PlaybackState;
  currentTime: number;
  play: (songId: string) => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;

  // Queue
  queue: QueueItem[];
  queueIndex: number;
  addToQueue: (songId: string) => Promise<void>;
  removeFromQueue: (index: number) => Promise<void>;
  clearQueue: () => Promise<void>;
  playNext: () => void;
  playPrevious: () => void;

  // Playlists
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Promise<string>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;

  // Listening sessions
  sessions: ListeningSession[];
  recordListeningSession: (songId: string, duration: number) => Promise<void>;

  // Stats
  dailyStats: DailyStats[];
  refreshStats: () => Promise<void>;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(PlaybackState.Stopped);
  const [currentTime, setCurrentTime] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [sessions, setSessions] = useState<ListeningSession[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    volume: 1,
    repeatMode: 'off',
    shuffleEnabled: false,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const listeningSessionRef = useRef<{ startTime: number; songId: string } | null>(null);
  const playNextCallbackRef = useRef<() => void>();

  // Load initial data
  useEffect(() => {
    (async () => {
      try {
        const loadedSongs = await getAllFromDB<Song>(DB_STORES.SONGS);
        setSongs(loadedSongs);

        const loadedPlaylists = await getAllFromDB<Playlist>(DB_STORES.PLAYLISTS);
        setPlaylists(loadedPlaylists);

        const loadedSessions = await getAllFromDB<ListeningSession>(DB_STORES.LISTENING_SESSIONS);
        setSessions(loadedSessions);

        const loadedStats = await getAllFromDB<DailyStats>(DB_STORES.DAILY_STATS);
        setDailyStats(loadedStats);

        const savedSettings = await getFromDB<AppSettings>(DB_STORES.SETTINGS, 'app-settings');
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error('Error loading data from DB:', error);
      }
    })();
  }, []);

  const recordListeningSessionImpl = useCallback(
    async (songId: string, listeningDuration: number) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) return;

      const counted = shouldCountAsPlayed(listeningDuration, song.duration);
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const hour = now.getHours();

      const session: ListeningSession = {
        id: generateId(),
        songId,
        startTime: Date.now(),
        endTime: Date.now(),
        listeningDuration,
        date,
        hour,
        counted,
      };

      await saveToDB(DB_STORES.LISTENING_SESSIONS, session);
      setSessions((prev) => [...prev, session]);

      // Update song stats
      if (counted) {
        const newPlayCount = song.playCount + 1;
        const updated: Song = {
          ...song,
          playCount: newPlayCount,
          lastPlayed: Date.now(),
        };
        await saveToDB(DB_STORES.SONGS, updated);
        setSongs((prev) => prev.map((s) => (s.id === songId ? updated : s)));
      }
    },
    [songs]
  );

  playNextCallbackRef.current = () => {
    // Record current session if threshold met
    if (listeningSessionRef.current && audioRef.current) {
      const duration = audioRef.current.currentTime;
      recordListeningSessionImpl(listeningSessionRef.current.songId, duration);
    }

    if (queue.length === 0) return;

    const nextIndex = (queueIndex + 1) % queue.length;
    setQueueIndex(nextIndex);
    const nextSong = queue[nextIndex];
    const song = songs.find((s) => s.id === nextSong.songId);
    if (song && song.fileUrl && audioRef.current) {
      audioRef.current.src = song.fileUrl;
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
      setCurrentSongId(nextSong.songId);
      setCurrentTime(0);
      listeningSessionRef.current = {
        startTime: Date.now(),
        songId: nextSong.songId,
      };
    }
  };

  // Audio element setup
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handlePlay = () => setPlaybackState(PlaybackState.Playing);
    const handlePause = () => setPlaybackState(PlaybackState.Paused);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      if (playNextCallbackRef.current) {
        playNextCallbackRef.current();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const addSongs = useCallback(
    async (newSongs: Song[]) => {
      const updatedSongs = [...songs];
      for (const song of newSongs) {
        await saveToDB(DB_STORES.SONGS, song);
        updatedSongs.push(song);
      }
      setSongs(updatedSongs);
    },
    [songs]
  );

  const removeSong = useCallback(async (songId: string) => {
    await deleteFromDB(DB_STORES.SONGS, songId);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
  }, []);

  const updateSongMetadata = useCallback(
    async (songId: string, updates: Partial<Song>) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) return;

      const updated = { ...song, ...updates };
      await saveToDB(DB_STORES.SONGS, updated);
      setSongs((prev) => prev.map((s) => (s.id === songId ? updated : s)));
    },
    [songs]
  );

  const toggleFavorite = useCallback(
    async (songId: string) => {
      const song = songs.find((s) => s.id === songId);
      if (!song) return;

      const updated = { ...song, isFavorite: !song.isFavorite };
      await saveToDB(DB_STORES.SONGS, updated);
      setSongs((prev) => prev.map((s) => (s.id === songId ? updated : s)));
    },
    [songs]
  );

  const play = useCallback(
    (songId: string) => {
      setCurrentSongId(songId);
      setCurrentTime(0);

      const song = songs.find((s) => s.id === songId);
      if (song && song.fileUrl) {
        if (audioRef.current) {
          audioRef.current.src = song.fileUrl;
          audioRef.current.play().catch((err) => console.error('Playback error:', err));
        }

        // Record listening session start
        listeningSessionRef.current = {
          startTime: Date.now(),
          songId,
        };
      }
    },
    [songs]
  );

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlaybackState(PlaybackState.Paused);
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
    }
  }, []);

  const setCurrentTimeHandler = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  }, []);

  const addToQueue = useCallback(async (songId: string) => {
    const newQueueItem: QueueItem = {
      songId,
      addedAt: Date.now(),
    };
    setQueue((prev) => [...prev, newQueueItem]);
  }, []);

  const removeFromQueue = useCallback(async (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(async () => {
    setQueue([]);
    setQueueIndex(0);
  }, []);

  const playNext = useCallback(() => {
    if (playNextCallbackRef.current) {
      playNextCallbackRef.current();
    }
  }, []);

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    const prevSong = queue[prevIndex];
    const song = songs.find((s) => s.id === prevSong.songId);
    if (song && song.fileUrl && audioRef.current) {
      audioRef.current.src = song.fileUrl;
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
      setCurrentSongId(prevSong.songId);
      setCurrentTime(0);
      listeningSessionRef.current = {
        startTime: Date.now(),
        songId: prevSong.songId,
      };
    }
  }, [queue, queueIndex, songs]);

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    const playlist: Playlist = {
      id: generateId(),
      name,
      description,
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveToDB(DB_STORES.PLAYLISTS, playlist);
    setPlaylists((prev) => [...prev, playlist]);
    return playlist.id;
  }, []);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    await deleteFromDB(DB_STORES.PLAYLISTS, playlistId);
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const updatePlaylist = useCallback(
    async (playlistId: string, updates: Partial<Playlist>) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;

      const updated = { ...playlist, ...updates, updatedAt: Date.now() };
      await saveToDB(DB_STORES.PLAYLISTS, updated);
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
    },
    [playlists]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;

      if (!playlist.songIds.includes(songId)) {
        const updated = {
          ...playlist,
          songIds: [...playlist.songIds, songId],
          updatedAt: Date.now(),
        };
        await saveToDB(DB_STORES.PLAYLISTS, updated);
        setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
      }
    },
    [playlists]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) return;

      const updated = {
        ...playlist,
        songIds: playlist.songIds.filter((id) => id !== songId),
        updatedAt: Date.now(),
      };
      await saveToDB(DB_STORES.PLAYLISTS, updated);
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? updated : p)));
    },
    [playlists]
  );

  const refreshStats = useCallback(async () => {
    const loadedStats = await getAllFromDB<DailyStats>(DB_STORES.DAILY_STATS);
    setDailyStats(loadedStats);
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const updated = { ...settings, ...updates };
      await saveToDB(DB_STORES.SETTINGS, { key: 'app-settings', ...updated });
      setSettings(updated);
    },
    [settings]
  );

  const value: MusicContextType = {
    songs,
    addSongs,
    removeSong,
    updateSongMetadata,
    toggleFavorite,
    currentSongId,
    playbackState,
    currentTime,
    play,
    pause,
    resume,
    setCurrentTime: setCurrentTimeHandler,
    queue,
    queueIndex,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    playlists,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    sessions,
    recordListeningSession: recordListeningSessionImpl,
    dailyStats,
    refreshStats,
    settings,
    updateSettings,
  };

  return (
    <MusicContext.Provider value={value}>
      <audio ref={audioRef} />
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
