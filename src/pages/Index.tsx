import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import MaintenanceCategories from "@/components/home/MaintenanceCategories";
import RolesSection from "@/components/home/RolesSection";
import WorkflowSection from "@/components/home/WorkflowSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="relative z-10 min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <MaintenanceCategories />
        <RolesSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
