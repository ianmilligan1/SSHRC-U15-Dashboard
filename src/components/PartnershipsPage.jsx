import { useMemo } from 'react';
import LineChartPanel from './LineChartPanel';
import RankingTable from './RankingTable';
import { getLatestYear, getYears, getTimeSeriesForMetric, PARTNERSHIP_COMPS, COMP_LABELS } from '../data/dataUtils';

function CompetitionSection({ compKey, description }) {
  const latestYear = getLatestYear(compKey);
  const years = getYears(compKey);
  const rateData = useMemo(
    () => getTimeSeriesForMetric(compKey, 'success_rate'),
    [compKey]
  );

  if (!latestYear || years.length === 0) return null;

  const hasRateData = rateData.some(p =>
    Object.keys(p).some(k => k !== 'year' && p[k] != null)
  );

  return (
    <div className="section">
      <div className="section-header">
        <h2>{COMP_LABELS[compKey]}</h2>
        <p>{description}</p>
      </div>

      {hasRateData && (
        <LineChartPanel
          title={`Success Rate Over Time (${years[0]}-${years[years.length - 1]})`}
          chartData={rateData}
          note="UW shown as bold black line. Hover to see individual university values."
        />
      )}

      <div className="chart-panel">
        <h3>U15 Ranking Table ({latestYear})</h3>
        <RankingTable compKey={compKey} year={latestYear} sortMetric="success_rate" />
      </div>
    </div>
  );
}

export default function PartnershipsPage() {
  const descriptions = {
    connection_grants: 'Small-scale, short-term grants for events and outreach activities. Available since 2012.',
    partnership_development_grants: 'Grants to develop new research partnerships. Available since 2010.',
    partnership_grants: 'Large-scale, long-term partnership grants for research initiatives. Available since 2011.',
    partnership_engage_grants: 'Short-term grants for partnered research in the not-for-profit, private, and/or public sector. Available since 2017.',
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Research Partnerships</h1>
        <p className="subtitle">Connection Grants, Partnership Development Grants, Partnership Grants, and Partnership Engage Grants</p>
      </header>

      {PARTNERSHIP_COMPS.map(c => (
        <CompetitionSection key={c} compKey={c} description={descriptions[c]} />
      ))}
    </div>
  );
}
