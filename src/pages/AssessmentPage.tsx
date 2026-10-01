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
      // Handle coding question advance:
      // If user hasn't explicitly checked or skipped:
      const existing = state.codingAnswers?.[currentQ.id];
      if (!existing && !codingFeedback) {
        if (codingInput.trim()) {
          const isMatch = verifyCodingAnswer(currentQ.expectedOutput || '', codingInput);
          recordCodingAnswer(currentQ.id, codingInput, isMatch ? 'correct' : 'incorrect');
        } else {
          // If empty and next clicked, mark as skipped without blocking
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
  const isCoding = currentQ.type === 'coding';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f3]">
      <Header />

      <PageTransition className="w-full pt-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Status & Context */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-[#eaddff] text-[#25005a] font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Hybrid Competency Assessment // {state.targetRole}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-label-sm text-label-sm text-[#424845] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#6b4ea6] animate-pulse"></span>
                50% Conceptual Theory • 50% Applied Coding
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#737874]">
              <span className="px-2 py-0.5 rounded bg-[#f1eee7] text-[#0d1f18] font-semibold">
                {theoryCount} Theory / {codingCount} Coding
              </span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#6b4ea6]">timer</span>
                <span>Question {currentIndex + 1} of {totalQuestions}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
            <div className="max-w-3xl">
              <h1 className="font-headline-lg text-headline-lg text-[#0d1f18] tracking-tight leading-tight">
                {isCoding ? 'Applied Competency: Code Tracing Challenge' : "Let's understand what you can actually demonstrate."}
              </h1>
              <p className="font-body-md text-body-md text-[#424845] mt-1">
                {isCoding
                  ? 'Trace execution deterministically and enter the exact output. You can check your answer or skip without penalty.'
                  : `Scenario-based evaluation measuring real-world production standards for ${state.targetRole}.`}
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#f6f3ed] border border-[#e5e2dc] shrink-0 card-interactive">
              <span className="material-symbols-outlined text-[18px] text-[#6b4ea6]">equalizer</span>
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-[#0d1f18]">Progress: {progressPercent}%</span>
                <span className="text-[#737874]">{totalAnswered} of {totalQuestions} completed</span>
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
                  {isCoding ? (
                    <span className="px-2.5 py-1 rounded bg-[#6b4ea6] text-white font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">code</span>
                      CODING CHALLENGE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-[#eaddff] text-[#25005a] font-label-sm text-label-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      THEORY // CONCEPTUAL
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded bg-[#ebe8e2] text-[#1c1c18] font-label-sm text-label-sm font-semibold uppercase">
                    Skill: {currentQ.skill}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#f1eee7] text-[#424845] font-label-sm text-label-sm uppercase">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#737874]">Item ID: {currentQ.id}</span>
              </div>

              {/* ===================== CODING CHALLENGE UI ===================== */}
              {isCoding ? (
                <div className="space-y-5">
                  {/* Problem Statement */}
                  <div className="space-y-1.5">
                    <span className="font-label-sm text-label-sm text-[#737874] uppercase tracking-wider block font-semibold">
                      Problem Statement &amp; Execution Prompt:
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-[#0d1f18] leading-snug">
                      {currentQ.title || currentQ.question}
                    </h3>
                    <p className="text-body-md text-[#424845] mt-1">
                      {currentQ.prompt || currentQ.question}
                    </p>
                  </div>

                  {/* Code Snippet Block */}
                  {currentQ.code && (
                    <div className="rounded-lg overflow-hidden border border-[#2e3440] shadow-md">
                      <div className="bg-[#1e222b] px-4 py-2 flex items-center justify-between border-b border-[#2e3440]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
                          <span className="text-[11px] font-mono text-[#8a919e] ml-2">code_snippet.{currentQ.skill.toLowerCase().includes('sql') ? 'sql' : currentQ.skill.toLowerCase().includes('python') ? 'py' : currentQ.skill.toLowerCase().includes('script') ? 'js' : 'txt'}</span>
                        </div>
                        <span className="text-[11px] font-mono text-[#8a919e] uppercase">{currentQ.skill}</span>
                      </div>
                      <pre className="p-4 bg-[#14171d] text-[#eceff4] font-mono text-sm leading-relaxed overflow-x-auto select-text">
                        <code>{currentQ.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Expected Output Input Area */}
                  <div className="space-y-2 pt-2">
                    <label htmlFor="coding-output" className="font-label-sm text-label-sm text-[#0d1f18] uppercase tracking-wider block font-bold flex items-center justify-between">
                      <span>Expected Output / Return Value:</span>
                      <span className="text-[11px] font-normal text-[#737874] lowercase font-sans">
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
                      className="w-full p-3 font-mono text-sm bg-[#fdfcf9] border border-[#c2c8c3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b4ea6] focus:border-[#6b4ea6] transition-all text-[#0d1f18]"
                    />
                  </div>

                  {/* Inline Verification Feedback Banner */}
                  {codingFeedback && (
                    <div
                      className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in ${
                        codingFeedback.status === 'correct'
                          ? 'bg-[#d2e7dc] text-[#0d1f18] border border-[#a5d6a7]'
                          : codingFeedback.status === 'skipped'
                          ? 'bg-[#ffeed9] text-[#703800] border border-[#ffcc80]'
                          : 'bg-[#ffdad6] text-[#93000a] border border-[#ffb4ab]'
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
                        <span className="text-[11px] text-[#703800]/80">
                          (Proceed with assessment — will not block submission)
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
                        className="btn-interactive px-5 py-2 rounded-lg bg-[#6b4ea6] hover:bg-[#583d8e] text-white font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center gap-2 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Check Answer</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSkipCoding}
                        className="btn-interactive px-4 py-2 rounded-lg border border-[#e5e2dc] bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#424845] hover:text-[#0d1f18] font-label-md text-label-md uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">fast_forward</span>
                        <span>Skip Challenge</span>
                      </button>
                    </div>

                    <span className="text-xs text-[#737874] italic">
                      Skipping does not block completion.
                    </span>
                  </div>
                </div>
              ) : (
                /* ===================== THEORY QUESTION UI ===================== */
                <div className="space-y-6">
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
                    {(currentQ.options || []).map((optionText, idx) => {
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
                </div>
              )}

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
                    <span>{currentIndex === totalQuestions - 1 ? 'Complete & Score Assessment' : 'Next Question'}</span>
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
                  Hybrid Matrix ({totalQuestions})
                </span>
                <span className="font-label-sm text-[11px] text-[#737874]">
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

                  let badgeStyle = 'bg-[#f6f3ed] text-[#737874] border-[#e5e2dc] hover:border-[#c2c8c3]';
                  let symbol = isQCoding ? 'C' : 'T';

                  if (isCurrent) {
                    badgeStyle = 'bg-[#6b4ea6] text-white border-[#6b4ea6] font-bold shadow-xs';
                  } else if (isQCoding && codingAns) {
                    if (codingAns.status === 'correct') {
                      badgeStyle = 'bg-[#d2e7dc] text-[#0d1f18] border-[#a5d6a7] font-semibold';
                    } else if (codingAns.status === 'skipped') {
                      badgeStyle = 'bg-[#ffeed9] text-[#703800] border-[#ffcc80] font-semibold';
                    } else {
                      badgeStyle = 'bg-[#ffdad6] text-[#93000a] border-[#ffb4ab] font-semibold';
                    }
                  } else if (!isQCoding && isTheoryAnswered) {
                    badgeStyle = 'bg-[#d2e7dc] text-[#0d1f18] border-[#a5d6a7] font-semibold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-10 rounded border text-xs flex flex-col items-center justify-center transition-all ${badgeStyle}`}
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
              <div className="pt-2 border-t border-[#f1eee7] space-y-1.5 text-xs text-[#737874]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#6b4ea6]"></span>
                  <span>Active Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#d2e7dc] border border-[#a5d6a7]"></span>
                  <span>Demonstrated / Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#ffeed9] border border-[#ffcc80]"></span>
                  <span>Skipped (Competency Pending)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#ffdad6] border border-[#ffb4ab]"></span>
                  <span>Gap Signal Recorded</span>
                </div>
              </div>
            </div>

            {/* Assessment Format Guide Box */}
            <div className="bg-[#f6f3ed] rounded-xl p-5 border border-[#e5e2dc] space-y-2">
              <div className="flex items-center gap-2 text-[#6b4ea6] font-semibold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>Hybrid Evaluation Protocol</span>
              </div>
              <p className="text-xs text-[#424845] leading-relaxed">
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
