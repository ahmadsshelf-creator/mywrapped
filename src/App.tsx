import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MusicProvider } from './context/MusicContext';
import './App.css';

// Pages (to be created)
const App: React.FC = () => {
  return (
    <MusicProvider>
      <Router>
        <Routes>
          {/* Routes will be added here */}
        </Routes>
      </Router>
    </MusicProvider>
  );
};

export default App;
