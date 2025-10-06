import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import KeyStats from "@/components/KeyStats";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import FeaturedProperties from "@/components/FeaturedProperties";
import Footer from "@/components/Footer";
import StickyCTA from "@/components/StickyCTA";
import OnboardingModal from "@/components/OnboardingModal";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <KeyStats />
        <Features />
        <Testimonials />
        <FeaturedProperties />
      </main>
      <Footer />
      <StickyCTA />
      <OnboardingModal />
    </div>
  );
};

export default Index;
