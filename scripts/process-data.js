import axios from 'axios';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.sshrc-crsh.gc.ca';
const STATS_PAGE = `${BASE_URL}/en/competition-results/statistics.aspx`;
const DATA_DIR = path.join(__dirname, '..', 'data-cache');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'sshrc-data.json');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// U15 universities: high-confidence variants (full names) and low-confidence variants (short names)
const U15_HIGH_CONF = {
  'University of Alberta': ['university of alberta', 'u of alberta', 'u. of alberta'],
  'University of British Columbia': ['university of british columbia', 'the university of british columbia', 'u. of british columbia'],
  'University of Calgary': ['university of calgary', 'u of calgary'],
  'Dalhousie University': ['dalhousie university'],
  'Université Laval': ['université laval', 'universite laval', 'u. laval'],
  'University of Manitoba': ['university of manitoba', 'u of manitoba'],
  'McGill University': ['mcgill university'],
  'McMaster University': ['mcmaster university'],
  'Université de Montréal': ['université de montréal', 'universite de montreal', 'university of montreal', 'u. de montréal', 'u. de montreal'],
  'University of Ottawa': ['university of ottawa', 'u of ottawa', 'u. of ottawa', 'uottawa'],
  "Queen's University": ["queen's university", "queens university", "queen's university at kingston", "queen's u."],
  'University of Saskatchewan': ['university of saskatchewan', 'u of saskatchewan'],
  'University of Toronto': ['university of toronto', 'u of t', 'u. of toronto'],
  'University of Waterloo': ['university of waterloo', 'u. of waterloo'],
  'Western University': ['western university', 'university of western ontario', 'western university (the university of western ontario)', 'western ontario'],
};

// Short names used in older files (ALL CAPS like "WATERLOO", "TORONTO")
// These match with lower confidence and can be overridden by high-confidence matches
const U15_LOW_CONF = {
  'University of Alberta': ['alberta'],
  'University of British Columbia': ['british columbia'],
  'University of Calgary': ['calgary'],
  'Dalhousie University': ['dalhousie'],
  'Université Laval': ['laval'],
  'University of Manitoba': ['manitoba'],
  'McGill University': ['mcgill'],
  'McMaster University': ['mcmaster'],
  'Université de Montréal': ['montréal', 'montreal'],
  'University of Ottawa': ['ottawa'],
  "Queen's University": ["queen's", "queens"],
  'University of Saskatchewan': ['saskatchewan'],
  'University of Toronto': ['toronto'],
  'University of Waterloo': ['waterloo'],
  'Western University': ['western ontario'],
};

// Province/region names to ALWAYS skip
const PROVINCE_NAMES = new Set([
  'british columbia / colombie-britannique', 'colombie-britannique',
  'new brunswick', 'new brunswick / nouveau brunswick', 'nouveau brunswick',
  'newfoundland', 'newfoundland and labrador', 'newfoundland and labrador / terre-neuve-et-labrador',
  'nova scotia', 'nova scotia / nouvelle-écosse', 'nouvelle-écosse',
  'ontario',
  'prince edward island', 'prince edward island / île-du-prince-édouard',
  'quebec', 'québec', 'quebec / québec',
  'atlantic', 'atlantic / atlantique', 'atlantique',
  'prairies', 'prairies / prairies',
  'western', 'west', 'territories', 'north',
  'sub-total', 'sub-total / total partiel', 'total', 'total / total',
  'total atlantic / total atlantique', 'total prairies',
  'total ontario', 'total québec', 'total quebec',
  'unknown', 'unknown / inconnue', 'other/unknown', 'other', 'n/a',
  'canada', 'all institutions', 'all',
]);

