# Claude Code Prompt: SSHRC U15 Performance Dashboard for University of Waterloo

## Project Overview

Build a static website (for GitHub Pages deployment) that visualizes the University of Waterloo's performance in SSHRC (Social Sciences and Humanities Research Council) competitions relative to the other U15 Canadian research universities. This dashboard will support strategic planning for greater SSHRC engagement at UW.

## Data Source

All data comes from SSHRC's publicly available competition statistics Excel spreadsheets at: https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx

Download ALL available Excel files (.xlsx and .xls) for the following competition categories, going back as far as data is available:

### Faculty Research Grants

1. **Insight Grants** (2012–2024): `/documents/xlsx/competition-results/statistics/{year}/ig_{year}.xlsx`
2. **Insight Development Grants** (2011–2024): `/documents/xlsx/competition-results/statistics/{year}/idg_{year}.xlsx`
3. **Standard Research Grants** (predecessor to Insight Grants, 1995–2011): `/documents/xlsx/competition-results/statistics/{year}/research_{year}.xls` (note: filenames use academic year format in the URLs but single year in filenames)

### Research Training & Talent Development

1. **Canada Graduate Scholarships – Master's (CGS-M)** (2003–2024): `/documents/xlsx/competition-results/statistics/{year}/masters_{year}.xlsx` (older years use .xls)
2. **Canada Graduate Scholarships – Doctoral (CGS-D)** (2004–2024): `/documents/xlsx/competition-results/statistics/{year}/cgs_docs_{year}.xlsx` (older years use .xls; filenames vary — some include academic year range like `cgs_docs_2022-2023.xlsx`)
3. **SSHRC Doctoral Awards** (1995–2024): `/documents/xlsx/competition-results/statistics/{year}/docs_{year}.xlsx` (older years use .xls; some include academic year range)
4. **Postdoctoral Fellowships** (1995–2024): `/documents/xlsx/competition-results/statistics/{year}/postdocs_{year}.xlsx` (older years use .xls)

**IMPORTANT:** The exact filenames vary by year. Scrape the actual page at https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx to extract the real URLs for every spreadsheet, rather than guessing filenames. Parse the HTML to find all links ending in .xlsx or .xls under each competition heading.

Base URL for all files: `https://sshrc-crsh.canada.ca`

## Data Extraction Requirements

Each Excel spreadsheet contains competition data broken down by institution. Extract the following for each U15 university, for each year and competition:

- Number of applications submitted
- Number of awards/grants received
- Success rate (awards / applications, as percentage)
- Total funding amount awarded (in dollars, where available)

The spreadsheets have varying formats across years. You'll need to:

1. Download each file
2. Inspect the structure (sheet names, column headers, row layout)
3. Find the rows corresponding to each U15 university
4. Extract the relevant metrics

## U15 Universities — Name Matching

University names appear differently across years and spreadsheets. Match ALL of these variants:

| University | Possible Names in Data |
|---|---|
| University of Alberta | Alberta, U of Alberta, University of Alberta |
| University of British Columbia | UBC, British Columbia, University of British Columbia |
| University of Calgary | Calgary, U of Calgary, University of Calgary |
| Dalhousie University | Dalhousie, Dalhousie University |
| Université Laval | Laval, Université Laval, Universite Laval |
| University of Manitoba | Manitoba, U of Manitoba, University of Manitoba |
| McGill University | McGill, McGill University |
| McMaster University | McMaster, McMaster University |
| Université de Montréal | Montreal, Montréal, Université de Montréal, Universite de Montreal, University of Montreal |
| University of Ottawa | Ottawa, U of Ottawa, University of Ottawa, uOttawa |
| Queen's University | Queen's, Queens, Queen's University, Queen's University at Kingston |
| University of Saskatchewan | Saskatchewan, U of Saskatchewan, University of Saskatchewan |
| University of Toronto | Toronto, U of T, University of Toronto |
| University of Waterloo | Waterloo, UW, University of Waterloo |
| Western University | Western, Western University, University of Western Ontario, UWO |

