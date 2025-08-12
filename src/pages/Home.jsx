import React, { useMemo, useState } from 'react';
import './Home.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';

const TEAMS = ['All', 'Engineering', 'Marketing', 'Product', 'Design'];
const PROJECTS = ['Main Project', 'Mobile App', 'Website Revamp', 'Growth Experiments'];

const TEAM_PROJECT_HOURS = {
  Engineering: { 'Main Project': 120, 'Mobile App': 80, 'Website Revamp': 60, 'Growth Experiments': 40 },
  Marketing: { 'Main Project': 50, 'Mobile App': 30, 'Website Revamp': 20, 'Growth Experiments': 70 },
  Product: { 'Main Project': 90, 'Mobile App': 45, 'Website Revamp': 35, 'Growth Experiments': 30 },
  Design: { 'Main Project': 40, 'Mobile App': 60, 'Website Revamp': 55, 'Growth Experiments': 20 },
};

const Home = () => {
  const [selectedTeam, setSelectedTeam] = useState('All');

  const allTotals = useMemo(() => {
    const totals = {};
    PROJECTS.forEach((p) => { totals[p] = 0; });
    Object.values(TEAM_PROJECT_HOURS).forEach((teamMap) => {
      PROJECTS.forEach((p) => { totals[p] += teamMap[p] || 0; });
    });
    return totals;
  }, []);

  const chartData = useMemo(() => {
    const source = selectedTeam === 'All' ? allTotals : TEAM_PROJECT_HOURS[selectedTeam] || {};
    return PROJECTS.map((project) => ({
      project,
      hours: source[project] ?? 0,
    }));
  }, [selectedTeam, allTotals]);

  // Synthetic meetings data for scatter plot
  const ATTENDEES_THRESHOLD = 8; // draw a line at this Y value
  const meetingsScatterData = useMemo(() => {
    // Example meetings with name and recurrence (kept consistent with attendee counts)
    const base = [
      { duration: 15, attendees: 8, name: 'Daily Standup', isRecurring: true, periodicity: 'Daily' },
      { duration: 30, attendees: 2, name: '1:1 - Manager/IC', isRecurring: true, periodicity: 'Weekly' },
      { duration: 90, attendees: 7, name: 'Sprint Planning', isRecurring: true, periodicity: 'Bi-weekly' },
      { duration: 60, attendees: 5, name: 'Design Review', isRecurring: true, periodicity: 'Weekly' },
      { duration: 45, attendees: 6, name: 'Project Check-in', isRecurring: true, periodicity: 'Weekly' },
      { duration: 45, attendees: 3, name: 'Customer Interview', isRecurring: false, periodicity: 'Ad-hoc' },
      { duration: 60, attendees: 9, name: 'Cross-team Sync', isRecurring: true, periodicity: 'Bi-weekly' },
      { duration: 120, attendees: 10, name: 'Quarterly Planning', isRecurring: true, periodicity: 'Quarterly' },
      { duration: 60, attendees: 6, name: 'Roadmap Review', isRecurring: true, periodicity: 'Monthly' },
      { duration: 60, attendees: 8, name: 'All-hands Prep', isRecurring: false, periodicity: 'Ad-hoc' },
      { duration: 60, attendees: 5, name: 'Vendor Demo', isRecurring: false, periodicity: 'Ad-hoc' },
      { duration: 60, attendees: 30, name: 'Company All-hands', isRecurring: true, periodicity: 'Monthly' },
      { duration: 60, attendees: 6, name: 'Postmortem', isRecurring: false, periodicity: 'Ad-hoc' },
    ];
    // San Francisco loaded hourly cost (approx fully-loaded comp): ~$300/hr per person
    const hourlyPerPerson = 300;
    return base.map((m, idx) => {
      const salaryCost = Math.round((m.duration / 60) * m.attendees * hourlyPerPerson);
      return { id: idx + 1, ...m, salaryCost };
    });
  }, []);

  const meetingsSplitData = useMemo(() => {
    const high = [];
    const low = [];
    meetingsScatterData.forEach((d) => {
      if (d.attendees > ATTENDEES_THRESHOLD) high.push(d);
      else low.push(d);
    });
    return { high, low };
  }, [meetingsScatterData]);

  return (
    <div className="page home-page">
      <section className="alerts-section" aria-labelledby="alerts-heading">
        <div className="alerts-header">
          <h2 id="alerts-heading">Alerts</h2>
        </div>
        <ul className="alerts-list">
          <li className="alert-item negative">
            Marketing's team productivity per person has decreased 3rd week in a row.
          </li>
          <li className="alert-item negative">
            Integrations team has had a large spillover in the past 2 weeks causing your Main project to be probably delayed.
          </li>
          <li className="alert-item positive">
            The time to get your new engineering integrated to the team and deliver median productivity outcomes decreased to 15 days.
          </li>
        </ul>
      </section>

      {/* KPI Boxes */}
      <section className="kpis-section" aria-label="Main KPIs">
        <div className="kpis-grid">
          <div className="kpi-card">
            <div className="kpi-title">New signed deals</div>
            <div className="kpi-value">12</div>
            <div className="kpi-sub muted">Goal: 20 this quarter</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Average revenue per employee</div>
            <div className="kpi-value">$186k</div>
            <div className="kpi-sub muted">FY-to-date</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-title">Overall productivity score</div>
            <div className="kpi-value">74</div>
            <div className="kpi-trend negative">
              <span className="trend-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7l7 7 4-4 7 7" />
                </svg>
              </span>
              -5 from last week
            </div>
          </div>
        </div>
      </section>

      {/* Project Time Chart */}
      <section className="chart-card" aria-labelledby="project-time-heading">
        <div className="chart-header">
          <h2 id="project-time-heading">Time spent by project</h2>
          <div className="chart-controls">
            <label htmlFor="team-select" className="control-label">Team</label>
            <select
              id="team-select"
              className="team-select"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {TEAMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} width={50} />
              <Tooltip
                formatter={(value) => [`${value} hrs`, 'Time']}
                labelFormatter={(label) => `Project: ${label}`}
              />
              <Bar
                key={selectedTeam}
                dataKey="hours"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Bloated Meetings Scatter (left half) */}
      <div className="row-2col">
        <section className="chart-card" aria-labelledby="bloated-meetings-heading">
          <div className="chart-header">
            <h2 id="bloated-meetings-heading">Meetings: Duration vs Attendees</h2>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="duration" name="Duration" unit="m" tick={{ fontSize: 12 }} domain={[0, 130]} />
                <YAxis type="number" dataKey="attendees" name="Attendees" tick={{ fontSize: 12 }} width={50} domain={[0, 'dataMax + 2']} />
                <ZAxis type="number" dataKey="salaryCost" range={[70, 260]} name="Salary cost" unit="$" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 8px 18px rgba(2, 8, 23, 0.06)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          <div>Duration: <strong>{d.duration}m</strong></div>
                          <div>Attendees: <strong>{d.attendees}</strong></div>
                          <div>Salary cost: <strong>${d.salaryCost.toLocaleString()}</strong></div>
                          <div>Recurring: <strong>{d.isRecurring ? 'Yes' : 'No'}</strong>{' '}
                            {d.isRecurring && <span style={{ color: '#0f172a' }}>({d.periodicity})</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={ATTENDEES_THRESHOLD} stroke="#ef4444" strokeDasharray="6 6" label={{ value: `Attendees ≥ ${ATTENDEES_THRESHOLD}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 12 }} />
                <Scatter data={meetingsSplitData.low} fill="#10b981" />
                <Scatter data={meetingsSplitData.high} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </section>
        <div className="chart-card chart-card--empty" aria-hidden="true" />
      </div>
    </div>
  );
};

export default Home;


