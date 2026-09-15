// Badges/Achievements page

import React, { useMemo } from 'react';
import { useMusic } from '../context/MusicContext';
import { Award, Lock } from 'lucide-react';
import {
  getTotalListeningTime,
  getUniqueSongCount,
  getUniqueArtistCount,
  getListeningStreak,
  isNightOwl,
  isEarlyBird,
} from '../utils/statistics';
import { Badge } from '../types';

const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'first-listen',
    name: 'First Listen',
    description: 'Played your first song',
    icon: 'Music',
    condition: 'playCount >= 1',
    unlocked: false,
  },
  {
    id: '10-songs',
    name: 'Starter',
    description: 'Listened to 10 different songs',
    icon: 'Music',
    condition: 'uniqueSongs >= 10',
    unlocked: false,
  },
  {
    id: '100-songs',
    name: 'Audiophile',
    description: 'Listened to 100 different songs',
    icon: 'Music',
    condition: 'uniqueSongs >= 100',
    unlocked: false,
  },
  {
    id: '500-songs',
    name: 'Connoisseur',
    description: 'Listened to 500 different songs',
    icon: 'Music',
    condition: 'uniqueSongs >= 500',
    unlocked: false,
  },
  {
    id: '1000-minutes',
    name: 'Devoted',
    description: 'Listened for 1000 minutes',
    icon: 'Clock',
    condition: 'totalMinutes >= 1000',
    unlocked: false,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Listen frequently late at night',
    icon: 'Moon',
    condition: 'nightOwl',
    unlocked: false,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Listen frequently in the morning',
    icon: 'Sun',
    condition: 'earlyBird',
    unlocked: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Listen to 50 different artists',
    icon: 'Compass',
    condition: 'uniqueArtists >= 50',
    unlocked: false,
  },
  {
    id: 'loyal-fan',
    name: 'Loyal Fan',
    description: 'Listen to the same artist 50+ times',
    icon: 'Heart',
    condition: 'loyalFan',
    unlocked: false,
  },
  {
    id: 'weekly-listener',
    name: 'Weekly Listener',
    description: 'Maintain a 7-day listening streak',
    icon: 'Zap',
    condition: 'streak >= 7',
    unlocked: false,
  },
  {
    id: 'monthly-listener',
    name: 'Monthly Listener',
    description: 'Maintain a 30-day listening streak',
    icon: 'Flame',
    condition: 'streak >= 30',
    unlocked: false,
  },
];

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => (
  <div
    className={`rounded-lg p-6 text-center transition-all ${
      badge.unlocked
        ? 'bg-gradient-to-br from-primary/20 to-dark-800 border border-primary/50'
        : 'bg-dark-800 border border-dark-700 opacity-60'
    }`}
  >
    <div className="mb-4">
      {badge.unlocked ? (
        <Award className="w-12 h-12 mx-auto text-primary" />
      ) : (
        <Lock className="w-12 h-12 mx-auto text-dark-600" />
      )}
    </div>
    <h3 className="font-semibold text-lg mb-1">{badge.name}</h3>
    <p className="text-sm text-dark-600 mb-3">{badge.description}</p>
    {badge.unlockedAt && (
      <p className="text-xs text-primary">
        Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
      </p>
    )}
  </div>
);

export const Badges: React.FC = () => {
  const { songs, sessions } = useMusic();

  const unlockedBadges = useMemo(() => {
    const songsMap = new Map(songs.map((s) => [s.id, s]));
    const uniqueSongs = getUniqueSongCount(sessions);
    const uniqueArtists = getUniqueArtistCount(sessions, songsMap);
    const totalTime = getTotalListeningTime(sessions);
    const totalMinutes = Math.round(totalTime / 60);
    const streak = getListeningStreak([]);
    const nightOwl = isNightOwl(sessions);
    const earlyBird = isEarlyBird(sessions);
    const playCount = songs.reduce((sum, s) => sum + s.playCount, 0);

    const maxArtistCount = Math.max(
      0,
      ...Array.from(new Map<string, number>()).values()
    );

    return BADGE_DEFINITIONS.map((badge) => {
      let unlocked = false;

      switch (badge.id) {
        case 'first-listen':
          unlocked = playCount >= 1;
          break;
        case '10-songs':
          unlocked = uniqueSongs >= 10;
          break;
        case '100-songs':
          unlocked = uniqueSongs >= 100;
          break;
        case '500-songs':
          unlocked = uniqueSongs >= 500;
          break;
        case '1000-minutes':
          unlocked = totalMinutes >= 1000;
          break;
        case 'night-owl':
          unlocked = nightOwl;
          break;
        case 'early-bird':
          unlocked = earlyBird;
          break;
        case 'explorer':
          unlocked = uniqueArtists >= 50;
          break;
        case 'loyal-fan':
          unlocked = maxArtistCount >= 50;
          break;
        case 'weekly-listener':
          unlocked = streak >= 7;
          break;
        case 'monthly-listener':
          unlocked = streak >= 30;
          break;
      }

      return { ...badge, unlocked };
    });
  }, [songs, sessions]);

  const unlockedCount = unlockedBadges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="text-3xl font-bold mb-2">Achievements</h2>
        <p className="text-dark-600">
          {unlockedCount} of {unlockedBadges.length} unlocked
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-dark-800 rounded-lg p-4">
        <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(unlockedCount / unlockedBadges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.some((b) => b.unlocked) && (
        <div>
          <h3 className="text-xl font-bold mb-4">Unlocked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges
              .filter((b) => b.unlocked)
              .map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {unlockedBadges.some((b) => !b.unlocked) && (
        <div>
          <h3 className="text-xl font-bold mb-4">Locked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges
              .filter((b) => !b.unlocked)
              .map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
