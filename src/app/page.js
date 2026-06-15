import LandingNavbar from '@/components/landing/LandingNavbar'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import FeatureGrid from '@/components/landing/FeatureGrid'
import WorkflowSection from '@/components/landing/WorkflowSection'
import DashboardPreview from '@/components/landing/DashboardPreview'
import RoleSection from '@/components/landing/RoleSection'
import FinalCTA from '@/components/landing/FinalCTA'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'Rentivo | CRM Pintar untuk Bisnis Rental',
  description:
    'Landing page Rentivo, platform AI-assisted omnichannel CRM dan rental operations untuk bisnis persewaan di Indonesia.',
}

export default function Home() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeatureGrid />
        <WorkflowSection />
        <DashboardPreview />
        <RoleSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
