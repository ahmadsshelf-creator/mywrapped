// Navigation component (desktop sidebar and mobile bottom nav)

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Music, Disc3, Heart, Trophy, Award, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Library', path: '/library', icon: Music },
  { label: 'Playlists', path: '/playlists', icon: Disc3 },
  { label: 'Favorites', path: '/favorites', icon: Heart },
  { label: 'Wrapped', path: '/wrapped', icon: Trophy },
  { label: 'Badges', path: '/badges', icon: Award },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-dark-900 border-r border-dark-800 h-screen sticky top-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">MyWrapped</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'bg-primary text-black font-semibold'
                  : 'text-dark-600 hover:text-white hover:bg-dark-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-900 border-t border-dark-800 px-3 py-2 flex justify-around items-center gap-1 z-30">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors text-xs ${
              location.pathname === path
                ? 'text-primary'
                : 'text-dark-600 hover:text-white'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};
