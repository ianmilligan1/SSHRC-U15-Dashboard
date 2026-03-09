import TrainingSection from './TrainingSection';

export default function TalentPage() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Research Training & Talent Development</h1>
        <p className="subtitle">CGS Masters, CGS Doctoral, SSHRC Doctoral Awards, and Postdoctoral Fellowships</p>
      </header>

      <TrainingSection />
    </div>
  );
}
