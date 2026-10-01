import { AssessmentQuestion } from '../types/atlas';

export interface SkillQuestionPool {
  theory: AssessmentQuestion[];
  coding: AssessmentQuestion[];
}

export const QUESTION_BANK: Record<string, SkillQuestionPool> = {
  // =========================================================================
  // DATA ANALYST & SQL
  // =========================================================================
  'sql': {
    theory: [
      {
        id: 'sql-th-01',
        skill: 'SQL',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Relational Querying',
        question: 'Which SQL clause is used to filter aggregated group results rather than individual table rows?',
        options: [
          'HAVING to evaluate predicates on grouped summary values.',
          'WHERE to filter aggregated column values.',
          'GROUP BY to sort rows by aggregate rank.',
          'QUALIFY to filter unaggregated base tables.'
        ],
        correctAnswer: 0,
        explanation: 'HAVING filters groups produced by GROUP BY, whereas WHERE filters individual rows before aggregation.'
      },
      {
        id: 'sql-th-02',
        skill: 'SQL',
        type: 'theory',
        difficulty: 'Applied',
        domain: 'Window Functions',
        question: 'Which window function produces sequential ranking with no gaps when tie values occur?',
        options: [
          'DENSE_RANK() OVER (ORDER BY score DESC)',
          'RANK() OVER (ORDER BY score DESC)',
          'ROW_NUMBER() OVER (ORDER BY score DESC)',
          'NTILE(4) OVER (ORDER BY score DESC)'
        ],
        correctAnswer: 0,
        explanation: 'DENSE_RANK() assigns consecutive rankings (1, 2, 2, 3) without skipping numbers after duplicate ties.'
      },
      {
        id: 'sql-th-03',
        skill: 'SQL',
        type: 'theory',
        difficulty: 'Advanced',
        domain: 'Indexing & Joins',
        question: 'What is the performance impact of an unindexed Foreign Key column during frequent parent-table DELETE operations?',
        options: [
          'The database must perform full table scans on the child table to verify referential integrity, causing severe locking.',
          'Foreign key constraints are automatically ignored without an index.',
          'Parent records cannot be inserted into the database.',
          'Queries on the parent table switch automatically to hash joins.'
        ],
        correctAnswer: 0,
        explanation: 'Deleting a parent row requires checking child rows. Without an index on the child FK, the engine must table-scan the child table.'
      }
    ],
    coding: [
      {
        id: 'sql-cd-01',
        skill: 'SQL',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'HAVING Filter',
        title: 'SQL HAVING Filter Output',
        prompt: 'Given table employees (dept, salary), determine the count of rows returned:',
        code: `-- 'Eng': 120, 130, 90  (Avg: 113.3)
-- 'Sales': 80, 70      (Avg: 75.0)
-- 'Ops': 140           (Avg: 140.0)

SELECT dept, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept
HAVING AVG(salary) > 100;`,
        expectedOutput: '2',
        explanation: "Departments 'Eng' (113.3) and 'Ops' (140.0) exceed 100, returning 2 rows."
      },
      {
        id: 'sql-cd-02',
        skill: 'SQL',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'LEFT JOIN NULLs',
        title: 'LEFT JOIN Unmatched Count',
        prompt: 'Determine the count of customers with no recorded orders:',
        code: `-- Customers: [1, 2, 3, 4, 5]
-- Orders (customer_id): [1, 1, 3]

SELECT COUNT(*)
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.customer_id IS NULL;`,
        expectedOutput: '3',
        explanation: 'Customers 2, 4, and 5 have no orders in the orders table, yielding 3 rows.'
      },
      {
        id: 'sql-cd-03',
        skill: 'SQL',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'COALESCE Arithmetic',
        title: 'COALESCE Compensation Sum',
        prompt: 'Calculate the total output of this SQL query:',
        code: `-- Staff records:
-- Alice: base = 100, bonus = NULL
-- Bob: base = 120, bonus = 30

SELECT SUM(base + COALESCE(bonus, 0)) AS total
FROM staff;`,
        expectedOutput: '250',
        explanation: 'Alice gives 100 + 0 = 100. Bob gives 120 + 30 = 150. Total = 250.'
      }
    ]
  },

  'power-bi': {
    theory: [
      {
        id: 'pbi-th-01',
        skill: 'Power BI',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Data Modeling',
        question: 'Why is a Star Schema strongly preferred over a single denormalized flat table in Power BI models?',
        options: [
          'VertiPaq columnar storage achieves far higher compression and faster memory scans when fact tables reference skinny dimension tables.',
          'Power BI disables measure calculations on single wide tables.',
          'Star schemas eliminate the need for primary and foreign keys.',
          'Flat tables cannot support date hierarchies.'
        ],
        correctAnswer: 0,
        explanation: 'Star schemas optimize VertiPaq dictionary encoding and columnar compression, improving visual query speed.'
      },
      {
        id: 'pbi-th-02',
        skill: 'Power BI',
        type: 'theory',
        difficulty: 'Applied',
        domain: 'DAX Context',
        question: 'What occurs during DAX Context Transition when invoking a measure inside an iterator function like SUMX?',
        options: [
          'The active row context is converted into an equivalent filter context.',
          'The DAX engine throws a memory recursion exception.',
          'The measure executes only once and duplicates across all iterations.',
          'Row context is permanently discarded.'
        ],
        correctAnswer: 0,
        explanation: 'CALCULATE converts row context columns into a filter context during context transition.'
      }
    ],
    coding: [
      {
        id: 'pbi-cd-01',
        skill: 'Power BI',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'DAX CALCULATE',
        title: 'DAX Filter Context Override',
        prompt: 'Predict the scalar numeric result returned by this DAX measure:',
        code: `-- Total Company Sales: $500,000
-- West Region represents 40% ($200,000)

WestRevenue = 
CALCULATE(
    SUM(Sales[Revenue]),
    Sales[Region] = "West"
)`,
        expectedOutput: '200000',
        explanation: 'CALCULATE sets Region = West, evaluating 40% of 500,000 = 200,000.'
      },
      {
        id: 'pbi-cd-02',
        skill: 'Power BI',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'DAX DIVIDE',
        title: 'DAX Margin Percentage',
        prompt: 'Compute the integer profit margin percentage returned by this measure for Margin=40000 and Revenue=200000:',
        code: `MarginPct = 
INT(
    DIVIDE(
        SUM(Sales[Margin]),
        SUM(Sales[Revenue]),
        0
    ) * 100
)`,
        expectedOutput: '20',
        explanation: '(40,000 / 200,000) * 100 = 20%.'
      }
    ]
  },

  'excel': {
    theory: [
      {
        id: 'xls-th-01',
        skill: 'Excel',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Dynamic Lookups',
        question: 'Why is XLOOKUP or INDEX/MATCH superior to traditional VLOOKUP for robust analytical models?',
        options: [
          'They decouple lookup and return arrays, safely looking left and resisting column insertion/deletion breaks.',
          'VLOOKUP is limited to integer values only.',
          'XLOOKUP automatically compiles formulas to SQL queries.',
          'VLOOKUP only works on sheets with fewer than 500 rows.'
        ],
        correctAnswer: 0,
        explanation: 'XLOOKUP and INDEX/MATCH decouple lookup and return ranges, preventing formula breakage when columns move.'
      }
    ],
    coding: [
      {
        id: 'xls-cd-01',
        skill: 'Excel',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'INDEX & MATCH',
        title: 'INDEX & MATCH Exact Lookup',
        prompt: 'Given range A1:A3 = [100, 250, 400] and labels B1:B3 = ["Bronze", "Silver", "Gold"], what value is returned?',
        code: `=INDEX(A1:A3, MATCH("Silver", B1:B3, 0))`,
        expectedOutput: '250',
        explanation: 'MATCH("Silver", B1:B3, 0) finds index 2. INDEX(A1:A3, 2) returns 250.'
      },
      {
        id: 'xls-cd-02',
        skill: 'Excel',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'SUMIFS Criteria',
        title: 'SUMIFS Multi-Condition Sum',
        prompt: 'Given Regions A1:A4 = ["North", "South", "North", "North"] and Amounts B1:B4 = [80, 40, 100, 30], what is the result?',
        code: `=SUMIFS(B1:B4, A1:A4, "North", B1:B4, ">=50")`,
        expectedOutput: '180',
        explanation: "Rows 1 (80) and 3 (100) match Region='North' and Amount >= 50. Total = 80 + 100 = 180."
      }
    ]
  },

  'python': {
    theory: [
      {
        id: 'py-th-01',
        skill: 'Python',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Data Wrangling',
        question: 'Which Pandas method correctly drops rows where the spend column has missing (null/NaN) values?',
        options: [
          'df.dropna(subset=["spend"])',
          'df.drop_nulls(columns="spend")',
          'df.filter(lambda x: x.spend is not None)',
          'df.remove(df["spend"] == np.nan)'
        ],
        correctAnswer: 0,
        explanation: 'df.dropna(subset=["spend"]) inspects only the specified column(s) and drops rows containing NaN values.'
      }
    ],
    coding: [
      {
        id: 'py-cd-01',
        skill: 'Python',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Dict Comprehension',
        title: 'Dict Comprehension & Key Sorting',
        prompt: 'What is the exact output printed by this Python program?',
        code: `records = {"alpha": 12, "beta": 5, "gamma": 18, "delta": 3}
filtered = {k: v * 2 for k, v in records.items() if v >= 10}
print(sorted(filtered.keys()))`,
        expectedOutput: "['alpha', 'gamma']",
        explanation: "Only 'alpha' (12) and 'gamma' (18) have v >= 10. sorted(filtered.keys()) returns ['alpha', 'gamma']."
      },
      {
        id: 'py-cd-02',
        skill: 'Python',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'List Comprehension',
        title: 'Odd Square List Transformation',
        prompt: 'Predict the exact output printed by this script:',
        code: `nums = [1, 2, 3, 4, 5]
sq_odds = [x ** 2 for x in nums if x % 2 != 0]
print(sq_odds)`,
        expectedOutput: '[1, 9, 25]',
        explanation: 'Odd numbers are 1, 3, 5. Their squares are 1, 9, 25. Result is [1, 9, 25].'
      }
    ]
  },

  'data-storytelling': {
    theory: [
      {
        id: 'story-th-01',
        skill: 'Data Storytelling',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Executive Framing',
        question: 'According to executive communication frameworks (e.g. Minto Pyramid), how should analytical findings be structured?',
        options: [
          'Lead with the business impact and specific operational recommendations first, followed by supporting evidence.',
          'Document every query and data cleaning error log before mentioning results.',
          'Use decorative 3D graphics to maximize visual excitement.',
          'Avoid drawing conclusions so stakeholders interpret data independently.'
        ],
        correctAnswer: 0,
        explanation: 'Executive communication leads with the actionable recommendation and bottom-line impact upfront.'
      }
    ],
    coding: [
      {
        id: 'story-cd-01',
        skill: 'Data Storytelling',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Net Retention Rate',
        title: 'Net Retention Rate (NRR) Tracing',
        prompt: 'Compute the Net Retention Rate percentage (integer value) for this revenue model:',
        code: `Beginning_MRR = 100
Expansion_MRR = 20
Churned_MRR   = 5
Contraction   = 5

NRR = ((Beginning_MRR + Expansion_MRR - Churned_MRR - Contraction) / Beginning_MRR) * 100
print(int(NRR))`,
        expectedOutput: '110',
        explanation: '(100 + 20 - 5 - 5) = 110. (110 / 100) * 100 = 110%.'
      },
      {
        id: 'story-cd-02',
        skill: 'Data Storytelling',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'CAC Payback',
        title: 'Customer Acquisition Payback Months',
        prompt: 'Calculate the CAC payback period in months (integer):',
        code: `CAC = 1200
ARPU_Monthly = 150
Gross_Margin = 0.80

Monthly_Gross_Profit = ARPU_Monthly * Gross_Margin
Payback_Months = CAC / Monthly_Gross_Profit
print(int(Payback_Months))`,
        expectedOutput: '10',
        explanation: 'Monthly Gross Profit = 150 * 0.80 = 120. Payback = 1200 / 120 = 10 months.'
      }
    ]
  },

  // =========================================================================
  // BACKEND DEVELOPER & NODE.JS
  // =========================================================================
  'node-js-rest-apis': {
    theory: [
      {
        id: 'be-api-th-01',
        skill: 'Node.js & REST APIs',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'HTTP Status Codes',
        question: 'Which HTTP status code is semantic when a client sends syntactically valid JSON that fails business validation rules?',
        options: [
          '422 Unprocessable Entity',
          '401 Unauthorized',
          '500 Internal Server Error',
          '204 No Content'
        ],
        correctAnswer: 0,
        explanation: 'HTTP 422 Unprocessable Entity indicates valid syntax but semantic or business validation errors in the payload.'
      },
      {
        id: 'be-api-th-02',
        skill: 'Node.js & REST APIs',
        type: 'theory',
        difficulty: 'Applied',
        domain: 'Asynchronous I/O',
        question: 'In Node.js asynchronous event-driven architecture, what happens if CPU-heavy computations run on the main thread?',
        options: [
          'The event loop is blocked, preventing incoming HTTP requests and I/O callbacks from executing.',
          'Node.js automatically spawns background threads for synchronous loops.',
          'The CPU frequency scales up to prevent blocking.',
          'Incoming HTTP requests are automatically cached in Redis.'
        ],
        correctAnswer: 0,
        explanation: 'Because JavaScript execution in Node.js is single-threaded, CPU-intensive loops block the event loop from processing I/O events.'
      }
    ],
    coding: [
      {
        id: 'be-api-cd-01',
        skill: 'Node.js & REST APIs',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Webhook Validation',
        title: 'Webhook Status Code Tracing',
        prompt: 'Determine the HTTP status code returned by this webhook handler:',
        code: `function handleWebhook(req) {
  const { apiKey, payload } = req.body || {};
  if (!apiKey) return 401;
  if (!payload || typeof payload.id !== 'string') return 422;
  return 200;
}

const req = { body: { apiKey: 'live_sec_99', payload: { id: 12345 } } };
console.log(handleWebhook(req));`,
        expectedOutput: '422',
        explanation: 'apiKey is provided, but payload.id is an integer (12345) rather than a string, returning 422.'
      },
      {
        id: 'be-api-cd-02',
        skill: 'Node.js & REST APIs',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Auth Header Extraction',
        title: 'Bearer Header Token Extraction',
        prompt: 'What value is printed after extracting the token string?',
        code: `function parseAuth(header) {
  if (!header || !header.startsWith('Bearer ')) return 'NO_AUTH';
  return header.split(' ')[1];
}

console.log(parseAuth('Bearer token_xyz_77'));`,
        expectedOutput: 'token_xyz_77',
        explanation: "Splitting on space gives ['Bearer', 'token_xyz_77'], returning 'token_xyz_77'."
      }
    ]
  },

  'relational-databases-sql': {
    theory: [
      {
        id: 'be-sql-th-01',
        skill: 'Relational Databases & SQL',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'ACID Properties',
        question: 'In database ACID transaction guarantees, what does the "Isolation" property ensure?',
        options: [
          'Concurrent transactions execute without interfering with one another or reading intermediate uncommitted states.',
          'Database tables are stored in isolated physical disk sectors.',
          'Transactions run strictly in single-threaded mode.',
          'All database users have isolated database credentials.'
        ],
        correctAnswer: 0,
        explanation: 'Isolation ensures that concurrent transactions operate independently without seeing incomplete changes.'
      }
    ],
    coding: [
      {
        id: 'be-sql-cd-01',
        skill: 'Relational Databases & SQL',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'LEFT JOIN Filter',
        title: 'LEFT JOIN Orphan Record Count',
        prompt: 'Determine the count of users with zero orders:',
        code: `-- Users (id): [10, 20, 30, 40]
-- Orders (user_id): [10, 30]

SELECT COUNT(*)
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.user_id IS NULL;`,
        expectedOutput: '2',
        explanation: 'Users 20 and 40 have no orders, returning 2 rows.'
      }
    ]
  },

  'system-design-architecture': {
    theory: [
      {
        id: 'sys-th-01',
        skill: 'System Design & Architecture',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Caching Strategies',
        question: 'What is the Cache-Aside (Lazy Loading) caching pattern?',
        options: [
          'The application queries the cache first; if missing (cache miss), it fetches from database and writes the result to cache.',
          'The database writes to cache automatically on every insert.',
          'All read queries bypass the cache and read from replica disks.',
          'The cache permanently persists all database transactions.'
        ],
        correctAnswer: 0,
        explanation: 'Cache-Aside checks cache first; on a miss, the application loads data from DB and populates the cache for subsequent requests.'
      }
    ],
    coding: [
      {
        id: 'sys-cd-01',
        skill: 'System Design & Architecture',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Rate Limiter Token Bucket',
        title: 'Token Bucket Rate Limiter',
        prompt: 'Predict the remaining token count after processing 3 requests:',
        code: `class TokenBucket:
    def __init__(self, capacity=10):
        self.tokens = capacity
    def consume(self, amount=1):
        if self.tokens >= amount:
            self.tokens -= amount
            return True
        return False

bucket = TokenBucket(10)
bucket.consume(2)
bucket.consume(1)
print(bucket.tokens)`,
        expectedOutput: '7',
        explanation: '10 - 2 = 8, 8 - 1 = 7 remaining tokens.'
      }
    ]
  },

  'docker-containerization': {
    theory: [
      {
        id: 'doc-th-01',
        skill: 'Docker & Containerization',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Multi-Stage Builds',
        question: 'Why are multi-stage Docker builds recommended for production images?',
        options: [
          'They separate the build toolchain from the minimal runtime image, reducing image size and attack surface.',
          'They allow containers to run without an operating system kernel.',
          'They eliminate the need for container port exposure.',
          'They bypass container CPU limits.'
        ],
        correctAnswer: 0,
        explanation: 'Multi-stage builds compile artifacts in an intermediate build stage and copy only runtime files to the final lean image.'
      }
    ],
    coding: [
      {
        id: 'doc-cd-01',
        skill: 'Docker & Containerization',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Port Mapping',
        title: 'Docker Port Map Extraction',
        prompt: 'Given the Docker run command `docker run -d -p 8080:3000 --name web app:v1`, what is the host port opened to external traffic?',
        code: `const cmd = "docker run -d -p 8080:3000 --name web app:v1";
const match = cmd.match(/-p\\s+(\\d+):(\\d+)/);
console.log(match ? match[1] : 'NONE');`,
        expectedOutput: '8080',
        explanation: 'In `-p host:container`, 8080 is the host port accessible externally.'
      },
      {
        id: 'doc-cd-02',
        skill: 'Docker & Containerization',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Dockerfile Layers',
        title: 'Multi-Stage Output Size',
        prompt: 'What number of layers is copied to the final stage in this Dockerfile?',
        code: `stages = [
  {"stage": "builder", "copies": ["src/", "package.json", "tsconfig.json"]},
  {"stage": "runner", "copies": ["dist/index.js", "package.json"]}
]
print(len(stages[1]["copies"]))`,
        expectedOutput: '2',
        explanation: 'The runner stage copies 2 artifacts: dist/index.js and package.json.'
      }
    ]
  },

  'cloud-deployment': {
    theory: [
      {
        id: 'cld-dep-th-01',
        skill: 'Cloud Deployment',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Health Checks',
        question: 'What is the purpose of distinguishing between liveness probes and readiness probes in cloud container orchestration?',
        options: [
          'Liveness checks if the container is running (restarting if failed), while readiness checks if it is prepared to receive network traffic.',
          'Liveness checks server CPU speed while readiness checks memory size.',
          'Liveness is for development while readiness is for production.',
          'They perform identical tasks and can be used interchangeably.'
        ],
        correctAnswer: 0,
        explanation: 'Liveness probes detect deadlocks/crashes to trigger pod restarts; readiness probes gate whether traffic is routed to the container.'
      }
    ],
    coding: [
      {
        id: 'cld-dep-cd-01',
        skill: 'Cloud Deployment',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Env Configuration',
        title: 'Environment Port Fallback',
        prompt: 'What port integer is printed when process.env.PORT is undefined?',
        code: `function getServerPort(envPort) {
  return parseInt(envPort || '8000', 10);
}

console.log(getServerPort(undefined));`,
        expectedOutput: '8000',
        explanation: 'Fallback string 8000 is parsed as integer 8000.'
      }
    ]
  },

  // =========================================================================
  // FRONTEND DEVELOPER & REACT
  // =========================================================================
  'html-modern-css': {
    theory: [
      {
        id: 'fe-css-th-01',
        skill: 'HTML & Modern CSS',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'CSS Specificity',
        question: 'In standard CSS cascade specificity rules, which selector has the highest specificity score?',
        options: [
          'ID selector (#header)',
          'Class selector (.container)',
          'Element selector (div)',
          'Universal selector (*)'
        ],
        correctAnswer: 0,
        explanation: 'ID selectors (0,1,0,0) have higher specificity than class (0,0,1,0) and element (0,0,0,1) selectors.'
      }
    ],
    coding: [
      {
        id: 'fe-css-cd-01',
        skill: 'HTML & Modern CSS',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Box Model Math',
        title: 'CSS Box Model Total Width',
        prompt: 'Calculate total element width (content-box) for width=200px, padding=20px, border=5px:',
        code: `width = 200
padding = 20 * 2  # left and right
border = 5 * 2    # left and right
total_width = width + padding + border
print(total_width)`,
        expectedOutput: '250',
        explanation: '200 + 40 + 10 = 250px.'
      }
    ]
  },

  'javascript-esnext': {
    theory: [
      {
        id: 'fe-js-th-01',
        skill: 'JavaScript & ESNext',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Event Loop',
        question: 'In the JavaScript event loop, what is the execution order between microtasks (Promise.then) and macrotasks (setTimeout)?',
        options: [
          'All microtasks execute immediately after synchronous execution before the next macrotask begins.',
          'Macrotasks execute before microtasks.',
          'They alternate on every event loop tick.',
          'Microtasks only run when the tab is hidden.'
        ],
        correctAnswer: 0,
        explanation: 'The microtask queue is completely drained before processing the next macrotask in the event loop.'
      }
    ],
    coding: [
      {
        id: 'fe-js-cd-01',
        skill: 'JavaScript & ESNext',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Array Pipeline',
        title: 'Array Filter, Map & Reduce',
        prompt: 'Predict the number printed to the console after executing this pipeline:',
        code: `const items = [
  { id: 1, val: 10, active: true },
  { id: 2, val: 25, active: false },
  { id: 3, val: 15, active: true }
];

const total = items
  .filter(x => x.active)
  .map(x => x.val * 2)
  .reduce((acc, curr) => acc + curr, 0);

console.log(total);`,
        expectedOutput: '50',
        explanation: 'Active items 1 (10) and 3 (15) become 20 and 30. Sum = 50.'
      },
      {
        id: 'fe-js-cd-02',
        skill: 'JavaScript & ESNext',
        type: 'coding',
        difficulty: 'Applied',
        domain: 'Closure State',
        title: 'Closure Counter Output',
        prompt: 'What value is printed to the console?',
        code: `function makeCounter(start) {
  let val = start;
  return () => { val += 3; return val; };
}
const c = makeCounter(10);
c(); c();
console.log(c());`,
        expectedOutput: '19',
        explanation: '10 -> 13 -> 16 -> 19.'
      }
    ]
  },

  'react-ecosystem': {
    theory: [
      {
        id: 'fe-re-th-01',
        skill: 'React Ecosystem',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'State Updates',
        question: 'Why should state updaters use functional state updates (setCount(c => c + 1)) when new state depends on previous state?',
        options: [
          'State updates in React are batched and asynchronous; functional updates guarantee access to the latest committed state.',
          'Functional updates bypass React virtual DOM reconciliation entirely.',
          'Standard state updates cause syntax errors in React 18+.',
          'Functional updates prevent component rendering.'
        ],
        correctAnswer: 0,
        explanation: 'Functional state updaters prevent race conditions when multiple state updates are batched.'
      }
    ],
    coding: [
      {
        id: 'fe-re-cd-01',
        skill: 'React Ecosystem',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'State Batched Update',
        title: 'React Functional State Updater',
        prompt: 'Predict the final count after executing both updater functions on count=0:',
        code: `let count = 0;
const updater1 = (c) => c + 1;
const updater2 = (c) => c + 2;

count = updater2(updater1(count));
console.log(count);`,
        expectedOutput: '3',
        explanation: '0 + 1 = 1, then 1 + 2 = 3.'
      }
    ]
  },

  'ui-ux-implementation': {
    theory: [
      {
        id: 'fe-ui-th-01',
        skill: 'UI / UX Implementation',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Design Tokens',
        question: 'What is the primary benefit of defining design tokens (spacing, typography, color palettes) in CSS variables or theme configs?',
        options: [
          'Guarantees visual consistency across the entire UI and enables effortless theme switching (dark mode).',
          'Eliminates all JavaScript bundle size.',
          'Replaces HTML layout elements with native canvas.',
          'Accelerates server SQL query speeds.'
        ],
        correctAnswer: 0,
        explanation: 'Design tokens centralize design decisions into reusable variables, ensuring system consistency.'
      }
    ],
    coding: [
      {
        id: 'fe-ui-cd-01',
        skill: 'UI / UX Implementation',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Rem to Px',
        title: 'Design Token Rem to Pixel',
        prompt: 'Calculate pixel value for 2.5rem with a 16px base font size:',
        code: `rem_val = 2.5
base_px = 16
total_px = int(rem_val * base_px)
print(total_px)`,
        expectedOutput: '40',
        explanation: '2.5 * 16 = 40px.'
      }
    ]
  },

  'web-performance-accessibility': {
    theory: [
      {
        id: 'fe-perf-th-01',
        skill: 'Web Performance & Accessibility',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Core Web Vitals',
        question: 'What does the Core Web Vitals metric Largest Contentful Paint (LCP) measure?',
        options: [
          'The time it takes for the largest visual content element (hero image/heading) to render in the viewport.',
          'The total time required to download all CSS files.',
          'The number of JavaScript console errors thrown on page load.',
          'The database query latency on the backend.'
        ],
        correctAnswer: 0,
        explanation: 'LCP measures perceived load speed by timing when the main viewport content element finishes rendering.'
      }
    ],
    coding: [
      {
        id: 'fe-perf-cd-01',
        skill: 'Web Performance & Accessibility',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Aspect Ratio',
        title: 'Responsive Aspect Ratio Padding',
        prompt: 'Calculate 16:9 aspect ratio padding-top percentage (rounded to 2 decimals):',
        code: `ratio_pct = (9 / 16) * 100
print(round(ratio_pct, 2))`,
        expectedOutput: '56.25',
        explanation: '(9 / 16) * 100 = 56.25%.'
      }
    ]
  },

  // =========================================================================
  // SOFTWARE DEVELOPER & CS FUNDAMENTALS
  // =========================================================================
  'core-programming-oop': {
    theory: [
      {
        id: 'sw-oop-th-01',
        skill: 'Core Programming & OOP',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'SOLID Principles',
        question: 'What does the Single Responsibility Principle (SRP) dictate in software design?',
        options: [
          'A module, class, or function should have one, and only one, reason to change.',
          'Every program must run on a single CPU thread.',
          'Classes can only contain a single private method.',
          'Database operations cannot be called from classes.'
        ],
        correctAnswer: 0,
        explanation: 'SRP states that a class should encapsulate a single responsibility or business actor reason to change.'
      }
    ],
    coding: [
      {
        id: 'sw-oop-cd-01',
        skill: 'Core Programming & OOP',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Polymorphism',
        title: 'Polymorphic Method Execution',
        prompt: 'Determine the return value printed by this polymorphic subclass call:',
        code: `class Shape:
    def area(self): return 0

class Square(Shape):
    def __init__(self, s): self.s = s
    def area(self): return self.s * self.s

sq = Square(6)
print(sq.area())`,
        expectedOutput: '36',
        explanation: 'Square overrides area() to return 6 * 6 = 36.'
      }
    ]
  },

  'data-structures': {
    theory: [
      {
        id: 'ds-th-01',
        skill: 'Data Structures',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Hash Tables',
        question: 'What is the average time complexity for searching an element in a Hash Table?',
        options: [
          'O(1) Constant Time',
          'O(N) Linear Time',
          'O(log N) Logarithmic Time',
          'O(N^2) Quadratic Time'
        ],
        correctAnswer: 0,
        explanation: 'Hash tables offer O(1) average lookup time via key hashing.'
      }
    ],
    coding: [
      {
        id: 'ds-cd-01',
        skill: 'Data Structures',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Stack Operations',
        title: 'Stack LIFO Execution Trace',
        prompt: 'Determine the array printed after all stack operations in sequence:',
        code: `stack = []
output = []
operations = [("PUSH", 5), ("PUSH", 9), ("POP", None), ("PUSH", 2), ("POP", None)]

for op, val in operations:
    if op == "PUSH":
        stack.append(val)
    elif op == "POP" and stack:
        output.append(stack.pop())

print(output)`,
        expectedOutput: '[9, 2]',
        explanation: 'POP yields 9, then POP yields 2. Result is [9, 2].'
      }
    ]
  },

  'algorithms': {
    theory: [
      {
        id: 'algo-th-01',
        skill: 'Algorithms',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Big-O Analysis',
        question: 'What is the time complexity of Binary Search on a sorted array of N elements?',
        options: [
          'O(log N) Logarithmic Time',
          'O(N) Linear Time',
          'O(N log N) Linearithmic Time',
          'O(1) Constant Time'
        ],
        correctAnswer: 0,
        explanation: 'Binary search halves the search space on each step, yielding O(log N) complexity.'
      }
    ],
    coding: [
      {
        id: 'algo-cd-01',
        skill: 'Algorithms',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Binary Search Step Count',
        title: 'Binary Search Step Count',
        prompt: 'Calculate the maximum number of comparison steps to find an element in a 16-element sorted array:',
        code: `import math
n = 16
steps = int(math.log2(n))
print(steps)`,
        expectedOutput: '4',
        explanation: 'log2(16) = 4 steps.'
      }
    ]
  },

  'git-version-control': {
    theory: [
      {
        id: 'git-th-01',
        skill: 'Git & Version Control',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Branching Models',
        question: 'What is the primary difference between `git merge` and `git rebase`?',
        options: [
          'Merge creates a new commit combining branch histories; rebase replays commits onto the target base creating a linear history.',
          'Rebase permanently deletes all commit history.',
          'Merge only works on remote repositories.',
          'Rebase cannot be executed on feature branches.'
        ],
        correctAnswer: 0,
        explanation: 'Merge preserves branch topology with a merge commit, while rebase linearizes commit history.'
      }
    ],
    coding: [
      {
        id: 'git-cd-01',
        skill: 'Git & Version Control',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Merge Parent Count',
        title: 'Git Merge Commit Parents',
        prompt: 'How many parent commit hashes does a standard 2-branch merge commit possess?',
        code: `parents = ["commit_main_sha", "commit_feature_sha"]
print(len(parents))`,
        expectedOutput: '2',
        explanation: 'A 2-branch merge commit has exactly 2 parent commits.'
      }
    ]
  },

  'software-engineering-principles': {
    theory: [
      {
        id: 'swe-th-01',
        skill: 'Software Engineering Principles',
        type: 'theory',
        difficulty: 'Foundation',
        domain: 'Testing & Mocking',
        question: 'Why are mock dependencies used in automated unit tests instead of connecting to live production databases?',
        options: [
          'Mocks isolate the unit under test, deliver deterministic fast execution, and eliminate production side-effects.',
          'Live database connections are prohibited by programming languages.',
          'Mock tests run only inside web browsers.',
          'Live databases cannot store test strings.'
        ],
        correctAnswer: 0,
        explanation: 'Unit tests isolate logic and execute in milliseconds by substituting real dependencies with mocks.'
      }
    ],
    coding: [
      {
        id: 'swe-cd-01',
        skill: 'Software Engineering Principles',
        type: 'coding',
        difficulty: 'Foundation',
        domain: 'Retry Backoff',
        title: 'Exponential Backoff Delay',
        prompt: 'Calculate the delay in milliseconds for attempt=3 with base=100ms (formula: base * 2^(attempt-1)):',
        code: `base_ms = 100
attempt = 3
delay = base_ms * (2 ** (attempt - 1))
print(delay)`,
        expectedOutput: '400',
        explanation: '100 * (2^2) = 100 * 4 = 400ms.'
      }
    ]
  }
};

