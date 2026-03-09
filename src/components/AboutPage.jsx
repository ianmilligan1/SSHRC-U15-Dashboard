import { useState, useEffect } from 'react';
import DevelopmentLog from './DevelopmentLog';
import { data } from '../data/dataUtils';

export default function AboutPage() {
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    fetch(new URL('../data/build-prompt.md', import.meta.url).href)
      .then(r => r.text())
      .then(setPromptText)
      .catch(() => setPromptText('(Prompt file could not be loaded)'));
  }, []);

  return (
    <div className="about-page">
      <h1>About This Dashboard</h1>
      <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Transparency, methodology, and process documentation
      </p>

      <h2>About This Dashboard</h2>
      <p>
        This dashboard visualizes the University of Waterloo's SSHRC competition performance
        relative to U15 peers, built to support strategic planning for greater SSHRC engagement.
        All data comes from SSHRC's publicly available competition statistics, published as
        Excel spreadsheets on their website.
      </p>
      <p>
        <strong>Data coverage:</strong> The dashboard includes data from eleven competition categories
        spanning up to 30 years (1995-2024), organized across four pages:
      </p>
      <ul style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
        <li><strong>Insight:</strong> Insight Grants, Insight Development Grants, and the predecessor Standard Research Grants</li>
        <li><strong>Partnerships:</strong> Connection Grants, Partnership Development Grants, Partnership Grants, and Partnership Engage Grants</li>
        <li><strong>Talent:</strong> CGS Masters, CGS Doctoral, SSHRC Doctoral Awards, and Postdoctoral Fellowships</li>
      </ul>
      <p>
        <strong>Caveats:</strong> Spreadsheet formats vary significantly across years, which
        means some data points may be missing or imprecise for older years. The Standard Research
        Grant program was the predecessor to Insight Grants and is shown as a continuous series
        on relevant charts. Some competitions (CGS-M, CGS-D) report only awards, not
        applications, so success rates are not available for these. University name matching
        across decades of data uses pattern matching which may occasionally misidentify institutions.
        Rows marked with a dagger (<strong>&dagger;</strong>) indicate small sample sizes (5 or fewer
        applications) where success rates may not be meaningful.
      </p>

      <h2>How This Was Built</h2>
      <p>
        <strong>This dashboard was built using Claude Code (Anthropic) with human direction and oversight.</strong>
      </p>
      <p>
        The build process involved three main phases: (1) a data pipeline that downloads and
        parses nearly 200 Excel spreadsheets from SSHRC's website, normalizing university names and
        extracting competition statistics into a single JSON file; (2) a React dashboard built
        with Vite and Recharts that visualizes the data with interactive charts, tables, and
        comparison tools; and (3) this About page documenting the process.
      </p>
      <p>
        The project went through multiple iterations. The initial build created a single-page
        dashboard with 7 competition types. A second session added 4 partnership competition
        types, restructured the dashboard into separate pages, improved trend line clarity with
        peer comparison controls, and fixed a critical data quality issue where an affiliated
        college was being misidentified as a major research university. The development log below
        documents each stage.
      </p>
      <p>
        Initial build completed on <strong>March 8, 2026</strong>. Iterative refinements ongoing.
      </p>

      <details className="prompt-viewer">
        <summary>View the full prompt used to build this dashboard</summary>
        <pre className="prompt-content">{promptText}</pre>
      </details>

      <h2>Development Log</h2>
      <p>
        The following timeline documents the actual build process, including challenges
        encountered and how they were resolved. This is not a polished narrative — it's
        a real development diary showing the iterative process.
      </p>
      <DevelopmentLog />

      <h2>Why This Matters</h2>
      <p>
        This project is also a proof-of-concept for how AI tools like Claude Code can be used
        responsibly in institutional contexts. It demonstrates two things:
      </p>
      <p>
        <strong>For research administration:</strong> AI can dramatically accelerate the kind of
        data gathering, parsing, and visualization work that would otherwise take weeks of analyst
        time. The SSHRC data exists as dozens of inconsistently-formatted Excel spreadsheets
        spanning decades — exactly the kind of tedious but important work that benefits from AI
        assistance. The human role is strategic: deciding what questions to ask, what comparisons
        matter, and how to interpret the results.
      </p>
      <p>
        <strong>For education:</strong> Students need to learn how to work WITH AI tools
        effectively — not just prompt them, but direct complex multi-step projects, validate
        outputs, and understand both the capabilities and limitations. This dashboard, built from
        a detailed prompt with human oversight throughout, is an example of what that collaboration
        looks like in practice. The full prompt and development log are published here as a model
        of transparency.
      </p>
      <p style={{ marginTop: '2rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        Built by Ian Milligan, Professor of History & AVP Research Oversight and Integrity,
        University of Waterloo.
      </p>

      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Last data update: {data.metadata.last_updated}
      </p>
    </div>
  );
}
