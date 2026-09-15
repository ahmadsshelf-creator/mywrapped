// Settings page

import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Settings as SettingsIcon, RotateCcw, Trash2, Upload, Folder } from 'lucide-react';
import { selectMusicFolder, selectMusicFiles } from '../utils/fileImport';
import { extractMetadata, getAudioDuration, isSupportedAudioFormat } from '../utils/metadata';
import { Song } from '../types';
import { clearStore, DB_STORES } from '../utils/storage';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const Settings: React.FC = () => {
  const { songs, addSongs, updateSettings, settings, playlists } = useMusic();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState<'all' | 'stats' | 'playlists' | null>(null);

  const processFiles = async (files: FileList) => {
    setIsLoading(true);
    const songsToAdd: Song[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!isSupportedAudioFormat(file.name)) continue;

        setLoadingStatus(`Processing: ${file.name}`);

        const metadata = await extractMetadata(file);
        const fileUrl = URL.createObjectURL(file);
        const duration = await getAudioDuration(fileUrl);

        const song: Song = {
          id: generateId(),
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
          artist: metadata.artist || 'Unknown Artist',
          album: metadata.album || 'Unknown Album',
          duration,
          albumArt: metadata.albumArt,
          fileUrl,
          file,
          genre: metadata.genre,
          year: metadata.year,
          dateAdded: Date.now(),
          playCount: 0,
          isFavorite: false,
        };

        songsToAdd.push(song);
      }

      if (songsToAdd.length > 0) {
        setLoadingStatus(`Adding ${songsToAdd.length} songs...`);
        await addSongs(songsToAdd);
      }

      setIsLoading(false);
      setLoadingStatus('');
    } catch (error) {
      console.error('Error importing music:', error);
      setLoadingStatus('Error importing music. Please try again.');
      setIsLoading(false);
    }
  };

  const handleImportFolder = async () => {
    const files = await selectMusicFolder();
    if (files) {
      await processFiles(files);
    }
  };

  const handleImportFiles = async () => {
    const files = await selectMusicFiles();
    if (files) {
      await processFiles(files);
    }
  };

  const handleClearLibrary = async () => {
    setShowConfirmClear(null);
    await clearStore(DB_STORES.SONGS);
    window.location.reload();
  };

  const handleClearStats = async () => {
    setShowConfirmClear(null);
    await clearStore(DB_STORES.LISTENING_SESSIONS);
    await clearStore(DB_STORES.DAILY_STATS);
    window.location.reload();
  };

  const handleClearPlaylists = async () => {
    setShowConfirmClear(null);
    await clearStore(DB_STORES.PLAYLISTS);
    window.location.reload();
  };

  return (
    <div className="space-y-8 pb-24">
      <h2 className="text-3xl font-bold">Settings</h2>

      {/* Import Section */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Music
        </h3>

        {isLoading && (
          <div className="mb-4 p-4 bg-dark-700 rounded-lg text-center">
            <p className="mb-2">{loadingStatus}</p>
            <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleImportFolder}
            disabled={isLoading}
            className="button-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Folder className="w-5 h-5" />
            Select Music Folder
          </button>
          <button
            onClick={handleImportFiles}
            disabled={isLoading}
            className="button-secondary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            Import Music Files
          </button>
        </div>

        <div className="mt-4 p-4 bg-dark-700 rounded text-sm text-dark-600">
          <p>
            <strong>Current library:</strong> {songs.length} songs
          </p>
          <p className="mt-2 text-xs">
            Supported formats: MP3, WAV, M4A, OGG, FLAC, AAC
          </p>
        </div>
      </div>

      {/* Theme Section */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' })}
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="dark">Dark</option>
              <option value="light">Light (Coming soon)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-dark-600 mt-1">{Math.round(settings.volume * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-dark-800 border-2 border-red-500/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-500 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => setShowConfirmClear('all')}
            className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Clear Entire Library
          </button>
          <button
            onClick={() => setShowConfirmClear('stats')}
            className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Clear Listening Statistics
          </button>
          <button
            onClick={() => setShowConfirmClear('playlists')}
            className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Clear All Playlists
          </button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-2 text-red-500">Are you sure?</h3>
            <p className="text-dark-600 mb-6">
              {showConfirmClear === 'all' && 'This will permanently delete all your songs and statistics.'}
              {showConfirmClear === 'stats' && 'This will clear all listening statistics and wrapped data.'}
              {showConfirmClear === 'playlists' && 'This will delete all your playlists.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmClear(null)}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirmClear === 'all') handleClearLibrary();
                  if (showConfirmClear === 'stats') handleClearStats();
                  if (showConfirmClear === 'playlists') handleClearPlaylists();
                }}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">About MyWrapped</h3>
        <p className="text-dark-600 text-sm">
          A polished, modern music player web app with local music library, playlists, listening
          statistics, and daily Wrapped summaries. Your music stays on your device.
        </p>
        <p className="text-dark-600 text-xs mt-4">Version 1.0.0</p>
      </div>
    </div>
  );
};
