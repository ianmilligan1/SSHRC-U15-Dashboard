import { UW, getUWTotalAwards, getLatestYear, getUniData, getU15Ranked, formatPercent } from '../data/dataUtils';

export default function KPICards() {
  const latestIG = getLatestYear('insight_grants');
  const igData = getUniData('insight_grants', latestIG, UW);

  // Total awards across all competitions in latest available year
  const refYear = latestIG;
  const totalAwards = getUWTotalAwards(refYear);

  // 5 years ago
  const fiveYearsAgo = refYear - 5;
  const totalAwardsThen = getUWTotalAwards(fiveYearsAgo);
  const awardsTrend = totalAwards > totalAwardsThen ? 'up' : totalAwards < totalAwardsThen ? 'down' : 'flat';

  // UW rank by total awards in IG
  const igRanked = getU15Ranked('insight_grants', refYear, 'awards');
  const uwIgRank = igRanked.find(d => d.uni === UW);

  // Overall success rate for IG
  const igRate = igData?.success_rate;

  // 5 years ago IG rate
  const igDataThen = getUniData('insight_grants', fiveYearsAgo, UW);
  const igRateThen = igDataThen?.success_rate;
  const rateTrend = igRate && igRateThen
    ? (igRate > igRateThen ? 'up' : igRate < igRateThen ? 'down' : 'flat')
    : 'flat';

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="label">Total SSHRC Awards ({refYear})</div>
        <div className="value">{totalAwards}</div>
        <div className={`detail trend-${awardsTrend}`}>
          {awardsTrend === 'up' ? '\u2191' : awardsTrend === 'down' ? '\u2193' : '\u2192'} vs. {totalAwardsThen} in {fiveYearsAgo}
        </div>
      </div>

      <div className="kpi-card">
        <div className="label">Insight Grant Success Rate</div>
        <div className="value">{igRate != null ? formatPercent(igRate) : '-'}</div>
        <div className={`detail trend-${rateTrend}`}>
          {rateTrend === 'up' ? '\u2191' : rateTrend === 'down' ? '\u2193' : '\u2192'} vs. {igRateThen != null ? formatPercent(igRateThen) : '-'} in {fiveYearsAgo}
        </div>
      </div>

      <div className="kpi-card">
        <div className="label">U15 Rank (IG Awards)</div>
        <div className="value">{uwIgRank ? `#${uwIgRank.rank}` : '-'}</div>
        <div className="detail">of {igRanked.length} U15 universities</div>
      </div>

      <div className="kpi-card">
        <div className="label">IG Funding ({refYear})</div>
        <div className="value">{igData?.total_funding ? '$' + (igData.total_funding / 1000000).toFixed(1) + 'M' : '-'}</div>
        <div className="detail">{igData?.awards || 0} awards from {igData?.applications || 0} applications</div>
      </div>
    </div>
  );
}
