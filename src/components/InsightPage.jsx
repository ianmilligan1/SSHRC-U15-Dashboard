import InsightGrantsSection from './InsightGrantsSection';
import IDGSection from './IDGSection';

export default function InsightPage() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Insight Programs</h1>
        <p className="subtitle">Insight Grants, Insight Development Grants, and Standard Research Grants (predecessor)</p>
      </header>

      <InsightGrantsSection />
      <IDGSection />
    </div>
  );
}