// Returns { canonical, confidence: 'high' | 'low' } or null
function matchU15(rawName) {
  if (!rawName || typeof rawName !== 'string') return null;
  const cleaned = rawName.trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[\u2019\u2018\u0060\u00B4]/g, "'")
    .replace(/\*+$/, '')
    .trim();

  if (!cleaned || cleaned.length < 3) return null;

  // Skip province/region headers
  if (PROVINCE_NAMES.has(cleaned)) return null;

  // High-confidence: exact or contains match against full name variants
  for (const [canonical, variants] of Object.entries(U15_HIGH_CONF)) {
    for (const variant of variants) {
      if (cleaned === variant || cleaned.includes(variant)) {
        return { canonical, confidence: 'high' };
      }
    }
  }

  // Low-confidence: short name match (used in older files)
  for (const [canonical, variants] of Object.entries(U15_LOW_CONF)) {
    for (const variant of variants) {
      if (cleaned === variant) {
        return { canonical, confidence: 'low' };
      }
    }
  }

  return null;
}

function classifyFile(urlPath) {
  const filename = path.basename(urlPath).toLowerCase().replace(/ /g, '_');
  const dirMatch = urlPath.match(/statistics\/(\d{4})\//);
  const year = dirMatch ? parseInt(dirMatch[1]) : null;

  if (filename.startsWith('ig_')) return { type: 'insight_grants', year };
  if (filename.startsWith('idg_')) return { type: 'insight_development_grants', year };
  if (filename.startsWith('research_')) return { type: 'standard_research_grants', year };
  if (filename.startsWith('masters_')) return { type: 'cgs_masters', year };
  if (filename.startsWith('cgs_docs_')) return { type: 'cgs_doctoral', year };
  if (filename.startsWith('docs_')) return { type: 'sshrc_doctoral', year };
  if (filename.startsWith('postdocs_')) return { type: 'postdoctoral', year };

  return null;
}

function extractExcelUrls(html) {
  const urls = [];
  const regex = /href="([^"]*\.xlsx?)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1]);
  }
  return [...new Set(urls)];
}

async function downloadFile(urlPath) {
  const fullUrl = BASE_URL + urlPath;
  const filename = path.basename(urlPath).replace(/ /g, '_');
  const dirMatch = urlPath.match(/statistics\/(\d{4})\//);
  const year = dirMatch ? dirMatch[1] : 'unknown';
  const localDir = path.join(DATA_DIR, year);
  const localPath = path.join(localDir, filename);

  if (fs.existsSync(localPath)) return localPath;

  fs.mkdirSync(localDir, { recursive: true });

  try {
    const resp = await axios.get(fullUrl, {
      responseType: 'arraybuffer',
      httpsAgent,
      timeout: 30000,
    });
    fs.writeFileSync(localPath, resp.data);
    console.log(`  Downloaded: ${filename}`);
    return localPath;
  } catch (err) {
    console.warn(`  WARN: Failed to download ${fullUrl}: ${err.message}`);
    return null;
  }
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '' || val === '-' || val === 'N/A' || val === 'n/a') return null;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[$,%\s*]/g, '').replace(/,/g, '').trim();
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function findOrgSheet(workbook) {
  // The organization/institution sheet is usually "- 1 -" in newer files
  // or the first data sheet in older files
  const sheetNames = workbook.SheetNames;

  // Try "- 1 -" first (newer format)
  if (sheetNames.includes('- 1 -')) return '- 1 -';

  // Try sheets with institution-related names
  for (const name of sheetNames) {
    const lower = name.toLowerCase();
    if (lower.includes('inst') || lower.includes('org') || lower.includes('univ')) {
      return name;
    }
  }

  // Skip contents sheet, use first data sheet
  for (const name of sheetNames) {
    const lower = name.toLowerCase();
    if (!lower.includes('content') && !lower.includes('mati')) {
      return name;
    }
  }

  return sheetNames[0];
}

function parseExcelFile(filePath, competitionType, year) {
  try {
    const workbook = XLSX.readFile(filePath, { type: 'buffer' });
    const sheetName = findOrgSheet(workbook);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!data || data.length < 3) return {};

    // Determine column structure by finding the header area
    const colInfo = detectColumns(data, competitionType);
    if (!colInfo) {
      console.warn(`    Could not detect column structure in sheet "${sheetName}"`);
      return {};
    }

    // Extract U15 data
    return extractU15Data(data, colInfo, competitionType);
  } catch (err) {
    console.warn(`  WARN: Failed to parse ${filePath}: ${err.message}`);
    return {};
  }
}

