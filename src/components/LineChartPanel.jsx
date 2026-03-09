import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UW, U15_LIST, SHORT_NAMES } from '../data/dataUtils';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  const sorted = [...payload].filter(e => e.value != null).sort((a, b) => (b.value || 0) - (a.value || 0));
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', padding: '0.75rem', fontSize: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{label}</div>
      {sorted.map(entry => (
        <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontWeight: entry.name === UW ? 700 : 400 }}>
          <span style={{ color: entry.color }}>{SHORT_NAMES[entry.name] || entry.name}</span>
          <span>{entry.value != null ? entry.value.toFixed(1) + '%' : '-'}</span>
        </div>
      ))}
    </div>
  );
}

const PEER_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2'];

export default function LineChartPanel({ title, chartData, note, yLabel = '%' }) {
  const [highlightedPeers, setHighlightedPeers] = useState(new Set());

  const universities = useMemo(() => {
    const unis = new Set();
    chartData.forEach(point => {
      Object.keys(point).forEach(k => {
        if (k !== 'year' && U15_LIST.includes(k)) unis.add(k);
      });
    });
    return [...unis];
  }, [chartData]);

  const otherUnis = universities.filter(u => u !== UW);

  const togglePeer = (uni) => {
    setHighlightedPeers(prev => {
      const next = new Set(prev);
      if (next.has(uni)) next.delete(uni);
      else next.add(uni);
      return next;
    });
  };

  const peerColorMap = {};
  let ci = 0;
  highlightedPeers.forEach(uni => {
    peerColorMap[uni] = PEER_COLORS[ci++ % PEER_COLORS.length];
  });

  return (
    <div className="chart-panel">
      <h3>{title}</h3>

      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Compare with:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.35rem' }}>
          {otherUnis.map(uni => {
            const isActive = highlightedPeers.has(uni);
            return (
              <button
                key={uni}
                onClick={() => togglePeer(uni)}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  border: isActive ? `2px solid ${peerColorMap[uni]}` : '1px solid var(--border)',
                  borderRadius: '3px',
                  background: isActive ? peerColorMap[uni] + '15' : 'transparent',
                  color: isActive ? peerColorMap[uni] : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {SHORT_NAMES[uni] || uni}
              </button>
            );
          })}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 'auto']} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          {otherUnis.filter(u => !highlightedPeers.has(u)).map(uni => (
            <Line
              key={uni}
              type="monotone"
              dataKey={uni}
              stroke="#ddd"
              strokeWidth={1}
              dot={false}
              connectNulls
              opacity={0.6}
            />
          ))}
          {[...highlightedPeers].map(uni => (
            <Line
              key={uni}
              type="monotone"
              dataKey={uni}
              stroke={peerColorMap[uni]}
              strokeWidth={2.5}
              dot={{ fill: peerColorMap[uni], r: 2.5 }}
              connectNulls
            />
          ))}
          <Line
            type="monotone"
            dataKey={UW}
            stroke="#000000"
            strokeWidth={3}
            dot={{ fill: '#000', r: 3.5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {note && <p className="chart-note">{note}</p>}
    </div>
  );
}
