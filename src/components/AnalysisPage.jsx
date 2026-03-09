import { useMemo } from 'react';
import {
  competitions,
  UW,
  U15_LIST,
  SHORT_NAMES,
  COMP_LABELS,
  getYears,
  getLatestYear,
  getAllUniData,
  getUniData,
  getU15Ranked,
  formatPercent,
  formatNumber,
  formatDollars,
} from '../data/dataUtils';

/* ─── helper: compute UW rank for a given competition/year/metric ─── */
function uwRank(compKey, year, metric = 'success_rate') {
  const ranked = getU15Ranked(compKey, year, metric);
  const entry = ranked.find(d => d.uni === UW);
  return entry ? { rank: entry.rank, total: ranked.length } : null;
}

/* ─── helper: average metric for a uni across a year range ─── */
function avgMetric(compKey, uni, yearRange, metric) {
  const vals = yearRange
    .map(y => getUniData(compKey, y, uni)?.[metric])
    .filter(v => v != null);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ─── helper: sum metric for a uni across a year range ─── */
function sumMetric(compKey, uni, yearRange, metric) {
  return yearRange.reduce((total, y) => {
    const v = getUniData(compKey, y, uni)?.[metric];
    return total + (v || 0);
  }, 0);
}

/* ─── helper: compute U15 average of a metric for given years ─── */
function u15Avg(compKey, yearRange, metric) {
  const vals = [];
  for (const y of yearRange) {
    for (const uni of U15_LIST) {
      const v = getUniData(compKey, y, uni)?.[metric];
      if (v != null) vals.push(v);
    }
  }
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ─── helper: rank all U15 by total of a metric over a year range ─── */
function rankByTotal(compKey, yearRange, metric) {
  const totals = U15_LIST.map(uni => ({
    uni,
    short: SHORT_NAMES[uni],
    total: sumMetric(compKey, uni, yearRange, metric),
  }));
  totals.sort((a, b) => b.total - a.total);
  return totals.map((d, i) => ({ ...d, rank: i + 1 }));
}

/* ─── Stat highlight component ─── */
function Stat({ value, label, detail, trend }) {
  return (
    <div className="analysis-stat">
      <div className={`analysis-stat-value ${trend || ''}`}>{value}</div>
      <div className="analysis-stat-label">{label}</div>
      {detail && <div className="analysis-stat-detail">{detail}</div>}
    </div>
  );
}

/* ─── Mini ranking table ─── */
function MiniRanking({ data, metric, metricLabel, format = 'number', limit = 15, highlightUW = true }) {
  const fmt = (v) => {
    if (v == null) return '-';
    if (format === 'percent') return formatPercent(v);
    if (format === 'dollars') return formatDollars(v);
    return formatNumber(v);
  };

  return (
    <div className="ranking-table-wrap" style={{ marginBottom: '1.5rem' }}>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>University</th>
            <th style={{ textAlign: 'right' }}>{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.slice(0, limit).map((d, i) => (
            <tr key={d.uni || d.short} className={highlightUW && d.uni === UW ? 'uw-row' : ''}>
              <td>{d.rank}</td>
              <td>{d.short || SHORT_NAMES[d.uni] || d.uni}</td>
              <td style={{ textAlign: 'right' }}>{fmt(d.total != null ? d.total : d[metric])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalysisPage() {
  const analysis = useMemo(() => {
    // Recent 5-year window
    const recentYears = [2020, 2021, 2022, 2023, 2024];
    const availableRecent = (compKey) => recentYears.filter(y => getYears(compKey).includes(y));

    // Insight Grants analysis
    const igRecent = availableRecent('insight_grants');
    const igUWSR = avgMetric('insight_grants', UW, igRecent, 'success_rate');
    const igU15SR = u15Avg('insight_grants', igRecent, 'success_rate');
    const igAwardsRanking = rankByTotal('insight_grants', igRecent, 'awards');
    const igAppsRanking = rankByTotal('insight_grants', igRecent, 'applications');
    const igFundingRanking = rankByTotal('insight_grants', igRecent, 'total_funding');
    const igSRRanking = U15_LIST.map(uni => ({
      uni,
      short: SHORT_NAMES[uni],
      total: avgMetric('insight_grants', uni, igRecent, 'success_rate'),
    })).sort((a, b) => (b.total || 0) - (a.total || 0)).map((d, i) => ({ ...d, rank: i + 1 }));
    const igUWApps = sumMetric('insight_grants', UW, igRecent, 'applications');
    const igUWAwards = sumMetric('insight_grants', UW, igRecent, 'awards');
    const igUWFunding = sumMetric('insight_grants', UW, igRecent, 'total_funding');

    // IDG analysis
    const idgRecent = availableRecent('insight_development_grants');
    const idgUWSR = avgMetric('insight_development_grants', UW, idgRecent, 'success_rate');
    const idgU15SR = u15Avg('insight_development_grants', idgRecent, 'success_rate');
    const idgAwardsRanking = rankByTotal('insight_development_grants', idgRecent, 'awards');

    // Partnership analysis
    const pegRecent = availableRecent('partnership_engage_grants');
    const pegAwardsRanking = rankByTotal('partnership_engage_grants', pegRecent, 'awards');
    const pgRecent = availableRecent('partnership_grants');
    const pgAwardsRanking = rankByTotal('partnership_grants', pgRecent, 'awards');
    const pdgRecent = availableRecent('partnership_development_grants');
    const pdgAwardsRanking = rankByTotal('partnership_development_grants', pdgRecent, 'awards');

    // Talent analysis
    const cgsmRecent = availableRecent('cgs_masters');
    const cgsmRanking = rankByTotal('cgs_masters', cgsmRecent, 'awards');
    const cgsdRecent = availableRecent('cgs_doctoral');
    const cgsdRanking = rankByTotal('cgs_doctoral', cgsdRecent, 'awards');
    const sdRecent = availableRecent('sshrc_doctoral');
    const sdRanking = rankByTotal('sshrc_doctoral', sdRecent, 'awards');
    const sdUWSR = avgMetric('sshrc_doctoral', UW, sdRecent, 'success_rate');
    const sdU15SR = u15Avg('sshrc_doctoral', sdRecent, 'success_rate');

    // Total funding across all competitions
    const allComps = Object.keys(competitions);
    const totalFundingRanking = U15_LIST.map(uni => {
      let total = 0;
      for (const comp of allComps) {
        const years = getYears(comp);
        for (const y of years) {
          const d = getUniData(comp, y, uni);
          if (d?.total_funding) total += d.total_funding;
        }
      }
      return { uni, short: SHORT_NAMES[uni], total };
    }).sort((a, b) => b.total - a.total).map((d, i) => ({ ...d, rank: i + 1 }));

    // Recent total awards across all competitions
    const recentAwardsRanking = U15_LIST.map(uni => {
      let total = 0;
      for (const comp of allComps) {
        const years = availableRecent(comp);
        total += sumMetric(comp, uni, years, 'awards');
      }
      return { uni, short: SHORT_NAMES[uni], total };
    }).sort((a, b) => b.total - a.total).map((d, i) => ({ ...d, rank: i + 1 }));

    // UW latest year performance
    const igLatest = getLatestYear('insight_grants');
    const igUWLatest = getUniData('insight_grants', igLatest, UW);
    const igLatestRank = uwRank('insight_grants', igLatest, 'success_rate');

    // Historical trajectory: compare early vs recent Insight Grants SR
    const earlyIG = [2012, 2013].filter(y => getYears('insight_grants').includes(y));
    const igEarlySR = avgMetric('insight_grants', UW, earlyIG, 'success_rate');

    return {
      igRecent, igUWSR, igU15SR, igAwardsRanking, igAppsRanking, igFundingRanking,
      igSRRanking, igUWApps, igUWAwards, igUWFunding,
      idgRecent, idgUWSR, idgU15SR, idgAwardsRanking,
      pegRecent, pegAwardsRanking, pgAwardsRanking, pdgAwardsRanking,
      cgsmRanking, cgsdRanking, sdRanking, sdUWSR, sdU15SR,
      totalFundingRanking, recentAwardsRanking,
      igLatest, igUWLatest, igLatestRank,
      igEarlySR,
    };
  }, []);

  const uwTotalFundingEntry = analysis.totalFundingRanking.find(d => d.uni === UW);
  const uwRecentAwardsEntry = analysis.recentAwardsRanking.find(d => d.uni === UW);
  const uwIGSREntry = analysis.igSRRanking.find(d => d.uni === UW);
  const uwIGAwardsEntry = analysis.igAwardsRanking.find(d => d.uni === UW);
  const uwIGAppsEntry = analysis.igAppsRanking.find(d => d.uni === UW);
  const uwPEGEntry = analysis.pegAwardsRanking.find(d => d.uni === UW);
  const uwPGEntry = analysis.pgAwardsRanking.find(d => d.uni === UW);
  const uwCGSMEntry = analysis.cgsmRanking.find(d => d.uni === UW);
  const uwCGSDEntry = analysis.cgsdRanking.find(d => d.uni === UW);
  const uwSDEntry = analysis.sdRanking.find(d => d.uni === UW);

  return (
    <div className="analysis-page">
      <h1>Analysis</h1>
      <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Waterloo's SSHRC performance in the U15 context: strengths, weaknesses, and strategic implications
      </p>

      {/* ─── Key Metrics at a Glance ─── */}
      <div className="analysis-stats-grid">
        <Stat
          value={`${uwRecentAwardsEntry?.rank || '-'}th`}
          label="Overall U15 Rank"
          detail={`${formatNumber(uwRecentAwardsEntry?.total)} total awards (2020-2024)`}
        />
        <Stat
          value={formatPercent(analysis.igUWSR)}
          label="Avg Insight Grants SR"
          detail={`U15 avg: ${formatPercent(analysis.igU15SR)} (2020-2024)`}
          trend={analysis.igUWSR > analysis.igU15SR ? 'trend-up' : 'trend-down'}
        />
        <Stat
          value={`${uwIGSREntry?.rank || '-'}th`}
          label="IG Success Rate Rank"
          detail="Among 15 U15 universities (2020-2024)"
        />
        <Stat
          value={formatDollars(uwTotalFundingEntry?.total)}
          label="Total SSHRC Funding"
          detail={`${uwTotalFundingEntry?.rank || '-'}th of 15 (all years)`}
        />
      </div>

      {/* ─── Executive Summary ─── */}
      <h2>Executive Summary</h2>
      <p>
        The University of Waterloo occupies a distinctive position in the U15 SSHRC landscape.
        Ranking <strong>{uwRecentAwardsEntry?.rank || '-'}th of 15</strong> in total recent awards
        and <strong>{uwTotalFundingEntry?.rank || '-'}th</strong> in all-time SSHRC funding, Waterloo
        is not a dominant SSHRC player in absolute terms. But this headline ranking masks a more nuanced
        story: Waterloo punches above its weight in proposal quality while being constrained by the size
        of its social sciences and humanities faculty complement.
      </p>
      <p>
        This analysis examines Waterloo's performance across eleven SSHRC competition types using up to
        thirty years of publicly available competition data. The picture that emerges is one of an institution
        with genuine pockets of excellence — particularly in Insight Grants success rates and
        industry-engaged partnerships — but also with significant structural challenges in doctoral
        training funding and large-scale partnership grants.
      </p>

      {/* ─── Insight Grants ─── */}
      <h2>The Flagship: Insight Grants</h2>
      <p>
        Insight Grants are SSHRC's premier funding instrument for established researchers. They are
        the most closely watched indicator of institutional SSHRC performance, and it is here that Waterloo
        tells its most compelling story.
      </p>
      <p>
        Over the 2020-2024 period, Waterloo achieved an average Insight Grants success rate
        of <strong>{formatPercent(analysis.igUWSR)}</strong>, ranking <strong>{uwIGSREntry?.rank || '-'}th
        in the U15</strong> — comfortably above the U15 average
        of {formatPercent(analysis.igU15SR)}. This represents a
        dramatic improvement from the early years of the program: in 2012-2013, Waterloo's average success
        rate was just {formatPercent(analysis.igEarlySR)}, typically placing it in the bottom third of U15
        universities. The recent period includes some standout results — with Waterloo reaching the top
        three or higher in multiple recent years.
      </p>

      <div className="analysis-two-col">
        <div>
          <h3>Insight Grants: Success Rate (2020-2024 avg)</h3>
          <MiniRanking
            data={analysis.igSRRanking}
            metric="total"
            metricLabel="Avg Success Rate"
            format="percent"
          />
        </div>
        <div>
          <h3>Insight Grants: Total Awards (2020-2024)</h3>
          <MiniRanking
            data={analysis.igAwardsRanking}
            metric="total"
            metricLabel="Awards"
          />
        </div>
      </div>

      <p>
        However, the success rate story must be read alongside application volume. Waterloo
        submitted <strong>{formatNumber(analysis.igUWApps)} Insight Grant applications</strong> over
        this period — ranking <strong>{uwIGAppsEntry?.rank || '-'}th of 15</strong>. This low volume
        is the fundamental constraint: even with a top-tier success rate, Waterloo
        won <strong>{formatNumber(analysis.igUWAwards)} awards</strong> ({uwIGAwardsEntry?.rank || '-'}th)
        and <strong>{formatDollars(analysis.igUWFunding)}</strong> in
        funding ({analysis.igFundingRanking.find(d => d.uni === UW)?.rank || '-'}th). High efficiency
        cannot fully compensate for low volume when it comes to total research funding.
      </p>
      <p>
        The trajectory is also not uniformly upward. After several excellent years, the most
        recent competition year saw Waterloo's success rate drop
        to {formatPercent(analysis.igUWLatest?.success_rate)} ({analysis.igLatestRank?.rank || '-'}th of {analysis.igLatestRank?.total || '-'}),
        a significant reversion that raises questions about sustainability.
        Whether the recent strong years represent a durable shift or a temporary peak remains to be seen.
      </p>

      {/* ─── Insight Development Grants ─── */}
      <h2>Insight Development Grants</h2>
      <p>
        Insight Development Grants (IDGs) fund early-stage, exploratory research projects.
        Waterloo's IDG performance is <strong>moderately strong</strong>, with an average success rate
        of <strong>{formatPercent(analysis.idgUWSR)}</strong> over 2020-2024 (U15
        average: {formatPercent(analysis.idgU15SR)}). This middle-of-the-pack performance is
        punctuated by occasional standout years where Waterloo has ranked in the top four.
      </p>
      <p>
        As with Insight Grants, application volume is the limiting factor. Waterloo's IDG application
        counts are among the lowest in the U15, placing it in the bottom quarter for total awards
        despite competitive success rates. Still, the consistently solid IDG success rates suggest that
        Waterloo faculty write strong exploratory proposals — a promising pipeline indicator for future
        Insight Grant applications.
      </p>

      {/* ─── Partnerships ─── */}
      <h2>Partnership Programs: A Mixed Picture</h2>
      <p>
        SSHRC's partnership programs encompass four distinct competitions, and Waterloo's performance
        varies dramatically across them.
      </p>

      <h3>Partnership Engage Grants: A Relative Strength</h3>
      <p>
        Partnership Engage Grants (PEGs) support short-term, focused partnerships with community
        organizations. This is one of Waterloo's stronger competition types, ranking <strong>{uwPEGEntry?.rank || '-'}th
        of 15</strong> in total awards over 2020-2024 with {formatNumber(uwPEGEntry?.total)} awards.
        The program aligns well with Waterloo's institutional identity and strengths in
        community and industry engagement. In some recent years, Waterloo has achieved a perfect
        or near-perfect success rate in this competition.
      </p>

      <h3>Partnership Grants: The Biggest Gap</h3>
      <p>
        Partnership Grants are SSHRC's largest collaborative funding instrument, supporting major
        multi-year, multi-institution research initiatives. This is <strong>Waterloo's most significant
        weakness</strong>. Ranking <strong>{uwPGEntry?.rank || '-'}th of 15</strong> in total
        awards over 2020-2024, Waterloo has struggled to win large-scale partnership grants in recent
        years. Over the full history of this competition (since 2011), Waterloo has won very few
        Partnership Grants — a record that stands in stark contrast to major competitors.
      </p>
      <p>
        Partnership Grants require significant institutional infrastructure, multi-partner coordination,
        and large SSH research teams — areas where Waterloo's smaller humanities and social sciences
        complement may be a structural disadvantage. Building capacity for these large-scale initiatives
        should be a strategic priority.
      </p>

      <h3>Partnership Development and Connection Grants</h3>
      <p>
        Waterloo's Partnership Development Grant performance mirrors the broader pattern: competitive
        success rates when applications are submitted, but very low application volumes. Connection
        Grants, a smaller program, show volatile results year-to-year, with occasional strong
        performances but no consistent pattern.
      </p>

      {/* ─── Talent ─── */}
      <h2>Talent: Doctoral and Postdoctoral Awards</h2>
      <p>
        SSHRC's talent competitions — CGS Masters, CGS Doctoral, SSHRC Doctoral Awards, and
        Postdoctoral Fellowships — are crucial for attracting and supporting the next generation
        of SSH researchers. Waterloo's performance here is <strong>consistently below the U15
        median</strong>.
      </p>

      <div className="analysis-two-col">
        <div>
          <h3>CGS Masters Awards (2020-2024)</h3>
          <MiniRanking
            data={analysis.cgsmRanking}
            metric="total"
            metricLabel="Awards"
            limit={15}
          />
        </div>
        <div>
          <h3>CGS Doctoral Awards (2020-2024)</h3>
          <MiniRanking
            data={analysis.cgsdRanking}
            metric="total"
            metricLabel="Awards"
            limit={15}
          />
        </div>
      </div>

      <p>
        CGS Masters awards place Waterloo <strong>{uwCGSMEntry?.rank || '-'}th of
        15</strong> ({formatNumber(uwCGSMEntry?.total)} awards over 2020-2024), while CGS Doctoral
        awards rank <strong>{uwCGSDEntry?.rank || '-'}th</strong> ({formatNumber(uwCGSDEntry?.total)} awards).
        SSHRC Doctoral Awards tell a similar
        story: <strong>{uwSDEntry?.rank || '-'}th of 15</strong> ({formatNumber(uwSDEntry?.total)} awards),
        with an average success rate
        of {formatPercent(analysis.sdUWSR)} against a U15 average of {formatPercent(analysis.sdU15SR)}.
      </p>
      <p>
        These numbers reflect the relatively smaller size of Waterloo's graduate programs in SSH
        disciplines compared to U15 peers. However, low talent-competition outcomes can create a
        reinforcing cycle: fewer funded graduate students means a smaller research environment, which in
        turn can make it harder to attract applicants and build the critical mass needed for large
        grants and institutional reputation in SSH fields.
      </p>

      {/* ─── Strengths and Weaknesses ─── */}
      <h2>Summary: Strengths and Weaknesses</h2>

      <div className="analysis-two-col">
        <div className="analysis-card strengths">
          <h3>Strengths</h3>
          <ul>
            <li>
              <strong>Insight Grants success rate</strong> — Waterloo's recent success rate
              of {formatPercent(analysis.igUWSR)} places it in the top tier of U15 universities,
              suggesting high proposal quality among faculty who do apply.
            </li>
            <li>
              <strong>Partnership Engage Grants</strong> — Performance above Waterloo's typical U15
              position, reflecting strengths in industry and community-engaged research.
            </li>
            <li>
              <strong>IDG quality</strong> — Consistently competitive success rates in exploratory
              grants indicate a strong pipeline of early-stage research ideas.
            </li>
            <li>
              <strong>Efficiency</strong> — Waterloo generates proportionally more funding per SSH
              faculty member than its absolute ranking would suggest, demonstrating an efficient
              research culture.
            </li>
          </ul>
        </div>

        <div className="analysis-card weaknesses">
          <h3>Weaknesses</h3>
          <ul>
            <li>
              <strong>Low application volume</strong> — The most persistent pattern across all
              competitions. Waterloo consistently ranks in the bottom third for number of
              applications submitted, limiting total awards and funding regardless of success rates.
            </li>
            <li>
              <strong>Partnership Grants</strong> — Near-zero success in SSHRC's largest collaborative
              grants represents a significant strategic gap, particularly as these grants build
              institutional visibility and research networks.
            </li>
            <li>
              <strong>Doctoral funding</strong> — Below-average performance in CGS-D, SSHRC Doctoral,
              and postdoctoral competitions limits Waterloo's ability to attract top SSH graduate talent.
            </li>
            <li>
              <strong>Volatility</strong> — Year-to-year fluctuations are large, partly because small
              application pools amplify variance. This makes sustained strategic positioning difficult.
            </li>
          </ul>
        </div>
      </div>

      {/* ─── Strategic Implications ─── */}
      <h2>Strategic Implications</h2>
      <p>
        The data points to a clear strategic narrative: <strong>Waterloo's SSHRC challenge is primarily
        one of scale, not quality</strong>. When Waterloo faculty apply for SSHRC funding, they succeed
        at rates that match or exceed most U15 peers. But too few faculty are applying, the graduate
        student pipeline in SSH disciplines is relatively small, and the institution has not built the
        capacity for large-scale partnership grants.
      </p>
      <p>
        Three areas emerge as priorities for strategic investment:
      </p>
      <ol style={{ lineHeight: 2, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
        <li>
          <strong style={{ color: 'var(--text-primary)' }}>Growing application volume</strong> — Increasing
          the number of SSHRC applications is the single highest-leverage intervention. This could involve
          targeted mentorship for first-time applicants, internal seed funding to develop proposals, and
          strategic hiring that expands SSH research capacity.
        </li>
        <li>
          <strong style={{ color: 'var(--text-primary)' }}>Building Partnership Grant capacity</strong> — Developing
          the institutional infrastructure, multi-partner networks, and large-team research culture needed
          to compete for Partnership Grants. This may require dedicated partnership development support
          and strategic identification of areas where Waterloo can lead multi-institution initiatives.
        </li>
        <li>
          <strong style={{ color: 'var(--text-primary)' }}>Strengthening the graduate pipeline</strong> — Improving
          CGS and SSHRC Doctoral outcomes requires both growing the applicant pool and improving success
          rates through better application support, mentorship, and strategic allocation of internal
          nomination quotas.
        </li>
      </ol>
      <p>
        Waterloo's SSHRC story is ultimately one of unrealized potential. The quality indicators are
        encouraging — when Waterloo competes, it competes well. The strategic question is how to
        translate that per-application excellence into the kind of volume and breadth that would move
        Waterloo into the upper tier of U15 SSH research performance.
      </p>

      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
        Note: This analysis was generated from SSHRC's publicly available competition statistics.
        All rankings are among the 15 U15 member universities with available data. Success rates,
        application counts, and funding figures are drawn directly from SSHRC competition result
        spreadsheets and may reflect the data quality caveats described on the About page. Some
        older competition years have incomplete data.
      </p>
    </div>
  );
}
