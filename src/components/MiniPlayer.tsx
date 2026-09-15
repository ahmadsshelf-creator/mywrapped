// Persistent mini player at the bottom

import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { PlaybackState } from '../types';
import { formatDuration } from '../utils/metadata';

interface MiniPlayerProps {
  onNowPlayingClick?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onNowPlayingClick }) => {
  const { currentSongId, playbackState, currentTime, songs, play, pause, resume, playNext, playPrevious, setCurrentTime, settings, updateSettings } = useMusic();
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    updateSettings({ volume });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 z-40">
      {/* Progress bar */}
      <div
        className="h-1 bg-dark-700 cursor-pointer hover:bg-dark-600 transition-colors"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(currentTime / currentSong.duration) * 100}%` }}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Song info */}
        <div
          className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNowPlayingClick}
        >
          {currentSong.albumArt && (
            <img
              src={currentSong.albumArt}
              alt={currentSong.album}
              className="w-12 h-12 rounded object-cover float-left mr-3"
            />
          )}
          <div className="truncate">
            <p className="text-sm font-semibold truncate">{currentSong.title}</p>
            <p className="text-xs text-dark-600 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={playPrevious}
            className="p-1 hover:text-primary transition-colors"
            aria-label="Previous"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="p-2 bg-primary hover:bg-green-600 text-white rounded-full transition-colors"
            aria-label={playbackState === PlaybackState.Playing ? 'Pause' : 'Play'}
          >
            {playbackState === PlaybackState.Playing ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-1 hover:text-primary transition-colors"
            aria-label="Next"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Time */}
        <div className="text-xs text-dark-600 w-12 text-right">
          {formatDuration(currentTime)} / {formatDuration(currentSong.duration)}
        </div>

        {/* Volume */}
        <div className="relative">
          <button
            onClick={toggleMute}
            className="p-1 hover:text-primary transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          {showVolume && (
            <div className="absolute bottom-full right-0 mb-2 bg-dark-800 rounded p-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.volume}
                onChange={handleVolumeChange}
                className="w-20"
                aria-label="Volume"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
