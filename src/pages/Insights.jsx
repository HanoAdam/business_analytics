import React, { useEffect, useMemo, useState } from 'react';
import './Insights.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  const [chartData, setChartData] = useState([]);

  const chartEmptyState = useMemo(() => {
    return chartType === 'Line chart'
      ? 'Select a metric to see your line chart'
      : 'Select a metric to see your pie chart';
  }, [chartType]);

  // Static metric groups per requested specification
  const METRIC_GROUPS = useMemo(() => ([
    {
      dataset: 'Calendar',
      fields: [
        'Number of meetings',
        'Internal meetings',
        'External meetings',
        'Participants count',
        'Main topics by time spent',
      ],
    },
    {
      dataset: 'Email',
      fields: [
        'Emails sent',
        'Recipients: External',
        'Recipients: Internal',
        'Recipients: Company',
        'Content: Project',
        'Content: Topics',
        'Avg response time: External emails',
        'Avg response time: Internal emails',
      ],
    },
    {
      dataset: 'Slack',
      fields: [
        'Messages count',
        'Huddles count',
        'Messages content: Projects',
        'Messages content: Topics',
        'Huddles content: Projects',
        'Huddles content: Topics',
        'Avg response time',
      ],
    },
    {
      dataset: 'How did your team spend your time?',
      fields: [
        'Application - Time',
        'Project - Time',
        'Meetings - Time',
      ],
    },
    {
      dataset: 'Jira (Non Engineering)',
      fields: [
        'Spillover rate',
        'Number of tickets',
        'Number of epics',
      ],
    },
    {
      dataset: 'Notion',
      fields: [
        'Number of pages created',
        'Number of edits to pages',
        'Project to documentation score',
      ],
    },
    {
      dataset: 'Google',
      fields: [
        'What did people look for',
      ],
    },
    {
      dataset: 'AI usage',
      fields: [
        'Number of prompts',
        'Prompt quality',
        'Prompt',
      ],
    },
    {
      dataset: 'Bamboo HR',
      fields: [
        'Team salary',
      ],
    },
    {
      dataset: 'QuickBooks',
      fields: [
        'Tool spend vs tool usage',
      ],
    },
  ]), []);

  const groupedMetrics = useMemo(() => {
    const groups = METRIC_GROUPS;
    if (!metricSearch.trim()) return groups;
    const q = metricSearch.toLowerCase();
    return groups
      .map((group) => ({
        dataset: group.dataset,
        fields: group.fields.filter(
          (field) => field.toLowerCase().includes(q) || group.dataset.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.fields.length > 0);
  }, [METRIC_GROUPS, metricSearch]);

  // Create pseudo-random but stable values for a given seed
  const seededRandom = (seedStr) => {
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i += 1) {
      hash ^= seedStr.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    hash >>>= 0; // force unsigned
    return (hash % 1000) / 1000; // 0..1
  };

  const getMetricProfile = (dataset, field) => {
    const d = dataset.toLowerCase();
    const f = field.toLowerCase();
    // Defaults
    const profile = {
      base: 50,
      trendPerDay: 0.2,
      volatility: 6,
      weekendFactor: 0.6,
      weeklySeasonalityAmp: 0.25,
      clampMin: 0,
      clampMax: Number.POSITIVE_INFINITY,
      roundTo: 1,
    };

    // Calendar
    if (d.includes('calendar')) {
      if (f.includes('number of meetings')) {
        Object.assign(profile, { base: 6, trendPerDay: -0.05, volatility: 2, weeklySeasonalityAmp: 0.5 });
      } else if (f.includes('internal meetings')) {
        Object.assign(profile, { base: 4, trendPerDay: -0.06, volatility: 2, weeklySeasonalityAmp: 0.45 });
      } else if (f.includes('external meetings')) {
        Object.assign(profile, { base: 2, trendPerDay: 0.05, volatility: 2, weeklySeasonalityAmp: 0.35 });
      } else if (f.includes('participants')) {
        Object.assign(profile, { base: 12, trendPerDay: 0.03, volatility: 4, weeklySeasonalityAmp: 0.4 });
      } else if (f.includes('topics') || f.includes('time spent')) {
        Object.assign(profile, { base: 180, trendPerDay: 0.2, volatility: 12, weeklySeasonalityAmp: 0.35 });
      }
    }

    // Email
    if (d.includes('email')) {
      if (f.includes('emails sent')) {
        Object.assign(profile, { base: 120, trendPerDay: 0.6, volatility: 15, weeklySeasonalityAmp: 0.3 });
      } else if (f.includes('recipients: external')) {
        Object.assign(profile, { base: 70, trendPerDay: 0.3, volatility: 10, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('recipients: internal')) {
        Object.assign(profile, { base: 60, trendPerDay: 0.1, volatility: 10, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('recipients: company')) {
        Object.assign(profile, { base: 15, trendPerDay: 0.05, volatility: 4, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('content: project')) {
        Object.assign(profile, { base: 45, trendPerDay: 0.25, volatility: 9, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('content: topics')) {
        Object.assign(profile, { base: 55, trendPerDay: 0.25, volatility: 9, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('avg response time') && f.includes('external')) {
        Object.assign(profile, { base: 180, trendPerDay: -1.8, volatility: 8, weeklySeasonalityAmp: 0.2 });
      } else if (f.includes('avg response time') && f.includes('internal')) {
        Object.assign(profile, { base: 60, trendPerDay: -1.2, volatility: 6, weeklySeasonalityAmp: 0.2 });
      }
    }

    // Slack
    if (d.includes('slack')) {
      if (f.includes('messages count')) {
        Object.assign(profile, { base: 320, trendPerDay: 1.2, volatility: 40, weeklySeasonalityAmp: 0.35 });
      } else if (f.includes('huddles count')) {
        Object.assign(profile, { base: 7, trendPerDay: 0.05, volatility: 2, weeklySeasonalityAmp: 0.4 });
      } else if (f.includes('content: projects')) {
        Object.assign(profile, { base: 60, trendPerDay: 0.3, volatility: 10, weeklySeasonalityAmp: 0.3 });
      } else if (f.includes('content: topics')) {
        Object.assign(profile, { base: 80, trendPerDay: 0.35, volatility: 12, weeklySeasonalityAmp: 0.3 });
      } else if (f.includes('avg response time')) {
        Object.assign(profile, { base: 9, trendPerDay: -0.05, volatility: 1.5, weeklySeasonalityAmp: 0.2 });
      }
    }

    // Time spent
    if (d.includes('how did your team spend your time')) {
      if (f.includes('application - time')) {
        Object.assign(profile, { base: 320, trendPerDay: 0.4, volatility: 14, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('project - time')) {
        Object.assign(profile, { base: 260, trendPerDay: 0.3, volatility: 12, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('meetings - time')) {
        Object.assign(profile, { base: 140, trendPerDay: -0.25, volatility: 10, weeklySeasonalityAmp: 0.35 });
      }
    }

    // Jira (Non Engineering)
    if (d.includes('jira')) {
      if (f.includes('spillover rate')) {
        Object.assign(profile, { base: 22, trendPerDay: -0.06, volatility: 2.5, weeklySeasonalityAmp: 0.1, clampMax: 100 });
      } else if (f.includes('number of tickets')) {
        Object.assign(profile, { base: 42, trendPerDay: 0.35, volatility: 8, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('number of epics')) {
        Object.assign(profile, { base: 5, trendPerDay: 0.05, volatility: 1.2, weeklySeasonalityAmp: 0.2 });
      }
    }

    // Notion
    if (d.includes('notion')) {
      if (f.includes('pages created')) {
        Object.assign(profile, { base: 7, trendPerDay: 0.1, volatility: 2, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('edits to pages')) {
        Object.assign(profile, { base: 28, trendPerDay: 0.3, volatility: 6, weeklySeasonalityAmp: 0.25 });
      } else if (f.includes('project to documentation score')) {
        Object.assign(profile, { base: 62, trendPerDay: 0.08, volatility: 1.5, weeklySeasonalityAmp: 0.1, clampMax: 100 });
      }
    }

    // Google
    if (d.includes('google')) {
      Object.assign(profile, { base: 85, trendPerDay: 0.25, volatility: 10, weeklySeasonalityAmp: 0.2 });
    }

    // AI usage
    if (d.includes('ai usage')) {
      if (f.includes('number of prompts')) {
        Object.assign(profile, { base: 40, trendPerDay: 0.8, volatility: 8, weeklySeasonalityAmp: 0.2 });
      } else if (f.includes('prompt quality')) {
        Object.assign(profile, { base: 55, trendPerDay: 0.2, volatility: 2, weeklySeasonalityAmp: 0.1, clampMax: 100 });
      } else if (f === 'prompt') {
        Object.assign(profile, { base: 350, trendPerDay: 3, volatility: 30, weeklySeasonalityAmp: 0.15 });
      }
    }

    // Bamboo HR
    if (d.includes('bamboo hr')) {
      Object.assign(profile, { base: 5200, trendPerDay: 5, volatility: 80, weeklySeasonalityAmp: 0.05, weekendFactor: 1 });
    }

    // QuickBooks
    if (d.includes('quickbooks')) {
      Object.assign(profile, { base: 48, trendPerDay: 0.2, volatility: 3, weeklySeasonalityAmp: 0.1, clampMax: 100 });
    }

    return profile;
  };

  const getWeeklySeasonalityFactor = (dayOfWeek, amp) => {
    // Emphasize mid-week activity, depress weekends
    const weights = [0.55, 0.85, 1.10, 1.15, 1.05, 0.7, 0.5]; // Sun..Sat
    const base = weights[dayOfWeek];
    return 1 + (base - 1) * amp; // scale towards 1 by amplitude
  };

  const presetToDays = (preset) => {
    switch (preset) {
      case 'Today':
        return 1;
      case 'Yesterday':
        return 1;
      case '7D':
        return 7;
      case '30D':
        return 30;
      case '3M':
        return 90;
      case '6M':
        return 180;
      case '12M':
        return 365;
      case 'XTD':
        return 365;
      case 'Custom':
      default:
        return 30;
    }
  };

  const generateTimeSeries = (days, seedKey) => {
    const now = new Date();
    const series = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayOfWeek = d.getDay();

      // Resolve metric profile
      const [ds, field] = selectedMetric ? [selectedMetric.dataset, selectedMetric.field] : ['Generic', 'Value'];
      const profile = getMetricProfile(ds, field);

      // Deterministic base for seed
      const baseJitter = (seededRandom(`${seedKey}:b`) - 0.5) * profile.volatility;
      const base = profile.base + baseJitter;

      // Clear trend direction over time (older to recent)
      const daysFromStart = days - i; // 1..days
      const trend = profile.trendPerDay * daysFromStart;

      // Weekly seasonality and weekend factor
      const seasonality = getWeeklySeasonalityFactor(dayOfWeek, profile.weeklySeasonalityAmp);
      const weekendAdj = (dayOfWeek === 0 || dayOfWeek === 6) ? profile.weekendFactor : 1;

      // Stable daily noise
      const noise = (seededRandom(`${seedKey}:${d.toISOString().slice(0, 10)}`) - 0.5) * profile.volatility;

      let value = (base + trend + noise) * seasonality * weekendAdj;
      value = Math.max(profile.clampMin, Math.min(profile.clampMax, value));
      if (profile.roundTo && profile.roundTo > 0) {
        value = Math.round(value / profile.roundTo) * profile.roundTo;
      }
      series.push({ date: label, value });
    }
    return series;
  };

  useEffect(() => {
    if (!selectedMetric) {
      setChartData([]);
      return;
    }
    const days = presetToDays(selectedPreset);
    const seedKey = `${selectedMetric.dataset}:${selectedMetric.field}`;
    const data = generateTimeSeries(days, seedKey);
    setChartData(data);
  }, [selectedMetric, selectedPreset]);

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
          <div className="chart-area" role="region" aria-label="Chart area" style={{ height: 520 }}>
            {chartType === 'Line chart' && selectedMetric ? (
              <div style={{ width: '100%', height: '100%', padding: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis width={60} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
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
            )}
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