Use case-insensitive, partial matching. Be generous with matching — inspect the actual data to confirm how names appear.

## Output: Static Dashboard Website

Build a single-page React application (using Vite) that can be deployed to GitHub Pages. The site should be entirely static — all data should be embedded in the JavaScript bundle as JSON (no server-side calls needed after build).

### Design Requirements

**Color Palette — Black/White/Grey for UW institutional use:**

- Background: `#FFFFFF` (white)
- Primary text: `#111111` (near-black)
- Secondary text: `#666666` (dark grey)
- UW highlight color: `#000000` (black) — used for UW's line/bar in all charts
- Other U15 universities: varying shades of grey (`#999999`, `#BBBBBB`, `#DDDDDD`) or a single muted tone
- Accent for emphasis: `#333333`
- Borders/dividers: `#E5E5E5`
- Chart grid lines: `#F0F0F0`
- Hover/selected state: slight background tint `#F5F5F5`

**Typography:**

- Use a clean, professional sans-serif. Import from Google Fonts: "DM Sans" for body text and "Instrument Serif" for the dashboard title/section headers (gives an academic, editorial feel).
- The overall feel should be: clean, authoritative, data-forward — like a well-designed institutional report.

**Layout:**

- Responsive, works on desktop and tablet
- Clear section headers
- Dashboard title: "SSHRC Performance: University of Waterloo in the U15"
- Subtitle: "Competition statistics for strategic planning"
- Include a note at the bottom: "Data source: SSHRC Competition Statistics (sshrc-crsh.canada.ca). Dashboard built for internal planning purposes."

### Dashboard Sections & Visualizations

Use Recharts for all charts.

#### 1. Executive Summary (Top of Page)

- Large KPI cards showing UW's latest-year performance:
  - Total SSHRC awards won (across all competitions)
  - Overall success rate
  - UW's rank among U15 (by total awards)
  - Trend arrow (up/down vs. 5 years ago)

#### 2. Insight Grants (Faculty Research) — Main Section

This is the most important section. Include:

- **Line chart:** Success rate over time (2012–2024 for Insight Grants; extend back to 1995 using Standard Research Grant data as predecessor). UW as a bold black line, all other U15 as thin grey lines. On hover, show university name and value.
- **Bar chart:** Total funding awarded per year, UW vs U15 average.
- **Ranking table:** For the most recent year, show all 15 universities ranked by success rate, with applications, awards, success rate, and total funding columns. UW row highlighted.
- **Trend sparklines:** Small inline sparklines showing UW's rank position over time (are we improving or declining?).

#### 3. Insight Development Grants

- Similar line chart (success rate over time, 2011–2024)
- Ranking table for most recent year

#### 4. Research Training & Talent Development

Combined section for CGS-M, CGS-D, SSHRC Doctoral, and Postdoctoral:

- **Grouped bar chart or stacked area chart:** Total awards won by UW per year, broken down by competition type
- **Line chart:** UW's combined training award success rate vs U15 average over time
- **Table:** Most recent year breakdown by competition, showing UW rank within U15

#### 5. Overall U15 Comparison

- **Heatmap or matrix:** Rows = U15 universities, Columns = competition types. Cell values = success rate (latest year). Color intensity from light grey (low) to black (high). Gives an at-a-glance view of where each university is strong/weak.
- **Scatter plot:** X = total applications, Y = total awards, bubble size = total funding. Each U15 university is a dot. UW emphasized.

#### 6. Historical Trends

- **Line chart:** UW's rank among U15 over time, per competition category. Y-axis inverted (1 at top = best). Show how UW's position has changed over the decades.

### Interactive Features

- Dropdown filter at the top to select competition type (All, Insight Grants, IDG, CGS-M, CGS-D, Doctoral, Postdoc)
- Year range slider to narrow the time period
- Hover tooltips on all charts showing exact values
- Click on any university in a chart to highlight it alongside UW for direct comparison
- Toggle to switch between absolute numbers and rates/percentages

