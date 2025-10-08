import Navbar from "@/components/Navbar";
import ContextBar from "@/components/ContextBar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import RoleSelector from "@/components/RoleSelector";
import KeyStats from "@/components/KeyStats";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FeaturedProperties from "@/components/FeaturedProperties";
import RightNowSection from "@/components/RightNowSection";
import ExploreMap from "@/components/ExploreMap";
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
        <ExploreMap />
        <HowItWorks />
        <RoleSelector />
        <KeyStats />
        <Features />
        <Testimonials />
        <FeaturedProperties />
        <RightNowSection />
      </main>
      <Footer />
      <StickyCTA />
      <OnboardingModal />
    </div>
  );
};

export default Index;