/**
 * Returns a matched question pool for any skill name.
 * Normalizes all possible skill variants to guarantee genuine competency questions.
 */
export function getSkillQuestionPool(skillName: string): SkillQuestionPool {
  const normalized = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  // Exact match
  if (QUESTION_BANK[normalized]) {
    return QUESTION_BANK[normalized];
  }

  // Alias / heuristic mappings for composite skill names
  if (normalized.includes('sql') || normalized.includes('relational') || normalized.includes('database')) {
    return QUESTION_BANK['sql'] || QUESTION_BANK['relational-databases-sql'];
  }
  if (normalized.includes('power-bi') || normalized.includes('dax')) {
    return QUESTION_BANK['power-bi'];
  }
  if (normalized.includes('excel') || normalized.includes('spreadsheet') || normalized.includes('financial-modeling')) {
    return QUESTION_BANK['excel'];
  }
  if (normalized.includes('python') || normalized.includes('pandas')) {
    return QUESTION_BANK['python'];
  }
  if (normalized.includes('storytelling') || normalized.includes('communication') || normalized.includes('stakeholder')) {
    return QUESTION_BANK['data-storytelling'];
  }
  if (normalized.includes('api') || normalized.includes('rest') || normalized.includes('endpoint')) {
    return QUESTION_BANK['node-js-rest-apis'];
  }
  if (normalized.includes('javascript') || normalized.includes('esnext') || normalized.includes('typescript')) {
    return QUESTION_BANK['javascript-esnext'];
  }
  if (normalized.includes('css') || normalized.includes('html') || normalized.includes('styling')) {
    return QUESTION_BANK['html-modern-css'];
  }
  if (normalized.includes('react') || normalized.includes('frontend')) {
    return QUESTION_BANK['react-ecosystem'];
  }
  if (normalized.includes('ui') || normalized.includes('ux') || normalized.includes('figma') || normalized.includes('design')) {
    return QUESTION_BANK['ui-ux-implementation'];
  }
  if (normalized.includes('performance') || normalized.includes('accessibility') || normalized.includes('vitals')) {
    return QUESTION_BANK['web-performance-accessibility'];
  }
  if (normalized.includes('docker') || normalized.includes('container')) {
    return QUESTION_BANK['docker-containerization'];
  }
  if (normalized.includes('system') || normalized.includes('architecture') || normalized.includes('scalab')) {
    return QUESTION_BANK['system-design-architecture'];
  }
  if (normalized.includes('cloud') || normalized.includes('aws') || normalized.includes('terraform') || normalized.includes('deploy')) {
    return QUESTION_BANK['cloud-deployment'];
  }
  if (normalized.includes('structure') || normalized.includes('stack') || normalized.includes('tree')) {
    return QUESTION_BANK['data-structures'];
  }
  if (normalized.includes('algo') || normalized.includes('search') || normalized.includes('sort')) {
    return QUESTION_BANK['algorithms'];
  }
  if (normalized.includes('git') || normalized.includes('version') || normalized.includes('ci-cd')) {
    return QUESTION_BANK['git-version-control'];
  }
  if (normalized.includes('principle') || normalized.includes('testing') || normalized.includes('clean-code') || normalized.includes('oop')) {
    return QUESTION_BANK['core-programming-oop'] || QUESTION_BANK['software-engineering-principles'];
  }

  // Check any partial key match in QUESTION_BANK
  for (const key of Object.keys(QUESTION_BANK)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return QUESTION_BANK[key];
    }
  }

  // Safe fallback default: SQL
  return QUESTION_BANK['sql'];
}

