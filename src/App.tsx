import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AtlasProvider } from './context/AtlasContext';
import { AccountProvider } from './context/AccountContext';
import { LandingPage } from './pages/LandingPage';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { AssessmentResultPage } from './pages/AssessmentResultPage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { SkillGapsPage } from './pages/SkillGapsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { CareerRoadmapPage } from './pages/CareerRoadmapPage';
import { RoadmapStepPage } from './pages/RoadmapStepPage';
import { EvidencePage } from './pages/EvidencePage';
import { ReassessmentPage } from './pages/ReassessmentPage';
import { CareerMapPage } from './pages/CareerMapPage';
import { ProfilePage } from './pages/ProfilePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';

// Dedicated Employer Workspace Pages
import { EmployerOnboardingPage } from './pages/EmployerOnboardingPage';
import { EmployerPortalPage } from './pages/EmployerPortalPage';
import { EmployerProfileManagePage } from './pages/EmployerProfileManagePage';
import { EmployerOpportunitiesManagePage } from './pages/EmployerOpportunitiesManagePage';
import { CreateOpportunityPage } from './pages/CreateOpportunityPage';
import { EmployerMatchesPage } from './pages/EmployerMatchesPage';
import { EmployerCandidatesPage } from './pages/EmployerCandidatesPage';
import { CandidateProfileEmployerPage } from './pages/CandidateProfileEmployerPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AccountProvider>
        <AtlasProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Entry & Account Selection */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/role-select" element={<RoleSelectPage />} />

            {/* Candidate Journey */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/assessment/result" element={<AssessmentResultPage />} />
            <Route path="/diagnosis" element={<DiagnosisPage />} />
            <Route path="/skill-gaps" element={<SkillGapsPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
            <Route path="/roadmap/:stepId" element={<RoadmapStepPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
            <Route path="/career-map" element={<CareerMapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reassessment" element={<ReassessmentPage />} />

            {/* Dedicated Employer Workspace */}
            <Route path="/employer/onboarding" element={<EmployerOnboardingPage />} />
            <Route path="/employer" element={<EmployerPortalPage />} />
            <Route path="/employer/profile" element={<EmployerProfileManagePage />} />
            <Route path="/employer/opportunities" element={<EmployerOpportunitiesManagePage />} />
            <Route path="/employer/opportunities/new" element={<CreateOpportunityPage />} />
            <Route path="/employer/opportunities/:id" element={<EmployerMatchesPage />} />
            <Route path="/employer/opportunities/:id/matches" element={<EmployerMatchesPage />} />
            <Route path="/employer/candidates" element={<EmployerCandidatesPage />} />
            <Route path="/employer/candidates/:id" element={<CandidateProfileEmployerPage />} />

            {/* Fallback route */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </AtlasProvider>
      </AccountProvider>
    </BrowserRouter>
  );
}
