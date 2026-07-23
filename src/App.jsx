import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';
import PollsDirectory from './pages/PollsDirectory';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('quick_poll_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.body;
    if (theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }
    localStorage.setItem('quick_poll_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      {/* Ambient background blur elements */}
      <div className="ambient-background">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="app-container">
        {/* Navigation Bar */}
        <header className="app-header">
          <NavLink to="/" className="brand-section">
            <div className="app-logo-row">
              <span style={{ fontSize: '1.75rem' }}>📊</span>
              <span className="app-title">QuickPoll</span>
            </div>
          </NavLink>
          
          <nav className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Create
            </NavLink>
            <NavLink 
              to="/polls" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Explore
            </NavLink>
            
            <button 
              className="btn-toggle-theme" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                // Sun Icon for dark mode
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                // Moon Icon for light mode
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </nav>
        </header>

        {/* Dashboard Pages */}
        <main style={{ minHeight: '400px' }}>
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollDetail />} />
            <Route path="/polls" element={<PollsDirectory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>© 2026 QuickPoll Systems. Designed for high-fidelity real-time voting dashboard analytics.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
