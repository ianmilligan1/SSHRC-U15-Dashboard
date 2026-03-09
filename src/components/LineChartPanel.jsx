import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UW, U15_LIST, SHORT_NAMES } from '../data/dataUtils';

const GREY_PALETTE = ['#999', '#aaa', '#bbb', '#888', '#ccc', '#777', '#b0b0b0', '#a0a0a0', '#909090', '#c5c5c5', '#858585', '#9a9a9a', '#b5b5b5', '#a5a5a5'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  const sorted = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
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

export default function LineChartPanel({ title, chartData, note, yLabel = '%', highlightUni = null }) {
  const [hovered, setHovered] = useState(null);

  const universities = useMemo(() => {
    const unis = new Set();
    chartData.forEach(point => {
      Object.keys(point).forEach(k => {
        if (k !== 'year' && U15_LIST.includes(k)) unis.add(k);
      });
    });
    return [...unis];
  }, [chartData]);

  const otherUnis = universities.filter(u => u !== UW && u !== highlightUni);
  let greyIdx = 0;

  return (
    <div className="chart-panel">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          {otherUnis.map(uni => (
            <Line
              key={uni}
              type="monotone"
              dataKey={uni}
              stroke={hovered === uni ? '#555' : GREY_PALETTE[greyIdx++ % GREY_PALETTE.length]}
              strokeWidth={hovered === uni ? 2 : 1}
              dot={false}
              connectNulls
              opacity={hovered && hovered !== uni && hovered !== UW ? 0.3 : 0.7}
              onMouseEnter={() => setHovered(uni)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
          {highlightUni && highlightUni !== UW && (
            <Line
              type="monotone"
              dataKey={highlightUni}
              stroke="#555555"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          )}
          <Line
            type="monotone"
            dataKey={UW}
            stroke="#000000"
            strokeWidth={3}
            dot={{ fill: '#000', r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      {note && <p className="chart-note">{note}</p>}
    </div>
  );
}
