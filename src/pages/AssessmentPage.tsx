import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAtlas } from '../context/AtlasContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageTransition, AnimatedProgressBar } from '../components/motion/Motion';
import { SupabaseAuthService } from '../services/supabaseAuth';
import { AssessmentApiService } from '../services/assessmentService';
import { RoadmapApiService } from '../services/roadmapService';
import { verifyCodingAnswer } from '../services/scoringService';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    roleDefinition,
    hasProfile,
    recordAssessmentAnswer,
    recordCodingAnswer,
    completeAssessment
  } = useAtlas();

  // Dynamically load questions for the user's active role (mixed theory & coding)
  const questions = useMemo(() => {
    return roleDefinition.skills.flatMap((s) => s.assessmentQuestions);
  }, [roleDefinition]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentQ = questions[currentIndex] || questions[0];

  // Local state for current question interaction
  const [selectedOption, setSelectedOption] = useState<number | null>(() => {
    return currentQ && currentQ.type !== 'coding' ? (state.assessmentAnswers[currentQ.id] ?? null) : null;
  });

  const [codingInput, setCodingInput] = useState<string>(() => {
    return (currentQ && state.codingAnswers?.[currentQ.id]?.submittedText) || '';
  });

  const [codingFeedback, setCodingFeedback] = useState<{
    status: 'correct' | 'incorrect' | 'skipped';
    message: string;
  } | null>(() => {
    if (currentQ && state.codingAnswers?.[currentQ.id]) {
      const ca = state.codingAnswers[currentQ.id];
      if (ca.status === 'correct') {
        return { status: 'correct', message: '✓ Output verified! Competency demonstrated.' };
      }
      if (ca.status === 'incorrect') {
        return { status: 'incorrect', message: '✕ Output mismatch — gap signal recorded.' };
      }
      if (ca.status === 'skipped') {
        return { status: 'skipped', message: '↷ Skipped — competency not demonstrated.' };
      }
    }
    return null;
  });

  const [errorNotice, setErrorNotice] = useState<string>('');

  const totalQuestions = questions.length;
  const theoryCount = useMemo(() => questions.filter((q) => q.type !== 'coding').length, [questions]);
  const codingCount = useMemo(() => questions.filter((q) => q.type === 'coding').length, [questions]);

  // Sync state when switching question
  useEffect(() => {
    if (!currentQ) return;
    setErrorNotice('');
    if (currentQ.type === 'coding') {
      const saved = state.codingAnswers?.[currentQ.id];
      setCodingInput(saved?.submittedText || '');
      if (saved) {
        if (saved.status === 'correct') {
          setCodingFeedback({ status: 'correct', message: '✓ Output verified! Competency demonstrated.' });
        } else if (saved.status === 'incorrect') {
          setCodingFeedback({ status: 'incorrect', message: '✕ Output mismatch — gap signal recorded.' });
        } else {
          setCodingFeedback({ status: 'skipped', message: '↷ Skipped — competency not demonstrated.' });
        }
      } else {
        setCodingFeedback(null);
      }
    } else {
      setSelectedOption(state.assessmentAnswers[currentQ.id] ?? null);
      setCodingFeedback(null);
    }
  }, [currentIndex, currentQ, state.assessmentAnswers, state.codingAnswers]);

  const answeredTheoryCount = Object.keys(state.assessmentAnswers).length;
  const answeredCodingCount = Object.keys(state.codingAnswers || {}).length;
  const totalAnswered = answeredTheoryCount + answeredCodingCount;
  const progressPercent = Math.round(((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100);

  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const handleChooseOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setErrorNotice('');
    if (currentQ) {
      recordAssessmentAnswer(currentQ.id, optionIndex);
    }
  };

  const handleCheckCodingAnswer = () => {
    if (!currentQ || currentQ.type !== 'coding') return;
    setErrorNotice('');

    if (!codingInput.trim()) {
      setErrorNotice('Please enter the expected output or click "Skip Challenge".');
      return;
    }

    const isMatch = verifyCodingAnswer(currentQ.expectedOutput || '', codingInput);
    if (isMatch) {
      setCodingFeedback({
        status: 'correct',
        message: '✓ Output verified! Competency demonstrated.'
      });
      recordCodingAnswer(currentQ.id, codingInput, 'correct');
    } else {
      setCodingFeedback({
        status: 'incorrect',
        message: '✕ Output mismatch. Check execution tracing or formatting.'
      });
      recordCodingAnswer(currentQ.id, codingInput, 'incorrect');
    }
  };

  const handleSkipCoding = () => {
    if (!currentQ || currentQ.type !== 'coding') return;
    setErrorNotice('');
    setCodingFeedback({
      status: 'skipped',
      message: '↷ Skipped — competency not demonstrated.'
    });
    recordCodingAnswer(currentQ.id, '', 'skipped');

    // Automatically advance to next question after brief moment for smooth flow
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        handleSelectQuestion(currentIndex + 1);
      }
    }, 400);
  };

  const handleNext = () => {
    if (!currentQ) return;

    // Handle theory question validation
    if (currentQ.type !== 'coding') {
      if (selectedOption === null && state.assessmentAnswers[currentQ.id] === undefined) {
        setErrorNotice('Please select an answer to proceed.');
        return;
      }
    } else {
      const existing = state.codingAnswers?.[currentQ.id];
      if (!existing && !codingFeedback) {
        if (codingInput.trim()) {
          const isMatch = verifyCodingAnswer(currentQ.expectedOutput || '', codingInput);
          recordCodingAnswer(currentQ.id, codingInput, isMatch ? 'correct' : 'incorrect');
        } else {
          recordCodingAnswer(currentQ.id, '', 'skipped');
        }
      }
    }

    if (currentIndex < totalQuestions - 1) {
      handleSelectQuestion(currentIndex + 1);
    } else {
      completeAssessment();
      const token = SupabaseAuthService.getAccessToken();
      if (token) {
        const answers = {
          ...state.assessmentAnswers,
          ...(currentQ.type !== 'coding' && selectedOption !== null ? { [currentQ.id]: selectedOption } : {}),
        };
        const coding = {
          ...(state.codingAnswers || {}),
        };
        AssessmentApiService.submitAssessment(
          roleDefinition.id,
          answers,
          questions,
          state.selfRatings,
          token,
          coding
        ).then((submitRes) => {
          if (submitRes.success) {
            RoadmapApiService.generateRoadmap(token).catch((err) => {
              console.warn('[AssessmentPage] Roadmap generation error:', err);
            });
          }
        }).catch((err) => {
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
      <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9]">
        <Header />
        <main className="w-full pt-28 flex-1 max-w-xl mx-auto px-4 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 text-2xl font-bold mb-4 shadow-sm">
            ?
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">
            Complete your ATLAS profile to begin.
          </h2>
          <p className="text-xs text-[#94A3B8] mb-6">
            ATLAS calibrates assessment questions around your chosen target career trajectory. Create your profile first.
          </p>
          <Link
            to="/onboarding"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm btn-interactive"
          >
            Create my profile →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];
  const isCoding = currentQ.type === 'coding';

  return (
    <div className="min-h-screen flex flex-col bg-[#080B16] text-[#F1F5F9] relative overflow-hidden">
      <Header />

      <PageTransition className="w-full pt-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Status & Context */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono text-xs uppercase tracking-wider font-semibold">
                Hybrid Assessment // {state.targetRole}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-[#94A3B8] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                50% Conceptual Theory • 50% Applied Coding
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
              <span className="px-2.5 py-1 rounded-md bg-[#11182B] border border-white/10 text-white font-mono font-semibold">
                {theoryCount} Theory / {codingCount} Coding
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="material-symbols-outlined text-[16px] text-violet-400">timer</span>
                <span>Item {currentIndex + 1} of {totalQuestions}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl text-white font-extrabold tracking-tight leading-tight">
                {isCoding ? 'Applied Competency: Code Tracing Challenge' : "Conceptual Technical Verification"}
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1.5">
                {isCoding
                  ? 'Trace execution deterministically and enter the exact output. You can check your answer or skip without penalty.'
                  : `Scenario-based evaluation measuring real-world production standards for ${state.targetRole}.`}
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#11182B] border border-white/10 shrink-0 card-interactive shadow-md">
              <span className="material-symbols-outlined text-[20px] text-teal-400">equalizer</span>
              <div className="flex flex-col text-xs font-mono">
                <span className="font-bold text-white">Progress: {progressPercent}%</span>
                <span className="text-[#94A3B8] text-[11px]">{totalAnswered} of {totalQuestions} answered</span>
              </div>
            </div>
          </div>

          {/* Smooth Linear Progress Bar */}
          <AnimatedProgressBar
            value={progressPercent}
            className="w-full h-1.5"
            trackClassName="bg-[#11182B] rounded-full overflow-hidden"
            fillClassName="bg-violet-600 rounded-full shadow-sm"
            durationMs={350}
          />
        </div>

        {errorNotice && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in shadow-sm">
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
              className="glass-panel-elevated rounded-2xl p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 space-y-6 animate-fade-in"
            >
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-2">
                  {isCoding ? (
                    <span className="px-3 py-1 rounded-md bg-violet-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">code</span>
                      CODING CHALLENGE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      THEORY // CONCEPTUAL
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.05] text-white font-mono text-[11px] font-semibold uppercase">
                    Skill: {currentQ.skill}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.03] text-[#94A3B8] font-mono text-[11px] uppercase">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#64748B]">Item ID: {currentQ.id}</span>
              </div>

              {/* ===================== CODING CHALLENGE UI ===================== */}
              {isCoding ? (
                <div className="space-y-5">
                  {/* Problem Statement */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-xs text-[#94A3B8] uppercase tracking-wider block font-semibold">
                      Problem Statement &amp; Execution Prompt:
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug">
                      {currentQ.title || currentQ.question}
                    </h3>
                    <p className="text-sm text-[#CBD5E1] mt-1 leading-relaxed">
                      {currentQ.prompt || currentQ.question}
                    </p>
                  </div>

                  {/* Code Snippet Block Styled Like Modern IDE */}
                  {currentQ.code && (
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#090D18]">
                      <div className="bg-[#0F1424] px-4 py-2.5 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                          <span className="text-xs font-mono text-[#94A3B8] ml-2">solution_trace.{currentQ.skill.toLowerCase().includes('sql') ? 'sql' : currentQ.skill.toLowerCase().includes('python') ? 'py' : currentQ.skill.toLowerCase().includes('script') ? 'js' : 'ts'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-semibold">{currentQ.skill}</span>
                      </div>
                      <pre className="p-5 text-[#E2E8F0] font-mono text-sm leading-relaxed overflow-x-auto select-text bg-[#080B16]/90">
                        <code>{currentQ.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Expected Output Input Area */}
                  <div className="space-y-2 pt-2">
                    <label htmlFor="coding-output" className="font-mono text-xs text-white uppercase tracking-wider block font-bold flex items-center justify-between">
                      <span>Expected Output / Return Value:</span>
                      <span className="text-[11px] font-normal text-[#94A3B8] lowercase font-mono">
                        whitespace &amp; line endings normalized deterministically
                      </span>
                    </label>
                    <textarea
                      id="coding-output"
                      rows={3}
                      value={codingInput}
                      onChange={(e) => {
                        setCodingInput(e.target.value);
                        setErrorNotice('');
                      }}
                      placeholder="Type the exact expected output produced by the code above..."
                      className="w-full p-3.5 font-mono text-sm bg-[#0D1224] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all text-white placeholder-[#64748B]"
                    />
                  </div>

                  {/* Inline Verification Feedback Banner */}
                  {codingFeedback && (
                    <div
                      className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in shadow-md ${
                        codingFeedback.status === 'correct'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : codingFeedback.status === 'skipped'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          {codingFeedback.status === 'correct'
                            ? 'check_circle'
                            : codingFeedback.status === 'skipped'
                            ? 'fast_forward'
                            : 'cancel'}
                        </span>
                        <span>{codingFeedback.message}</span>
                      </div>

                      {codingFeedback.status === 'skipped' && (
                        <span className="text-[11px] text-amber-300/80 font-mono">
                          (Will not block completion)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Coding Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCheckCodingAnswer}
                        className="btn-interactive px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Check Answer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSkipCoding}
                        className="btn-interactive px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[#CBD5E1] hover:text-white font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">fast_forward</span>
                        <span>Skip Challenge</span>
                      </button>
                    </div>

                    <span className="text-xs font-mono text-[#64748B]">
                      Skipping does not block completion.
                    </span>
                  </div>
                </div>
              ) : (
                /* ===================== THEORY QUESTION UI ===================== */
                <div className="space-y-6">
                  {/* Scenario Context Box (if present) */}
                  {currentQ.scenarioContext && (
                    <div className="p-4 rounded-xl bg-[#0D1224] border-l-4 border-violet-500 text-xs text-[#CBD5E1] font-mono leading-relaxed overflow-x-auto">
                      <span className="font-bold text-violet-300 uppercase tracking-wider block mb-1 font-mono">
                        Scenario Code Context:
                      </span>
                      <pre className="whitespace-pre-wrap">{currentQ.scenarioContext}</pre>
                    </div>
                  )}

                  {/* Main Question Text */}
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-[#94A3B8] uppercase tracking-wider block">
                      Technical Screening Prompt:
                    </span>
                    <h3 className="text-xl font-bold text-white leading-snug">
                      {currentQ.question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {(currentQ.options || []).map((optionText, idx) => {
                      const isChecked = selectedOption === idx || state.assessmentAnswers[currentQ.id] === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleChooseOption(idx)}
                          className={`card-interactive p-4 rounded-xl border cursor-pointer flex items-start gap-4 transition-all ${
                            isChecked
                              ? 'border-violet-500 bg-violet-900/20 shadow-sm'
                              : 'border-white/10 bg-[#0D1224] hover:border-white/20 hover:bg-[#11182B]'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                              isChecked ? 'bg-violet-600 text-white shadow-sm' : 'bg-white/10 text-[#94A3B8]'
                            }`}
                          >
                            {optionLetters[idx]}
                          </div>
                          <div className="text-sm text-white leading-relaxed pt-0.5">
                            {optionText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`btn-interactive px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold flex items-center gap-2 ${
                    currentIndex === 0
                      ? 'text-white/20 cursor-not-allowed'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-interactive px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-sm"
                  >
                    <span>{currentIndex === totalQuestions - 1 ? 'Complete & Score Assessment' : 'Next Question'}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: PROGRESS RAIL & QUESTION MATRIX */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel-elevated rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-white font-bold">
                  Hybrid Matrix ({totalQuestions})
                </span>
                <span className="font-mono text-[11px] text-teal-400 font-semibold">
                  {totalAnswered}/{totalQuestions} Completed
                </span>
              </div>

              {/* Grid of Question Badges with Theory vs Coding distinction */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isQCoding = q.type === 'coding';
                  const codingAns = state.codingAnswers?.[q.id];
                  const isTheoryAnswered = state.assessmentAnswers[q.id] !== undefined;

                  let badgeStyle = 'bg-[#0D1224] text-[#94A3B8] border-white/10 hover:border-white/20 hover:text-white';
                  let symbol = isQCoding ? 'C' : 'T';

                  if (isCurrent) {
                    badgeStyle = 'bg-violet-600 text-white border-violet-400 font-bold shadow-sm';
                  } else if (isQCoding && codingAns) {
                    if (codingAns.status === 'correct') {
                      badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold';
                    } else if (codingAns.status === 'skipped') {
                      badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold';
                    } else {
                      badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold';
                    }
                  } else if (!isQCoding && isTheoryAnswered) {
                    badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-11 rounded-xl border text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${badgeStyle}`}
                      title={`${isQCoding ? '[CODING]' : '[THEORY]'} ${q.skill} (${q.difficulty})`}
                    >
                      <span className="text-[9px] font-mono opacity-80">{symbol}{idx + 1}</span>
                      <span className="text-[11px] font-bold">
                        {isQCoding && codingAns
                          ? codingAns.status === 'correct'
                            ? '✓'
                            : codingAns.status === 'skipped'
                            ? '↷'
                            : '✕'
                          : idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs font-mono text-[#94A3B8]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-violet-600 shadow-sm"></span>
                  <span className="text-white">Active Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500/30 border border-emerald-500/40"></span>
                  <span>Demonstrated / Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500/30 border border-amber-500/40"></span>
                  <span>Skipped (Challenge Pending)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-rose-500/30 border border-rose-500/40"></span>
                  <span>Gap Signal Recorded</span>
                </div>
              </div>
            </div>

            {/* Assessment Format Guide Box */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs font-mono uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Hybrid Evaluation Protocol</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Theory questions assess conceptual knowledge and best practices. Coding challenges evaluate deterministic code-tracing competency with exact normalized output verification.
              </p>
            </div>
          </div>
        </div>
      </PageTransition>

      <Footer />
    </div>
  );
};
