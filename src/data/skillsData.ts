import { SkillKey } from '../types/atlas';

export interface SkillMeta {
  key: SkillKey;
  name: string;
  category: string;
  defaultThreshold: number;
  defaultBaseline: number;
  description: string;
  iconName: string;
  rolePrerequisite: string;
  criticalDeficitDescription: string;
  onTrackDescription: string;
  learningActions: {
    title: string;
    description: string;
    type: 'Learn' | 'Practice' | 'Build' | 'Defend';
    estimatedMinutes: number;
  }[];
}

export const SKILLS_METADATA: Record<SkillKey, SkillMeta> = {
  'Power BI': {
    key: 'Power BI',
    name: 'Power BI & DAX Architecture',
    category: 'Business Intelligence & Modeling',
    defaultThreshold: 80,
    defaultBaseline: 48,
    description: 'Enterprise screening blocker. Dimensional star-schema design, bidirectional cross-filtering trade-offs, and CALCULATE context transitions.',
    iconName: 'bar_chart',
    rolePrerequisite: '92% Demand in Data Analyst JDs',
    criticalDeficitDescription: 'Primary screening bottleneck: DAX filter context transition (CALCULATE, ALLSELECTED) and bi-directional schema relationships show critical deficits in technical screening.',
    onTrackDescription: 'Mastery holds across data ingestion and core chart visuals. Focus on performance optimization and row-level security governance.',
    learningActions: [
      {
        title: 'Learn Power BI and DAX fundamentals',
        description: 'Understand evaluation context, filter context vs row context, and CALCULATE mechanics.',
        type: 'Learn',
        estimatedMinutes: 45
      },
      {
        title: 'Practice dimensional data modeling',
        description: 'Design robust Kimball star schemas, resolve many-to-many bridges, and enforce integer keys.',
        type: 'Practice',
        estimatedMinutes: 60
      },
      {
        title: 'Build role-specific e-commerce dashboard',
        description: 'Synthesize dynamic sales KPI measures on 1.2M row transactional dataset with custom date tables.',
        type: 'Build',
        estimatedMinutes: 90
      },
      {
        title: 'Document and defend architectural choices',
        description: 'Write project defense memo explaining measure performance and row-level security roles.',
        type: 'Defend',
        estimatedMinutes: 45
      }
    ]
  },
  'SQL': {
    key: 'SQL',
    name: 'SQL & Relational Synthesis',
    category: 'Database & Analytical Querying',
    defaultThreshold: 80,
    defaultBaseline: 62,
    description: 'Technical interview round 2 hurdle. Window functions (RANK, DENSE_RANK, LEAD/LAG), recursive CTEs, and query plan cost analysis.',
    iconName: 'database',
    rolePrerequisite: '98% Essential Core Prerequisite',
    criticalDeficitDescription: 'Solid foundation in basic joins and grouping, but remediation required in analytical window partitions (ROWS BETWEEN) and multi-table recursive query logic.',
    onTrackDescription: 'Executes clean ANSI-SQL aggregations and multi-table joins. Focus on execution plan reading and index strategies.',
    learningActions: [
      {
        title: 'Master analytical window functions',
        description: 'Deep dive into PARTITION BY, sliding window frames, and positional navigation functions.',
        type: 'Learn',
        estimatedMinutes: 45
      },
      {
        title: 'Execute complex query drills',
        description: 'Solve 18 scenario-based business logic problems using recursive CTEs and nested subqueries.',
        type: 'Practice',
        estimatedMinutes: 60
      },
      {
        title: 'Build multi-touch attribution query pipeline',
        description: 'Model customer acquisition touchpoints on 184k event stream to measure channel ROI.',
        type: 'Build',
        estimatedMinutes: 75
      },
      {
        title: 'Optimize query execution plans',
        description: 'Profile slow queries with EXPLAIN ANALYZE, refactor subqueries, and create optimal indexes.',
        type: 'Defend',
        estimatedMinutes: 40
      }
    ]
  },
  'Data Storytelling': {
    key: 'Data Storytelling',
    name: 'Data Storytelling & Executive Synthesis',
    category: 'Communication & Decision Science',
    defaultThreshold: 75,
    defaultBaseline: 55,
    description: 'Hiring manager conversions. Translating BI grids into 1-page C-suite memos and quantified ROI recommendations.',
    iconName: 'present_to_all',
    rolePrerequisite: '78% Interview Weight',
    criticalDeficitDescription: 'Translation barrier: Technical statistical figures are verified, but candidate profiles lack written 1-page business impact memos and stakeholder presentation decks.',
    onTrackDescription: 'Presents structured arguments with clear charts. Focus on spontaneous oral defense and executive executive summary synthesis.',
    learningActions: [
      {
        title: 'Learn the Minto Pyramid Principle',
        description: 'Structure analytical communication by leading with conclusions and supporting arguments.',
        type: 'Learn',
        estimatedMinutes: 30
      },
      {
        title: 'Translate 50-row metrics into executive takeaways',
        description: 'Synthesize raw metric deviations into 3 actionable bullets with quantified business dollar impacts.',
        type: 'Practice',
        estimatedMinutes: 45
      },
      {
        title: 'Author 1-page C-suite strategic memo',
        description: 'Produce an executive decision document outlining resource allocation for a fictional tech expansion.',
        type: 'Build',
        estimatedMinutes: 60
      },
      {
        title: 'Simulate asynchronous interview defense',
        description: 'Record an 8-minute executive pitch defending metric methodologies to non-technical stakeholders.',
        type: 'Defend',
        estimatedMinutes: 35
      }
    ]
  },
  'Excel': {
    key: 'Excel',
    name: 'Advanced Excel & Financial Modeling',
    category: 'Quantitative Spreadsheet Modeling',
    defaultThreshold: 85,
    defaultBaseline: 76,
    description: 'Validated baseline competence in nested IFs, INDEX/MATCH, dynamic arrays, and Power Query ETL pipelines.',
    iconName: 'grid_on',
    rolePrerequisite: '65% Prerequisite Baseline',
    criticalDeficitDescription: 'Meets majority of enterprise screening criteria. Recommended for maintenance sprint only.',
    onTrackDescription: 'Candidate demonstrates strong dynamic array, XLOOKUP, and automated ETL capabilities. Maintain fluency with periodic drills.',
    learningActions: [
      {
        title: 'Review dynamic array formulas and LAMBDA',
        description: 'Consolidate modern spill range formulas (FILTER, UNIQUE, SORTBY, LAMBDA).',
        type: 'Learn',
        estimatedMinutes: 30
      },
      {
        title: 'Automate folder ingestion with Power Query',
        description: 'Build an automated ETL pipeline that normalizes weekly sales spreadsheets without macros.',
        type: 'Practice',
        estimatedMinutes: 45
      },
      {
        title: 'Construct parametric sensitivity model',
        description: 'Build two-variable data tables and scenario managers for revenue projections.',
        type: 'Build',
        estimatedMinutes: 60
      },
      {
        title: 'Audit workbook error-handling and audit trail',
        description: 'Implement defensive spreadsheet design with data validation and circular reference guards.',
        type: 'Defend',
        estimatedMinutes: 30
      }
    ]
  },
  'Python': {
    key: 'Python',
    name: 'Python (Exploratory Data Analysis & Pandas)',
    category: 'Data Science & Automation',
    defaultThreshold: 65,
    defaultBaseline: 40,
    description: 'Strategic competitive edge. Vectorized Pandas wrangling, handling missing continuous variables, and automated EDA.',
    iconName: 'code',
    rolePrerequisite: '58% Role Prerequisite',
    criticalDeficitDescription: 'Basic syntax verified. Priority lies in vectorized Pandas wrangling, handling missing continuous variables, and exporting visual charts via Seaborn.',
    onTrackDescription: 'Capable of loading CSVs and calculating group summaries. Advance toward clean pipeline functions and automated data cleaning.',
    learningActions: [
      {
        title: 'Master vectorized Pandas operations',
        description: 'Eliminate Python row loops in favor of vectorized numpy transformations and transform() methods.',
        type: 'Learn',
        estimatedMinutes: 40
      },
      {
        title: 'Clean messy real-world datasets',
        description: 'Impute missing values, parse messy datetime strings, and isolate statistical outliers with IQR.',
        type: 'Practice',
        estimatedMinutes: 50
      },
      {
        title: 'Build automated Exploratory Data Analysis notebook',
        description: 'Create an end-to-end reproducible Jupyter notebook with seaborn distribution plots and summary tables.',
        type: 'Build',
        estimatedMinutes: 70
      },
      {
        title: 'Deploy Streamlit interactive exploration app',
        description: 'Host a lightweight dashboard showcasing parameter-driven cohort filters.',
        type: 'Defend',
        estimatedMinutes: 40
      }
    ]
  }
};
