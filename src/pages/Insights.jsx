import React, { useMemo, useState } from 'react';
import './Insights.css';

// Dummy data imports (used only to derive available metric fields)
import ticketsData from '../../dummy_data/tickets.json';
import sprintsData from '../../dummy_data/sprints.json';
import meetingsData from '../../dummy_data/meetings.json';
import emailsData from '../../dummy_data/emails.json';
import slackMessagesData from '../../dummy_data/slack_messages.json';
import slackHuddlesData from '../../dummy_data/slack_huddles.json';
import projectsData from '../../dummy_data/projects.json';
import employeesData from '../../dummy_data/employees.json';
import usageData from '../../dummy_data/usage.json';
import notionPagesData from '../../dummy_data/notion_pages.json';
import notionEditsData from '../../dummy_data/notion_edits.json';
import chatgptPromptsData from '../../dummy_data/chatgpt_prompts.json';

const TIME_PRESETS = [
  'Custom',
  'Today',
  'Yesterday',
  '7D',
  '30D',
  '3M',
  '6M',
  '12M',
  'XTD',
];

const CHART_TYPES = ['Line chart', 'Pie chart'];

const Insights = () => {
  const [selectedPreset, setSelectedPreset] = useState('30D');
  const [chartType, setChartType] = useState('Line chart');
  const [isChartMenuOpen, setIsChartMenuOpen] = useState(false);
  const [isMetricPickerOpen, setIsMetricPickerOpen] = useState(false);
  const [metricSearch, setMetricSearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null); // { dataset: string, field: string }

  const chartEmptyState = useMemo(() => {
    return chartType === 'Line chart'
      ? 'Select a metric to see your line chart'
      : 'Select a metric to see your pie chart';
  }, [chartType]);

  // Build grouped metrics from dummy datasets
  const datasets = useMemo(() => (
    [
      { name: 'tickets', data: ticketsData },
      { name: 'sprints', data: sprintsData },
      { name: 'meetings', data: meetingsData },
      { name: 'emails', data: emailsData },
      { name: 'slack_messages', data: slackMessagesData },
      { name: 'slack_huddles', data: slackHuddlesData },
      { name: 'projects', data: projectsData },
      { name: 'employees', data: employeesData },
      { name: 'usage', data: usageData },
      { name: 'notion_pages', data: notionPagesData },
      { name: 'notion_edits', data: notionEditsData },
      { name: 'chatgpt_prompts', data: chatgptPromptsData },
    ]
  ), []);

  function deriveFields(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    const sampleSize = Math.min(10, dataArray.length);
    const fieldSet = new Set();
    for (let i = 0; i < sampleSize; i += 1) {
      const row = dataArray[i];
      if (row && typeof row === 'object') {
        Object.keys(row).forEach((k) => fieldSet.add(k));
      }
    }
    return Array.from(fieldSet).sort();
  }

  const groupedMetrics = useMemo(() => {
    const groups = datasets
      .map(({ name, data }) => ({
        dataset: name,
        fields: deriveFields(data),
      }))
      .filter((g) => g.fields.length > 0);
    if (!metricSearch.trim()) return groups;
    const q = metricSearch.toLowerCase();
    return groups.map((g) => ({
      dataset: g.dataset,
      fields: g.fields.filter((f) => f.toLowerCase().includes(q) || g.dataset.toLowerCase().includes(q)),
    }))
    .filter((g) => g.fields.length > 0);
  }, [datasets, metricSearch]);

  return (
    <div className="page insights-page">
      <div className="insights-layout">
        {/* Left Panel */}
        <aside className="left-panel" aria-label="Query configuration">
          <div className="panel-section">
            <div className="section-header">
              <span>Metrics</span>
              <button
                className="icon-btn"
                aria-label="Add metric"
                onClick={() => setIsMetricPickerOpen(true)}
              >+
              </button>
            </div>
            <div className="section-body">
              {selectedMetric ? (
                <div className="selected-metric">
                  <span className="badge">A</span>
                  <div className="metric-labels">
                    <div className="metric-dataset">{selectedMetric.dataset}</div>
                    <div className="metric-field">{selectedMetric.field}</div>
                  </div>
                  <button className="change-link" onClick={() => setIsMetricPickerOpen(true)}>
                    Change
                  </button>
                </div>
              ) : (
                <button className="input-like" onClick={() => setIsMetricPickerOpen(true)}>
                  <span className="badge">A</span>
                  <span className="muted">Select Metric</span>
                </button>
              )}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-header">
              <span>Breakdown</span>
              <button className="icon-btn" aria-label="Add breakdown" onClick={() => {}}>+
              </button>
            </div>
            <div className="section-body">
              <button className="input-like" onClick={() => {}}>
                <span className="muted">Add breakdown</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <section className="main-panel">
          {/* Top toolbar */}
          <div className="top-toolbar">
            <div className="time-toolbar" role="tablist" aria-label="Time range">
              {TIME_PRESETS.map((label) => (
                <button
                  key={label}
                  role="tab"
                  aria-selected={selectedPreset === label}
                  className={`time-pill ${selectedPreset === label ? 'active' : ''}`}
                  onClick={() => setSelectedPreset(label)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Graph type selector */}
            <div className="chart-type">
              <button
                className="chart-type-trigger"
                aria-haspopup="menu"
                aria-expanded={isChartMenuOpen}
                onClick={() => setIsChartMenuOpen((v) => !v)}
              >
                <span className="chart-icon" aria-hidden>
                  {chartType === 'Line chart' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="3 17 9 11 13 15 21 7" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 12A9 9 0 1 1 12 3v9z" />
                      <path d="M12 3a9 9 0 0 1 9 9h-9z" />
                    </svg>
                  )}
                </span>
                {chartType}
                <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isChartMenuOpen && (
                <div className="chart-menu" role="menu">
                  {CHART_TYPES.map((t) => (
                    <button
                      key={t}
                      role="menuitemradio"
                      aria-checked={chartType === t}
                      className={`chart-menu-item ${chartType === t ? 'selected' : ''}`}
                      onClick={() => {
                        setChartType(t);
                        setIsChartMenuOpen(false);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart area */}
          <div className="chart-area" role="region" aria-label="Chart area">
            <div className="chart-placeholder">
              <div className="placeholder-graphic" aria-hidden>
                <svg width="220" height="110" viewBox="0 0 220 110" fill="none" stroke="#d7dbe7" strokeWidth="2">
                  <path d="M5 105 L60 75 L100 90 L160 45 L215 15" />
                  <circle cx="60" cy="75" r="3" />
                  <circle cx="160" cy="45" r="3" />
                </svg>
              </div>
              <div className="muted">
                {selectedMetric ? `Selected: ${selectedMetric.dataset}.${selectedMetric.field}` : chartEmptyState}
              </div>
            </div>
          </div>
        </section>
      </div>

      {isMetricPickerOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Select metric">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add metric</div>
              <button className="icon-btn" aria-label="Close" onClick={() => setIsMetricPickerOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="search-input"
                placeholder="Search metrics or dataset…"
                value={metricSearch}
                onChange={(e) => setMetricSearch(e.target.value)}
              />
              <div className="metric-groups" role="list">
                {groupedMetrics.length === 0 && (
                  <div className="muted" style={{ padding: '16px' }}>No matching metrics</div>
                )}
                {groupedMetrics.map((group) => (
                  <div key={group.dataset} className="metric-group" role="group" aria-label={group.dataset}>
                    <div className="metric-group-title">{group.dataset}</div>
                    <div className="metric-list">
                      {group.fields.map((field) => (
                        <button
                          key={`${group.dataset}:${field}`}
                          className="metric-item"
                          onClick={() => {
                            setSelectedMetric({ dataset: group.dataset, field });
                            setIsMetricPickerOpen(false);
                          }}
                        >
                          <span className="metric-field-name">{field}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;

