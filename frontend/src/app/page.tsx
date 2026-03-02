'use client';

import {
  HeroSection,
  ProblemSection,
  FeaturesSection,
  PricingSection,
  ROISection,
  DemoSection,
  TestimonialsSection,
  FinalCTASection,
} from '@/components/landing';
import OwnerStrip from '@/components/OwnerStrip';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <OwnerStrip />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection />
      <ROISection />
      <DemoSection />
      <TestimonialsSection />
      <FinalCTASection />
    </div>
  );
}
