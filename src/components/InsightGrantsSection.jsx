import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LineChartPanel from './LineChartPanel';
import RankingTable from './RankingTable';
import { UW, getLatestYear, getYears, getCombinedFacultyTimeSeries, getAllUniData, getU15AverageForMetric, getUWRankOverTime, formatDollars } from '../data/dataUtils';
import { LineChart, Line } from 'recharts';

export default function InsightGrantsSection() {
  const latestYear = getLatestYear('insight_grants');
  const combinedData = useMemo(() => getCombinedFacultyTimeSeries(), []);

  // Funding comparison: UW vs U15 average
  const fundingData = useMemo(() => {
    const years = getYears('insight_grants');
    return years.map(year => {
      const uwData = getAllUniData('insight_grants', year)[UW];
      const avg = getU15AverageForMetric('insight_grants', year, 'total_funding');
      return {
        year,
        'UW Funding': uwData?.total_funding || 0,
        'U15 Average': avg || 0,
      };
    });
  }, []);

  // UW rank over time sparkline data
  const rankData = useMemo(() => getUWRankOverTime('insight_grants', 'awards'), []);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Insight Grants (Faculty Research)</h2>
        <p>Includes Standard Research Grants (1995-2011) as predecessor program. UW shown as bold black line.</p>
      </div>

      <LineChartPanel
        title="Success Rate Over Time (1995-Present)"
        chartData={combinedData}
        note="Standard Research Grants (1995-2011) + Insight Grants (2012-present). Success rate = awards / applications."
      />

      <div className="chart-grid">
        <div className="chart-panel">
          <h3>Total Funding: UW vs U15 Average</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fundingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => formatDollars(v)} />
              <Tooltip formatter={v => formatDollars(v)} />
              <Legend />
              <Bar dataKey="UW Funding" fill="#000000" />
              <Bar dataKey="U15 Average" fill="#cccccc" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-panel">
          <h3>UW Rank Among U15 Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rankData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis reversed domain={[1, 15]} tick={{ fontSize: 11 }} label={{ value: 'Rank', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip formatter={v => `#${v}`} />
              <Line type="monotone" dataKey="rank" stroke="#000" strokeWidth={2} dot={{ fill: '#000', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="chart-note">1 = best among U15. Based on number of awards.</p>
        </div>
      </div>

      <div className="chart-panel">
        <h3>U15 Ranking Table ({latestYear})</h3>
        <RankingTable compKey="insight_grants" year={latestYear} sortMetric="success_rate" />
      </div>
    </div>
  );
}
