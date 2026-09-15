// Full-screen now playing view

import React, { useState, useEffect } from 'react';
import { ChevronDown, Heart, SkipBack, Play, Pause, SkipForward, Repeat, Shuffle } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { PlaybackState } from '../types';
import { formatDuration } from '../utils/metadata';

interface NowPlayingProps {
  onClose: () => void;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({ onClose }) => {
  const {
    currentSongId,
    playbackState,
    currentTime,
    songs,
    play,
    pause,
    resume,
    playNext,
    playPrevious,
    setCurrentTime,
    toggleFavorite,
    settings,
  } = useMusic();

  const currentSong = songs.find((s) => s.id === currentSongId);

  if (!currentSong) {
    return null;
  }

  const handlePlayPause = () => {
    if (playbackState === PlaybackState.Playing) {
      pause();
    } else {
      resume();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = (e.clientX - rect.left) / rect.width;
    const newTime = percentage * currentSong.duration;
    setCurrentTime(newTime);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-dark-900 to-dark-950 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-dark-800">
        <button
          onClick={onClose}
          className="p-2 hover:bg-dark-800 rounded-full transition-colors"
          aria-label="Close"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold">Now Playing</h2>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Album Art */}
        <div className="mb-12 w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
          {currentSong.albumArt ? (
            <img
              src={currentSong.albumArt}
              alt={currentSong.album}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-dark-700 flex items-center justify-center">
              <span className="text-8xl">♪</span>
            </div>
          )}
        </div>

        {/* Song Info */}
        <h1 className="text-3xl font-bold text-center mb-2">{currentSong.title}</h1>
        <p className="text-lg text-dark-600 text-center mb-8">{currentSong.artist}</p>
        <p className="text-sm text-dark-600 text-center mb-8">{currentSong.album}</p>

        {/* Progress */}
        <div className="w-full max-w-xs mb-8">
          <div
            className="h-1.5 bg-dark-700 cursor-pointer rounded-full mb-4 overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-dark-600">
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(currentSong.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className={`p-3 rounded-full transition-colors ${
              currentSong.isFavorite ? 'text-primary' : 'hover:text-primary'
            }`}
            aria-label="Favorite"
          >
            <Heart className="w-6 h-6" fill={currentSong.isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={playPrevious}
            className="p-3 hover:text-primary transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-4 bg-primary hover:bg-green-600 text-white rounded-full transition-colors"
            aria-label={playbackState === PlaybackState.Playing ? 'Pause' : 'Play'}
          >
            {playbackState === PlaybackState.Playing ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 hover:text-primary transition-colors"
            aria-label="Next"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            className="p-3 hover:text-primary transition-colors"
            aria-label="Repeat"
          >
            <Repeat className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