function detectColumns(data, competitionType) {
  // Strategy: find a cluster of header rows containing institution/organization label
  // AND applications/awards labels. They may be on the same row or adjacent rows.
  // Then use the indicator row (with #, $, %) to map columns.

  for (let i = 0; i < Math.min(data.length, 20); i++) {
    // Check a window of 3 rows for header components
    let instCol = -1;
    let hasAppsOrAwards = false;
    let headerRowIdx = i;

    for (let w = 0; w < 3 && (i + w) < data.length; w++) {
      const row = data[i + w];
      if (!row) continue;
      const rowStrs = row.map(c => String(c).toLowerCase().trim().replace(/\r?\n/g, ' '));

      for (let j = 0; j < rowStrs.length; j++) {
        const cell = rowStrs[j];
        if (instCol < 0 && (cell.includes('institution') || cell.includes('établissement') ||
            cell.includes('organization') || cell.includes('organis') ||
            cell.includes('administering') || cell.includes('administrateur'))) {
          instCol = j;
          headerRowIdx = i + w;
        }
        // Only check for app/award keywords in data columns (j > 0),
        // not in column 0 which often contains title text with false matches
        if (j > 0 && (cell.includes('applic') || cell.includes('demande') ||
            cell.includes('awards') || cell.includes('subventions'))) {
          hasAppsOrAwards = true;
        }
      }
    }

    // Need BOTH an institution column and application/award labels in the window
    if (instCol < 0 || !hasAppsOrAwards) continue;

    // Found the header area. Scan the header rows to find:
    // 1. Where "Applications" and "Awards" group headers start (column ranges)
    // 2. The indicator row with #, $, % markers
    // 3. The success rate column
    // IMPORTANT: Only scan from headerRowIdx onward, and skip column 0 (institution column)
    // to avoid false matches from title rows containing keywords like "Subventions"

    let appsStartCol = -1, awardsStartCol = -1, successRateStartCol = -1;
    let indicatorRowIdx = -1;
    let isAwardsOnly = false;

    // Scan from the header row (where institution label was found) + nearby rows
    for (let k = Math.max(0, headerRowIdx - 1); k <= headerRowIdx + 4 && k < data.length; k++) {
      const subRow = data[k];
      if (!subRow) continue;
      const subStrs = subRow.map(c => String(c).toLowerCase().trim().replace(/\r?\n/g, ' '));

      // Only check columns > instCol for group headers (avoid title text in col 0)
      for (let j = instCol + 1; j < subStrs.length; j++) {
        const cell = subStrs[j];
        if ((cell.includes('applic') || cell.includes('demande')) && appsStartCol < 0) {
          appsStartCol = j;
        }
        if ((cell.includes('awards') || cell.includes('subventions') || cell.includes('bourses')) && awardsStartCol < 0) {
          awardsStartCol = j;
        }
        if ((cell.includes('success rate') || cell.includes('taux de réussite') || cell.includes('taux de reussite')) && successRateStartCol < 0) {
          successRateStartCol = j;
        }
      }

      // Check if this is the indicator row
      const trimmed = subRow.map(c => String(c).trim());
      if (trimmed.some(c => c === '#') && indicatorRowIdx < 0) {
        indicatorRowIdx = k;
      }
    }

    // Determine if this is awards-only (no applications column)
    if (awardsStartCol >= 0 && appsStartCol < 0) {
      isAwardsOnly = true;
    }

    if (indicatorRowIdx < 0 && !isAwardsOnly) {
      // No indicator row; might be awards-only with just # and % total
      if (awardsStartCol >= 0) {
        isAwardsOnly = true;
      } else {
        continue;
      }
    }

    const dataStartRow = indicatorRowIdx >= 0 ? indicatorRowIdx + 1 : headerRowIdx + 2;

    if (isAwardsOnly) {
      // Awards-only format (CGS-M, CGS-D, sometimes others)
      let awardsNumCol = instCol + 1;
      if (indicatorRowIdx >= 0) {
        const indicators = data[indicatorRowIdx].map(c => String(c).trim());
        for (let j = instCol + 1; j < indicators.length; j++) {
          if (indicators[j] === '#') { awardsNumCol = j; break; }
        }
      }
      return {
        dataStartRow,
        instCol,
        appsNumCol: -1,
        appsTotalCol: -1,
        awardsNumCol,
        awardsTotalCol: -1,
        successRateCol: -1,
      };
    }

    // Full format with applications and awards
    const indicators = data[indicatorRowIdx].map(c => String(c).trim());

    let appsNumCol = -1, awardsNumCol = -1, appsTotalCol = -1, awardsTotalCol = -1, successRateCol = -1;

    // Use group header positions to correctly assign # columns
    // Find # columns in the applications range and awards range
    const appsHashCols = [];
    const appsDollarCols = [];
    const awardsHashCols = [];
    const awardsDollarCols = [];

    // Determine the boundary between apps and awards
    const appsEnd = awardsStartCol > 0 ? awardsStartCol : indicators.length;
    const awardsEnd = successRateStartCol > 0 ? successRateStartCol : indicators.length;

    for (let j = instCol + 1; j < indicators.length; j++) {
      const ind = indicators[j];
      if (j < appsEnd) {
        if (ind === '#') appsHashCols.push(j);
        if (ind === '$' || ind.includes('$')) appsDollarCols.push(j);
      } else if (j < awardsEnd) {
        if (ind === '#') awardsHashCols.push(j);
        if (ind === '$' || ind.includes('$')) awardsDollarCols.push(j);
      }
    }

    // Pick first # in each range
    if (appsHashCols.length > 0) appsNumCol = appsHashCols[0];
    if (awardsHashCols.length > 0) awardsNumCol = awardsHashCols[0];

    // Pick last $ in each range (total funding)
    if (appsDollarCols.length > 0) appsTotalCol = appsDollarCols[appsDollarCols.length - 1];
    if (awardsDollarCols.length > 0) awardsTotalCol = awardsDollarCols[awardsDollarCols.length - 1];

    // Success rate: first % after the awards section
    if (successRateStartCol > 0) {
      successRateCol = successRateStartCol;
      // Check if the actual % is in the indicator row at this position
      for (let j = successRateStartCol; j < indicators.length; j++) {
        if (indicators[j] === '%' || indicators[j].includes('%')) {
          successRateCol = j;
          break;
        }
      }
    } else {
      // Find first % after awards columns
      for (let j = awardsEnd; j < indicators.length; j++) {
        if (indicators[j] === '%' || indicators[j].includes('%')) {
          successRateCol = j;
          break;
        }
      }
    }

    // Fallback: if we couldn't find apps/awards by ranges, use simple ordering
    if (appsNumCol < 0 && awardsNumCol < 0) {
      const allHash = [];
      for (let j = instCol + 1; j < indicators.length; j++) {
        if (indicators[j] === '#') allHash.push(j);
      }
      if (allHash.length >= 4) {
        appsNumCol = allHash[0];
        awardsNumCol = allHash[2];
      } else if (allHash.length >= 2) {
        appsNumCol = allHash[0];
        awardsNumCol = allHash[1];
      }
    }

    return { dataStartRow, instCol, appsNumCol, appsTotalCol, awardsNumCol, awardsTotalCol, successRateCol };
  }

  // Fallback: scan for U15 university names in the data to infer structure
  for (let i = 0; i < Math.min(data.length, 50); i++) {
    const row = data[i];
    if (!row) continue;
    for (let j = 0; j < Math.min(row.length, 3); j++) {
      const name = String(row[j]).trim();
      if (matchU15(name)) {
        // Found a U15 name. The columns after it are likely data.
        // Look backward for any header clues
        let appsCol = -1, awardsCol = -1;
        // Check if there are numbers in subsequent columns
        for (let c = j + 1; c < row.length; c++) {
          const val = parseNumber(row[c]);
          if (val !== null && val > 0) {
            if (appsCol < 0) appsCol = c;
            else if (awardsCol < 0) { awardsCol = c; break; }
          }
        }
        return {
          dataStartRow: i,
          instCol: j,
          appsNumCol: appsCol >= 0 ? appsCol : j + 1,
          appsTotalCol: -1,
          awardsNumCol: awardsCol >= 0 ? awardsCol : -1,
          awardsTotalCol: -1,
          successRateCol: -1,
        };
      }
    }
  }

  return null;
}

