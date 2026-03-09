import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import RankingTable from './RankingTable';
import { UW, getYears, getLatestYear, getUniData, TRAINING_COMPS, COMP_LABELS, formatNumber } from '../data/dataUtils';

export default function TrainingSection() {
  // Stacked bar chart: UW awards per year by competition type
  const stackedData = useMemo(() => {
    const allYears = new Set();
    TRAINING_COMPS.forEach(c => getYears(c).forEach(y => allYears.add(y)));
    const sortedYears = [...allYears].sort((a, b) => a - b);

    return sortedYears.map(year => {
      const point = { year };
      TRAINING_COMPS.forEach(c => {
        const d = getUniData(c, year, UW);
        point[COMP_LABELS[c]] = d?.awards || 0;
      });
      return point;
    }).filter(p => TRAINING_COMPS.some(c => p[COMP_LABELS[c]] > 0));
  }, []);

  const colors = {
    'CGS Masters': '#000000',
    'CGS Doctoral': '#555555',
    'SSHRC Doctoral': '#999999',
    'Postdoctoral': '#cccccc',
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Research Training & Talent Development</h2>
        <p>CGS Masters, CGS Doctoral, SSHRC Doctoral Awards, and Postdoctoral Fellowships.</p>
      </div>

      <div className="chart-panel">
        <h3>UW Training Awards Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stackedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {TRAINING_COMPS.map(c => (
              <Bar key={c} dataKey={COMP_LABELS[c]} stackId="a" fill={colors[COMP_LABELS[c]]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-note">Stacked bar chart showing UW awards across all training competition types.</p>
      </div>

      <div className="chart-grid">
        {TRAINING_COMPS.map(c => {
          const latest = getLatestYear(c);
          if (!latest) return null;
          return (
            <div key={c} className="chart-panel">
              <h3>{COMP_LABELS[c]} ({latest})</h3>
              <RankingTable compKey={c} year={latest} sortMetric="awards" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
