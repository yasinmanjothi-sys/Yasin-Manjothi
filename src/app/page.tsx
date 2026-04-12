import Header from "@/components/Header";
import HeroSequence from "@/components/HeroSequence";
import WorksGrid from "@/components/WorksGrid";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSequence />
      <AboutSection />
      <WorksGrid />
      <Footer />
    </main>
  );
}