function extractU15Data(data, colInfo, competitionType) {
  const results = {};
  const confidence = {}; // Track confidence of each match

  for (let i = colInfo.dataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const rawName = String(row[colInfo.instCol] || '').trim();
    if (!rawName) continue;

    const match = matchU15(rawName);
    if (!match) continue;
    const { canonical, confidence: conf } = match;

    // Skip if we already have a HIGH confidence match (don't overwrite with low)
    if (results[canonical] && confidence[canonical] === 'high') continue;
    // If we have a LOW confidence match and this is HIGH, overwrite
    // If both same confidence, keep first occurrence
    if (results[canonical] && conf !== 'high') continue;

    // Awards-only format (CGS-M, CGS-D, or any competition with appsNumCol = -1)
    if (colInfo.appsNumCol < 0) {
      const awards = parseNumber(row[colInfo.awardsNumCol]) || 0;
      results[canonical] = {
        applications: null,
        awards,
        success_rate: null,
        total_funding: null,
      };
      confidence[canonical] = conf;
      continue;
    }

    // Standard competition parsing
    const applications = parseNumber(row[colInfo.appsNumCol]) || 0;
    const awards = parseNumber(row[colInfo.awardsNumCol]) || 0;

    let successRate = null;
    if (colInfo.successRateCol >= 0) {
      const rawRate = parseNumber(row[colInfo.successRateCol]);
      if (rawRate !== null) {
        // Determine if it's already a percentage or a decimal
        if (rawRate > 0 && rawRate <= 1) {
          successRate = Math.round(rawRate * 10000) / 100; // Convert 0.xx to xx%
        } else if (rawRate > 1 && rawRate <= 100) {
          successRate = Math.round(rawRate * 100) / 100;
        }
      }
    }

    // Calculate success rate if not found or invalid
    if (successRate === null && applications > 0) {
      successRate = Math.round((awards / applications) * 10000) / 100;
    }

    let totalFunding = null;
    if (colInfo.awardsTotalCol >= 0) {
      totalFunding = parseNumber(row[colInfo.awardsTotalCol]);
      // Sanity check: funding should be a large number (at least 4 digits)
      if (totalFunding !== null && totalFunding < 1000 && totalFunding > 0) {
        // Might be misidentified column
        totalFunding = null;
      }
    }

    results[canonical] = {
      applications,
      awards,
      success_rate: successRate || 0,
      total_funding: totalFunding,
    };
    confidence[canonical] = conf;
  }

  return results;
}

