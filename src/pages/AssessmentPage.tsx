import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedProgressBar } from '../components/motion/Motion';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { AssessmentApiService } from '../services/assessmentService';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, roleDefinition, hasProfile, recordAssessmentAnswer, completeAssessment } = useAtlas();

  // Dynamically load questions for the user's active role
  const questions = useMemo(() => {
    return roleDefinition.skills.flatMap((s) => s.assessmentQuestions);
  }, [roleDefinition]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentQ = questions[currentIndex] || questions[0];
  const [selectedOption, setSelectedOption] = useState<number | null>(() => {
    return currentQ ? state.assessmentAnswers[currentQ.id] ?? null : null;
  });
  const [errorNotice, setErrorNotice] = useState<string>('');

  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100);

  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    const q = questions[index];
    setSelectedOption(state.assessmentAnswers[q.id] ?? null);
    setErrorNotice('');
  };

  const handleChooseOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setErrorNotice('');
    if (currentQ) {
      recordAssessmentAnswer(currentQ.id, optionIndex);
    }
  };

  const handleNext = () => {
    if (currentQ && selectedOption === null && state.assessmentAnswers[currentQ.id] === undefined) {
      setErrorNotice('Please select an answer to proceed.');
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      handleSelectQuestion(currentIndex + 1);
    } else {
      completeAssessment();
      const token = SupabaseAuthService.getAccessToken();
      if (token) {
        const answers = {
          ...state.assessmentAnswers,
          ...(currentQ && selectedOption !== null ? { [currentQ.id]: selectedOption } : {}),
        };
        AssessmentApiService.submitAssessment(
          roleDefinition.id,
          answers,
          questions,
          state.selfRatings,
          token
        ).catch((err) => {
          console.warn('[AssessmentPage] Background assessment submit failed:', err);
        });
      }
      navigate('/assessment/result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
        <Header />
        <main className="w-full pt-28 flex-1 max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#f6f3ed] border border-[#e5e2dc] flex items-center justify-center text-[#6b4ea6] text-2xl font-bold mb-4">
            ?
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0d1f18] mb-2">
            Complete your ATLAS profile to begin.
          </h2>
          <p className="text-xs text-[#424845] mb-6">
            ATLAS calibrates assessment questions around your chosen target career trajectory. Create your profile first.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-lg bg-[#0d1f18] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#22382f]"
          >
            Create my profile →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Status & Context */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#eaddff] text-[#25005a] font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Competency Assessment // {state.targetRole}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-label-sm text-label-sm text-[#424845] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#6b4ea6] animate-pulse"></span>
                Standardized Evaluation Protocol
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#737874]">
              <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">timer</span>
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
            <div className="max-w-3xl">
              <h1 className="font-headline-lg text-headline-lg text-[#0d1f18] tracking-tight leading-tight">
                Let's understand what you can actually demonstrate.
              </h1>
              <p className="font-body-md text-body-md text-[#424845] mt-1">
                Scenario-based evaluation measuring real-world production standards for <strong className="text-[#0d1f18]">{state.targetRole}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#f6f3ed] border border-[#e5e2dc] shrink-0 card-interactive">
              <span className="material-symbols-outlined text-[18px] text-[#6b4ea6]">equalizer</span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#0d1f18]">Progress: {progressPercent}%</span>
                <span className="text-[#737874]">{Object.keys(state.assessmentAnswers).length} answered</span>
              </div>
            </div>
          </div>

          {/* Smooth Linear Progress Bar */}
          <AnimatedProgressBar
            value={progressPercent}
            className="w-full h-1.5"
            trackClassName="bg-[#e5e2dc] rounded-full overflow-hidden"
            fillClassName="bg-[#6b4ea6] rounded-full"
            durationMs={350}
          />
        </div>

        {errorNotice && (
          <div className="mb-4 p-3 bg-[#ffdad6] text-[#93000a] text-xs font-semibold rounded flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Main Diagnostic Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 8 COLUMNS: QUESTION DOSSIER */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div
              key={currentQ.id}
              className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-[#e5e2dc] space-y-6 animate-fade-in"
            >
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f1eee7]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#ebe8e2] text-[#1c1c18] font-label-sm text-label-sm font-semibold uppercase">
                    Skill: {currentQ.skill}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm uppercase">
                    Difficulty: {currentQ.difficulty}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#eaddff] text-[#25005a] font-label-sm text-label-sm uppercase font-semibold">
                    Domain: {currentQ.domain}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#737874]">Item ID: {currentQ.id}</span>
              </div>

              {/* Scenario Context Box (if present) */}
              {currentQ.scenarioContext && (
                <div className="p-4 rounded-lg bg-[#f6f3ed] border-l-4 border-[#6b4ea6] text-xs text-[#424845] font-mono leading-relaxed overflow-x-auto">
                  <span className="font-bold text-[#0d1f18] uppercase tracking-wider block mb-1 font-sans">
                    Scenario Code Context:
                  </span>
                  <pre className="whitespace-pre-wrap">{currentQ.scenarioContext}</pre>
                </div>
              )}

              {/* Main Question Text */}
              <div className="space-y-2">
                <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider block">
                  Technical Screening Prompt:
                </span>
                <h3 className="font-headline-sm text-headline-sm text-[#0d1f18] leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((optionText, idx) => {
                  const isChecked = selectedOption === idx || state.assessmentAnswers[currentQ.id] === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleChooseOption(idx)}
                      className={`card-interactive p-4 rounded-lg border cursor-pointer flex items-start gap-4 ${
                        isChecked
                          ? 'border-[#0d1f18] bg-[#f6f3ed] shadow-xs'
                          : 'border-[#e5e2dc] bg-white hover:border-[#c2c8c3] hover:bg-[#fcf9f3]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isChecked ? 'bg-[#0d1f18] text-white' : 'bg-[#ebe8e2] text-[#424845]'
                        }`}
                      >
                        {optionLetters[idx]}
                      </div>
                      <div className="text-body-md text-body-md text-[#1c1c18] leading-relaxed pt-0.5">
                        {optionText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#f1eee7]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`btn-interactive px-5 py-2.5 rounded font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center gap-2 ${
                    currentIndex === 0
                      ? 'text-[#c2c8c3] cursor-not-allowed'
                      : 'text-[#424845] hover:bg-[#ebe8e2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-interactive px-6 py-2.5 rounded bg-[#0d1f18] hover:bg-[#22382f] text-white font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center gap-2 shadow-xs"
                  >
                    <span>{currentIndex === totalQuestions - 1 ? 'Complete & Score Evaluation' : 'Next Question'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: PROGRESS RAIL & QUESTION MATRIX */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e2dc] space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1eee7] pb-3">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#0d1f18] font-bold">
                  Screening Matrix ({totalQuestions})
                </span>
                <span className="font-label-sm text-[11px] text-[#737874]">
                  {Object.keys(state.assessmentAnswers).length}/{totalQuestions} Answered
                </span>
              </div>

              {/* Grid of Question Number Badges */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = state.assessmentAnswers[q.id] !== undefined;

                  let badgeStyle = 'bg-[#f6f3ed] text-[#737874] border-[#e5e2dc] hover:border-[#c2c8c3]';
                  if (isCurrent) {
                    badgeStyle = 'bg-[#6b4ea6] text-white border-[#6b4ea6] font-bold shadow-xs';
                  } else if (isAnswered) {
                    badgeStyle = 'bg-[#d2e7dc] text-[#0d1f18] border-[#a5d6a7] font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-9 rounded border text-xs flex flex-col items-center justify-center transition-all ${badgeStyle}`}
                      title={`${q.skill} (${q.difficulty})`}
                    >
                      <span>Q{idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#f1eee7] space-y-1.5 text-xs text-[#737874]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#6b4ea6]"></span>
                  <span>Active Item</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#d2e7dc] border border-[#a5d6a7]"></span>
                  <span>Answer Recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#f6f3ed] border border-[#e5e2dc]"></span>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      <Footer />
    </div>
  );
};
