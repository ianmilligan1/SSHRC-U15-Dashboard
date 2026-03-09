import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { UW, U15_LIST, SHORT_NAMES, COMP_LABELS, getLatestYear, getAllUniData } from '../data/dataUtils';

function HeatmapCell({ value, maxVal }) {
  if (value == null) return <td style={{ background: '#fafafa', color: '#ccc' }}>-</td>;
  const intensity = maxVal > 0 ? value / maxVal : 0;
  const bg = `rgba(0, 0, 0, ${intensity * 0.7})`;
  const color = intensity > 0.4 ? '#fff' : '#111';
  return <td style={{ background: bg, color, fontVariantNumeric: 'tabular-nums' }}>{value.toFixed(0)}%</td>;
}

export default function U15ComparisonSection() {
  const compKeys = ['insight_grants', 'insight_development_grants', 'connection_grants', 'partnership_development_grants', 'sshrc_doctoral', 'postdoctoral'];

  // Heatmap data
  const heatmapData = useMemo(() => {
    const latestYears = {};
    compKeys.forEach(c => { latestYears[c] = getLatestYear(c); });

    const maxVals = {};
    compKeys.forEach(c => {
      let max = 0;
      const yearData = getAllUniData(c, latestYears[c]);
      U15_LIST.forEach(uni => {
        const rate = yearData[uni]?.success_rate;
        if (rate != null && rate > max) max = rate;
      });
      maxVals[c] = max;
    });

    return { latestYears, maxVals };
  }, []);

  // Scatter plot data
  const scatterData = useMemo(() => {
    const latestIG = getLatestYear('insight_grants');
    const yearData = getAllUniData('insight_grants', latestIG);
    return U15_LIST.map(uni => {
      const d = yearData[uni];
      if (!d) return null;
      return {
        name: SHORT_NAMES[uni],
        uni,
        applications: d.applications || 0,
        awards: d.awards || 0,
        funding: d.total_funding || 0,
        isUW: uni === UW,
      };
    }).filter(Boolean);
  }, []);

  const uwScatter = scatterData.filter(d => d.isUW);
  const otherScatter = scatterData.filter(d => !d.isUW);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Overall U15 Comparison</h2>
        <p>Cross-competition view showing where each university is strong or weak.</p>
      </div>

      <div className="chart-panel">
        <h3>Success Rate Heatmap (Latest Year)</h3>
        <div className="heatmap-grid">
          <table>
            <thead>
              <tr>
                <th>University</th>
                {compKeys.map(c => (
                  <th key={c}>{COMP_LABELS[c]} ({heatmapData.latestYears[c]})</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {U15_LIST.map(uni => (
                <tr key={uni} className={uni === UW ? 'uw-row' : ''}>
                  <td style={{ textAlign: 'left', whiteSpace: 'nowrap', fontWeight: uni === UW ? 700 : 400 }}>
                    {SHORT_NAMES[uni]}{uni === UW ? ' *' : ''}
                  </td>
                  {compKeys.map(c => {
                    const yearData = getAllUniData(c, heatmapData.latestYears[c]);
                    const rate = yearData[uni]?.success_rate;
                    return <HeatmapCell key={c} value={rate} maxVal={heatmapData.maxVals[c]} />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="chart-note">Darker = higher success rate. Only competitions with application-based success rates shown.</p>
      </div>

      <div className="chart-panel">
        <h3>Insight Grants: Applications vs Awards ({getLatestYear('insight_grants')})</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="applications" name="Applications" tick={{ fontSize: 11 }} label={{ value: 'Applications', position: 'insideBottom', offset: -5, fontSize: 11 }} />
            <YAxis type="number" dataKey="awards" name="Awards" tick={{ fontSize: 11 }} label={{ value: 'Awards', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <ZAxis type="number" dataKey="funding" range={[80, 600]} name="Funding" />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'Funding') return '$' + (value / 1000000).toFixed(1) + 'M';
                return value;
              }}
              labelFormatter={() => ''}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div style={{ background: '#fff', border: '1px solid #e5e5e5', padding: '0.5rem', fontSize: '0.8rem' }}>
                    <strong>{d?.name}</strong><br />
                    Apps: {d?.applications}, Awards: {d?.awards}<br />
                    Funding: ${(d?.funding / 1000000).toFixed(1)}M
                  </div>
                );
              }}
            />
            <Scatter data={otherScatter} fill="#cccccc" />
            <Scatter data={uwScatter} fill="#000000" />
          </ScatterChart>
        </ResponsiveContainer>
        <p className="chart-note">Bubble size = total funding. Black = UW. Ideal position: upper-right.</p>
      </div>
    </div>
  );
}
