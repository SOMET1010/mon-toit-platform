import Navbar from "@/components/Navbar";
import ContextBar from "@/components/ContextBar";
import Hero from "@/components/Hero";
import KeyStats from "@/components/KeyStats";
import FeaturedProperties from "@/components/FeaturedProperties";
import PreFooterCTA from "@/components/PreFooterCTA";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import OnboardingModal from "@/components/OnboardingModal";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ContextBar />
      <main className="flex-1">
        <Hero />
        <KeyStats />
        <FeaturedProperties limit={4} />
        <PreFooterCTA />
      </main>
      <Footer />
      <StickyCTA />
      <OnboardingModal />
    </div>
  );
};

export default Index;
