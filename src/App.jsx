import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InsightPage from './components/InsightPage';
import PartnershipsPage from './components/PartnershipsPage';
import TalentPage from './components/TalentPage';
import AboutPage from './components/AboutPage';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <nav className="nav">
          <NavLink to="/" className="nav-brand">SSHRC U15 Dashboard</NavLink>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink></li>
            <li><NavLink to="/insight" className={({ isActive }) => isActive ? 'active' : ''}>Insight</NavLink></li>
            <li><NavLink to="/partnerships" className={({ isActive }) => isActive ? 'active' : ''}>Partnerships</NavLink></li>
            <li><NavLink to="/talent" className={({ isActive }) => isActive ? 'active' : ''}>Talent</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/insight" element={<InsightPage />} />
          <Route path="/partnerships" element={<PartnershipsPage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <footer className="footer">
          <p>Data source: <a href="https://sshrc-crsh.canada.ca/en/competition-results/statistics.aspx" target="_blank" rel="noreferrer">SSHRC Competition Statistics</a> (sshrc-crsh.canada.ca). Dashboard built for internal planning purposes.</p>
          <p style={{ marginTop: '0.25rem' }}>Built with Claude Code (Anthropic). <a href="https://github.com/ianmilligan1/SSHRC-U15-Dasboard" target="_blank" rel="noreferrer">GitHub</a></p>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