## Data Processing Pipeline

Write a Node.js script (`scripts/process-data.js`) that:

1. Downloads all Excel files from SSHRC (use axios for HTTP, xlsx or exceljs for parsing)
2. Parses each file, identifies the data structure, and extracts U15 data
3. Normalizes university names to canonical forms
4. Outputs a single `src/data/sshrc-data.json` file with the structure:

```json
{
  "competitions": {
    "insight_grants": {
      "label": "Insight Grants",
      "category": "faculty_research",
      "years": {
        "2024": {
          "University of Waterloo": {
            "applications": 25,
            "awards": 12,
            "success_rate": 48.0,
            "total_funding": 1500000
          },
          "University of Toronto": { ... },
          ...
        },
        "2023": { ... }
      }
    },
    "insight_development_grants": { ... },
    "standard_research_grants": { ... },
    "cgs_masters": { ... },
    "cgs_doctoral": { ... },
    "sshrc_doctoral": { ... },
    "postdoctoral": { ... }
  },
  "metadata": {
    "last_updated": "2025-03-08",
    "source": "SSHRC Competition Statistics",
    "source_url": "https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx"
  }
}
```

## About Page — Transparency & AI Process Documentation

The site should have two pages using React Router (with hash routing for GitHub Pages compatibility): the main Dashboard and an About page. Add a minimal top navigation bar with links between the two.

### About Page Content

The About page serves a dual purpose: it provides transparency about this specific dashboard, AND it functions as a case study in AI-augmented institutional work. Structure the page as follows:

#### 1. "About This Dashboard" section

- Brief explanation: This dashboard visualizes the University of Waterloo's SSHRC competition performance relative to U15 peers, built to support strategic planning for greater SSHRC engagement.
- Data source attribution: All data from SSHRC's publicly available competition statistics.
- Note any caveats: data format inconsistencies across years, possible gaps, Standard Research Grants as Insight Grant predecessor, etc.

#### 2. "How This Was Built" section

- State clearly: "This dashboard was built using Claude Code (Anthropic) with human direction and oversight."
- Include the full prompt used to generate this project. Embed the entire contents of this prompt document in a collapsible/expandable `<details>` element (or a toggle component) titled "View the full prompt used to build this dashboard." Render the prompt as formatted markdown. Store the prompt text in a separate file (`src/data/build-prompt.md`) and import it.
- Note the timeframe: "Initial build completed on [DATE — fill in actual date]. Total active development time: [X hours/sessions — update as you go]."

#### 3. "Development Log" section

- Create a file `src/data/dev-log.json` with timestamped entries documenting the build process. Each entry should have:
  - `timestamp` (ISO format)
  - `phase` (e.g., "data-pipeline", "dashboard-build", "debugging", "refinement")
  - `description` (what was done)
  - `challenges` (any issues encountered, optional)
  - `human_input` (what the human directed or decided, optional)
  - `ai_contribution` (what Claude Code generated or solved, optional)
- As you build this project, log your own development process into `dev-log.json` as you go. This is important — the log should be honest and detailed, showing the actual iterative process including any false starts, data parsing challenges, format surprises in the Excel files, etc. This is not a polished narrative; it's a real development diary.
- Display the log on the About page as a vertical timeline, styled cleanly. Each entry shows the timestamp, phase badge, and description. Expandable to show challenges/human-input/ai-contribution details.

#### 4. "Why This Matters" section

