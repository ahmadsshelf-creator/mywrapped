// Wrapped/Daily Summary page

import React, { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../utils/metadata';
import {
  getMostPlayedSong,
  getMostPlayedArtist,
  getMostActiveListeningHour,
  getTotalListeningTime,
  getUniqueArtistCount,
  getUniqueSongCount,
  getListeningStreak,
} from '../utils/statistics';
import { Trophy, Music, User, Clock, Zap, TrendingUp } from 'lucide-react';

interface StatBoxProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, title, value, subtitle }) => (
  <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-lg p-6 hover:from-dark-700 transition-colors">
    <div className="text-primary mb-3">{icon}</div>
    <p className="text-sm text-dark-600 mb-1">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
    {subtitle && <p className="text-xs text-dark-600 mt-2">{subtitle}</p>}
  </div>
);

export const Wrapped: React.FC = () => {
  const { songs, sessions } = useMusic();

  const wrappedStats = useMemo(() => {
    const songsMap = new Map(songs.map((s) => [s.id, s]));
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.date === today && s.counted);

    const totalTime = getTotalListeningTime(sessions);
    const uniqueSongs = getUniqueSongCount(sessions);
    const uniqueArtists = getUniqueArtistCount(sessions, songsMap);
    const streak = getListeningStreak([]);
    const mostPlayedSongId = getMostPlayedSong(sessions, songsMap);
    const mostPlayedArtistName = getMostPlayedArtist(sessions, songsMap);
    const topHour = getMostActiveListeningHour(sessions);

    const mostPlayedSong = mostPlayedSongId ? songsMap.get(mostPlayedSongId) : null;
    const todaySongsPlayed = todaySessions.length;
    const todayMinutes = Math.round(todaySessions.reduce((sum, s) => sum + s.listeningDuration, 0) / 60);

    return {
      totalTime,
      totalMinutes: Math.round(totalTime / 60),
      uniqueSongs,
      uniqueArtists,
      streak,
      mostPlayedSong,
      mostPlayedArtist: mostPlayedArtistName,
      topHour,
      todaySongsPlayed,
      todayMinutes,
    };
  }, [songs, sessions]);

  const getTimeOfDay = (hour: number | undefined): string => {
    if (hour === undefined) return 'N/A';
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="text-center mb-12">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-4xl font-bold mb-2">Your Day in Music</h1>
        <p className="text-dark-600">Today's listening summary</p>
      </div>

      {/* Today's Stats */}
      {wrappedStats.todaySongsPlayed > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox
              icon={<Music className="w-8 h-8" />}
              title="Songs Played Today"
              value={wrappedStats.todaySongsPlayed}
            />
            <StatBox
              icon={<Clock className="w-8 h-8" />}
              title="Minutes Listened"
              value={wrappedStats.todayMinutes}
            />
            <StatBox
              icon={<User className="w-8 h-8" />}
              title="Most Active Time"
              value={getTimeOfDay(wrappedStats.topHour)}
              subtitle={wrappedStats.topHour !== undefined ? `${wrappedStats.topHour}:00` : ''}
            />
            <StatBox
              icon={<Zap className="w-8 h-8" />}
              title="Listening Streak"
              value={wrappedStats.streak}
              subtitle="days"
            />
          </div>

          {/* Top Song/Artist */}
          {wrappedStats.mostPlayedSong && (
            <div className="bg-gradient-to-br from-primary/10 to-dark-800 rounded-lg p-8 border border-primary/20">
              <h3 className="text-lg text-primary font-semibold mb-4">Your Top Song Today</h3>
              {wrappedStats.mostPlayedSong.albumArt && (
                <img
                  src={wrappedStats.mostPlayedSong.albumArt}
                  alt={wrappedStats.mostPlayedSong.album}
                  className="w-32 h-32 rounded-lg object-cover mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-bold text-center mb-2">{wrappedStats.mostPlayedSong.title}</h2>
              <p className="text-center text-dark-600 mb-4">by {wrappedStats.mostPlayedSong.artist}</p>
              <div className="text-center">
                <span className="text-primary font-semibold">{wrappedStats.mostPlayedSong.playCount}</span>
                <span className="text-dark-600 ml-2">total plays</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-dark-800 rounded-lg p-12 text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-dark-700" />
          <h3 className="text-xl font-semibold mb-2">No listening activity yet today</h3>
          <p className="text-dark-600">Start playing music to see your daily summary!</p>
        </div>
      )}

      {/* All-time Stats */}
      <div>
        <h3 className="text-2xl font-bold mb-4">All-Time Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox
            icon={<TrendingUp className="w-8 h-8" />}
            title="Total Listening Time"
            value={formatDuration(wrappedStats.totalTime)}
          />
          <StatBox
            icon={<Music className="w-8 h-8" />}
            title="Unique Songs"
            value={wrappedStats.uniqueSongs}
          />
          <StatBox
            icon={<User className="w-8 h-8" />}
            title="Unique Artists"
            value={wrappedStats.uniqueArtists}
          />
          <StatBox
            icon={<Zap className="w-8 h-8" />}
            title="Current Streak"
            value={wrappedStats.streak}
            subtitle="days"
          />
        </div>
      </div>

      {/* Top Artist */}
      {wrappedStats.mostPlayedArtist && (
        <div className="bg-dark-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Your Top Artist (All-Time)</h3>
          <p className="text-2xl font-bold text-primary">{wrappedStats.mostPlayedArtist}</p>
        </div>
      )}
    </div>
  );
};
