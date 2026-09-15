// Home/Dashboard page

import React, { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { PlayCircle, Clock, Volume2, TrendingUp } from 'lucide-react';
import { formatDuration } from '../utils/metadata';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="bg-dark-800 rounded-lg p-6 hover:bg-dark-700 transition-colors">
    <div className="flex items-center gap-4">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm text-dark-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

interface SongCardProps {
  title: string;
  artist: string;
  plays?: number;
  albumArt?: string;
  onClick?: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ title, artist, plays, albumArt, onClick }) => (
  <div
    onClick={onClick}
    className="bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors cursor-pointer group"
  >
    {albumArt && (
      <img
        src={albumArt}
        alt={title}
        className="w-full h-32 object-cover rounded mb-3 group-hover:opacity-80 transition-opacity"
      />
    )}
    <h3 className="font-semibold truncate">{title}</h3>
    <p className="text-sm text-dark-600 truncate">{artist}</p>
    {plays !== undefined && (
      <p className="text-xs text-primary mt-2">{plays} plays</p>
    )}
  </div>
);

export const Home: React.FC = () => {
  const { songs, sessions, playlists, play } = useMusic();

  const stats = useMemo(() => {
    const totalSongs = songs.length;
    const totalDuration = songs.reduce((sum, song) => sum + song.duration, 0);
    const totalListens = sessions.filter((s) => s.counted).length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.counted ? s.listeningDuration : 0), 0);

    return { totalSongs, totalDuration, totalListens, totalTime };
  }, [songs, sessions]);

  const recentlyPlayed = useMemo(() => {
    return [...songs]
      .filter((s) => s.lastPlayed)
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
      .slice(0, 6);
  }, [songs]);

  const mostPlayed = useMemo(() => {
    return [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 6);
  }, [songs]);

  const recentlyAdded = useMemo(() => {
    return [...songs].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 6);
  }, [songs]);

  const favorites = useMemo(() => {
    return songs.filter((s) => s.isFavorite).slice(0, 6);
  }, [songs]);

  return (
    <div className="space-y-8 pb-24">
      {/* Stats Grid */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Welcome to MyWrapped</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Music className="w-8 h-8" />}
            label="Songs in Library"
            value={stats.totalSongs}
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            label="Total Duration"
            value={formatDuration(stats.totalDuration)}
          />
          <StatCard
            icon={<Volume2 className="w-8 h-8" />}
            label="Times Listened"
            value={stats.totalListens}
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Total Listening Time"
            value={formatDuration(stats.totalTime)}
          />
        </div>
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Your Playlists</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.slice(0, 3).map((playlist) => (
              <div
                key={playlist.id}
                className="bg-dark-800 rounded-lg p-4 hover:bg-dark-700 transition-colors cursor-pointer"
              >
                <Disc3 className="w-12 h-12 text-primary mb-2" />
                <h4 className="font-semibold">{playlist.name}</h4>
                <p className="text-sm text-dark-600">{playlist.songIds.length} songs</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Recently Played</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentlyPlayed.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                albumArt={song.albumArt}
                onClick={() => play(song.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Most Played */}
      {mostPlayed.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Most Played</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mostPlayed.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                plays={song.playCount}
                albumArt={song.albumArt}
                onClick={() => play(song.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold mb-4">Your Favorites</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {favorites.map((song) => (
              <SongCard
                key={song.id}
                title={song.title}
                artist={song.artist}
                albumArt={song.albumArt}
                onClick={() => play(song.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="text-center py-20">
          <Music className="w-16 h-16 mx-auto mb-4 text-dark-700" />
          <h3 className="text-xl font-semibold mb-2">No songs yet</h3>
          <p className="text-dark-600">Go to Settings to import your music collection</p>
        </div>
      )}
    </div>
  );
};

import { Music, Disc3 } from 'lucide-react';