Include this text (adapt the wording naturally, don't just paste it verbatim):

> This project is also a proof-of-concept for how AI tools like Claude Code can be used responsibly in institutional contexts. It demonstrates two things:
>
> **For research administration:** AI can dramatically accelerate the kind of data gathering, parsing, and visualization work that would otherwise take weeks of analyst time. The SSHRC data exists as dozens of inconsistently-formatted Excel spreadsheets spanning decades — exactly the kind of tedious but important work that benefits from AI assistance. The human role is strategic: deciding what questions to ask, what comparisons matter, and how to interpret the results.
>
> **For education:** Students need to learn how to work WITH AI tools effectively — not just prompt them, but direct complex multi-step projects, validate outputs, and understand both the capabilities and limitations. This dashboard, built from a detailed prompt with human oversight throughout, is an example of what that collaboration looks like in practice. The full prompt and development log are published here as a model of transparency.

Built by Ian Milligan, Professor of History & AVP Research Oversight and Integrity, University of Waterloo.

#### 5. Page Footer

- "Built with Claude Code (Anthropic). Source data: SSHRC Competition Statistics."
- Link to the GitHub repository
- Date of last data update

### About Page Design

- Same black/white palette as the dashboard
- Long-form readable layout — narrower max-width (~720px) for the prose sections, generous line-height
- The development log timeline should be visually distinct — use a left-border timeline style with phase badges
- The collapsible prompt section should have a monospace/code-like treatment for the prompt text
- Overall feel: like a well-typeset methodology appendix in an academic publication

## Project Structure

```
sshrc-u15-dashboard/
├── scripts/
│   └── process-data.js          # Data download & processing
├── src/
│   ├── data/
│   │   ├── sshrc-data.json      # Generated data file
│   │   ├── build-prompt.md      # The full prompt (this document)
│   │   └── dev-log.json         # Development timeline entries
│   ├── components/
│   │   ├── Dashboard.jsx         # Main dashboard layout
│   │   ├── AboutPage.jsx         # About / transparency page
│   │   ├── DevelopmentLog.jsx    # Timeline component for dev log
│   │   ├── KPICards.jsx          # Executive summary cards
│   │   ├── InsightGrantsSection.jsx
│   │   ├── IDGSection.jsx
│   │   ├── TrainingSection.jsx
│   │   ├── U15ComparisonSection.jsx
│   │   ├── HistoricalTrendsSection.jsx
│   │   ├── RankingTable.jsx      # Reusable ranking table
│   │   ├── LineChartPanel.jsx    # Reusable line chart wrapper
│   │   └── FilterControls.jsx   # Dropdowns, sliders, toggles
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js               # Configure for GitHub Pages base path
├── package.json
└── README.md
```

## GitHub Pages Deployment

- Configure `vite.config.js` with the correct base path for GitHub Pages (e.g., `/sshrc-u15-dashboard/`)
- Add deployment scripts to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "gh-pages -d dist",
  "fetch-data": "node scripts/process-data.js"
}
```

- Include `gh-pages` as a dev dependency
- Add a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment on push to main

## Technical Notes

- Use `xlsx` (SheetJS) npm package for parsing both .xlsx and .xls files
- Some older .xls files may be in older Excel format — handle gracefully
- If a spreadsheet can't be parsed, log a warning and skip it rather than crashing
- Add data validation: if a university's numbers look anomalous (e.g., success rate > 100%), flag it
- The data processing script should be idempotent — safe to re-run

## Error Handling for Data

- Not all competitions exist for all years — handle missing data gracefully
- Some universities may not appear in some years (no applications submitted) — treat as zero
- The format of spreadsheets changes across years — the script needs to be adaptive
- If total funding data isn't available in older years, just track applications/awards/success rate

## Summary

The end product is a professional, GitHub Pages-hosted dashboard that tells a clear story: where does UW stand in SSHRC competitions relative to U15 peers, and how has that changed over time? This will directly inform strategic planning conversations about how to improve SSHRC engagement, where UW's strengths and weaknesses lie, and what peer institutions are doing differently.

The About page makes this project do double duty: it's both a useful institutional tool AND a transparent case study in AI-augmented work. By publishing the full prompt, development log, and methodology, it models the kind of responsible AI use that matters for both research administration and student education.

**Build the data pipeline first (download + parse + JSON), then build the React dashboard, then build the About page last (so the development log captures the real process).**
