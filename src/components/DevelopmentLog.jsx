import { useState } from 'react';
import devLog from '../data/dev-log.json';

export default function DevelopmentLog() {
  const [expanded, setExpanded] = useState({});

  const toggle = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="timeline">
      {devLog.map((entry, idx) => (
        <div key={idx} className="timeline-entry">
          <div className="timestamp">{new Date(entry.timestamp).toLocaleString()}</div>
          <span className="phase-badge">{entry.phase}</span>
          <div className="description">{entry.description}</div>
          {(entry.challenges || entry.human_input || entry.ai_contribution) && (
            <button
              onClick={() => toggle(idx)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '0.25rem 0',
                marginTop: '0.5rem',
                fontFamily: 'var(--font-body)',
              }}
            >
              {expanded[idx] ? '\u25BC Details' : '\u25B6 Details'}
            </button>
          )}
          {expanded[idx] && (
            <dl className="timeline-details">
              {entry.challenges && (
                <>
                  <dt>Challenges</dt>
                  <dd>{entry.challenges}</dd>
                </>
              )}
              {entry.human_input && (
                <>
                  <dt>Human Input</dt>
                  <dd>{entry.human_input}</dd>
                </>
              )}
              {entry.ai_contribution && (
                <>
                  <dt>AI Contribution</dt>
                  <dd>{entry.ai_contribution}</dd>
                </>
              )}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
}
