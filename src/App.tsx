// Updated App component with all routes and persistent player

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Navigation } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlaying } from './components/NowPlaying';
import { Onboarding } from './components/Onboarding';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Playlists } from './pages/Playlists';
import { Favorites } from './pages/Favorites';
import { Wrapped } from './pages/Wrapped';
import { Badges } from './pages/Badges';
import { Settings } from './pages/Settings';
import './App.css';

const AppContent: React.FC = () => {
  const { songs } = useMusic();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  useEffect(() => {
    // Show onboarding if no songs
    if (songs.length === 0) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [songs.length]);

  if (showOnboarding && songs.length === 0) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="app-container">
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 content-area md:overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/wrapped" element={<Wrapped />} />
              <Route path="/badges" element={<Badges />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Mini Player */}
      <MiniPlayer onNowPlayingClick={() => setShowNowPlaying(true)} />

      {/* Now Playing Modal */}
      {showNowPlaying && <NowPlaying onClose={() => setShowNowPlaying(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <MusicProvider>
      <Router>
        <AppContent />
      </Router>
    </MusicProvider>
  );
};

export default App;
