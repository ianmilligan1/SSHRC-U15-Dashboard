# SSHRC U15 Performance Dashboard

A static dashboard visualizing the University of Waterloo's SSHRC competition performance relative to U15 peers, built for strategic planning purposes.

**Live site:** [ianmilligan1.github.io/SSHRC-U15-Dashboard](https://ianmilligan1.github.io/SSHRC-U15-Dashboard/)

## Data Coverage

Seven competition categories spanning up to 30 years (1995-2024):
- **Faculty Research:** Insight Grants, Insight Development Grants, Standard Research Grants (predecessor to IG)
- **Training:** CGS Masters, CGS Doctoral, SSHRC Doctoral, Postdoctoral Fellowships

All data comes from SSHRC's publicly available [competition statistics](https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx), published as Excel spreadsheets.

## Dashboard Sections

- **Executive KPIs** - Total awards, success rates, U15 rank, funding
- **Insight Grants** - Success rate trends (1995-present), funding comparison, U15 ranking table
- **Insight Development Grants** - Success rate trends and ranking
- **Research Training** - Awards by competition type, ranking tables
- **U15 Comparison** - Success rate heatmap, applications vs awards scatter plot
- **Historical Trends** - UW rank over time across all competition types

## Tech Stack

- **React + Vite** - Static SPA with hash routing for GitHub Pages
- **Recharts** - All charts and visualizations
- **Node.js + xlsx** - Data pipeline to download and parse SSHRC Excel files
- Deployed via GitHub Actions to GitHub Pages

## Development

```bash
npm install
npm run dev          # Start dev server on port 5173
npm run build        # Production build to dist/
npm run fetch-data   # Re-download and parse SSHRC Excel files
```

## About

Built by Ian Milligan, Professor of History & AVP Research Oversight and Integrity, University of Waterloo. Built with Claude Code (Anthropic). See the [About page](https://ianmilligan1.github.io/SSHRC-U15-Dasboard/#/about) for full methodology and development process documentation.
