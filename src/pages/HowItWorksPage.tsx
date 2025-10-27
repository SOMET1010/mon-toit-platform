import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/pages/HowItWorks";

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
