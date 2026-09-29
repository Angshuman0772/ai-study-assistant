import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";

function Home() {
  const features = [
    {
      title: "AI Chat Tutor",
      description:
        "Ask questions about your study material and get instant explanations.",
    },
    {
      title: "Quiz Generator",
      description: "Generate practice quizzes from your notes automatically.",
    },
    {
      title: "Smart Summaries",
      description: "Convert lengthy notes into concise study guides.",
    },
    {
      title: "Study Planner",
      description: "Create personalized study schedules and track progress.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />

      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Features</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