/**
 * Selects 1 theory question and 1 coding challenge for a given skill.
 * Selects pseudo-randomly based on an attempt seed to ensure dynamic variety across retakes.
 */
export function selectQuestionsForSkill(
  roleId: string,
  skillName: string,
  domain: string,
  topics?: string[],
  attemptSeed: number = 0
): AssessmentQuestion[] {
  const pool = getSkillQuestionPool(skillName);

  // Pick theory question from pool
  const theoryPool = pool.theory.length > 0 ? pool.theory : [];
  const theoryIndex = Math.abs(attemptSeed + skillName.length) % Math.max(theoryPool.length, 1);
  const rawTheory = theoryPool[theoryIndex];

  const theoryQuestion: AssessmentQuestion = rawTheory
    ? {
        ...rawTheory,
        id: `${roleId}-${rawTheory.id}`,
        skill: skillName,
        domain: domain || rawTheory.domain
      }
    : (() => {
        const primaryTopic = topics?.[0] || 'core architecture';
        return {
          id: `${roleId}-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-th`,
          skill: skillName,
          type: 'theory' as const,
          difficulty: 'Foundation' as const,
          domain: domain,
          question: `In professional ${skillName}, which foundational principle is critical when architecting solutions regarding ${primaryTopic}?`,
          options: [
            `Establishing clear specifications, baseline schemas, and deterministic constraints around ${primaryTopic}`,
            `Skipping initial documentation and deploying immediately to production environments`,
            `Relying solely on default settings without parameter tuning or environment validation`,
            `Ignoring security context and role-based access to speed up delivery`
          ],
          correctAnswer: 0,
          explanation: `Foundational mastery requires rigorous parameter specification and constraints around ${primaryTopic}.`
        };
      })();

  // Pick coding challenge from pool
  const codingPool = pool.coding.length > 0 ? pool.coding : [];
  const codingIndex = Math.abs(attemptSeed + skillName.length * 3 + 1) % Math.max(codingPool.length, 1);
  const rawCoding = codingPool[codingIndex];

  const codingQuestion: AssessmentQuestion = rawCoding
    ? {
        ...rawCoding,
        id: `${roleId}-${rawCoding.id}`,
        skill: skillName,
        domain: domain || rawCoding.domain
      }
    : {
        id: `${roleId}-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cd`,
        skill: skillName,
        type: 'coding',
        difficulty: 'Applied',
        domain: domain,
        title: `${skillName} Execution Tracing`,
        prompt: `Trace the ${skillName} logic and determine the exact return output:`,
        code: `def process_records(items, min_val=20):
    return len([x for x in items if x >= min_val])

print(process_records([10, 25, 30, 15, 40]))`,
        expectedOutput: '3',
        explanation: 'Values 25, 30, and 40 are >= 20. Total count is 3.'
      };

  return [theoryQuestion, codingQuestion];
}
