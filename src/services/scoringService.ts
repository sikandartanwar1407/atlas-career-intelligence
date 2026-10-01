import {
  SkillKey,
  PriorityLevel,
  SkillGapDetail,
  SkillAllocation,
  RoadmapStep,
  RoadmapAction,
  RoleDefinition
} from '../types/atlas';

export function calculateSkillGaps(
  roleDef: RoleDefinition,
  selfRatings: Record<SkillKey, number>,
  demonstratedScores?: Record<SkillKey, number>,
  customThresholds?: Partial<Record<SkillKey, number>>
): SkillGapDetail[] {
  return roleDef.skills.map((skillConfig) => {
    const key = skillConfig.name;
    const baseline = selfRatings[key] ?? skillConfig.defaultBaseline;
    const threshold = customThresholds?.[key] ?? skillConfig.targetThreshold;
    const demonstrated = demonstratedScores?.[key] ?? baseline;
    const gap = Math.max(threshold - demonstrated, 0);

    let priority: PriorityLevel = 'LOW PRIORITY';
    if (gap >= 25) {
      priority = 'HIGH PRIORITY';
    } else if (gap >= 12) {
      priority = 'MEDIUM PRIORITY';
    }

    let evidenceStatus: 'Missing' | 'Moderate' | 'Strong' | 'Unverified' = 'Unverified';
    if (gap >= 25) {
      evidenceStatus = 'Missing';
    } else if (gap >= 12) {
      evidenceStatus = 'Moderate';
    } else {
      evidenceStatus = 'Strong';
    }

    return {
      skill: key,
      displayName: skillConfig.name,
      baseline,
      demonstrated,
      roleThreshold: threshold,
      gap,
      priority,
      description: gap >= 20 ? skillConfig.criticalDeficitDescription : skillConfig.onTrackDescription,
      strategicNote: skillConfig.description,
      evidenceStatus
    };
  }).sort((a, b) => b.gap - a.gap); // Strictly sorted by highest gap descending
}

export function normalizeCodeOutput(text: string | null | undefined): string {
  if (!text) return '';
  // 1. Normalize line endings and trim outer whitespace
  let norm = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  // 2. Standardize curly quotes
  norm = norm.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  // 3. Trim individual lines
  const lines = norm.split('\n').map((l) => l.trim());
  return lines.join('\n').trim();
}

export function verifyCodingAnswer(expected: string, submitted: string | null | undefined): boolean {
  const normExp = normalizeCodeOutput(expected);
  const normSub = normalizeCodeOutput(submitted);
  if (!normSub) return false;

  if (normExp === normSub) return true;
  if (normExp.toLowerCase() === normSub.toLowerCase()) return true;
  // Compare numbers / punctuation tolerance
  if (normExp.replace(/[,;.]/g, '') === normSub.replace(/[,;.]/g, '')) return true;
  return false;
}

export function scoreAssessmentAnswers(
  roleDef: RoleDefinition,
  answers: Record<string, number>,
  selfRatings: Record<SkillKey, number>,
  codingAnswers?: Record<string, { submittedText: string; status: 'correct' | 'incorrect' | 'skipped' }>
): {
  overallDemonstrated: number;
  largestGapSkill: SkillKey;
  theoryScore: number;
  codingScore: number;
  theoryCorrectCount: number;
  theoryTotalCount: number;
  codingCorrectCount: number;
  codingSkippedCount: number;
  codingTotalCount: number;
  skillScores: Record<SkillKey, {
    baseline: number;
    demonstrated: number;
    threshold: number;
    gap: number;
    theoryPerformance: string;
    codingPerformance: string;
    competencyStatus: 'demonstrated' | 'gap_signal' | 'skipped';
  }>;
} {
  const skillScores: Record<SkillKey, {
    baseline: number;
    demonstrated: number;
    threshold: number;
    gap: number;
    theoryPerformance: string;
    codingPerformance: string;
    competencyStatus: 'demonstrated' | 'gap_signal' | 'skipped';
  }> = {};

  let totalTheoryCorrect = 0;
  let totalTheoryCount = 0;
  let totalCodingCorrect = 0;
  let totalCodingSkipped = 0;
  let totalCodingCount = 0;

  for (const skillConfig of roleDef.skills) {
    const skill = skillConfig.name;
    const questions = skillConfig.assessmentQuestions;
    const baseline = selfRatings[skill] ?? skillConfig.defaultBaseline;
    const threshold = skillConfig.targetThreshold;

    let theoryCorrect = 0;
    let theoryTotal = 0;
    let codingCorrect = 0;
    let codingSkipped = 0;
    let codingTotal = 0;

    for (const q of questions) {
      if (q.type === 'coding') {
        codingTotal++;
        totalCodingCount++;
        const ansVal = answers[q.id];
        const sub = codingAnswers?.[q.id];

        if (ansVal === 1 || sub?.status === 'correct') {
          codingCorrect++;
          totalCodingCorrect++;
        } else if (ansVal === -1 || sub?.status === 'skipped') {
          codingSkipped++;
          totalCodingSkipped++;
        }
      } else {
        // Theory Question
        theoryTotal++;
        totalTheoryCount++;
        const ansVal = answers[q.id];
        if (ansVal !== undefined && ansVal === q.correctAnswer) {
          theoryCorrect++;
          totalTheoryCorrect++;
        }
      }
    }

    const totalQuestions = theoryTotal + codingTotal;
    const totalCorrect = theoryCorrect + codingCorrect;
    let demonstrated = baseline;

    if (totalQuestions > 0) {
      demonstrated = Math.round((totalCorrect / totalQuestions) * 100);
    }

    const gap = Math.max(threshold - demonstrated, 0);

    let theoryPerformance = `${theoryCorrect}/${theoryTotal} Demonstrated`;
    let codingPerformance = `${codingCorrect}/${codingTotal} Demonstrated`;
    if (codingSkipped > 0 && codingCorrect === 0) {
      codingPerformance = 'Skipped — competency not demonstrated';
    } else if (codingTotal > 0 && codingCorrect === 0) {
      codingPerformance = '0/' + codingTotal + ' (Skill gap signal)';
    }

    let competencyStatus: 'demonstrated' | 'gap_signal' | 'skipped' = 'demonstrated';
    if (codingSkipped > 0 && codingCorrect === 0 && theoryCorrect === 0) {
      competencyStatus = 'skipped';
    } else if (gap >= 15) {
      competencyStatus = 'gap_signal';
    }

    skillScores[skill] = {
      baseline,
      demonstrated,
      threshold,
      gap,
      theoryPerformance,
      codingPerformance,
      competencyStatus
    };
  }

  // Calculate overall demonstrated competency
  const sumDemonstrated = Object.values(skillScores).reduce((acc, curr) => acc + curr.demonstrated, 0);
  const overallDemonstrated = Math.round(sumDemonstrated / Math.max(roleDef.skills.length, 1));

  const theoryScore = totalTheoryCount > 0 ? Math.round((totalTheoryCorrect / totalTheoryCount) * 100) : 0;
  const codingScore = totalCodingCount > 0 ? Math.round((totalCodingCorrect / totalCodingCount) * 100) : 0;

  // Determine largest gap purely from mathematics
  let largestGap = -1;
  let largestGapSkill: SkillKey = roleDef.skills[0]?.name || 'Core Competency';

  for (const skill of roleDef.skills.map((s) => s.name)) {
    if (skillScores[skill] && skillScores[skill].gap > largestGap) {
      largestGap = skillScores[skill].gap;
      largestGapSkill = skill;
    }
  }

  return {
    overallDemonstrated,
    largestGapSkill,
    theoryScore,
    codingScore,
    theoryCorrectCount: totalTheoryCorrect,
    theoryTotalCount: totalTheoryCount,
    codingCorrectCount: totalCodingCorrect,
    codingSkippedCount: totalCodingSkipped,
    codingTotalCount: totalCodingCount,
    skillScores
  };
}

