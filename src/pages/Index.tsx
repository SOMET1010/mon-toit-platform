import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import KeyStats from "@/components/KeyStats";
import Features from "@/components/Features";
import FeaturedProperties from "@/components/FeaturedProperties";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Hero />
        <KeyStats />
        <Features />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
