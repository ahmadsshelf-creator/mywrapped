// Playlist detail page

import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { ChevronLeft, Play, Trash2, Heart, Plus } from 'lucide-react';
import { formatDuration } from '../utils/metadata';

export const PlaylistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, songs, play, toggleFavorite, removeSongFromPlaylist, updatePlaylist } = useMusic();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const playlist = useMemo(() => playlists.find((p) => p.id === id), [playlists, id]);
  const playlistSongs = useMemo(() => {
    if (!playlist) return [];
    return playlist.songIds
      .map((songId) => songs.find((s) => s.id === songId))
      .filter((s): s is typeof songs[0] => !!s);
  }, [playlist, songs]);

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <p className="text-dark-600">Playlist not found</p>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updatePlaylist(playlist.id, { name: editedName });
      setIsEditingName(false);
    }
  };

  const coverArt = playlistSongs[0]?.albumArt;
  const totalDuration = playlistSongs.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/playlists')}
          className="p-2 hover:bg-dark-800 rounded-full transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold">Playlist</h2>
      </div>

      {/* Playlist Info */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-40 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-dark-700 flex-shrink-0 flex items-center justify-center">
            {coverArt ? (
              <img src={coverArt} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-4xl">🎵</div>
            )}
          </div>

          <div className="flex-1">
            {isEditingName ? (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="button-primary px-6"
                >
                  Save
                </button>
              </div>
            ) : (
              <h1
                className="text-4xl font-bold mb-4 cursor-pointer hover:text-primary transition-colors"
                onClick={() => {
                  setEditedName(playlist.name);
                  setIsEditingName(true);
                }}
              >
                {playlist.name}
              </h1>
            )}

            <div className="flex gap-6 text-dark-600 mb-6">
              <div>
                <span className="text-primary font-semibold">{playlistSongs.length}</span> songs
              </div>
              <div>
                <span className="text-primary font-semibold">{formatDuration(totalDuration)}</span> total
              </div>
            </div>

            {playlistSongs.length > 0 && (
              <button
                onClick={() => play(playlistSongs[0].id)}
                className="button-primary flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Play
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs */}
      {playlistSongs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-dark-600 mb-4">No songs in this playlist yet</p>
          <button
            onClick={() => navigate('/library')}
            className="button-primary flex items-center justify-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Songs
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {playlistSongs.map((song) => (
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
                  className={`p-2 transition-colors ${
                    song.isFavorite ? 'text-primary' : 'hover:text-primary'
                  }`}
                  aria-label="Toggle favorite"
                >
                  <Heart className="w-4 h-4" fill={song.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => removeSongFromPlaylist(playlist.id, song.id)}
                  className="p-2 hover:text-red-500 transition-colors"
                  aria-label="Remove from playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
