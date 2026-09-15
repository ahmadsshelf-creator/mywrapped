// Onboarding component for first-time users

import React, { useState } from 'react';
import { Music, Folder, Upload } from 'lucide-react';
import { selectMusicFolder, selectMusicFiles } from '../utils/fileImport';
import { extractMetadata, getAudioDuration, isSupportedAudioFormat } from '../utils/metadata';
import { useMusic } from '../context/MusicContext';
import { Song } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { addSongs } = useMusic();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

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
        setLoadingStatus(`Adding ${songsToAdd.length} songs to library...`);
        await addSongs(songsToAdd);
      }

      setIsLoading(false);
      onComplete();
    } catch (error) {
      console.error('Error importing music:', error);
      setLoadingStatus('Error importing music. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSelectFolder = async () => {
    const files = await selectMusicFolder();
    if (files) {
      await processFiles(files);
    }
  };

  const handleSelectFiles = async () => {
    const files = await selectMusicFiles();
    if (files) {
      await processFiles(files);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Building Your Library</h2>
          <p className="text-dark-600 mb-4">{loadingStatus}</p>
          <div className="w-64 h-2 bg-dark-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-950 px-4">
      <div className="max-w-md w-full text-center">
        <Music className="w-20 h-20 mx-auto mb-6 text-primary" />

        <h1 className="text-4xl font-bold mb-2">MyWrapped</h1>
        <p className="text-xl text-dark-600 mb-2">Your Music. Your Device. Your Stats.</p>
        <p className="text-dark-600 mb-8">
          Import your music collection and start tracking your listening habits with beautiful daily Wrapped summaries.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSelectFolder}
            className="button-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Folder className="w-5 h-5" />
            Select Music Folder
          </button>

          <button
            onClick={handleSelectFiles}
            className="button-secondary w-full flex items-center justify-center gap-2 py-3"
          >
            <Upload className="w-5 h-5" />
            Import Music Files
          </button>
        </div>

        <p className="text-sm text-dark-600 mt-8">
          Supported formats: MP3, WAV, M4A, OGG, FLAC, AAC
        </p>
      </div>
    </div>
  );
};
