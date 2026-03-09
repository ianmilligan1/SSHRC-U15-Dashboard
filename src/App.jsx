import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AboutPage from './components/AboutPage';

function App() {
  return (
    <HashRouter>
      <div className="app">
        <nav className="nav">
          <NavLink to="/" className="nav-brand">SSHRC U15 Dashboard</NavLink>
          <ul className="nav-links">
            <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
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
