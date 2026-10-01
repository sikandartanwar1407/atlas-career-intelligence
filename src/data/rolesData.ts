import { RoleDefinition, RoleSkillConfig, AssessmentQuestion, LearningResource } from '../types/atlas';
import { selectQuestionsForSkill, QUESTION_BANK } from './questionBank';

// Re-export question bank for backwards compatibility
export { QUESTION_BANK };

// Helper to generate dynamic hybrid (50% Theory / 50% Coding) questions for any skill
export function generateSkillQuestions(
  roleId: string,
  skillName: string,
  domain: string,
  topics?: string[],
  attemptSeed: number = 0
): AssessmentQuestion[] {
  return selectQuestionsForSkill(roleId, skillName, domain, topics || [], attemptSeed);
}

// Helper to generate resources for any skill
export function generateSkillResources(skillName: string, roleName: string): LearningResource[] {
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return [
    {
      id: `res-${slug}-01`,
      skill: skillName,
      title: `${skillName} Architectural Mastery & Core Patterns`,
      type: 'Course',
      difficulty: 'Intermediate',
      estimatedHours: 8,
      description: `Comprehensive deep dive into core methodologies, production standards, and workflow optimization for ${roleName}s.`,
      provider: 'ATLAS Learning Labs'
    },
    {
      id: `res-${slug}-02`,
      skill: skillName,
      title: `Hands-on Enterprise ${skillName} Production Project`,
      type: 'Project',
      difficulty: 'Advanced',
      estimatedHours: 12,
      description: `End-to-end portfolio-grade application with automated tests, code review rubrics, and defensible architectural documentation.`,
      provider: 'ATLAS Technical Projects'
    },
    {
      id: `res-${slug}-03`,
      skill: skillName,
      title: `Official Production Standards & Best Practice Documentation`,
      type: 'Documentation',
      difficulty: 'Foundation',
      estimatedHours: 4,
      description: `Official specifications, API patterns, syntax references, and anti-pattern mitigation guidelines.`,
      provider: 'Industry Technical Consortium'
    }
  ];
}

// Build a full role definition
export function createRoleDefinition(
  id: string,
  name: string,
  category: string,
  shortDescription: string,
  skillsData: {
    name: string;
    description: string;
    baseline: number;
    threshold: number;
    topics: [string, string, string];
    prerequisite: string;
    deficitDesc: string;
    onTrackDesc: string;
  }[],
  attemptSeed: number = 0
): RoleDefinition {
  const requiredSkills = skillsData.map((s) => s.name);
  const skills: RoleSkillConfig[] = skillsData.map((s) => {
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return {
      id: `${id}-${slug}`,
      name: s.name,
      category,
      description: s.description,
      targetThreshold: s.threshold,
      defaultBaseline: s.baseline,
      assessmentTopics: s.topics,
      resourceTopics: s.topics,
      rolePrerequisite: s.prerequisite,
      criticalDeficitDescription: s.deficitDesc,
      onTrackDescription: s.onTrackDesc,
      learningActions: [
        {
          title: `Study ${s.name} core principles and specifications`,
          description: `Deep review of standard architectural conventions and foundational constructs.`,
          type: 'Learn',
          estimatedMinutes: 45
        },
        {
          title: `Practice practical drills and problem sets`,
          description: `Solve 10 industry scenario challenges isolating edge cases and optimizations.`,
          type: 'Practice',
          estimatedMinutes: 60
        },
        {
          title: `Build production-ready verified portfolio artifact`,
          description: `Synthesize a complete demonstrable project implementing robust data/code structures.`,
          type: 'Build',
          estimatedMinutes: 90
        },
        {
          title: `Interview defense walkthrough and technical documentation`,
          description: `Formulate a technical architectural defense memorandum justifying design tradeoffs.`,
          type: 'Defend',
          estimatedMinutes: 45
        }
      ],
      learningResources: generateSkillResources(s.name, name),
      assessmentQuestions: generateSkillQuestions(id, s.name, category, s.topics, attemptSeed)
    };
  });

  return {
    id,
    name,
    category,
    shortDescription,
    roleThreshold: 80,
    requiredSkills,
    skills
  };
}

