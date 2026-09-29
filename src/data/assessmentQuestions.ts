import { AssessmentQuestion } from '../types/atlas';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ==================== SQL (3 questions) ====================
  {
    id: 'sql-01',
    skill: 'SQL',
    difficulty: 'Foundation',
    domain: 'Relational DB',
    scenarioContext: `[Customers (customer_id: PK, full_name, signup_date)] ⟷ 1:N ⟷ [Transactions (transaction_id: PK, customer_id: FK, order_value, status)]`,
    question: 'You need to combine customer profile data with transactional logs using a common customer ID. Which SQL operation would you primarily employ?',
    options: [
      'GROUP BY to aggregate records based on defined dimensional keys using summary functions.',
      'JOIN to correlate and combine rows from two or more tables based on a related key attribute.',
      'ORDER BY to sort the resulting query output dataset sequentially in ascending or descending order.',
      'UNION to append the result sets of two separate query outputs vertically with matching schemas.'
    ],
    correctAnswer: 1,
    explanation: 'A JOIN clause correlates rows from two or more tables based on a related column between them (e.g. ON Customers.customer_id = Transactions.customer_id).'
  },
  {
    id: 'sql-02',
    skill: 'SQL',
    difficulty: 'Applied',
    domain: 'Window Functions',
    scenarioContext: `[Sales (rep_id, region, revenue, sale_date)]`,
    question: 'To assign a ranking to each sales representative within their respective region based on total revenue, where ties share the same rank and no rank numbers are skipped, which window function should be used?',
    options: [
      'RANK() OVER (PARTITION BY region ORDER BY revenue DESC)',
      'ROW_NUMBER() OVER (PARTITION BY region ORDER BY revenue DESC)',
      'DENSE_RANK() OVER (PARTITION BY region ORDER BY revenue DESC)',
      'PERCENT_RANK() OVER (PARTITION BY region ORDER BY revenue DESC)'
    ],
    correctAnswer: 2,
    explanation: 'DENSE_RANK() assigns consecutive rankings without gaps when duplicate values occur, unlike RANK() which leaves gaps after ties.'
  },
  {
    id: 'sql-03',
    skill: 'SQL',
    difficulty: 'Advanced',
    domain: 'Optimization & CTEs',
    scenarioContext: `[OrderHistory (order_id, user_id, amount, created_at)] with 25 million records. Query takes 14s.`,
    question: 'A query calculates a 30-day rolling average order value per user. Which approach best prevents an expensive full table re-scan for each row?',
    options: [
      'Correlated subquery with WHERE created_at BETWEEN o1.created_at - 30 AND o1.created_at',
      'Window frame: AVG(amount) OVER (PARTITION BY user_id ORDER BY created_at RANGE BETWEEN INTERVAL 30 DAY PRECEDING AND CURRENT ROW)',
      'Multiple self-joins on user_id with cross-product inequality filters',
      'Exporting raw table to an unindexed staging table and executing nested WHILE loops'
    ],
    correctAnswer: 1,
    explanation: 'The analytical window frame clause with RANGE/ROWS BETWEEN calculates sliding windows in single-pass O(N log N) time without Cartesian product blowups.'
  },

  // ==================== Power BI (3 questions) ====================
  {
    id: 'pbi-01',
    skill: 'Power BI',
    difficulty: 'Foundation',
    domain: 'Data Modeling & Schemas',
    scenarioContext: `[DimDate], [DimCustomer], [DimProduct] ⟷ [FactSales]`,
    question: 'Why is a Star Schema strongly preferred over a single wide, flattened de-normalized flat table in enterprise Power BI models?',
    options: [
      'Power BI VertiPaq engine compresses separate dimension and fact tables far more efficiently and delivers faster columnar query scanning.',
      'A star schema requires less DAX code because measures cannot be written on single flat tables.',
      'Power BI disables chart rendering if table width exceeds 15 columns.',
      'Star schemas eliminate the need for primary keys and foreign keys entirely.'
    ],
    correctAnswer: 0,
    explanation: 'VertiPaq columnar in-memory database optimizes memory footprint through dictionary encoding and run-length encoding when fact tables contain integer foreign keys referencing skinny dimension tables.'
  },
  {
    id: 'pbi-02',
    skill: 'Power BI',
    difficulty: 'Applied',
    domain: 'DAX Filter Context',
    scenarioContext: `TotalSales = SUM(FactSales[Amount])`,
    question: 'You write a DAX measure to calculate total sales for the European region regardless of any slicer selection made on the Region visual filter. Which DAX formulation is correct?',
    options: [
      'CALCULATE([TotalSales], FILTER(ALL(DimRegion), DimRegion[Region] = "Europe"))',
      'SUMIF(DimRegion[Region] = "Europe", FactSales[Amount])',
      'LOOKUPVALUE(FactSales[Amount], DimRegion[Region], "Europe")',
      'RELATEDTABLE(FactSales, DimRegion[Region] == "Europe")'
    ],
    correctAnswer: 0,
    explanation: 'CALCULATE modifies or overrides existing filter context. ALL(DimRegion) strips user slicer filters, while DimRegion[Region] = "Europe" applies the fixed continent context.'
  },
  {
    id: 'pbi-03',
    skill: 'Power BI',
    difficulty: 'Advanced',
    domain: 'Context Transition & Performance',
    scenarioContext: `Iterating over customer table using SUMX`,
    question: 'In DAX, what occurs when a measure containing CALCULATE() is invoked inside an iterator function like SUMX or ADDCOLUMNS?',
    options: [
      'Context Transition occurs: the current row context is automatically converted into an equivalent filter context.',
      'A fatal memory recursion error is thrown because iterators cannot evaluate aggregated measures.',
      'The row context is destroyed and replaced with an unfiltered global table scan.',
      'The measure only evaluates on the very first row and duplicates that value for all subsequent rows.'
    ],
    correctAnswer: 0,
    explanation: 'CALCULATE triggers context transition in DAX: it inspects the current row context across all columns of the current table and converts them into an active filter context.'
  },

  // ==================== Excel (3 questions) ====================
  {
    id: 'xls-01',
    skill: 'Excel',
    difficulty: 'Foundation',
    domain: 'Lookups & References',
    scenarioContext: `Looking up Employee Department based on Employee ID in column C, returning Department from column A.`,
    question: 'Why is XLOOKUP or INDEX/MATCH superior to traditional VLOOKUP for dynamic financial and analytical spreadsheets?',
    options: [
      'VLOOKUP cannot look to the left of the lookup column without restructuring the table, and breaks when columns are inserted or deleted.',
      'VLOOKUP is limited to integer numbers only and cannot match strings or dates.',
      'XLOOKUP automatically converts spreadsheets into SQL databases.',
      'VLOOKUP only works if the workbook is under 1,000 rows.'
    ],
    correctAnswer: 0,
    explanation: 'VLOOKUP relies on a static column index number that breaks when columns shift, and cannot search to the left of the lookup key. XLOOKUP and INDEX/MATCH decouple lookup and return arrays.'
  },
  {
    id: 'xls-02',
    skill: 'Excel',
    difficulty: 'Applied',
    domain: 'Data Modeling & Power Query',
    scenarioContext: `Weekly sales data arrives in 12 separate CSV files in a shared folder with irregular date headers.`,
    question: 'What is the most robust, reproducible workflow in Excel to consolidate and clean this incoming data every week?',
    options: [
      'Write a manual copy-paste sequence recorded with a single macro recorder script.',
      'Use Power Query (Get & Transform) with "From Folder" to dynamically unpivot columns, clean types, and refresh on click.',
      'Use nested IF formulas referencing 12 separate sheets with 50,000 cells each.',
      'Save each file as text and open in Notepad to merge lines manually.'
    ],
    correctAnswer: 1,
    explanation: 'Power Query automated ETL provides declarative, repeatable transformations that handle folder ingestion, unpivoting, and schema transformations without manual copy-paste.'
  },
  {
    id: 'xls-03',
    skill: 'Excel',
    difficulty: 'Advanced',
    domain: 'Dynamic Arrays & Modeling',
    scenarioContext: `Portfolio return simulation with variable hurdle rates.`,
    question: 'How do Excel dynamic array formulas (such as FILTER, UNIQUE, SORT, and LAMBDA) fundamentally differ from legacy Ctrl+Shift+Enter array formulas?',
    options: [
      'Dynamic array formulas spill results automatically into adjacent cells without pre-selecting the exact target range, and recalculate with significantly less memory overhead.',
      'Dynamic array formulas can only output a single scalar numeric value.',
      'Legacy CSE formulas are faster and support cloud co-authoring whereas dynamic arrays do not.',
      'Dynamic array formulas require third-party VBA extensions installed.'
    ],
    correctAnswer: 0,
    explanation: 'Dynamic arrays automatically spill variable-length outputs into contiguous cells (the spill range with # operator) and are natively integrated into the calculation engine.'
  },

  // ==================== Python (3 questions) ====================
  {
    id: 'py-01',
    skill: 'Python',
    difficulty: 'Foundation',
    domain: 'Pandas & Data Wrangling',
    scenarioContext: `df = pd.DataFrame({'customer': ['A', 'B', None, 'D'], 'spend': [120, 300, 450, np.nan]})`,
    question: 'Which Pandas method correctly drops rows where the spend column has missing (null) values while keeping other rows intact?',
    options: [
      'df.dropna(subset=["spend"])',
      'df.drop_nulls(columns="spend")',
      'df.filter(lambda x: x.spend is not None)',
      'df.remove(df["spend"] == np.nan)'
    ],
    correctAnswer: 0,
    explanation: 'df.dropna(subset=["spend"]) inspects only the specified column(s) and drops rows containing NaN values in those columns.'
  },
  {
    id: 'py-02',
    skill: 'Python',
    difficulty: 'Applied',
    domain: 'Vectorization vs Loops',
    scenarioContext: `Calculating customer lifetime tier based on 10 million transactions: tier = 'Gold' if spend > 1000 else 'Silver'`,
    question: 'Which implementation executes with optimal computational speed on a large DataFrame?',
    options: [
      'Iterating through df.iterrows() with a Python for-loop and updating row by row.',
      'Vectorized evaluation using np.select or np.where(df["spend"] > 1000, "Gold", "Silver").',
      'Writing a custom Python while-loop that increments an integer index.',
      'Converting the entire dataframe to a nested dictionary and recursively mapping values.'
    ],
    correctAnswer: 1,
    explanation: 'Vectorized NumPy functions operate directly in compiled C arrays at near-hardware speeds, avoiding Python bytecode interpretation overhead of iterrows() (which can be 100x slower).'
  },
  {
    id: 'py-03',
    skill: 'Python',
    difficulty: 'Advanced',
    domain: 'Exploratory Data Analysis & Grouping',
    scenarioContext: `df.groupby('cohort')['churned'].agg(['count', 'mean'])`,
    question: 'You want to compute the retention rate per acquisition cohort and join the result back to each individual customer record as a new column "cohort_retention". Which method is idiomatic in Pandas?',
    options: [
      'df["cohort_retention"] = df.groupby("cohort")["retained"].transform("mean")',
      'df["cohort_retention"] = df.groupby("cohort")["retained"].apply(lambda s: s.sum())',
      'df["cohort_retention"] = df["cohort"].map(df["retained"].mean())',
      'df["cohort_retention"] = [df[df["cohort"] == c]["retained"].mean() for c in df["cohort"]]'
    ],
    correctAnswer: 0,
    explanation: 'The transform() method calculates aggregated metrics per group and broadcasts the result back to match the original DataFrame index shape.'
  },

  // ==================== Data Storytelling (3 questions) ====================
  {
    id: 'comm-01',
    skill: 'Data Storytelling',
    difficulty: 'Foundation',
    domain: 'Executive Framing',
    scenarioContext: `Presenting quarterly customer churn analysis to the Chief Operating Officer.`,
    question: 'What is the primary objective of an executive summary memo when presenting analytical findings to leadership?',
    options: [
      'Document every SQL query, database table schema, and ETL error log encountered during research.',
      'Lead with the business impact and specific operational recommendations first, followed by quantified evidence.',
      'Use 3D pie charts and decorative graphics to maximize visual excitement.',
      'Avoid giving any definitive conclusion so that executives are forced to explore the raw numbers themselves.'
    ],
    correctAnswer: 1,
    explanation: 'The Minto Pyramid Principle dictates leading with the core takeaway and actionable decision upfront, then supporting it with structured, quantified rationale.'
  },
  {
    id: 'comm-02',
    skill: 'Data Storytelling',
    difficulty: 'Applied',
    domain: 'Metric Translation & ROI',
    scenarioContext: `A machine learning model improves delivery routing efficiency by 3.8%.`,
    question: 'How should an analyst best present this finding to non-technical business stakeholders during an executive review?',
    options: [
      '"Our model RMSE decreased by 0.038 across cross-validated test splits."',
      '"The gradient boosting regressor utilized 150 estimators with a learning rate of 0.05."',
      '"Optimizing routing delivers an estimated $140,000 annual fuel savings and reduces late delivery refunds by 12%."',
      '"The loss function converged in 42 epochs with an Adam optimizer."'
    ],
    correctAnswer: 2,
    explanation: 'Effective data storytelling translates technical variances into bottom-line business metrics: dollars saved, revenue gained, risk mitigated, or customer time preserved.'
  },
  {
    id: 'comm-03',
    skill: 'Data Storytelling',
    difficulty: 'Advanced',
    domain: 'Stakeholder Defense & Uncertainty',
    scenarioContext: `A stakeholder challenges your revenue forecast, arguing that your sample excludes black-swan outliers.`,
    question: 'What is the most rigorous, professional response to defend your methodology in an interview or stakeholder defense?',
    options: [
      'Acknowledge the boundary condition, explain the statistical criteria used for outlier isolation, and present sensitivity confidence intervals showing best/worst case scenarios.',
      'Insist that your Python code had zero errors and therefore the calculation is infallible.',
      'Immediately agree with the stakeholder and discard the entire analysis.',
      'Dismiss the question as irrelevant to basic data analysis.'
    ],
    correctAnswer: 0,
    explanation: 'Senior analysts demonstrate epistemic humility and quantitative rigor by explicitly detailing methodology boundaries, assumptions, and sensitivity intervals under varying conditions.'
  }
];
