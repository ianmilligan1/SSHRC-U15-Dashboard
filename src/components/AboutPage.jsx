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
        spanning up to 30 years (1995-2024), organized across five pages:
      </p>
      <ul style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
        <li><strong>Insight:</strong> Insight Grants, Insight Development Grants, and the predecessor Standard Research Grants</li>
        <li><strong>Partnerships:</strong> Connection Grants, Partnership Development Grants, Partnership Grants, and Partnership Engage Grants</li>
        <li><strong>Talent:</strong> CGS Masters, CGS Doctoral, SSHRC Doctoral Awards, and Postdoctoral Fellowships</li>
        <li><strong>Analysis:</strong> A data-driven essay examining Waterloo's strengths, weaknesses, and strategic position relative to U15 peers, with all statistics computed dynamically from the underlying data</li>
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
        <strong>This dashboard was built entirely using Claude Code (Anthropic) with human direction
        and oversight.</strong> A single detailed prompt produced the initial data pipeline and dashboard.
        Subsequent short human instructions — often just a sentence or two identifying a problem or
        requesting a feature — drove all refinements. The full prompts are published below.
      </p>
      <p>
        The build process involved three main phases: (1) a data pipeline that downloads and
        parses nearly 200 Excel spreadsheets from SSHRC's website, normalizing university names and
        extracting competition statistics into a single JSON file; (2) a React dashboard built
        with Vite and Recharts that visualizes the data with interactive charts, tables, and
        comparison tools; and (3) iterative refinement driven by human review of the output.
      </p>
      <p>
        The entire project was built in <strong>a single evening (March 8, 2026)</strong>, across
        three Claude Code sessions totalling roughly two hours of wall-clock time. Each session
        demonstrated a different aspect of the human-AI collaboration:
      </p>
      <ul style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
        <li>
          <strong>Session 1 (~8:00-8:45 PM):</strong> The initial detailed prompt (326 lines)
          produced a working data pipeline and single-page dashboard with 7 competition types
          in approximately 45 minutes. This is the "heavy lift" — scraping, parsing, and
          visualizing decades of inconsistently-formatted data.
        </li>
        <li>
          <strong>Session 2 (~9:00-9:45 PM):</strong> Short human instructions expanded and refined
          the dashboard. Adding 4 partnership competition types, restructuring into separate
          pages, improving trend line clarity, and fixing a critical data quality issue (an
          affiliated college being misidentified as a major research university) — all driven by
          brief human feedback like <em>"I want to CLEARLY see the trend lines"</em> and <em>"Something
          is wrong with the Western data."</em>
        </li>
        <li>
          <strong>Session 3 (~9:45-10:10 PM):</strong> The human spotted a 6-year gap in Insight Grants
          data and requested a new Analysis page. Claude Code diagnosed the parsing bug
          (SSHRC changed column headers from "Applications" to "Projects" for 2014-2019),
          fixed it with back-calculation logic, then wrote a data-driven analytical essay
          examining Waterloo's strengths and weaknesses — all computed dynamically from the
          data.
        </li>
      </ul>
      <p>
        <strong>Total human input across all three sessions was approximately 15-20 sentences.</strong> Everything
        else — the 3,500+ lines of code, the data pipeline parsing 197 Excel files across 30 years
        of inconsistent formats, the responsive visualizations, and the strategic analysis — was
        generated by Claude Code in a single evening.
      </p>
      <p>
        Built on the evening of <strong>March 8, 2026</strong>. First commit at 8:02 PM, final
        commit at 10:10 PM.
      </p>

      <details className="prompt-viewer">
        <summary>View the full initial prompt (Session 1 — 326 lines)</summary>
        <pre className="prompt-content">{promptText}</pre>
      </details>

      <details className="prompt-viewer">
        <summary>View the refinement prompts (Sessions 2 & 3)</summary>
        <div className="prompt-content" style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            <strong>The following are the complete human instructions that drove all subsequent development.
            Each one was typically a single sentence or short paragraph.</strong>
          </p>

          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.25rem' }}>Session 2 (~9:00 PM) — Expanding and restructuring:</p>

          <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
            "Now I want to add more data. I also want to restructure the page so that there are separate
            pages: Overview should be a summary, Insight should be Insight Grants + IDG, Partnerships should
            include Connection Grants, Partnership Development Grants, Partnership Grants, and Partnership
            Engage Grants, and Talent is the existing training section."
          </p>

          <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
            "I want to CLEARLY see the trend lines. Highlight UW + let me compare with top peers."
          </p>

          <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
            "Something is wrong with the Western data — they're showing 100% success rates with tiny
            application numbers. That can't be right."
          </p>

          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.25rem', marginTop: '1rem' }}>Session 3 (~9:45 PM) — Data quality and analysis:</p>

          <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
            "There is no data on Insights between 2013 and 2019."
          </p>

          <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
            "I also want to do some analysis of this data. What are the strengths and weaknesses of
            Waterloo vis-a-vis other U15s based on this data. Are you able to write an essay on this and
            post it on an 'Analysis' tab?"
          </p>

          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.8rem' }}>
            That's it. Five short instructions, totalling roughly 15 sentences, drove all development
            after the initial prompt — adding 4 new competition types, restructuring the entire dashboard
            into separate pages, fixing two critical data quality bugs, and producing a full analytical
            essay with dynamic statistics.
          </p>
        </div>
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
        This project is a proof-of-concept for how AI tools like Claude Code can be used
        responsibly in institutional contexts. It demonstrates three things:
      </p>
      <p>
        <strong>For research administration:</strong> AI can dramatically accelerate the kind of
        data gathering, parsing, and visualization work that would otherwise take weeks of analyst
        time. The SSHRC data exists as nearly 200 inconsistently-formatted Excel spreadsheets
        spanning three decades — exactly the kind of tedious but important work that benefits from AI
        assistance. The human role is strategic: deciding what questions to ask, what comparisons
        matter, and catching data quality issues that require domain knowledge to spot.
      </p>
      <p>
        <strong>For education:</strong> Students need to learn how to work WITH AI tools
        effectively — not just prompt them, but direct complex multi-step projects, validate
        outputs, and understand both the capabilities and limitations. This dashboard, built from
        a detailed prompt with human oversight throughout, is an example of what that collaboration
        looks like in practice. The full prompts and development log are published here as a model
        of transparency.
      </p>
      <p>
        <strong>What the human brought:</strong> The initial vision and detailed requirements.
        The domain knowledge to spot that Western University's data "looked wrong" (it was an
        affiliated college being misidentified). The observation that six years of Insight Grants
        data were missing from the trend lines. The strategic question — "what are Waterloo's
        strengths and weaknesses?" — that drove the Analysis page. None of these interventions
        required technical expertise; all of them required human judgment and institutional knowledge
        that no AI could bring on its own.
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
