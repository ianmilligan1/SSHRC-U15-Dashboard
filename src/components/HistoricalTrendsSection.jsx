import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getUWRankOverTime, COMP_LABELS } from '../data/dataUtils';

export default function HistoricalTrendsSection() {
  const compKeys = ['insight_grants', 'insight_development_grants', 'sshrc_doctoral', 'postdoctoral', 'cgs_masters'];
  const colors = {
    insight_grants: '#000000',
    insight_development_grants: '#444444',
    sshrc_doctoral: '#888888',
    postdoctoral: '#aaaaaa',
    cgs_masters: '#cccccc',
  };

  const combinedRankData = useMemo(() => {
    const allYears = new Set();
    const ranksByComp = {};
    compKeys.forEach(c => {
      ranksByComp[c] = getUWRankOverTime(c, 'awards');
      ranksByComp[c].forEach(d => allYears.add(d.year));
    });

    return [...allYears].sort((a, b) => a - b).map(year => {
      const point = { year };
      compKeys.forEach(c => {
        const entry = ranksByComp[c].find(d => d.year === year);
        if (entry) point[COMP_LABELS[c]] = entry.rank;
      });
      return point;
    });
  }, []);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Historical Trends</h2>
        <p>UW's rank among U15 universities over time, by competition category.</p>
      </div>

      <div className="chart-panel">
        <h3>UW Rank Among U15 Over Time (by Awards)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedRankData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis reversed domain={[1, 15]} tick={{ fontSize: 11 }} label={{ value: 'Rank (1 = best)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip formatter={v => `#${v}`} />
            <Legend />
            {compKeys.map(c => (
              <Line
                key={c}
                type="monotone"
                dataKey={COMP_LABELS[c]}
                stroke={colors[c]}
                strokeWidth={c === 'insight_grants' ? 2.5 : 1.5}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="chart-note">Y-axis inverted: 1 at top = best position. Shows UW's rank by number of awards within each competition.</p>
      </div>
    </div>
  );
}
