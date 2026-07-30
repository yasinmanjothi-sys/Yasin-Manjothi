import Header from "@/components/Header";
import HeroSequence from "@/components/HeroSequence";
import DesignGrid from "@/components/DesignGrid";
import DevelopmentGrid from "@/components/DevelopmentGrid";
import PlaySection from "@/components/PlaySection";
import RecentCaseStudiesSection from "@/components/RecentCaseStudiesSection";
import SkillsStrip from "@/components/SkillsStrip";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSequence />
      <AboutSection />
      <DesignGrid />
      <PlaySection />
      <DevelopmentGrid />
      <RecentCaseStudiesSection />
      <SkillsStrip />
      <Footer />
    </main>
  );
}
