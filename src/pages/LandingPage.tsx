import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';
import { Footer } from '../components/Footer';
import { ROLES_CATALOGUE } from '../data/rolesData';
import { PageTransition, FadeIn } from '../components/motion/Motion';

export const LandingPage: React.FC = () => {
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('All');

  const categories = ['All', 'Engineering', 'Data & Analytics', 'Design', 'Product', 'Security', 'Cloud & DevOps', 'AI & Data'];
  const filteredRoles = ROLES_CATALOGUE.filter(
    (r) => selectedRoleCategory === 'All' || r.category === selectedRoleCategory
  );

  return (
    <div className="min-h-screen bg-[#fcf9f3] text-[#0d1f18] flex flex-col font-sans selection:bg-[#6b4ea6] selection:text-white">
      {/* Dedicated Public Landing Navigation */}
      <PublicHeader />

      <PageTransition className="flex-1 w-full pt-20">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-b border-[#e5e2dc]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left 6 Columns: Positioning & Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ebe8e2] border border-[#e5e2dc]">
                <span className="w-2 h-2 rounded-full bg-[#6b4ea6]"></span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#424845] font-semibold">
                  Career Intelligence Platform
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#0d1f18] leading-[1.12]">
                Your career has a direction.
                <br />
                <span className="italic font-serif text-[#6b4ea6]">ATLAS helps you find the path.</span>
              </h1>

              <p className="text-body-lg text-body-lg text-[#424845] max-w-xl leading-relaxed">
                Understand where you stand, discover the skills that matter, build credible evidence, and turn your career goal into a practical roadmap.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/onboarding"
                  className="btn-interactive px-7 py-4 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white font-title-md text-title-md font-semibold transition-all shadow-sm flex items-center gap-2 group"
                >
                  <span>Build my career profile</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>

                <a
                  href="#how-it-works"
                  className="btn-interactive px-6 py-4 rounded-lg border border-[#e5e2dc] bg-white hover:bg-[#f6f3ed] text-[#0d1f18] font-title-md text-title-md font-medium transition-all flex items-center gap-2"
                >
                  <span>How ATLAS works</span>
                  <span className="material-symbols-outlined text-[16px] text-[#737874]">
                    south
                  </span>
                </a>
              </div>

              {/* Credible Trust Badges */}
              <div className="pt-8 border-t border-[#f1eee7] grid grid-cols-3 gap-6 text-xs text-[#737874]">
                <div>
                  <span className="font-bold text-[#0d1f18] block font-mono text-sm">Deterministic</span>
                  <span>Transparent scoring algorithms</span>
                </div>
                <div>
                  <span className="font-bold text-[#0d1f18] block font-mono text-sm">Role-Specific</span>
                  <span>Calibrated across 13+ career paths</span>
                </div>
                <div>
                  <span className="font-bold text-[#0d1f18] block font-mono text-sm">Evidence-Driven</span>
                  <span>Defensible portfolio artifacts</span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Product Pipeline Visualization */}
            <div className="lg:col-span-6">
              <div className="relative w-full rounded-2xl bg-white p-6 sm:p-8 shadow-[0_8px_36px_-6px_rgba(13,31,24,0.08)] border border-[#e5e2dc] space-y-6">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#f1eee7]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6b4ea6]"></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#0d1f18] font-bold">
                      Career Intelligence Architecture
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#737874] bg-[#f6f3ed] px-2 py-0.5 rounded border border-[#e5e2dc]">
                    SYSTEM PIPELINE
                  </span>
                </div>

                <p className="text-xs text-[#424845] leading-relaxed">
                  ATLAS translates your educational background and career ambitions into a calibrated, evidence-backed roadmap through sequential intelligence loops:
                </p>

                {/* Pipeline Flow Visualization */}
                <div className="space-y-3">
                  {/* Step 1: Profile & Direction */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#fcf9f3] border border-[#e5e2dc] flex items-center justify-between gap-3 group hover:border-[#6b4ea6]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ebe8e2] text-[#0d1f18] flex items-center justify-center font-bold font-mono text-xs">
                        01
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0d1f18]">Your Profile &amp; Background</div>
                        <div className="text-[11px] text-[#737874]">Education, standing, and available study hours</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#6b4ea6] font-semibold">CANDIDATE INPUT</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#c2c8c3]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 2: Target Career Direction */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#fcf9f3] border border-[#e5e2dc] flex items-center justify-between gap-3 group hover:border-[#6b4ea6]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ebe8e2] text-[#0d1f18] flex items-center justify-center font-bold font-mono text-xs">
                        02
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0d1f18]">Your Target Career Direction</div>
                        <div className="text-[11px] text-[#737874]">Standardized competency threshold (e.g. 80% benchmark)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#0d1f18] font-semibold">BENCHMARK</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#c2c8c3]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 3: Diagnostic Assessment */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#fcf9f3] border border-[#e5e2dc] flex items-center justify-between gap-3 group hover:border-[#6b4ea6]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#ebe8e2] text-[#0d1f18] flex items-center justify-center font-bold font-mono text-xs">
                        03
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0d1f18]">Diagnostic Scenario Evaluation</div>
                        <div className="text-[11px] text-[#737874]">Empirical checks of technical application and problem-solving</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#6b4ea6] font-semibold">EMPIRICAL SCORE</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#c2c8c3]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 4: Gaps & Roadmap */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#d2e7dc]/30 border border-[#4f6359] flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0d1f18] text-white flex items-center justify-center font-bold font-mono text-xs">
                        04
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#0d1f18]">Prioritized Gaps &amp; Roadmap</div>
                        <div className="text-[11px] text-[#424845]">Deficit-weighted time allocation and verified project evidence</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#0d1f18] font-bold">CLEARANCE PLAN</span>
                  </div>
                </div>

                {/* Callout Strip */}
                <div className="p-3.5 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-between text-xs text-[#737874]">
                  <span>Zero guesswork. Complete transparency.</span>
                  <Link to="/onboarding" className="text-[#6b4ea6] font-semibold hover:underline">
                    Get started →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: HOW ATLAS WORKS */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#e5e2dc]">
          <div className="max-w-3xl mb-14 space-y-3">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold block">
              The Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] tracking-tight">
              How ATLAS transforms career preparation.
            </h2>
            <p className="text-body-md text-body-md text-[#424845]">
              Six deliberate steps connecting who you are today with the technical proof needed to clear candidate screening filters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">01</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Build your profile
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                Provide your educational background, current standing, and available weekly study hours without filling out bloated forms.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">02</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Choose your direction
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                Select from 13+ calibrated career paths—from Software Engineering to Data Science—or define a custom interdisciplinary target role.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">03</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Demonstrate your skills
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                Complete role-specific scenario evaluations that test practical technical application and diagnostic thinking rather than rote memory.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">04</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Understand your gaps
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                See exactly where your demonstrated scores differ from role thresholds, identifying the specific bottlenecks causing rejection.
              </p>
            </div>

            {/* Step 05 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">05</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Follow your roadmap
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                Follow an action sequence where your largest deficit becomes Step 01, with weekly hours divided proportionally by need.
              </p>
            </div>

            {/* Step 06 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-3 hover:border-[#c2c8c3] transition-colors">
              <span className="font-serif text-3xl font-bold text-[#6b4ea6] block">06</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">
                Build evidence
              </h3>
              <p className="text-body-sm text-body-sm text-[#424845] leading-relaxed">
                Log production-grade artifacts, code repositories, and technical defense memos ready for evaluation in senior interviews.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FROM CONFUSION TO CLARITY */}
        {/* ========================================================================= */}
        <section id="why-atlas" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#e5e2dc]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 5 Columns: Problem Framing */}
            <div className="lg:col-span-5 space-y-4">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold block">
                From Confusion to Clarity
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] tracking-tight leading-tight">
                Generic career advice is broken. ATLAS connects every dot.
              </h2>
              <p className="text-body-md text-body-md text-[#424845] leading-relaxed">
                Most students and early-career applicants navigate career preparation in fragments: uncalibrated courses, random projects, and vague resume bullet points that trigger rejection from applicant tracking systems.
              </p>
              <p className="text-body-md text-body-md text-[#424845] leading-relaxed">
                ATLAS connects the entire pipeline so every study hour directly moves the needle on technical clearance.
              </p>
            </div>

            {/* Right 7 Columns: Visual Comparison Loop */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Box 1: Fragmented Traditional Path */}
              <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#f1eee7]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  <span className="font-bold text-xs uppercase text-[#ba1a1a] tracking-wider">
                    Fragmented Preparation
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-[#424845]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ba1a1a] font-bold">✕</span>
                    <span>Generic certificates without measurable evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ba1a1a] font-bold">✕</span>
                    <span>No clarity on which skills cause screening rejection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ba1a1a] font-bold">✕</span>
                    <span>Equal time wasted on already-mastered concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ba1a1a] font-bold">✕</span>
                    <span>Toy projects that fail senior technical scrutiny</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: ATLAS Connected Loop */}
              <div className="p-6 rounded-xl bg-[#d2e7dc]/20 border-2 border-[#4f6359] space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#d2e7dc]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4f6359]"></span>
                  <span className="font-bold text-xs uppercase text-[#0d1f18] tracking-wider">
                    The ATLAS Intelligence Loop
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-[#0d1f18]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4f6359] font-bold">✓</span>
                    <span>Calibrated directly against target role thresholds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4f6359] font-bold">✓</span>
                    <span>Identifies exact screening bottlenecks immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4f6359] font-bold">✓</span>
                    <span>Allocates study hours proportionally to actual deficits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4f6359] font-bold">✓</span>
                    <span>Evidence locker with verified architectural artifacts</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: PERSONALIZED CAREER INTELLIGENCE */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#e5e2dc]">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold block">
              Dynamic Personalization
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] tracking-tight">
              Calibrated around you, not a generic curriculum.
            </h2>
            <p className="text-body-md text-body-md text-[#424845]">
              ATLAS dynamically adapts the competency framework, diagnostic evaluations, and roadmaps around your exact parameters:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">school</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Background &amp; Standing</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Whether you are a 1st-year student, recent graduate fresher, or early-career professional pivoting into tech.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">target</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Target Trajectory</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Competency benchmarks tailored to your specific role requirements across engineering, data, design, or security.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">speed</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Demonstrated Capability</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Empirical diagnostic scoring that identifies your specific strengths and isolates critical deficits.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">schedule</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Available Study Time</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Whether you have 5, 10, or 20 hours per week, every sprint schedule adjusts to fit your real-world calendar.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">verified</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Verified Evidence</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Turn learning into demonstrable repositories, dashboards, and architectural write-ups interviewers trust.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] space-y-2">
              <span className="material-symbols-outlined text-[#6b4ea6] text-[28px]">autorenew</span>
              <h3 className="font-title-md text-title-md text-[#0d1f18] font-bold">Continuous Recalibration</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                As you clear milestone sprints and re-evaluate competencies, your roadmap automatically updates to your next priority.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CAREER PATHS & ROLES */}
        {/* ========================================================================= */}
        <section id="career-paths" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#e5e2dc]">
          <div className="max-w-3xl mb-8 space-y-3">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold block">
              Supported Trajectories
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] tracking-tight">
              Explore calibrated career directions.
            </h2>
            <p className="text-body-md text-body-md text-[#424845]">
              ATLAS maintains deep competency architectures across major tech sectors. Select a category to inspect evaluated skills:
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-[#e5e2dc] mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedRoleCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedRoleCategory === cat
                    ? 'bg-[#0d1f18] text-white shadow-xs'
                    : 'bg-white border border-[#e5e2dc] text-[#424845] hover:bg-[#f6f3ed]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs flex flex-col justify-between hover:border-[#c2c8c3] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f6f3ed] text-[#737874]">
                      {role.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#4f6359] font-semibold">
                      Threshold: {role.roleThreshold}%
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#0d1f18] mt-1">{role.name}</h3>
                  <p className="text-xs text-[#424845] mt-2 line-clamp-2 leading-relaxed">
                    {role.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f1eee7]">
                  <span className="text-[10px] font-mono text-[#737874] uppercase block mb-1.5 font-bold">
                    Evaluated Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-[#f6f3ed] text-[11px] text-[#0d1f18]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: WHAT USERS GET */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#e5e2dc]">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#6b4ea6] font-bold block">
              Platform Modules
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] tracking-tight">
              Everything you need to navigate your transition.
            </h2>
            <p className="text-body-md text-body-md text-[#424845]">
              Six integrated tools purpose-built to eliminate guesswork from preparation to interview defense:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Career Diagnosis</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Understand where you currently stand with transparent readiness dial metrics and primary bottleneck identification.
              </p>
            </div>

            {/* Module 2 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Skill Gap Analysis</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                See exactly which capabilities need immediate attention, with high, medium, and low priority screening categorization.
              </p>
            </div>

            {/* Module 3 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">pie_chart</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Resource Allocation</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Understand where your learning time should go with weekly hours divided mathematically by deficit weightings.
              </p>
            </div>

            {/* Module 4 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">alt_route</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Career Roadmap</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Turn abstract deficits into practical, sequential milestones with specific drills, project specifications, and defense write-ups.
              </p>
            </div>

            {/* Module 5 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Evidence Locker</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                Build verifiable proof of capability, track project repositories, and rehearse recorded interview defense drills.
              </p>
            </div>

            {/* Module 6 */}
            <div className="p-6 rounded-xl bg-white border border-[#e5e2dc] shadow-xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#f6f3ed] text-[#0d1f18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">map</span>
              </div>
              <h3 className="font-title-lg text-title-lg text-[#0d1f18] font-bold">Career Map</h3>
              <p className="text-xs text-[#424845] leading-relaxed">
                See how your current position connects to your vertical trajectory, viable lateral branches, and compensation milestones.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: FINAL CTA */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#0d1f18] leading-tight">
              Your next career move should be intentional.
            </h2>
            <p className="text-body-md text-body-md text-[#424845] leading-relaxed">
              Create your ATLAS profile and build a career path based on where you are, where you want to go, and what you need to prove along the way.
            </p>
            <div className="pt-2">
              <Link
                to="/onboarding"
                className="btn-interactive inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#0d1f18] hover:bg-[#22382f] text-white font-title-md text-title-md font-semibold transition-all shadow-md group"
              >
                <span>Build my career profile</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};
