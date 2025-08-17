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
  ComposedChart,
  Line,
} from 'recharts';

// Synthetic employee data including prior-period values for trend calculation
const EMPLOYEE_BASE = [
  { name: 'Alice Johnson', team: 'Engineering', avgHours: 7.8, prevAvgHours: 7.5, productivity: 82, prevProductivity: 80 },
  { name: 'Bob Smith', team: 'Engineering', avgHours: 8.6, prevAvgHours: 8.9, productivity: 75, prevProductivity: 78 },
  { name: 'Carol Lee', team: 'Marketing', avgHours: 7.1, prevAvgHours: 6.8, productivity: 69, prevProductivity: 65 },
  { name: 'David Kim', team: 'Product', avgHours: 7.4, prevAvgHours: 7.6, productivity: 77, prevProductivity: 79 },
  { name: 'Emma Davis', team: 'Design', avgHours: 6.9, prevAvgHours: 7.2, productivity: 73, prevProductivity: 70 },
  { name: 'Frank Moore', team: 'Marketing', avgHours: 7.6, prevAvgHours: 7.3, productivity: 71, prevProductivity: 68 },
  { name: 'Grace Patel', team: 'Product', avgHours: 8.2, prevAvgHours: 8.0, productivity: 84, prevProductivity: 83 },
  { name: 'Hector Alvarez', team: 'Engineering', avgHours: 8.9, prevAvgHours: 8.4, productivity: 88, prevProductivity: 86 },
  { name: 'Ivy Chen', team: 'Design', avgHours: 7.2, prevAvgHours: 7.0, productivity: 79, prevProductivity: 77 },
  { name: 'Jason Brown', team: 'Product', avgHours: 7.7, prevAvgHours: 7.8, productivity: 81, prevProductivity: 82 },
];

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

  // Team-level hours vs Sales Deals (dual-axis style scatter + trend line)
  const teamHoursDeals = useMemo(() => {
    // Build points for each team (exclude 'All')
    const teams = TEAMS.filter((t) => t !== 'All');

    // Sum hours per team across projects
    const points = teams.map((team) => {
      const projectHours = TEAM_PROJECT_HOURS[team] || {};
      const totalHours = PROJECTS.reduce((sum, p) => sum + (projectHours[p] || 0), 0);
      return { team, hours: totalHours };
    });

    // Synthetic Sales Deals showing diminishing returns vs hours
    const pointsWithDeals = points.map((p) => {
      const deals = Math.round(15 + 10 * Math.log(p.hours / 100));
      return { ...p, deals };
    });

    // Fit y = a * ln(x) + b via least squares
    const lnxs = pointsWithDeals.map((p) => Math.log(p.hours));
    const ys = pointsWithDeals.map((p) => p.deals);
    const n = pointsWithDeals.length;
    const sumLnX = lnxs.reduce((s, v) => s + v, 0);
    const sumY = ys.reduce((s, v) => s + v, 0);
    const sumLnX2 = lnxs.reduce((s, v) => s + v * v, 0);
    const sumYLnX = pointsWithDeals.reduce((s, p, i) => s + ys[i] * lnxs[i], 0);

    const denom = n * sumLnX2 - sumLnX * sumLnX;
    const a = denom !== 0 ? (n * sumYLnX - sumLnX * sumY) / denom : 0;
    const b = n !== 0 ? (sumY - a * sumLnX) / n : 0;

    // Generate smooth trendline across the observed hours range
    const minX = Math.min(...pointsWithDeals.map((p) => p.hours));
    const maxX = Math.max(...pointsWithDeals.map((p) => p.hours));
    const samples = 24;
    const step = (maxX - minX) / (samples - 1 || 1);
    const trend = Array.from({ length: samples }, (_, i) => {
      const x = minX + i * step;
      const y = a * Math.log(x) + b;
      return { hours: x, deals: y };
    });

    return { points: pointsWithDeals, trend, minX, maxX };
  }, []);

  // Prepare employee rows with calculated revenue and deltas for trends
  const employeeRows = useMemo(() => {
    const MIN_REV = 110000;
    const MAX_REV = 750000;
    const calcRevenueFromProductivity = (prod) => Math.round(MIN_REV + (prod / 100) * (MAX_REV - MIN_REV));

    return EMPLOYEE_BASE.map((e) => {
      const revenue = calcRevenueFromProductivity(e.productivity);
      const hoursDelta = e.avgHours - e.prevAvgHours;
      const prodDelta = e.productivity - e.prevProductivity;
      return { ...e, revenue, hoursDelta, prodDelta };
    });
  }, []);

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
        {/* Dual-axis style: Hours (x) vs Sales Deals (y), points = teams, plus trend line */}
        <section className="chart-card" aria-labelledby="hours-deals-heading">
          <div className="chart-header">
            <h2 id="hours-deals-heading">Hours vs Sales Deals (by team)</h2>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={teamHoursDeals.points} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="hours"
                  name="Hours"
                  unit="hrs"
                  tick={{ fontSize: 12 }}
                  domain={[Math.floor((teamHoursDeals.minX - 10) / 10) * 10, Math.ceil((teamHoursDeals.maxX + 10) / 10) * 10]}
                />
                <YAxis
                  yAxisId="left"
                  type="number"
                  dataKey="deals"
                  name="Sales Deals"
                  tick={{ fontSize: 12 }}
                  width={50}
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', boxShadow: '0 8px 18px rgba(2, 8, 23, 0.06)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.team || 'Trend'}</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>
                          <div>Hours: <strong>{Math.round(d.hours)}</strong></div>
                          <div>Sales Deals: <strong>{Math.round(d.deals)}</strong></div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter yAxisId="left" data={teamHoursDeals.points} name="Teams" fill="#0ea5e9" />
                <Line yAxisId="left" type="monotone" name="Trend" dataKey="deals" data={teamHoursDeals.trend} dot={false} stroke="#64748b" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Employee table */}
      <section className="chart-card" aria-labelledby="employee-table-heading">
        <div className="chart-header">
          <h2 id="employee-table-heading">Employees</h2>
        </div>
        <div className="table-wrapper">
          <table className="data-table" role="table">
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Team</th>
                <th scope="col" className="col-num">Avg hours/day</th>
                <th scope="col" className="col-num">Productivity</th>
                <th scope="col" className="col-num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {employeeRows.map((emp) => {
                const hoursDeltaAbs = Math.abs(emp.hoursDelta).toFixed(1);
                const prodDeltaAbs = Math.abs(emp.prodDelta).toFixed(0);
                const hoursDeltaClass = emp.hoursDelta >= 0 ? 'positive' : 'negative';
                const prodDeltaClass = emp.prodDelta >= 0 ? 'positive' : 'negative';
                return (
                  <tr key={emp.name}>
                    <td>{emp.name}</td>
                    <td>{emp.team}</td>
                    <td className="col-num">
                      <div className="cell-main">{emp.avgHours.toFixed(1)}h</div>
                      <div className={`kpi-trend ${hoursDeltaClass}`} aria-label="Trend vs prior period">
                        <span className="trend-icon" aria-hidden>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7l7 7 4-4 7 7" />
                          </svg>
                        </span>
                        {emp.hoursDelta >= 0 ? '+' : '-'}{hoursDeltaAbs}
                      </div>
                    </td>
                    <td className="col-num">
                      <div className="cell-main">{emp.productivity}</div>
                      <div className={`kpi-trend ${prodDeltaClass}`} aria-label="Trend vs prior period">
                        <span className="trend-icon" aria-hidden>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 7l7 7 4-4 7 7" />
                          </svg>
                        </span>
                        {emp.prodDelta >= 0 ? '+' : '-'}{prodDeltaAbs}
                      </div>
                    </td>
                    <td className="col-num">${emp.revenue.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Home;


