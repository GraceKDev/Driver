import { FeatureGrid } from "@/components/landing/feature-grid";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { TrustSection } from "@/components/landing/trust-section";

export default function Home() {
  return (
    <div className="desk-surface min-h-screen overflow-x-clip">
      <LandingHeader />
      <main id="main">
        <HeroSection />
        <FeatureGrid />
        <HowItWorks />
        <TrustSection />
      </main>
      <LandingFooter />
    </div>
  );
}
