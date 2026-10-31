import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '../components/PublicHeader';
import { Footer } from '../components/Footer';
import { ROLES_CATALOGUE } from '../data/rolesData';
import { PageTransition } from '../components/motion/Motion';

export const LandingPage: React.FC = () => {
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('All');

  const categories = ['All', 'Engineering', 'Data & Analytics', 'Design', 'Product', 'Security', 'Cloud & DevOps', 'AI & Data'];
  const filteredRoles = ROLES_CATALOGUE.filter(
    (r) => selectedRoleCategory === 'All' || r.category === selectedRoleCategory
  );

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#4B5563] flex flex-col font-sans selection:bg-[#D8C3A5]/40 selection:text-[#18283D] relative overflow-hidden">
      {/* Dedicated Public Landing Navigation */}
      <PublicHeader />

      <PageTransition className="flex-1 w-full pt-20">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left 6 Columns: Positioning & Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D8C3A5]/25 border border-[#D8C3A5] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#8B6F5A]"></span>
                <span className="font-mono text-xs uppercase tracking-wider text-[#8B6F5A] font-semibold">
                  Autonomous Career Intelligence
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#18283D] leading-[1.1]">
                Your career has a direction.
                <br />
                <span className="text-[#18283D]">ATLAS helps you find the path.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B7280] max-w-xl leading-relaxed">
                Understand where you stand, discover the skills that matter, build credible evidence, and turn your career goal into a practical, calibrated roadmap.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/onboarding"
                  className="btn-interactive px-7 py-3.5 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-sm transition-all shadow-sm flex items-center gap-2 group"
                >
                  <span>Build my career profile</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>

                <a
                  href="#how-it-works"
                  className="btn-interactive px-6 py-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAF7F2] hover:bg-[#D8C3A5]/15 hover:border-[#8B6F5A]/50 hover:text-[#18283D] hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.98] text-[#18283D] font-medium text-sm transition-all flex items-center gap-2"
                >
                  <span>How ATLAS works</span>
                  <span className="material-symbols-outlined text-[16px] text-[#6B7280]">
                    south
                  </span>
                </a>
              </div>

              {/* Credible Trust Badges */}
              <div className="pt-8 border-t border-[#E5E7EB] grid grid-cols-3 gap-6 text-xs text-[#6B7280]">
                <div>
                  <span className="font-bold text-[#18283D] block font-mono text-sm">Deterministic</span>
                  <span>Transparent scoring algorithms</span>
                </div>
                <div>
                  <span className="font-bold text-[#18283D] block font-mono text-sm">Role-Specific</span>
                  <span>Calibrated across 13+ career paths</span>
                </div>
                <div>
                  <span className="font-bold text-[#18283D] block font-mono text-sm">Evidence-Driven</span>
                  <span>Defensible portfolio artifacts</span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Product Pipeline Visualization */}
            <div className="lg:col-span-6">
              <div className="relative w-full rounded-2xl glass-panel-elevated p-6 sm:p-8 shadow-[0_20px_50px_rgba(24,40,61,0.08)] border border-[#E5E7EB] space-y-6">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B6F5A] animate-pulse"></span>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#18283D] font-bold">
                      Career Intelligence Architecture
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8B6F5A] bg-[#D8C3A5]/25 px-2.5 py-0.5 rounded-md border border-[#D8C3A5]">
                    SYSTEM PIPELINE
                  </span>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed">
                  ATLAS translates your educational background and career ambitions into a calibrated, evidence-backed roadmap through sequential intelligence loops:
                </p>

                {/* Pipeline Flow Visualization */}
                <div className="space-y-3">
                  {/* Step 1: Profile & Direction */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between gap-3 group hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center font-bold font-mono text-xs">
                        01
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#18283D]">Your Profile &amp; Background</div>
                        <div className="text-[11px] text-[#6B7280]">Education, standing, and available study hours</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B6F5A] font-semibold px-2 py-0.5 rounded bg-[#D8C3A5]/25">INPUT</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#6B7280]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 2: Target Career Direction */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between gap-3 group hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center font-bold font-mono text-xs">
                        02
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#18283D]">Your Target Career Direction</div>
                        <div className="text-[11px] text-[#6B7280]">Standardized competency threshold (e.g. 80% benchmark)</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B6F5A] font-semibold px-2 py-0.5 rounded bg-[#D8C3A5]/25">BENCHMARK</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#6B7280]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 3: Diagnostic Assessment */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between gap-3 group hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center font-bold font-mono text-xs">
                        03
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#18283D]">Diagnostic Scenario Evaluation</div>
                        <div className="text-[11px] text-[#6B7280]">Empirical checks of technical application and problem-solving</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B6F5A] font-semibold px-2 py-0.5 rounded bg-[#D8C3A5]/25">DIAGNOSTIC</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="flex justify-center -my-1 text-[#6B7280]">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Step 4: Gaps & Roadmap */}
                  <div className="card-interactive p-3.5 rounded-xl bg-[#FAF7F2] border border-[#D8C3A5] flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#8B6F5A] text-[#FAF7F2] flex items-center justify-center font-bold font-mono text-xs shadow-sm">
                        04
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#18283D]">Prioritized Gaps &amp; Roadmap</div>
                        <div className="text-[11px] text-[#6B7280]">Deficit-weighted time allocation and verified project evidence</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#8B6F5A] font-bold px-2 py-0.5 rounded bg-[#D8C3A5]/30">CLEARANCE</span>
                  </div>
                </div>

                {/* Callout Strip */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Zero guesswork. Complete empirical transparency.</span>
                  <Link to="/onboarding" className="text-[#8B6F5A] font-semibold hover:underline">
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
        <section id="how-it-works" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#E5E7EB]">
          <div className="max-w-3xl mb-14 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block">
              The Journey
            </span>
            <h2 className="text-3xl sm:text-4xl text-[#18283D] font-extrabold tracking-tight">
              How ATLAS transforms career preparation.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Six deliberate steps connecting who you are today with the technical proof needed to clear candidate screening filters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">01</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Build your profile
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Provide your educational background, current standing, and available weekly study hours without filling out bloated forms.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">02</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Choose your direction
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Select from 13+ calibrated career paths—from Software Engineering to Data Science—or define a custom interdisciplinary target role.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">03</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Demonstrate your skills
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Complete role-specific scenario evaluations that test practical technical application and diagnostic thinking rather than rote memory.
              </p>
            </div>

            {/* Step 04 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">04</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Understand your gaps
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                See exactly where your demonstrated scores differ from role thresholds, identifying the specific bottlenecks causing rejection.
              </p>
            </div>

            {/* Step 05 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">05</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Follow your roadmap
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Follow an action sequence where your largest deficit becomes Step 01, with weekly hours divided proportionally by need.
              </p>
            </div>

            {/* Step 06 */}
            <div className="p-6 rounded-2xl glass-panel hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all space-y-3 card-interactive">
              <span className="font-mono text-3xl font-extrabold text-[#8B6F5A] block">06</span>
              <h3 className="text-base text-[#18283D] font-bold">
                Build evidence
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Log production-grade artifacts, code repositories, and technical defense memos ready for evaluation in senior interviews.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FROM CONFUSION TO CLARITY */}
        {/* ========================================================================= */}
        <section id="why-atlas" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 5 Columns: Problem Framing */}
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block">
                From Confusion to Clarity
              </span>
              <h2 className="text-3xl sm:text-4xl text-[#18283D] font-extrabold tracking-tight leading-tight">
                Generic career advice is broken. ATLAS connects every dot.
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                Most candidates navigate career preparation in fragments: uncalibrated courses, random projects, and vague resume bullet points that trigger rejection from applicant tracking systems.
              </p>
              <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
                ATLAS connects the entire pipeline so every study hour directly moves the needle on technical clearance.
              </p>
            </div>

            {/* Right 7 Columns: Visual Comparison Loop */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Box 1: Fragmented Traditional Path */}
              <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-rose-500/30 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-500/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-bold text-xs uppercase text-rose-400 font-mono tracking-wider">
                    Fragmented Preparation
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-[#4B5563]">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Generic certificates without measurable evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>No clarity on which skills cause screening rejection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Equal time wasted on already-mastered concepts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Toy projects that fail senior technical scrutiny</span>
                  </li>
                </ul>
              </div>

              {/* Box 2: ATLAS Connected Loop */}
              <div className="p-6 rounded-2xl glass-panel-elevated border-2 border-[#8B6F5A]/40 space-y-4 shadow-md">
                <div className="flex items-center gap-2 pb-2 border-b border-[#D8C3A5]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B6F5A]"></span>
                  <span className="font-bold text-xs uppercase text-[#8B6F5A] font-mono tracking-wider">
                    The ATLAS Intelligence Loop
                  </span>
                </div>

                <ul className="space-y-3 text-xs text-[#4B5563]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B6F5A] font-bold">✓</span>
                    <span>Calibrated directly against target role thresholds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B6F5A] font-bold">✓</span>
                    <span>Identifies exact screening bottlenecks immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B6F5A] font-bold">✓</span>
                    <span>Allocates study hours proportionally to actual deficits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#8B6F5A] font-bold">✓</span>
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
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#E5E7EB]">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block">
              Dynamic Personalization
            </span>
            <h2 className="text-3xl sm:text-4xl text-[#18283D] font-extrabold tracking-tight">
              Calibrated around you, not a generic curriculum.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              ATLAS dynamically adapts the competency framework, diagnostic evaluations, and roadmaps around your exact parameters:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">school</span>
              <h3 className="text-base text-[#18283D] font-bold">Background &amp; Standing</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Whether you are a 1st-year student, recent graduate fresher, or early-career professional pivoting into tech.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">target</span>
              <h3 className="text-base text-[#18283D] font-bold">Target Trajectory</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Competency benchmarks tailored to your specific role requirements across engineering, data, design, or security.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">speed</span>
              <h3 className="text-base text-[#18283D] font-bold">Demonstrated Capability</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Empirical diagnostic scoring that identifies your specific strengths and isolates critical deficits.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">schedule</span>
              <h3 className="text-base text-[#18283D] font-bold">Available Study Time</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Whether you have 5, 10, or 20 hours per week, every sprint schedule adjusts to fit your real-world calendar.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">verified</span>
              <h3 className="text-base text-[#18283D] font-bold">Verified Evidence</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Turn learning into demonstrable repositories, dashboards, and architectural write-ups interviewers trust.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel space-y-3 card-interactive">
              <span className="material-symbols-outlined text-[#8B6F5A] text-[28px]">autorenew</span>
              <h3 className="text-base text-[#18283D] font-bold">Continuous Recalibration</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                As you clear milestone sprints and re-evaluate competencies, your roadmap automatically updates to your next priority.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: CAREER PATHS & ROLES */}
        {/* ========================================================================= */}
        <section id="career-paths" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#E5E7EB]">
          <div className="max-w-3xl mb-8 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block">
              Supported Trajectories
            </span>
            <h2 className="text-3xl sm:text-4xl text-[#18283D] font-extrabold tracking-tight">
              Explore calibrated career directions.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              ATLAS maintains deep competency architectures across major tech sectors. Select a category to inspect evaluated skills:
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 pb-6 border-b border-[#E5E7EB] mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedRoleCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all duration-180 cursor-pointer ${
                  selectedRoleCategory === cat
                    ? 'bg-[#18283D] text-[#FAF7F2] font-semibold border border-[#18283D] shadow-xs'
                    : 'bg-[#FAF7F2] border border-[#E5E7EB] text-[#6B7280] hover:text-[#18283D] hover:border-[#8B6F5A]/50 hover:bg-[#D8C3A5]/15 hover:-translate-y-0.5'
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
                className="p-6 rounded-2xl glass-panel flex flex-col justify-between hover:border-[#8B6F5A]/60 hover:shadow-xl hover:-translate-y-1 hover:bg-[#D8C3A5]/5 transition-all card-interactive"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D8C3A5]/25 text-[#8B6F5A]">
                      {role.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#8B6F5A] font-semibold">
                      Threshold: {role.roleThreshold}%
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#18283D] mt-1">{role.name}</h3>
                  <p className="text-xs text-[#6B7280] mt-2 line-clamp-2 leading-relaxed">
                    {role.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E7EB]">
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase block mb-1.5 font-bold">
                    Evaluated Competencies:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#E5E7EB] text-[11px] text-[#4B5563]">
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
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-b border-[#E5E7EB]">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8B6F5A] font-bold block">
              Platform Modules
            </span>
            <h2 className="text-3xl sm:text-4xl text-[#18283D] font-extrabold tracking-tight">
              Everything you need to navigate your transition.
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Six integrated tools purpose-built to eliminate guesswork from preparation to interview defense:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Career Diagnosis</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Understand where you currently stand with transparent readiness dial metrics and primary bottleneck identification.
              </p>
            </div>

            {/* Module 2 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Skill Gap Analysis</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                See exactly which capabilities need immediate attention, with high, medium, and low priority screening categorization.
              </p>
            </div>

            {/* Module 3 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">pie_chart</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Resource Allocation</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Understand where your learning time should go with weekly hours divided mathematically by deficit weightings.
              </p>
            </div>

            {/* Module 4 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">alt_route</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Career Roadmap</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Turn abstract deficits into practical, sequential milestones with specific drills, project specifications, and defense write-ups.
              </p>
            </div>

            {/* Module 5 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">shield</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Evidence Locker</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Build verifiable proof of capability, track project repositories, and rehearse recorded interview defense drills.
              </p>
            </div>

            {/* Module 6 */}
            <div className="p-6 rounded-2xl glass-panel space-y-2.5 card-interactive">
              <div className="w-10 h-10 rounded-xl bg-[#D8C3A5]/25 border border-[#D8C3A5] text-[#8B6F5A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">map</span>
              </div>
              <h3 className="text-base text-[#18283D] font-bold">Career Map</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                See how your current position connects to your vertical trajectory, viable lateral branches, and compensation milestones.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: FINAL CTA */}
        {/* ========================================================================= */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#18283D] tracking-tight leading-tight">
              Your next career move should be <span className="text-[#18283D]">intentional.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed">
              Create your ATLAS profile and build a career path based on where you are, where you want to go, and what you need to prove along the way.
            </p>
            <div className="pt-2">
              <Link
                to="/onboarding"
                className="btn-interactive inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#18283D] hover:bg-[#223752] hover:border-[#D8C3A5]/60 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] border border-transparent text-[#FAF7F2] font-semibold text-base transition-all shadow-sm group"
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
