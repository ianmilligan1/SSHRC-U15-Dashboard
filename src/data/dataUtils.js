import sshrcData from './sshrc-data.json';

export const data = sshrcData;
export const competitions = sshrcData.competitions;

export const UW = 'University of Waterloo';

export const U15_LIST = [
  'University of Alberta',
  'University of British Columbia',
  'University of Calgary',
  'Dalhousie University',
  'Université Laval',
  'University of Manitoba',
  'McGill University',
  'McMaster University',
  'Université de Montréal',
  'University of Ottawa',
  "Queen's University",
  'University of Saskatchewan',
  'University of Toronto',
  'University of Waterloo',
  'Western University',
];

export const SHORT_NAMES = {
  'University of Alberta': 'Alberta',
  'University of British Columbia': 'UBC',
  'University of Calgary': 'Calgary',
  'Dalhousie University': 'Dalhousie',
  'Université Laval': 'Laval',
  'University of Manitoba': 'Manitoba',
  'McGill University': 'McGill',
  'McMaster University': 'McMaster',
  'Université de Montréal': 'UdeM',
  'University of Ottawa': 'Ottawa',
  "Queen's University": "Queen's",
  'University of Saskatchewan': 'Sask',
  'University of Toronto': 'UofT',
  'University of Waterloo': 'Waterloo',
  'Western University': 'Western',
};

export const COMP_LABELS = {
  insight_grants: 'Insight Grants',
  insight_development_grants: 'Insight Development Grants',
  standard_research_grants: 'Standard Research Grants',
  connection_grants: 'Connection Grants',
  partnership_development_grants: 'Partnership Development Grants',
  partnership_grants: 'Partnership Grants',
  partnership_engage_grants: 'Partnership Engage Grants',
  cgs_masters: 'CGS Masters',
  cgs_doctoral: 'CGS Doctoral',
  sshrc_doctoral: 'SSHRC Doctoral',
  postdoctoral: 'Postdoctoral',
};

export const INSIGHT_COMPS = ['insight_grants', 'insight_development_grants', 'standard_research_grants'];
export const PARTNERSHIP_COMPS = ['connection_grants', 'partnership_development_grants', 'partnership_grants', 'partnership_engage_grants'];
export const TRAINING_COMPS = ['cgs_masters', 'cgs_doctoral', 'sshrc_doctoral', 'postdoctoral'];
export const FACULTY_COMPS = INSIGHT_COMPS;

export function getYears(compKey) {
  const comp = competitions[compKey];
  if (!comp) return [];
  return Object.keys(comp.years).map(Number).sort((a, b) => a - b);
}

export function getLatestYear(compKey) {
  const years = getYears(compKey);
  return years.length > 0 ? years[years.length - 1] : null;
}

export function getUniData(compKey, year, uni) {
  return competitions[compKey]?.years?.[year]?.[uni] || null;
}

export function getAllUniData(compKey, year) {
  return competitions[compKey]?.years?.[year] || {};
}

export function getU15Ranked(compKey, year, metric = 'success_rate') {
  const yearData = getAllUniData(compKey, year);
  return U15_LIST
    .map(uni => ({ uni, ...yearData[uni] }))
    .filter(d => d.applications !== undefined || d.awards !== undefined)
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

export function getUWRankOverTime(compKey, metric = 'awards') {
  const years = getYears(compKey);
  return years.map(year => {
    const ranked = getU15Ranked(compKey, year, metric);
    const uwEntry = ranked.find(d => d.uni === UW);
    return {
      year,
      rank: uwEntry ? uwEntry.rank : null,
      total: ranked.length,
    };
  }).filter(d => d.rank !== null);
}

export function getTimeSeriesForMetric(compKey, metric = 'success_rate') {
  const years = getYears(compKey);
  return years.map(year => {
    const yearData = getAllUniData(compKey, year);
    const point = { year };
    for (const uni of U15_LIST) {
      if (yearData[uni]) {
        point[uni] = yearData[uni][metric];
      }
    }
    return point;
  });
}

export function getCombinedFacultyTimeSeries() {
  // Combine Standard Research Grants (1995-2011) with Insight Grants (2012+)
  const srgYears = getYears('standard_research_grants');
  const igYears = getYears('insight_grants');

  const allPoints = [];

  for (const year of srgYears) {
    const yearData = getAllUniData('standard_research_grants', year);
    const point = { year };
    for (const uni of U15_LIST) {
      if (yearData[uni] && yearData[uni].success_rate != null) {
        point[uni] = yearData[uni].success_rate;
      }
    }
    allPoints.push(point);
  }

  for (const year of igYears) {
    const yearData = getAllUniData('insight_grants', year);
    const point = { year };
    for (const uni of U15_LIST) {
      if (yearData[uni] && yearData[uni].success_rate != null) {
        point[uni] = yearData[uni].success_rate;
      }
    }
    allPoints.push(point);
  }

  return allPoints.sort((a, b) => a.year - b.year);
}

export function getUWTotalAwards(year) {
  let total = 0;
  for (const compKey of Object.keys(competitions)) {
    const d = getUniData(compKey, year, UW);
    if (d && d.awards) total += d.awards;
  }
  return total;
}

export function getU15AverageForMetric(compKey, year, metric) {
  const yearData = getAllUniData(compKey, year);
  const values = U15_LIST
    .map(uni => yearData[uni]?.[metric])
    .filter(v => v != null && v > 0);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function formatNumber(n) {
  if (n == null) return '-';
  return n.toLocaleString();
}

export function formatPercent(n) {
  if (n == null) return '-';
  return n.toFixed(1) + '%';
}

export function formatDollars(n) {
  if (n == null) return '-';
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n.toLocaleString();
}
