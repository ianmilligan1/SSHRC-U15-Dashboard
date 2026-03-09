import { UW, getU15Ranked, formatNumber, formatPercent, formatDollars, SHORT_NAMES } from '../data/dataUtils';

export default function RankingTable({ compKey, year, sortMetric = 'success_rate' }) {
  const ranked = getU15Ranked(compKey, year, sortMetric);

  if (ranked.length === 0) return <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data available for {year}.</p>;

  const hasApps = ranked.some(d => d.applications != null);
  const hasFunding = ranked.some(d => d.total_funding != null);
  const hasRate = ranked.some(d => d.success_rate != null);

  return (
    <div className="ranking-table-wrap">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>University</th>
            {hasApps && <th>Applications</th>}
            <th>Awards</th>
            {hasRate && <th>Success Rate</th>}
            {hasFunding && <th>Funding</th>}
          </tr>
        </thead>
        <tbody>
          {ranked.map(d => (
            <tr key={d.uni} className={d.uni === UW ? 'uw-row' : ''}>
              <td>{d.rank}</td>
              <td>{SHORT_NAMES[d.uni] || d.uni}{d.uni === UW ? ' *' : ''}</td>
              {hasApps && <td>{formatNumber(d.applications)}</td>}
              <td>{formatNumber(d.awards)}</td>
              {hasRate && <td>{formatPercent(d.success_rate)}</td>}
              {hasFunding && <td>{formatDollars(d.total_funding)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
