import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import SavedBoards from './pages/SavedBoards';
import Events from './pages/Events';
import Integrations from './pages/Integrations';
import OrgStructure from './pages/OrgStructure';
import Settings from './pages/Settings';
import Insights from './pages/Insights';
import AskAI from './pages/AskAI';

import './App.css';

const App = () => {
  const location = useLocation();
  const isInsights = location.pathname.startsWith('/insights');
  return (
    <div className="app-container">
      <Sidebar />
      <main className={`main-content ${isInsights ? 'no-padding' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/saved-boards" element={<SavedBoards />} />
          <Route path="/events" element={<Events />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/org-structure" element={<OrgStructure />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/ask-ai" element={<AskAI />} />
          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

