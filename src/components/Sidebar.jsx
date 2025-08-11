import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Create Button */}
      <div className="create-section">
        <button
          className="create-button"
          onClick={() => setShowCreateMenu((prev) => !prev)}
        >
          + Create
        </button>
        {showCreateMenu && (
          <div className="create-menu">
            <button
              className="create-menu-item"
              onClick={() => {
                navigate('/insights');
                setShowCreateMenu(false);
              }}
            >
              Insights
            </button>
            <button
              className="create-menu-item"
              onClick={() => {
                navigate('/ask-ai');
                setShowCreateMenu(false);
              }}
            >
              Ask AI
            </button>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="nav-items">
        <NavItem to="/home" label="Home" icon={Icons.home} />
        <NavItem to="/saved-boards" label="Saved Boards" icon={Icons.star} />
        <NavItem to="/events" label="Events" icon={Icons.activity} />
        <NavItem to="/integrations" label="Integrations" icon={Icons.plug} />
        <NavItem to="/org-structure" label="Org Structure" icon={Icons.org} />
        <NavItem to="/settings" label="Settings" icon={Icons.settings} />
      </nav>
    </aside>
  );
};

const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

const Icons = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  activity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  plug: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 7v6M15 7v6M7 13h10a4 4 0 0 1-8 0z" />
    </svg>
  ),
  org: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="4" r="2" />
      <circle cx="6" cy="20" r="2" />
      <circle cx="18" cy="20" r="2" />
      <path d="M12 6v6m0 0H6m6 0h6" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.02A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51h.02a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.14-.33 1.73.21.46.71.77 1.24.77H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

export default Sidebar;