// 13 Initial Roles
export const ROLES_CATALOGUE: RoleDefinition[] = [
  // 1. Data Analyst
  createRoleDefinition(
    'data-analyst',
    'Data Analyst',
    'Data & Analytics',
    'Translate complex data sets into actionable operational insights, KPIs, and executive reporting models.',
    [
      {
        name: 'SQL',
        description: 'Multi-table relational querying, window functions, and schema normalization.',
        baseline: 62,
        threshold: 80,
        topics: ['Join mechanics and grouping', 'Window functions and CTE partitioning', 'Query indexing and execution plans'],
        prerequisite: '94% of Data Analyst Requisitions',
        deficitDesc: 'Window functions and multi-table CTE optimization show deficiencies in screening.',
        onTrackDesc: 'Solid grasp of filtering and relational aggregations. Ready for dimensional warehouse queries.'
      },
      {
        name: 'Power BI',
        description: 'Dimensional star-schemas, DAX CALCULATE context transitions, and executive dashboarding.',
        baseline: 48,
        threshold: 80,
        topics: ['Evaluation context transitions', 'Dimensional star-schemas', 'Row-Level Security governance'],
        prerequisite: '88% of BI Analyst Requisitions',
        deficitDesc: 'DAX filter context transitions (CALCULATE) and bi-directional relationships show screening bottlenecks.',
        onTrackDesc: 'Good visual assembly. Advance into measure performance and semantic modeling.'
      },
      {
        name: 'Excel',
        description: 'Advanced financial and statistical modeling, XLOOKUP, dynamic arrays, and pivots.',
        baseline: 76,
        threshold: 85,
        topics: ['Dynamic array functions (INDEX/MATCH, FILTER)', 'What-if data tables and scenarios', 'Audit formula precedents and error handling'],
        prerequisite: 'Universal Operational Standard',
        deficitDesc: 'Dynamic nested formulas and multi-variable scenario modeling require structured refinement.',
        onTrackDesc: 'Strong baseline fluency. Clean data formatting and pivot structuring verified.'
      },
      {
        name: 'Python',
        description: 'Pandas data wrangling, NumPy vectorization, exploratory data analysis, and automated scripts.',
        baseline: 40,
        threshold: 65,
        topics: ['Pandas vectorization and indexing', 'Null handling and datetime parsing', 'Data cleaning pipelines'],
        prerequisite: '72% of Mid-Level Requisitions',
        deficitDesc: 'DataFrame transformations and vectorization concepts require algorithmic practice.',
        onTrackDesc: 'Basic script automation understood. Transitioning to production pipeline refactoring.'
      },
      {
        name: 'Data Storytelling',
        description: 'Translating quantitative metrics into persuasive executive decisions and root-cause memos.',
        baseline: 55,
        threshold: 75,
        topics: ['Cognitive load reduction in visuals', 'Executive summary structured memos', 'Root-cause attribution narratives'],
        prerequisite: 'Critical for Senior Progression',
        deficitDesc: 'Presentations list numbers without framing actionable business impact and decision choices.',
        onTrackDesc: 'Clear communication style. Strengthen executive hypothesis framing.'
      }
    ]
  ),

  // 2. Business Analyst
  createRoleDefinition(
    'business-analyst',
    'Business Analyst',
    'Business & Strategy',
    'Bridge business stakeholder requirements with technology solutions through process modeling and quantitative valuation.',
    [
      {
        name: 'Requirements Engineering',
        description: 'Eliciting, documenting, and prioritizing functional and non-functional requirements (BRDs/PRDs).',
        baseline: 58,
        threshold: 85,
        topics: ['Stakeholder interview elicitations', 'Traceability matrix and gap analysis', 'Acceptance criteria definition'],
        prerequisite: 'Core Requirement for BA Roles',
        deficitDesc: 'Ambiguity in functional acceptance criteria and edge-case scoping in screening reviews.',
        onTrackDesc: 'Consistent documentation standard. Focus on edge case mitigation.'
      },
      {
        name: 'Business Process Modeling',
        description: 'BPMN 2.0 swimlane workflows, As-Is vs To-Be process re-engineering, and bottleneck elimination.',
        baseline: 50,
        threshold: 80,
        topics: ['BPMN 2.0 notation standards', 'As-Is to To-Be bottleneck identification', 'Value stream mapping'],
        prerequisite: 'Essential for Enterprise BA',
        deficitDesc: 'Process models lack precise decision gates and exception path handling.',
        onTrackDesc: 'Clear operational workflows. Advance into quantitative value-stream metrics.'
      },
      {
        name: 'Excel & Financial Modeling',
        description: 'Cost-benefit analysis, NPV/ROI calculations, sensitivity tables, and business case justification.',
        baseline: 70,
        threshold: 85,
        topics: ['NPV and IRR business models', 'Sensitivity analysis tables', 'Variance forecasting models'],
        prerequisite: '86% of Strategy & Finance JDs',
        deficitDesc: 'Financial justification models lack dynamic sensitivity scenarios.',
        onTrackDesc: 'Reliable quantitative spreadsheets and budget modeling capabilities.'
      },
      {
        name: 'Data Storytelling',
        description: 'Synthesizing disparate business telemetry into compelling stakeholder roadmaps and presentations.',
        baseline: 60,
        threshold: 80,
        topics: ['Executive memo synthesis', 'Change management alignment', 'Trade-off communication frameworks'],
        prerequisite: 'Key to Senior Stakeholder Buy-in',
        deficitDesc: 'Presentations require stronger framing of organizational trade-offs.',
        onTrackDesc: 'Effective articulation of project milestones and stakeholder impact.'
      },
      {
        name: 'Agile & Scrum',
        description: 'User story writing, backlog refinement, sprint planning, and acceptance testing management.',
        baseline: 65,
        threshold: 80,
        topics: ['User story INVEST criteria', 'Sprint backlog grooming techniques', 'Definition of Done (DoD) verification'],
        prerequisite: 'Modern Software Team Requirement',
        deficitDesc: 'User stories lack testable acceptance criteria and clear INVEST criteria.',
        onTrackDesc: 'Good familiarity with sprints and Jira workflows.'
      }
    ]
  ),

  // 3. Data Scientist
  createRoleDefinition(
    'data-scientist',
    'Data Scientist',
    'Data & Analytics',
    'Build statistical models, machine learning algorithms, and predictive systems to solve complex business problems.',
    [
      {
        name: 'Python for Data Science',
        description: 'NumPy, Pandas, Scikit-learn, and efficient data processing algorithms.',
        baseline: 55,
        threshold: 85,
        topics: ['Vectorized transformations in Pandas', 'Scikit-learn pipeline construction', 'Modular code hygiene and testing'],
        prerequisite: 'Foundational Requisition Standard',
        deficitDesc: 'Code lacks modularity and unit test validation for production pipelines.',
        onTrackDesc: 'Fluent scripting and notebook explorations verified.'
      },
      {
        name: 'Applied Statistics',
        description: 'Hypothesis testing, probability distributions, A/B testing power analysis, and regression modeling.',
        baseline: 45,
        threshold: 85,
        topics: ['P-values and Type I/II error control', 'Sample size and statistical power calculations', 'Multivariate regression assumptions'],
        prerequisite: 'Core Rigor Gatekeeper',
        deficitDesc: 'Experimentation design shows confusion regarding sample size and statistical power.',
        onTrackDesc: 'Solid theoretical grounding in distributions and correlation.'
      },
      {
        name: 'Machine Learning',
        description: 'Supervised/unsupervised algorithms, cross-validation, regularization, and hyperparameter tuning.',
        baseline: 42,
        threshold: 80,
        topics: ['Bias-variance tradeoff and regularization', 'Ensemble methods (XGBoost/RandomForest)', 'Metric selection for imbalanced data'],
        prerequisite: '90% of Data Science Roles',
        deficitDesc: 'Model evaluation relies on raw accuracy instead of PR-AUC or business cost metrics.',
        onTrackDesc: 'Understands basic classifiers and regression algorithms.'
      },
      {
        name: 'SQL & Feature Stores',
        description: 'Complex data aggregation, feature engineering pipelines, and data warehouse interaction.',
        baseline: 58,
        threshold: 80,
        topics: ['Temporal feature aggregations in SQL', 'Windowed lead/lag cohort features', 'Feature store normalization'],
        prerequisite: 'Production Data Pipeline Expectation',
        deficitDesc: 'Temporal data leakage during feature generation in SQL queries.',
        onTrackDesc: 'Good capability querying raw event logs and cohort groupings.'
      },
      {
        name: 'Data Visualization',
        description: 'Communicating model insights, ROC curves, feature importance, and interactive dashboards.',
        baseline: 52,
        threshold: 75,
        topics: ['SHAP and feature importance plots', 'Residual diagnostic graphs', 'Interactive dashboard communication'],
        prerequisite: 'Stakeholder Translation Need',
        deficitDesc: 'Visualizations fail to clearly explain feature importance to non-technical leaders.',
        onTrackDesc: 'Clean Seaborn and Matplotlib visualizations.'
      }
    ]
  ),

  // 4. Software Developer
  createRoleDefinition(
    'software-developer',
    'Software Developer',
    'Engineering',
    'Design, develop, and maintain clean, testable, and robust software applications and system modules.',
    [
      {
        name: 'Core Programming & OOP',
        description: 'Clean code principles, object-oriented/functional paradigms, and design patterns.',
        baseline: 60,
        threshold: 85,
        topics: ['SOLID principles and modular design', 'Memory management and scope lifecycles', 'Polymorphism and design patterns'],
        prerequisite: 'Universal Engineering Baseline',
        deficitDesc: 'Violations of single-responsibility and tight coupling in architecture interviews.',
        onTrackDesc: 'Competent language syntax and procedural problem-solving.'
      },
      {
        name: 'Data Structures',
        description: 'Hash maps, trees, heaps, graphs, arrays, and memory layout optimization.',
        baseline: 50,
        threshold: 80,
        topics: ['Hash collision handling strategies', 'Binary search trees and balancing', 'Space-time memory complexity'],
        prerequisite: 'Standard Technical Screening Test',
        deficitDesc: 'Struggles with recursion and non-linear data structures like trees and graphs.',
        onTrackDesc: 'Understands arrays, linked lists, stacks, and queues.'
      },
      {
        name: 'Algorithms',
        description: 'Big-O complexity analysis, sorting/searching, dynamic programming, and greedy algorithms.',
        baseline: 45,
        threshold: 80,
        topics: ['Asymptotic Big-O time and space proofs', 'Breadth-First and Depth-First Search', 'Divide-and-conquer optimizations'],
        prerequisite: 'Screening Benchmark',
        deficitDesc: 'Inability to optimize brute-force algorithms to sub-quadratic time complexities.',
        onTrackDesc: 'Familiar with standard binary search and two-pointer patterns.'
      },
      {
        name: 'Git & Version Control',
        description: 'Branching strategies (GitFlow/Trunk), rebasing, merge conflict resolution, and CI integration.',
        baseline: 70,
        threshold: 85,
        topics: ['Interactive rebase and clean commit history', 'Semantic merge conflict resolution', 'Branch protection and PR reviews'],
        prerequisite: 'Every Day Team Hygiene',
        deficitDesc: 'Relies on force-pushes and messy git histories in collaboration reviews.',
        onTrackDesc: 'Good branching and standard pull request workflows.'
      },
      {
        name: 'Software Engineering Principles',
        description: 'Unit testing, TDD, debugging, refactoring, and automated deployment pipelines.',
        baseline: 48,
        threshold: 80,
        topics: ['Unit testing with mock dependencies', 'Automated CI/CD build scripts', 'Defensive error handling and logging'],
        prerequisite: 'Required for Production Ownership',
        deficitDesc: 'Code delivered without automated unit test suites or mock fixtures.',
        onTrackDesc: 'Basic manual testing and debugging techniques.'
      }
    ]
  ),

  // 5. Frontend Developer
  createRoleDefinition(
    'frontend-developer',
    'Frontend Developer',
    'Engineering',
    'Craft delightful, performant, and accessible user interfaces and web applications using modern web technologies.',
    [
      {
        name: 'HTML & Modern CSS',
        description: 'Semantic markup, Flexbox/Grid, responsive layouts, CSS variables, and modern Tailwind patterns.',
        baseline: 70,
        threshold: 85,
        topics: ['Semantic HTML5 and landmark tags', 'CSS Grid vs Flexbox architectural choices', 'Responsive container queries'],
        prerequisite: 'Foundational UI Requisite',
        deficitDesc: 'Over-reliance on non-semantic divs and fragile layout media query breakpoints.',
        onTrackDesc: 'Comfortable with responsive layouts and component styling.'
      },
      {
        name: 'JavaScript & ESNext',
        description: 'Asynchronous event loop, closures, promises, destructuring, and TypeScript typing.',
        baseline: 58,
        threshold: 85,
        topics: ['Event loop, microtasks, and macrotasks', 'Closures and lexical scoping', 'TypeScript generics and union types'],
        prerequisite: '88% of Frontend Screening Tests',
        deficitDesc: 'Gaps in event loop mechanics, prototype inheritance, and complex TypeScript generics.',
        onTrackDesc: 'Clean syntax and asynchronous async/await fluency.'
      },
      {
        name: 'React Ecosystem',
        description: 'Hooks, state management, component lifecycle, rendering optimizations, and routing.',
        baseline: 60,
        threshold: 85,
        topics: ['Custom hooks and lifecycle reconciliation', 'Memoization (useMemo, useCallback)', 'Context API vs state managers'],
        prerequisite: 'Dominant Web Framework (92%)',
        deficitDesc: 'Unnecessary component re-renders and misuse of useEffect dependency arrays.',
        onTrackDesc: 'Builds functional component trees and handles basic state.'
      },
      {
        name: 'UI / UX Implementation',
        description: 'Design system fidelity, micro-interactions, responsive ergonomics, and component reusability.',
        baseline: 62,
        threshold: 80,
        topics: ['Design token architecture', 'Micro-interactions and animations', 'Typography scale and whitespace discipline'],
        prerequisite: 'Differentiator for High-Tier Teams',
        deficitDesc: 'Visual implementation diverges from Figma token hierarchy and spacing specs.',
        onTrackDesc: 'Translates mockups into functional web elements cleanly.'
      },
      {
        name: 'Web Performance & Accessibility',
        description: 'Core Web Vitals, code-splitting, lazy loading, and WCAG AA accessibility compliance.',
        baseline: 42,
        threshold: 80,
        topics: ['Core Web Vitals (LCP, FID/INP, CLS)', 'ARIA roles, focus management, and keyboard traps', 'Bundle size optimization and tree-shaking'],
        prerequisite: 'Mandatory for Enterprise Applications',
        deficitDesc: 'Severe keyboard accessibility violations and unoptimized bundle assets.',
        onTrackDesc: 'Basic Lighthouse audit awareness and image optimization.'
      }
    ]
  ),

  // 6. Backend Developer
  createRoleDefinition(
    'backend-developer',
    'Backend Developer',
    'Engineering',
    'Build robust server-side systems, scalable APIs, database architectures, and distributed microservices.',
    [
      {
        name: 'Node.js & REST APIs',
        description: 'Express, asynchronous I/O, RESTful conventions, authentication, and error middleware.',
        baseline: 62,
        threshold: 85,
        topics: ['RESTful idempotency and HTTP status codes', 'Asynchronous stream handling and non-blocking I/O', 'JWT and OAuth2 authentication middleware'],
        prerequisite: 'Core Backend Requirement',
        deficitDesc: 'Improper error handling leaking stack traces and incorrect HTTP status code patterns.',
        onTrackDesc: 'Creates basic CRUD endpoints and router modules.'
      },
      {
        name: 'Relational Databases & SQL',
        description: 'PostgreSQL, indexing strategies, transactions (ACID), schema design, and query optimization.',
        baseline: 58,
        threshold: 85,
        topics: ['ACID transaction isolation levels', 'Composite B-Tree indexing and query plans', 'Foreign key constraints and cascading integrity'],
        prerequisite: 'Critical Infrastructure Competency',
        deficitDesc: 'N+1 query problems and missing composite indexes causing high query latency.',
        onTrackDesc: 'Standard join queries and schema migrations executed smoothly.'
      },
      {
        name: 'System Design & Architecture',
        description: 'Caching (Redis), rate-limiting, message queues, horizontal scaling, and microservices.',
        baseline: 40,
        threshold: 80,
        topics: ['Cache-aside vs write-through strategies in Redis', 'Decoupled pub/sub message queuing', 'API gateway and rate-limiting patterns'],
        prerequisite: 'Mid to Senior Gateway Requisite',
        deficitDesc: 'Designs collapse under distributed state and lack caching resilience.',
        onTrackDesc: 'Understands monolith vs microservice trade-offs at a conceptual level.'
      },
      {
        name: 'Docker & Containerization',
        description: 'Writing multi-stage Dockerfiles, Docker Compose, volume mounts, and container security.',
        baseline: 48,
        threshold: 75,
        topics: ['Multi-stage build optimization for minimal images', 'Container non-root security context', 'Network orchestration in docker-compose'],
        prerequisite: 'Universal DevOps Baseline',
        deficitDesc: 'Bloated multi-gigabyte container images and root user security exposures.',
        onTrackDesc: 'Runs and manages local application containers.'
      },
      {
        name: 'Cloud Deployment',
        description: 'Deploying servers to cloud platforms (AWS, GCP, Render), environment configs, and health checks.',
        baseline: 45,
        threshold: 75,
        topics: ['Environment secret segregation and 12-factor apps', 'Liveness and readiness health probe endpoints', 'Automated zero-downtime deployment pipelines'],
        prerequisite: 'Modern Production Standard',
        deficitDesc: 'Secrets committed to repositories or missing health check endpoints for load balancers.',
        onTrackDesc: 'Basic server deployments on PaaS environments.'
      }
    ]
  ),

  // 7. Full Stack Developer
  createRoleDefinition(
    'full-stack-developer',
    'Full Stack Developer',
    'Engineering',
    'Bridge user experience with robust backend architecture, owning features from database schema to interactive UI.',
    [
      {
        name: 'Frontend & React',
        description: 'State management, component architecture, hooks, and responsive user interfaces.',
        baseline: 64,
        threshold: 85,
        topics: ['Component lifecycle and custom hooks', 'Client-side state synchronization', 'Responsive UI layout implementation'],
        prerequisite: 'Full Stack UI Capability',
        deficitDesc: 'Component rendering bottlenecks and messy props drilling across complex trees.',
        onTrackDesc: 'Builds functional interactive screens with React.'
      },
      {
        name: 'Backend APIs',
        description: 'Server endpoints, business logic validation, asynchronous handling, and REST/GraphQL.',
        baseline: 60,
        threshold: 85,
        topics: ['API endpoint structuring and idempotency', 'Request payload validation and sanitization', 'Centralized error-handling middleware'],
        prerequisite: 'Full Stack Server Capability',
        deficitDesc: 'Weak validation on incoming payloads exposing endpoints to injection bugs.',
        onTrackDesc: 'Builds clean CRUD routes and handles basic database lookups.'
      },
      {
        name: 'Database Architecture',
        description: 'Relational schemas, ORM/query builder usage, indexing, and data normalization.',
        baseline: 55,
        threshold: 80,
        topics: ['Normalized relational schema modeling', 'Indexing critical lookups and foreign keys', 'Migration management and rollback testing'],
        prerequisite: 'Data Layer Ownership',
        deficitDesc: 'Unindexed database lookups causing application freezing under multi-user loads.',
        onTrackDesc: 'Comfortable with migrations and ORM queries.'
      },
      {
        name: 'Git & CI/CD Pipelines',
        description: 'Collaborative code reviews, pull requests, automated testing, and deployment workflows.',
        baseline: 62,
        threshold: 80,
        topics: ['Automated GitHub Actions CI/CD workflows', 'Branch protection rules and PR review rigor', 'Semantic versioning and deployment tags'],
        prerequisite: 'Team Velocity Expectation',
        deficitDesc: 'Manual deployments without automated test gates.',
        onTrackDesc: 'Smooth git branch workflows and basic CI scripts.'
      },
      {
        name: 'System Security & Auth',
        description: 'JWT/Sessions, CORS policies, XSS/CSRF mitigation, hashing, and role-based permissions.',
        baseline: 46,
        threshold: 80,
        topics: ['Salted hashing (bcrypt/argon2) for credentials', 'CORS origin whitelisting and CSRF protections', 'Role-Based Access Control (RBAC) enforcement'],
        prerequisite: 'Non-Negotiable Production Gate',
        deficitDesc: 'Storing passwords in plaintext or improper CORS wildcard configurations.',
        onTrackDesc: 'Understands JWT tokens and protected route concepts.'
      }
    ]
  ),

  // 8. UI/UX Designer
  createRoleDefinition(
    'ui-ux-designer',
    'UI/UX Designer',
    'Design',
    'Create user-centered digital products through rigorous user research, wireframing, design systems, and prototyping.',
    [
      {
        name: 'Figma & Prototyping',
        description: 'Auto layout, component variants, smart animations, and high-fidelity interactive flows.',
        baseline: 68,
        threshold: 85,
        topics: ['Auto-layout 5.0 nested structures', 'Component variants and interactive properties', 'Micro-interaction prototype transitions'],
        prerequisite: 'Industry Tooling Benchmark',
        deficitDesc: 'Prototypes built with static shapes lacking responsive Auto-Layout constraints.',
        onTrackDesc: 'Builds comprehensive multi-screen click-through wireframes.'
      },
      {
        name: 'User Research & Usability Testing',
        description: 'User interviews, usability heuristics, persona creation, and testing synthesis.',
        baseline: 52,
        threshold: 80,
        topics: ['Nielsen Norman 10 Usability Heuristics', 'Moderated user testing protocol design', 'Synthesis of thematic feedback affinity maps'],
        prerequisite: 'Distinguishes UX from Pure Visuals',
        deficitDesc: 'Decisions driven by personal aesthetic preferences rather than tested user telemetry.',
        onTrackDesc: 'Conducts user interviews and structures empathy maps.'
      },
      {
        name: 'Design Systems',
        description: 'Design tokens, typography scales, spacing units, atomic components, and developer handoff.',
        baseline: 55,
        threshold: 85,
        topics: ['Design token nomenclature and variables', 'Atomic component hierarchy and accessibility', 'Developer handoff specs and documentation'],
        prerequisite: 'Crucial for Team Scalability',
        deficitDesc: 'Inconsistent hex codes and detached component instances across files.',
        onTrackDesc: 'Organizes standardized color palettes and button components.'
      },
      {
        name: 'Information Architecture',
        description: 'Sitemaps, card sorting, user journeys, navigation structures, and content hierarchy.',
        baseline: 56,
        threshold: 80,
        topics: ['Card sorting and tree testing validations', 'Hierarchical user flow mapping', 'Cognitive load reduction in navigation'],
        prerequisite: 'Structural Core of UX',
        deficitDesc: 'Complex multi-level menus that disorient users and bury primary actions.',
        onTrackDesc: 'Draws clear wireframe flows and sitemaps.'
      },
      {
        name: 'Visual Design & Typography',
        description: 'Visual balance, contrast ratios, WCAG compliance, type pairings, and grid alignments.',
        baseline: 64,
        threshold: 80,
        topics: ['Typography hierarchy and vertical rhythm', 'Contrast ratio verification for WCAG AA', 'Intentional grid systems and balance'],
        prerequisite: 'High Visual Craft Benchmark',
        deficitDesc: 'Low-contrast text rendering inaccessible under standard lighting conditions.',
        onTrackDesc: 'Pleasing visual sense and harmonious aesthetic choices.'
      }
    ]
  ),

  // 9. Product Manager
  createRoleDefinition(
    'product-manager',
    'Product Manager',
    'Product',
    'Define the product vision, prioritize roadmap initiatives, and lead cross-functional teams to build high-impact products.',
    [
      {
        name: 'Product Strategy & Roadmapping',
        description: 'Market problem definition, competitive moats, OKRs, and outcome-oriented roadmaps.',
        baseline: 55,
        threshold: 85,
        topics: ['Outcome-based vs output-based roadmapping', 'Market sizing (TAM/SAM/SOM) analysis', 'Defining North Star metrics and OKRs'],
        prerequisite: 'Fundamental Strategic Duty',
        deficitDesc: 'Roadmaps built as feature laundry lists without strategic connection to business outcomes.',
        onTrackDesc: 'Articulates clear user personas and product objectives.'
      },
      {
        name: 'User Research & Customer Discovery',
        description: 'Customer interviews, JTBD (Jobs-to-be-Done) framework, and continuous discovery habits.',
        baseline: 58,
        threshold: 80,
        topics: ['Jobs-to-be-Done (JTBD) customer interviews', 'Validating problem urgency before solutioning', 'Continuous customer feedback loops'],
        prerequisite: 'Ensures Product-Market Fit',
        deficitDesc: 'Jumping straight into building features without validating the severity of user pain.',
        onTrackDesc: 'Talks with customers and documents user feedback themes.'
      },
      {
        name: 'Product Analytics & Metrics',
        description: 'Funnel conversion, retention cohorts, A/B experimentation, and metric trees.',
        baseline: 50,
        threshold: 85,
        topics: ['Cohort retention curves and churn drivers', 'Funnel drop-off diagnosis and telemetry', 'Statistical significance in A/B feature tests'],
        prerequisite: 'Data-Driven PM Expectation',
        deficitDesc: 'Unable to distinguish vanity metrics (signups) from retention signals.',
        onTrackDesc: 'Familiar with funnel metrics and active user calculations.'
      },
      {
        name: 'Agile Sprint Execution',
        description: 'PRD writing, user stories, backlog grooming, MVP definition, and trade-off prioritization.',
        baseline: 65,
        threshold: 80,
        topics: ['RICE and MoSCoW prioritization frameworks', 'Writing crisp, unambiguous PRDs', 'Sprint trade-offs and scope trimming'],
        prerequisite: 'Daily Operational Cadence',
        deficitDesc: 'PRDs leave scope ambiguous, leading to engineering sprint delays.',
        onTrackDesc: 'Writes user stories and coordinates daily standups.'
      },
      {
        name: 'Stakeholder Communication',
        description: 'Cross-functional alignment (Eng, Design, Sales, Execs), leadership without authority, and consensus building.',
        baseline: 62,
        threshold: 80,
        topics: ['Communicating trade-offs to executives', 'Managing conflicting departmental priorities', 'Transparent decision logging and memos'],
        prerequisite: 'Essential for Executive Confidence',
        deficitDesc: 'Fails to proactively manage executive expectations when timelines shift.',
        onTrackDesc: 'Good verbal communication and deck presentations.'
      }
    ]
  ),

  // 10. Digital Marketing Specialist
  createRoleDefinition(
    'digital-marketing-specialist',
    'Digital Marketing Specialist',
    'Marketing',
    'Drive sustainable customer acquisition, conversion optimization, and brand growth across multi-channel campaigns.',
    [
      {
        name: 'Search Engine Optimization (SEO)',
        description: 'Technical SEO, keyword research, on-page architecture, backlink strategies, and search intent.',
        baseline: 60,
        threshold: 80,
        topics: ['Search intent classification and keyword clusters', 'Technical crawling and Core Web Vitals impact', 'Information architecture and internal linking'],
        prerequisite: 'High-Demand Organic Engine',
        deficitDesc: 'Keyword stuffing without satisfying search intent or addressing technical crawl issues.',
        onTrackDesc: 'Executes on-page title, header, and meta description optimizations.'
      },
      {
        name: 'Paid Ads & Performance Marketing',
        description: 'Google Ads, Meta Ads, audience targeting, ROAS optimization, and budget pacing.',
        baseline: 52,
        threshold: 85,
        topics: ['CAC to LTV unit economics and ROAS thresholds', 'Audience segmentation and lookalike models', 'Ad creative testing frameworks'],
        prerequisite: 'Core Acquisition Channel',
        deficitDesc: 'Campaigns burn budget on broad keywords without negative match filtering.',
        onTrackDesc: 'Launches ad groups and manages basic PPC budgets.'
      },
      {
        name: 'Google Analytics & Web Telemetry',
        description: 'GA4 event tracking, UTM taxonomy, attribution modeling, and conversion funnels.',
        baseline: 55,
        threshold: 80,
        topics: ['GA4 custom event and conversion configuration', 'UTM tracking parameter standardization', 'First-touch vs data-driven attribution models'],
        prerequisite: 'Measurement & Attribution Baseline',
        deficitDesc: 'Campaign traffic cannot be attributed due to sloppy UTM conventions.',
        onTrackDesc: 'Reads traffic reports and tracks basic conversion goals.'
      },
      {
        name: 'Content & Copywriting Strategy',
        description: 'Direct response copywriting, value propositions, email drip campaigns, and lead magnets.',
        baseline: 65,
        threshold: 80,
        topics: ['Direct response headline hooks and angles', 'Automated email nurture sequences', 'Content calendar and lead magnet design'],
        prerequisite: 'Brand Voice & Engagement',
        deficitDesc: 'Copy focuses on feature descriptions instead of emotional customer pain points.',
        onTrackDesc: 'Writes engaging social copy and blog articles.'
      },
      {
        name: 'Conversion Rate Optimization (CRO)',
        description: 'Landing page heatmaps, A/B headline testing, frictionless forms, and checkout flow design.',
        baseline: 48,
        threshold: 80,
        topics: ['Landing page message match and clarity', 'A/B testing statistical sample sizing', 'Form friction reduction and micro-copy'],
        prerequisite: 'Multiplies Campaign ROI',
        deficitDesc: 'Running landing page split tests without sufficient sample sizes.',
        onTrackDesc: 'Analyzes user click heatmaps and suggests UX tweaks.'
      }
    ]
  ),

  // 11. Cybersecurity Analyst
  createRoleDefinition(
    'cybersecurity-analyst',
    'Cybersecurity Analyst',
    'Security',
    'Protect enterprise networks, cloud infrastructure, and sensitive data against vulnerabilities and advanced threats.',
    [
      {
        name: 'Network Security & Protocols',
        description: 'TCP/IP stack, firewalls, DNS, VPNs, TLS/SSL, packet analysis (Wireshark), and subnetting.',
        baseline: 62,
        threshold: 85,
        topics: ['Wireshark packet trace inspection', 'Firewall ingress/egress rule hardening', 'TLS handshake and certificate validation'],
        prerequisite: 'Foundational Defense Skill',
        deficitDesc: 'Inability to dissect malicious network traffic in Wireshark captures.',
        onTrackDesc: 'Understands OSI model layers and port security.'
      },
      {
        name: 'Vulnerability Assessment',
        description: 'OWASP Top 10, CVE scanning (Nessus), penetration testing principles, and patch management.',
        baseline: 55,
        threshold: 85,
        topics: ['OWASP Top 10 web attack mitigation', 'CVSS vulnerability scoring and prioritization', 'Remediation and patch governance'],
        prerequisite: 'Universal Security Standard',
        deficitDesc: 'Treating all scan findings identically without prioritizing CVSS exploitability.',
        onTrackDesc: 'Runs automated vulnerability scanners on endpoints.'
      },
      {
        name: 'Incident Detection & Response',
        description: 'SIEM telemetry (Splunk/Sentinel), SOC triage, log correlation, and containment procedures.',
        baseline: 48,
        threshold: 80,
        topics: ['SIEM query correlation across server logs', 'Incident containment and isolation playbooks', 'Root-cause timeline reconstruction'],
        prerequisite: 'Core SOC Operational Role',
        deficitDesc: 'Alert fatigue causing critical lateral movement signals to go unnoticed.',
        onTrackDesc: 'Monitors alerts and reports potential intrusions.'
      },
      {
        name: 'Security Compliance & NIST',
        description: 'NIST Cybersecurity Framework, ISO 27001, GDPR, access control policies, and audit documentation.',
        baseline: 50,
        threshold: 80,
        topics: ['NIST CSF (Identify, Protect, Detect, Respond, Recover)', 'Principle of Least Privilege implementation', 'Audit evidence collection and governance'],
        prerequisite: 'Corporate Governance Requirement',
        deficitDesc: 'Weak access control policies allowing unauthorized privilege creep.',
        onTrackDesc: 'Familiar with enterprise security compliance guidelines.'
      },
      {
        name: 'Threat Intelligence',
        description: 'MITRE ATT&CK framework, indicators of compromise (IOCs), malware analysis, and threat hunting.',
        baseline: 42,
        threshold: 75,
        topics: ['MITRE ATT&CK tactics, techniques, and procedures', 'Extracting and validating actionable IOCs', 'Proactive threat hunting methodologies'],
        prerequisite: 'Advanced Analytical Skill',
        deficitDesc: 'Inability to map adversary activities to MITRE ATT&CK techniques.',
        onTrackDesc: 'Reads threat intelligence feeds and identifies common attack vectors.'
      }
    ]
  ),

  // 12. Cloud Engineer
  createRoleDefinition(
    'cloud-engineer',
    'Cloud Engineer',
    'Cloud & DevOps',
    'Architect, provision, and maintain reliable, scalable, and automated cloud computing infrastructure across AWS/GCP.',
    [
      {
        name: 'AWS & Cloud Architecture',
        description: 'EC2, S3, IAM roles, VPC subnets, Lambda serverless, and resilient multi-AZ topology.',
        baseline: 60,
        threshold: 85,
        topics: ['VPC routing, public/private subnets, and NAT gateways', 'IAM least privilege policy syntax', 'Multi-AZ high availability patterns'],
        prerequisite: 'Primary Cloud Standard',
        deficitDesc: 'Leaving S3 buckets public or assigning administrative IAM wildcard permissions.',
        onTrackDesc: 'Provisions standard cloud virtual machines and storage.'
      },
      {
        name: 'Infrastructure as Code (Terraform)',
        description: 'Terraform HCL, state management, modularization, variable scoping, and automated plans.',
        baseline: 50,
        threshold: 85,
        topics: ['Terraform state locking and remote backends', 'Modular reusable infrastructure patterns', 'Plan review and drift detection'],
        prerequisite: 'Essential for Modern Cloud Teams',
        deficitDesc: 'Manual console modifications causing catastrophic Terraform state drifts.',
        onTrackDesc: 'Deploys basic cloud resources using Terraform scripts.'
      },
      {
        name: 'Kubernetes & Docker',
        description: 'Container orchestration, pods, deployments, services, ingress controllers, and config maps.',
        baseline: 45,
        threshold: 80,
        topics: ['Kubernetes deployment rolling updates and rollbacks', 'Ingress controller routing and TLS termination', 'Resource requests and limits tuning'],
        prerequisite: 'Enterprise Container Standard',
        deficitDesc: 'Containers crash-looping due to missing CPU/memory resource limits.',
        onTrackDesc: 'Builds Docker images and runs simple Kubernetes pods.'
      },
      {
        name: 'Cloud Networking & Security',
        description: 'Security groups, network ACLs, transit gateways, DDoS mitigation, and SSL/TLS encryption.',
        baseline: 52,
        threshold: 80,
        topics: ['Security Groups vs Network ACL enforcement', 'Transit Gateway inter-VPC peering', 'Shield/WAF rule configuration'],
        prerequisite: 'Infrastructure Gatekeeper',
        deficitDesc: 'Misconfigured security group rules exposing internal database ports to the public internet.',
        onTrackDesc: 'Configures basic VPC subnets and routing tables.'
      },
      {
        name: 'Cost Optimization & SRE',
        description: 'FinOps budget alerts, autoscaling policies, Prometheus/Grafana monitoring, and SLAs/SLOs.',
        baseline: 44,
        threshold: 75,
        topics: ['Spot instance and Savings Plan cost models', 'SLIs, SLOs, and Error Budget definitions', 'Prometheus alerting and Grafana metrics'],
        prerequisite: 'Operational Excellence Standard',
        deficitDesc: 'Unmonitored cloud spending and lack of automated alerts during outages.',
        onTrackDesc: 'Monitors cloud billing dashboards and basic CPU alarms.'
      }
    ]
  ),

  // 13. Machine Learning Engineer
  createRoleDefinition(
    'machine-learning-engineer',
    'Machine Learning Engineer',
    'AI & Data',
    'Bridge data science with production software, deploying scalable ML pipelines, inference APIs, and MLOps systems.',
    [
      {
        name: 'Deep Learning & PyTorch',
        description: 'Neural network architectures (CNNs, Transformers), tensor operations, backpropagation, and training loops.',
        baseline: 54,
        threshold: 85,
        topics: ['PyTorch autograd and custom training loops', 'Transformer attention mechanics and embeddings', 'Learning rate scheduling and regularization'],
        prerequisite: 'Modern AI Baseline',
        deficitDesc: 'Lack of understanding of gradient vanishing and tensor memory management in PyTorch.',
        onTrackDesc: 'Implements standard feedforward and convolutional models.'
      },
      {
        name: 'MLOps & Pipeline Orchestration',
        description: 'Model registry (MLflow), automated CI/CD for models, feature stores, and drift monitoring.',
        baseline: 45,
        threshold: 85,
        topics: ['MLflow experiment tracking and model versioning', 'Data drift and concept drift detection in production', 'Automated model retraining pipelines'],
        prerequisite: 'Critical Differentiator for MLEs',
        deficitDesc: 'Models deployed as raw pickle files without version tracking or drift monitoring.',
        onTrackDesc: 'Tracks experiments and logs training metrics.'
      },
      {
        name: 'Feature Engineering',
        description: 'Scalable data preprocessing, embedding generation, outlier mitigation, and feature transformation.',
        baseline: 58,
        threshold: 80,
        topics: ['Vectorized normalization and categorical encoding', 'Text embedding generation and vector indexing', 'Preventing target leakage in time-series features'],
        prerequisite: 'Model Performance Accelerator',
        deficitDesc: 'Data leakage between training and validation splits corrupting model benchmark scores.',
        onTrackDesc: 'Performs standard data scaling and encoding.'
      },
      {
        name: 'Math & Linear Algebra',
        description: 'Matrix decompositions, eigenvalues, vector calculus, gradient descent, and probability.',
        baseline: 52,
        threshold: 80,
        topics: ['Singular Value Decomposition (SVD) and matrix ranks', 'Multivariate gradient descent and Jacobians', 'Probabilistic maximum likelihood estimation'],
        prerequisite: 'Theoretical Underpinning',
        deficitDesc: 'Treating algorithms as black boxes without understanding loss function convergence.',
        onTrackDesc: 'Comfortable with matrix operations and basic calculus.'
      },
      {
        name: 'Model Evaluation & Optimization',
        description: 'Model quantization (INT8/FP16), TensorRT inference optimization, latency benchmarks, and edge deployment.',
        baseline: 40,
        threshold: 75,
        topics: ['Post-training quantization and pruning', 'Inference latency vs accuracy trade-offs', 'Dockerized FastAPI model serving endpoints'],
        prerequisite: 'Production Latency Requirement',
        deficitDesc: 'Serving models with multi-second latency due to unoptimized inference routines.',
        onTrackDesc: 'Wraps models in simple REST endpoints for inference.'
      }
    ]
  )
];

