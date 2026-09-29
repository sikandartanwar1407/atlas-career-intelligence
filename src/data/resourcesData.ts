import { LearningResource } from '../types/atlas';

export const LEARNING_RESOURCES: LearningResource[] = [
  // Power BI
  {
    id: 'res-pbi-01',
    skill: 'Power BI',
    title: 'DAX Filter Context & Architectural Transitions',
    type: 'Course',
    difficulty: 'Advanced',
    estimatedHours: 4.0,
    provider: 'ATLAS Technical Lab',
    description: 'Deep dive into CALCULATE, USERELATIONSHIP, context transition, and star-schema dimensional performance.'
  },
  {
    id: 'res-pbi-02',
    skill: 'Power BI',
    title: 'Enterprise eCommerce Sales Intelligence Dashboard',
    type: 'Project',
    difficulty: 'Intermediate',
    estimatedHours: 4.5,
    provider: 'ATLAS Project Locker #03',
    description: 'Build an end-to-end multi-table reporting solution on 1.2M transactional records with custom fiscal date tables and row-level security.'
  },
  {
    id: 'res-pbi-03',
    skill: 'Power BI',
    title: '14 DAX Scenario Drills on Raw Transaction Data',
    type: 'Practice',
    difficulty: 'Intermediate',
    estimatedHours: 2.5,
    provider: 'ATLAS Sandbox',
    description: 'Solve real-world business scenarios: YTD metrics, rolling 30-day run-rates, customer churn cohort measures.'
  },
  {
    id: 'res-pbi-04',
    skill: 'Power BI',
    title: 'Microsoft Power BI DAX & Tabular Architecture Reference',
    type: 'Documentation',
    difficulty: 'Foundation',
    estimatedHours: 1.5,
    provider: 'Official Technical Docs',
    description: 'Authoritative guide to VertiPaq compression mechanics, table relationships, and iterator evaluation order.'
  },

  // SQL
  {
    id: 'res-sql-01',
    skill: 'SQL',
    title: 'Analytical Window Functions & Complex Grouping Masterclass',
    type: 'Course',
    difficulty: 'Intermediate',
    estimatedHours: 3.0,
    provider: 'ATLAS Query Architecture',
    description: 'Master PARTITION BY, DENSE_RANK, LEAD/LAG, sliding window frames, and recursive common table expressions.'
  },
  {
    id: 'res-sql-02',
    skill: 'SQL',
    title: 'Multi-Touch Attribution & Customer Cohort Engine',
    type: 'Project',
    difficulty: 'Advanced',
    estimatedHours: 3.5,
    provider: 'ATLAS Project Locker #02',
    description: 'Write reproducible SQL queries to calculate first-touch, last-touch, and linear marketing attribution models across 184k events.'
  },
  {
    id: 'res-sql-03',
    skill: 'SQL',
    title: '18 Enterprise Technical Interview Query Drills',
    type: 'Practice',
    difficulty: 'Intermediate',
    estimatedHours: 2.0,
    provider: 'LeetCode / ATLAS Curated',
    description: 'Targeted drills modeling tier-1 tech & fintech interview prompts: retention, gaps & islands, cumulative revenue.'
  },
  {
    id: 'res-sql-04',
    skill: 'SQL',
    title: 'PostgreSQL & Snowflake Query Optimization Guide',
    type: 'Tutorial',
    difficulty: 'Advanced',
    estimatedHours: 1.5,
    provider: 'Database Engineering Lab',
    description: 'Interpreting EXPLAIN plans, index scans vs sequential scans, and subquery flattening.'
  },

  // Data Storytelling
  {
    id: 'res-comm-01',
    skill: 'Data Storytelling',
    title: 'The Minto Pyramid: Executive Synthesis for Analysts',
    type: 'Course',
    difficulty: 'Intermediate',
    estimatedHours: 2.0,
    provider: 'ATLAS Executive Lab',
    description: 'Learn to lead with bottom-line operational recommendations, structuring quantified evidence for C-level leadership.'
  },
  {
    id: 'res-comm-02',
    skill: 'Data Storytelling',
    title: 'Author a 1-Page Strategic Decision Memorandum',
    type: 'Project',
    difficulty: 'Intermediate',
    estimatedHours: 2.5,
    provider: 'ATLAS Evidence Studio',
    description: 'Translate a complex 50-row financial BI grid into a tight 1-page executive brief with sensitivity bounds.'
  },
  {
    id: 'res-comm-03',
    skill: 'Data Storytelling',
    title: 'Chart Hygiene & Non-Technical Translation Workshop',
    type: 'Tutorial',
    difficulty: 'Foundation',
    estimatedHours: 1.5,
    provider: 'Analytical Communication',
    description: 'De-cluttering charts, choosing actionable color accents, and writing descriptive chart headlines that state conclusions.'
  },

  // Excel
  {
    id: 'res-xls-01',
    skill: 'Excel',
    title: 'Modern Excel: Dynamic Arrays, LAMBDA & Power Query',
    type: 'Course',
    difficulty: 'Intermediate',
    estimatedHours: 1.5,
    provider: 'Financial Modeling Lab',
    description: 'Streamline repetitive data tasks using modern dynamic array formulas, LET/LAMBDA functions, and automated Power Query ETL.'
  },
  {
    id: 'res-xls-02',
    skill: 'Excel',
    title: 'Parametric Financial Sensitivity Model',
    type: 'Project',
    difficulty: 'Advanced',
    estimatedHours: 2.0,
    provider: 'ATLAS Model Locker',
    description: 'Build a multi-variable scenario analysis workbook with dynamic data tables and sensitivity curves.'
  },

  // Python
  {
    id: 'res-py-01',
    skill: 'Python',
    title: 'Vectorized Pandas & High-Speed Data Wrangling',
    type: 'Course',
    difficulty: 'Intermediate',
    estimatedHours: 2.5,
    provider: 'Data Science Core',
    description: 'Eliminate slow iterrows() loops in favor of vectorized numpy operations, groupby transforms, and efficient string parsing.'
  },
  {
    id: 'res-py-02',
    skill: 'Python',
    title: 'Exploratory Data Analysis & Automated Reporting Notebook',
    type: 'Project',
    difficulty: 'Intermediate',
    estimatedHours: 3.0,
    provider: 'Jupyter Lab Portfolio',
    description: 'Produce an end-to-end reproducible EDA notebook examining customer churn risk factors with Seaborn visual plots.'
  }
];
