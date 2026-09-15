// Library page with search and filtering

import React, { useMemo, useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Search, Play, Heart, Trash2 } from 'lucide-react';
import { formatDuration } from '../utils/metadata';

type SortBy = 'title' | 'artist' | 'album' | 'recently-played' | 'most-played';

export const Library: React.FC = () => {
  const { songs, play, toggleFavorite, removeSong } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('title');

  const filteredAndSorted = useMemo(() => {
    let result = [...songs];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'artist':
        result.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'album':
        result.sort((a, b) => a.album.localeCompare(b.album));
        break;
      case 'recently-played':
        result.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        break;
      case 'most-played':
        result.sort((a, b) => b.playCount - a.playCount);
        break;
      default: // title
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [songs, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h2 className="text-3xl font-bold mb-6">Your Library</h2>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-600" />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="title">Sort by Title</option>
            <option value="artist">Sort by Artist</option>
            <option value="album">Sort by Album</option>
            <option value="recently-played">Recently Played</option>
            <option value="most-played">Most Played</option>
          </select>
        </div>
      </div>

      {/* Song List */}
      <div className="space-y-2">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-600">No songs found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAndSorted.map((song) => (
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

                <div className="text-sm text-dark-600">{song.playCount}</div>

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
                    className={`p-2 transition-colors ${
                      song.isFavorite ? 'text-primary' : 'hover:text-primary'
                    }`}
                    aria-label="Toggle favorite"
                  >
                    <Heart className="w-4 h-4" fill={song.isFavorite ? 'currentColor' : 'none'} />
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
      </div>

      {/* Stats */}
      {filteredAndSorted.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-dark-600">
            {filteredAndSorted.length} song{filteredAndSorted.length !== 1 ? 's' : ''} •{' '}
            {formatDuration(filteredAndSorted.reduce((sum, s) => sum + s.duration, 0))}
          </p>
        </div>
      )}
    </div>
  );
};