// Helper to get or create role definition for custom "Other" roles
export function getRoleDefinition(roleIdOrName: string, attemptSeed: number = 0): RoleDefinition {
  const normalized = roleIdOrName.toLowerCase().trim();
  const found = ROLES_CATALOGUE.find(
    (r) => r.id === normalized || r.name.toLowerCase() === normalized
  );

  if (found) {
    if (attemptSeed === 0) return found;
    return {
      ...found,
      skills: found.skills.map((s) => ({
        ...s,
        assessmentQuestions: generateSkillQuestions(found.id, s.name, s.category, s.assessmentTopics, attemptSeed)
      }))
    };
  }

  // Custom "Other" Role Dynamic Adapter
  const customTitle = roleIdOrName && roleIdOrName.trim().length > 0 ? roleIdOrName.trim() : 'Custom Role Specialist';
  return createRoleDefinition(
    'custom-role',
    customTitle,
    'Custom Vector',
    `Calibrated competency architecture tailored for ${customTitle}.`,
    [
      {
        name: 'Core Technical Fundamentals',
        description: 'Essential domain paradigms, foundational tooling, and architecture execution.',
        baseline: 60,
        threshold: 80,
        topics: ['Standard conventions and best practices', 'Tooling configuration and setup', 'Systematic debugging workflows'],
        prerequisite: 'Foundational Domain Requirement',
        deficitDesc: 'Core technical conventions require deliberate reinforcement against industry benchmarks.',
        onTrackDesc: 'Demonstrates reliable baseline execution across standard workflows.'
      },
      {
        name: 'Domain Execution',
        description: 'Hands-on project synthesis, problem solving, and production-level delivery.',
        baseline: 55,
        threshold: 80,
        topics: ['Execution lifecycle management', 'Edge case mitigation', 'Production-grade delivery standards'],
        prerequisite: 'Core Competency Metric',
        deficitDesc: 'Applied execution requires deeper exposure to non-standard edge scenarios.',
        onTrackDesc: 'Builds functional deliverables adhering to specifications.'
      },
      {
        name: 'Analytical Thinking',
        description: 'Root-cause diagnosis, quantitative decision-making, and trade-off evaluation.',
        baseline: 58,
        threshold: 80,
        topics: ['Root-cause analysis methods', 'Quantitative trade-off modeling', 'Hypothesis-driven problem formulation'],
        prerequisite: 'Critical for Senior Progression',
        deficitDesc: 'Decisions occasionally lack explicit quantitative trade-off documentation.',
        onTrackDesc: 'Capable of methodical problem isolation and analysis.'
      },
      {
        name: 'Systems & Architecture',
        description: 'Scalable structural design, modularity, and integration with adjacent workflows.',
        baseline: 45,
        threshold: 75,
        topics: ['Modular system boundaries', 'Interface contracts and APIs', 'Reliability and error resilience'],
        prerequisite: 'Enterprise Scalability Gate',
        deficitDesc: 'Architectural designs require stronger modular decoupling for long-term scalability.',
        onTrackDesc: 'Understands system component interactions at a high level.'
      },
      {
        name: 'Delivery & Communication',
        description: 'Technical documentation, stakeholder alignment, and defensible project presentations.',
        baseline: 62,
        threshold: 80,
        topics: ['Defensible documentation writing', 'Cross-functional stakeholder alignment', 'Executive summary presentation'],
        prerequisite: 'Universal Professional Requirement',
        deficitDesc: 'Deliverables require clearer executive summaries and written defense memos.',
        onTrackDesc: 'Communicates clearly with peers and leads.'
      }
    ]
  );
}
