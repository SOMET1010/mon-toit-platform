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
      <main className="flex-1">
        <Hero />
        <div className="border-t-2 border-primary/10" />
        <KeyStats />
        <div className="border-t-2 border-primary/10" />
        <Features />
        <div className="border-t-2 border-primary/10" />
        <FeaturedProperties />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
