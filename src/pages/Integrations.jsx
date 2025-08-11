import React from 'react';
import './Integrations.css';

const INTEGRATIONS = [
  {
    key: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule and sync events across teams.',
    color: '#4285F4',
  },
  {
    key: 'gmail',
    name: 'Google Mail',
    description: 'Track conversations and automate follow-ups.',
    color: '#EA4335',
  },
  {
    key: 'slack',
    name: 'Slack',
    description: 'Real-time messaging for teams.',
    color: '#36C5F0',
  },
  {
    key: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing and webinars.',
    color: '#2D8CFF',
  },
  {
    key: 'jira',
    name: 'Jira',
    description: 'Plan, track, and release software.',
    color: '#0052CC',
  },
  {
    key: 'notion',
    name: 'Notion',
    description: 'All-in-one docs and knowledge base.',
    color: '#0F172A',
  },
  {
    key: 'linear',
    name: 'Linear',
    description: 'Issue tracking for modern teams.',
    color: '#6C5DD3',
  },
  {
    key: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Chat, meet, and collaborate in one place.',
    color: '#6054D6',
  },
  {
    key: 'google-workspace',
    name: 'Google Workspace',
    description: 'Connect Docs, Sheets, and Drive.',
    color: '#34A853',
  },
  {
    key: 'zendesk',
    name: 'Zendesk',
    description: 'Customer service and support platform.',
    color: '#03363D',
  },
  {
    key: 'bamboo-hr',
    name: 'Bamboo HR',
    description: 'HR software for small and medium businesses.',
    color: '#25C16F',
  },
  {
    key: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting, invoicing, and expenses.',
    color: '#2CA01C',
  },
];

const Integrations = () => {
  return (
    <div className="page integrations-page">
      <div className="header-row">
        <h1>Integrations</h1>
        <div className="search-box" role="search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search integrations…"
            aria-label="Search integrations"
            onChange={() => {}}
          />
        </div>
      </div>

      <div className="integrations-grid">
        {INTEGRATIONS.map((app) => (
          <IntegrationCard key={app.key} app={app} />)
        )}
      </div>

      <div className="load-more-wrap">
        <button className="load-more" onClick={() => {}}>Load more</button>
      </div>
    </div>
  );
};

const IntegrationCard = ({ app }) => {
  return (
    <div className="integration-card">
      <div className="card-top">
        <div className="app-icon" style={{ backgroundColor: app.color }}>
          {getInitials(app.name)}
        </div>
        <button className="open-ext" aria-label={`Open ${app.name} docs`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M14 3h7v7" />
            <path d="M10 14L21 3" />
            <path d="M21 14v7h-7" />
            <path d="M3 10v11h11" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <div className="app-title">{app.name}</div>
        <div className="app-desc muted">{app.description}</div>
      </div>
      <div className="card-actions">
        <div className="left-actions">
          <button className="btn btn-secondary" onClick={() => {}}>Configure</button>
          <button className="btn btn-danger" onClick={() => {}}>Remove</button>
        </div>
        <label className="switch">
          <input type="checkbox" onChange={() => {}} />
          <span className="slider" />
        </label>
      </div>
    </div>
  );
};

function getInitials(name) {
  const parts = name.split(' ');
  const initials = parts[0][0] + (parts[1] ? parts[1][0] : '');
  return initials.toUpperCase();
}

export default Integrations;