async function main() {
  console.log('=== SSHRC Data Processing Pipeline ===\n');

  // Step 1: Fetch the statistics page and extract URLs
  const resp = await axios.get(STATS_PAGE, { httpsAgent, timeout: 30000 });
  const allUrls = extractExcelUrls(resp.data);
  console.log(`Found ${allUrls.length} Excel file URLs\n`);

  // Step 2: Classify and filter to our target competitions
  const targetFiles = [];
  for (const url of allUrls) {
    const classified = classifyFile(url);
    if (classified) {
      targetFiles.push({ url, ...classified });
    }
  }
  console.log(`${targetFiles.length} files match target competitions\n`);

  // Step 3: Download all files
  console.log('Downloading Excel files...');
  for (const file of targetFiles) {
    file.localPath = await downloadFile(file.url);
  }
  console.log('');

  // Step 4: Parse each file
  console.log('Parsing Excel files...');
  const competitions = {
    insight_grants: { label: 'Insight Grants', category: 'faculty_research', years: {} },
    insight_development_grants: { label: 'Insight Development Grants', category: 'faculty_research', years: {} },
    standard_research_grants: { label: 'Standard Research Grants', category: 'faculty_research', years: {} },
    cgs_masters: { label: 'CGS Masters', category: 'training', years: {} },
    cgs_doctoral: { label: 'CGS Doctoral', category: 'training', years: {} },
    sshrc_doctoral: { label: 'SSHRC Doctoral Awards', category: 'training', years: {} },
    postdoctoral: { label: 'Postdoctoral Fellowships', category: 'training', years: {} },
  };

  for (const file of targetFiles) {
    if (!file.localPath || !file.type) continue;

    console.log(`  Parsing ${path.basename(file.localPath)} (${file.type}, ${file.year})...`);
    const yearData = parseExcelFile(file.localPath, file.type, file.year);

    const uniCount = Object.keys(yearData).length;
    if (uniCount > 0) {
      competitions[file.type].years[file.year] = yearData;
      console.log(`    Found data for ${uniCount} U15 universities`);
    } else {
      console.warn(`    WARN: No U15 data found`);
    }
  }

  // Step 5: Validate and fix data
  console.log('\n=== Data Validation ===');
  let issues = 0;
  for (const [key, comp] of Object.entries(competitions)) {
    for (const [year, yearData] of Object.entries(comp.years)) {
      for (const [uni, uniData] of Object.entries(yearData)) {
        // Fix: awards > applications (impossible - columns likely swapped or
        // format only showed awards with researchers count misidentified as apps)
        if (uniData.applications != null && uniData.awards > uniData.applications && uniData.applications > 0) {
          // The "applications" is likely actually the awards count,
          // and "awards" is something else (e.g., researcher count)
          // Use success rate to back-calculate if available
          if (uniData.success_rate > 0 && uniData.success_rate <= 100) {
            const realAwards = uniData.applications; // the smaller number is likely awards
            const realApps = Math.round(realAwards / (uniData.success_rate / 100));
            uniData.applications = realApps;
            uniData.awards = realAwards;
            issues++;
          } else {
            // Swap: smaller value = awards, larger = something else (set apps to null)
            const awards = uniData.applications;
            uniData.applications = null;
            uniData.awards = awards;
            issues++;
          }
        }

        // Fix: success rate > 100 (recalculate)
        if (uniData.success_rate > 100) {
          if (uniData.applications > 0 && uniData.awards <= uniData.applications) {
            uniData.success_rate = Math.round((uniData.awards / uniData.applications) * 10000) / 100;
          } else {
            uniData.success_rate = null;
          }
          issues++;
        }
      }
    }
  }
  console.log(`  ${issues} issues found and corrected`);

  // Step 6: Output JSON
  const output = {
    competitions,
    metadata: {
      last_updated: new Date().toISOString().split('T')[0],
      source: 'SSHRC Competition Statistics',
      source_url: 'https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx',
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  // Print summary
  console.log('\n=== Summary ===');
  for (const [key, comp] of Object.entries(competitions)) {
    const years = Object.keys(comp.years).sort();
    if (years.length > 0) {
      // Check UW coverage
      const uwYears = years.filter(y => comp.years[y]['University of Waterloo']);
      console.log(`${comp.label}: ${years.length} years (${years[0]}–${years[years.length - 1]}), UW in ${uwYears.length} years`);

      // Show latest UW data
      const latestYear = years[years.length - 1];
      const uwData = comp.years[latestYear]['University of Waterloo'];
      if (uwData) {
        console.log(`  Latest UW (${latestYear}): apps=${uwData.applications}, awards=${uwData.awards}, rate=${uwData.success_rate}%${uwData.total_funding ? ', funding=$' + uwData.total_funding.toLocaleString() : ''}`);
      }
    } else {
      console.log(`${comp.label}: No data found`);
    }
  }
  console.log(`\nOutput written to: ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
