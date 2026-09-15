// Favorites page

import React, { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { Heart, Play, Trash2 } from 'lucide-react';
import { formatDuration } from '../utils/metadata';

export const Favorites: React.FC = () => {
  const { songs, play, toggleFavorite, removeSong } = useMusic();

  const favorites = useMemo(() => {
    return songs.filter((s) => s.isFavorite).sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
  }, [songs]);

  return (
    <div className="space-y-6 pb-24">
      <h2 className="text-3xl font-bold">Favorite Songs</h2>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto mb-4 text-dark-700" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-dark-600">Heart your favorite songs to see them here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favorites.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-4 p-3 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors group"
            >
              {song.albumArt && (
                <img
                  src={song.albumArt}
                  alt={song.album}
                  className="w-12 h-12 rounded object-cover"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-dark-600 truncate">
                  {song.artist} • {song.album}
                </p>
              </div>

              <div className="text-sm text-dark-600 whitespace-nowrap">
                {formatDuration(song.duration)}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => play(song.id)}
                  className="p-2 hover:text-primary transition-colors"
                  aria-label="Play"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFavorite(song.id)}
                  className="p-2 text-primary transition-colors"
                  aria-label="Remove favorite"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                </button>
                <button
                  onClick={() => removeSong(song.id)}
                  className="p-2 hover:text-red-500 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-dark-600">
            {favorites.length} song{favorites.length !== 1 ? 's' : ''} • Total:{' '}
            {formatDuration(favorites.reduce((sum, s) => sum + s.duration, 0))}
          </p>
        </div>
      )}
    </div>
  );
};
