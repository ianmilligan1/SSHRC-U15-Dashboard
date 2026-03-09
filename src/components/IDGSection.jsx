import { useMemo } from 'react';
import LineChartPanel from './LineChartPanel';
import RankingTable from './RankingTable';
import { getLatestYear, getTimeSeriesForMetric } from '../data/dataUtils';

export default function IDGSection() {
  const latestYear = getLatestYear('insight_development_grants');
  const rateData = useMemo(() => getTimeSeriesForMetric('insight_development_grants', 'success_rate'), []);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Insight Development Grants</h2>
        <p>Smaller, shorter-duration grants for new research directions. Available since 2011.</p>
      </div>

      <LineChartPanel
        title="Success Rate Over Time (2011-Present)"
        chartData={rateData}
        note="UW shown as bold black line. Hover to see individual university values."
      />

      <div className="chart-panel">
        <h3>U15 Ranking Table ({latestYear})</h3>
        <RankingTable compKey="insight_development_grants" year={latestYear} sortMetric="success_rate" />
      </div>
    </div>
  );
}
