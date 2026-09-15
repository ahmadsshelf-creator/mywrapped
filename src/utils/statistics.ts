// Calculate listening statistics

import { Song, ListeningSession, DailyStats, Badge } from '../types';

const LISTENING_THRESHOLD = 30; // seconds before counting as "played"
const LISTENING_PERCENTAGE_THRESHOLD = 0.5; // 50% of song duration

export function shouldCountAsPlayed(listeningDuration: number, songDuration: number): boolean {
  return listeningDuration >= LISTENING_THRESHOLD && listeningDuration >= songDuration * LISTENING_PERCENTAGE_THRESHOLD;
}

export function calculateDailyStats(sessions: ListeningSession[]): DailyStats {
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === today && s.counted);

  const songsPlayed = todaySessions.length;
  const minutesListened = Math.round(todaySessions.reduce((sum, s) => sum + s.listeningDuration, 0) / 60);

  const uniqueSongsSet = new Set(todaySessions.map((s) => s.songId));
  const uniqueSongs = uniqueSongsSet.size;

  return {
    date: today,
    songsPlayed,
    minutesListened,
    uniqueSongs,
    uniqueArtists: 0, // Populated by caller if they have song data
    topSong: todaySessions.length > 0 ? todaySessions[0].songId : undefined,
    mostActiveHour: undefined,
  };
}

export function getListeningStreak(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const stat = dailyStats.find((s) => s.date === dateStr);

    if (!stat || stat.songsPlayed === 0) {
      break;
    }

    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

export function getMostPlayedSong(sessions: ListeningSession[], songs: Map<string, Song>): string | undefined {
  const songCounts = new Map<string, number>();

  sessions.forEach((session) => {
    if (session.counted) {
      songCounts.set(session.songId, (songCounts.get(session.songId) || 0) + 1);
    }
  });

  let maxSongId: string | undefined;
  let maxCount = 0;

  songCounts.forEach((count, songId) => {
    if (count > maxCount) {
      maxCount = count;
      maxSongId = songId;
    }
  });

  return maxSongId;
}

export function getMostPlayedArtist(sessions: ListeningSession[], songs: Map<string, Song>): string | undefined {
  const artistCounts = new Map<string, number>();

  sessions.forEach((session) => {
    if (session.counted) {
      const song = songs.get(session.songId);
      if (song) {
        artistCounts.set(song.artist, (artistCounts.get(song.artist) || 0) + 1);
      }
    }
  });

  let maxArtist: string | undefined;
  let maxCount = 0;

  artistCounts.forEach((count, artist) => {
    if (count > maxCount) {
      maxCount = count;
      maxArtist = artist;
    }
  });

  return maxArtist;
}

export function getMostActiveListeningHour(sessions: ListeningSession[]): number | undefined {
  const hourCounts = new Array(24).fill(0);

  sessions.forEach((session) => {
    if (session.counted) {
      hourCounts[session.hour]++;
    }
  });

  let maxHour = 0;
  let maxCount = 0;
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      maxHour = hour;
    }
  });

  return maxCount > 0 ? maxHour : undefined;
}

export function getTotalListeningTime(sessions: ListeningSession[]): number {
  return sessions.reduce((sum, session) => {
    return sum + (session.counted ? session.listeningDuration : 0);
  }, 0);
}

export function getUniqueArtistCount(sessions: ListeningSession[], songs: Map<string, Song>): number {
  const artists = new Set<string>();

  sessions.forEach((session) => {
    if (session.counted) {
      const song = songs.get(session.songId);
      if (song) {
        artists.add(song.artist);
      }
    }
  });

  return artists.size;
}

export function getUniqueSongCount(sessions: ListeningSession[]): number {
  const songs = new Set<string>();

  sessions.forEach((session) => {
    if (session.counted) {
      songs.add(session.songId);
    }
  });

  return songs.size;
}

export function getWeeklyStats(sessions: ListeningSession[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

  const weeklySessions = sessions.filter((s) => s.date >= oneWeekAgoStr && s.counted);
  return weeklySessions.reduce((sum, s) => sum + s.listeningDuration, 0);
}

export function getMonthlyStats(sessions: ListeningSession[]): number {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoStr = oneMonthAgo.toISOString().split('T')[0];

  const monthlySessions = sessions.filter((s) => s.date >= oneMonthAgoStr && s.counted);
  return monthlySessions.reduce((sum, s) => sum + s.listeningDuration, 0);
}

export function isNightOwl(sessions: ListeningSession[]): boolean {
  const nightHours = [22, 23, 0, 1, 2, 3, 4, 5]; // 10 PM to 5 AM
  const nightSessions = sessions.filter((s) => s.counted && nightHours.includes(s.hour));
  return nightSessions.length > sessions.filter((s) => s.counted).length * 0.3;
}

export function isEarlyBird(sessions: ListeningSession[]): boolean {
  const earlyHours = [5, 6, 7, 8, 9]; // 5 AM to 9 AM
  const earlySessions = sessions.filter((s) => s.counted && earlyHours.includes(s.hour));
  return earlySessions.length > sessions.filter((s) => s.counted).length * 0.3;
}