export function calculateResourceAllocation(
  availableHours: number,
  skillGaps: SkillGapDetail[]
): SkillAllocation[] {
  if (skillGaps.length === 0) return [];

  const weights: Record<SkillKey, number> = {};
  let totalWeight = 0;

  for (const item of skillGaps) {
    let weight = item.gap > 0 ? item.gap : 5;
    if (item.priority === 'HIGH PRIORITY') {
      weight *= 1.4;
    }
    weights[item.skill] = weight;
    totalWeight += weight;
  }

  let allocatedSum = 0;
  const allocations: SkillAllocation[] = skillGaps.map((item) => {
    const rawHours = (weights[item.skill] / Math.max(totalWeight, 1)) * availableHours;
    const rounded = Math.round(rawHours * 2) / 2;
    allocatedSum += rounded;
    return {
      skill: item.skill,
      gap: item.gap,
      priority: item.priority,
      allocatedHours: rounded,
      percentage: Math.round((rounded / Math.max(availableHours, 1)) * 100)
    };
  });

  // Reconcile rounding to equal availableHours exactly
  const diff = Math.round((availableHours - allocatedSum) * 2) / 2;
  if (diff !== 0 && allocations.length > 0) {
    allocations[0].allocatedHours = Math.max(0.5, allocations[0].allocatedHours + diff);
    allocations[0].percentage = Math.round((allocations[0].allocatedHours / availableHours) * 100);
  }

  return allocations;
}

export function generateRoadmap(
  roleDef: RoleDefinition,
  skillGaps: SkillGapDetail[],
  allocations: SkillAllocation[],
  existingProgress?: Record<string, { completed: boolean; completedActionIds: string[] }>
): RoadmapStep[] {
  // Sort strictly by gap descending: highest priority gap becomes Step 01
  const sortedGaps = [...skillGaps].sort((a, b) => b.gap - a.gap);

  return sortedGaps.map((item, index) => {
    const skillConfig = roleDef.skills.find((s) => s.name === item.skill) || roleDef.skills[0];
    const alloc = allocations.find((a) => a.skill === item.skill);
    const allocatedHours = alloc?.allocatedHours ?? 2.5;

    let estimatedWeeks = '2 Weeks';
    if (item.gap >= 25) estimatedWeeks = '3 Weeks';
    else if (item.gap >= 12) estimatedWeeks = '2 Weeks';
    else estimatedWeeks = '1 Week';

    const stepId = `step-${item.skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const actions: RoadmapAction[] = skillConfig.learningActions.map((act, aIdx) => ({
      id: `${stepId}-act-${aIdx + 1}`,
      title: act.title,
      description: act.description,
      estimatedMinutes: act.estimatedMinutes,
      type: act.type
    }));

    const progress = existingProgress?.[stepId];
    const completedActionIds = progress?.completedActionIds ?? [];
    const completed = progress?.completed ?? (completedActionIds.length === actions.length && actions.length > 0);

    return {
      id: stepId,
      stepNumber: index + 1,
      skill: item.skill,
      priority: item.priority,
      gap: item.gap,
      allocatedHours,
      estimatedDurationWeeks: estimatedWeeks,
      title: skillConfig.name,
      description: skillConfig.description,
      actions,
      completed,
      completedActionIds
    };
  });
}
