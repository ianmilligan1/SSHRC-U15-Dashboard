import KPICards from './KPICards';
import U15ComparisonSection from './U15ComparisonSection';
import HistoricalTrendsSection from './HistoricalTrendsSection';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>SSHRC Performance: University of Waterloo in the U15</h1>
        <p className="subtitle">Competition statistics for strategic planning</p>
      </header>

      <KPICards />
      <U15ComparisonSection />
      <HistoricalTrendsSection />
    </div>
  );
}
