// Playlists page

import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Plus, Trash2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Playlists: React.FC = () => {
  const { playlists, createPlaylist, deletePlaylist, songs, play } = useMusic();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateForm(false);
    }
  };

  const getPlaylistCoverArt = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || playlist.songIds.length === 0) return null;

    const song = songs.find((s) => s.id === playlist.songIds[0]);
    return song?.albumArt;
  };

  const getMostPlayedSongInPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return null;

    return [...playlist.songIds]
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is typeof songs[0] => !!s)
      .sort((a, b) => b.playCount - a.playCount)[0];
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Playlists</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="button-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Playlist
        </button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="bg-dark-800 rounded-lg p-6">
          <input
            type="text"
            placeholder="Playlist name..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleCreatePlaylist();
            }}
            className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary mb-4"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleCreatePlaylist} className="button-primary flex-1">
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewPlaylistName('');
              }}
              className="button-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-20">
          <Disc3 className="w-16 h-16 mx-auto mb-4 text-dark-700" />
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-dark-600">Create your first playlist to organize your music</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => {
            const coverArt = getPlaylistCoverArt(playlist.id);
            const topSong = getMostPlayedSongInPlaylist(playlist.id);

            return (
              <Link
                key={playlist.id}
                to={`/playlist/${playlist.id}`}
                className="bg-dark-800 rounded-lg overflow-hidden hover:bg-dark-700 transition-colors group"
              >
                <div className="aspect-square bg-gradient-to-br from-primary to-dark-700 flex items-center justify-center overflow-hidden">
                  {coverArt ? (
                    <img src={coverArt} alt={playlist.name} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="w-12 h-12 text-dark-600" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{playlist.name}</h3>
                  <p className="text-sm text-dark-600 mb-3">{playlist.songIds.length} songs</p>
                  {topSong && (
                    <p className="text-xs text-primary truncate">Top: {topSong.title}</p>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (topSong) play(topSong.id);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 button-primary py-2"
                  >
                    <Play className="w-4 h-4" />
                    Play
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

import { Disc3 } from 'lucide-react';
