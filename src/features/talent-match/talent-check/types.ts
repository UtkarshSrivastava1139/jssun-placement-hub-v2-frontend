export type RadixCategoryCode =
  | 'COD'
  | 'DSA'
  | 'OOD'
  | 'APTI'
  | 'COMM'
  | 'AI'
  | 'CLOUD'
  | 'SQL'
  | 'SWE'
  | 'SYSD'
  | 'NETW'
  | 'OS';

export type CompanyKey = 'google' | 'microsoft' | 'oracle_fss';

export type ProfileEvidenceStatus = 'source_supported' | 'self_report_only';

export interface CategoryGapItem {
  category_code: RadixCategoryCode;
  required_level: number;
  candidate_level: number;
  gap_amount: number;
  gap: boolean;
  attainment: number;
  learning_topics: string[];
  profile_evidence_status: ProfileEvidenceStatus;
}

export interface TalentCheckSummary {
  categories_with_gap: number;
  strongest_categories: RadixCategoryCode[];
  interpretation_notice: string;
  categories_with_profile_evidence: number;
}

export interface TalentCheckResult {
  schema_version: '1.0.0';
  assessment_id: string;
  profile_id: string;
  company_key: CompanyKey;
  company_name: string;
  readiness_score: number;
  scoring_version: 'tc-v1';
  created_at: string;
  skillset_gap: CategoryGapItem[];
  assessment_coverage: 1.0;
  evidence_coverage: number;
  summary: TalentCheckSummary;
}

export interface CompanyOption {
  key: CompanyKey;
  name: string;
  description: string;
}

export const TARGET_COMPANIES: CompanyOption[] = [
  {
    key: 'google',
    name: 'Google LLC',
    description: 'High expectations in core computer science, systems design, and algorithmic problem-solving.',
  },
  {
    key: 'microsoft',
    name: 'Microsoft Corporation',
    description: 'Strong balance across software engineering, cloud, system architecture, and collaboration.',
  },
  {
    key: 'oracle_fss',
    name: 'Oracle Financial Services Software',
    description: 'Enterprise SQL, distributed data architectures, analytical logic, and transaction systems.',
  },
];

/**
 * Metadata for the 12 canonical RADIX categories.
 * NOTE: `focus_topics` are informal suggested focus areas (general interview guidance,
 * NOT official or validated RADIX curriculum topics). Official RADIX curriculum topics
 * will be populated via CategoryGapItem.learning_topics once the category-to-curriculum
 * mapping is officially validated.
 */
export const CATEGORY_METADATA: Record<
  RadixCategoryCode,
  { name: string; description: string; focus_topics: string[]; suggested_focus_areas?: string[] }
> = {
  COD: {
    name: 'Coding & Implementation',
    description: 'Clean, idiomatic coding and syntax mastery in core languages',
    focus_topics: ['Idiomatic Code Patterns', 'Memory & Allocation Profiling', 'Defensive Error Handling', 'Boundary Testing'],
    suggested_focus_areas: ['Idiomatic Code Patterns', 'Memory & Allocation Profiling', 'Defensive Error Handling', 'Boundary Testing'],
  },
  DSA: {
    name: 'Data Structures & Algorithms',
    description: 'Complexity analysis, efficient data structures, and algorithmic logic',
    focus_topics: ['Dynamic Programming', 'Graph & Tree Algorithms', 'Amortized Complexity', 'Heaps & Segment Trees'],
  },
  OOD: {
    name: 'Object-Oriented Design',
    description: 'Domain modeling, SOLID design principles, and design patterns',
    focus_topics: ['SOLID Principles', 'Creational & Behavioral Patterns', 'Interface Segregation', 'Domain-Driven Modeling'],
  },
  APTI: {
    name: 'Quantitative & Logical Aptitude',
    description: 'Analytical reasoning, math foundations, and problem decomposition',
    focus_topics: ['Combinatorics & Probability', 'Permutations & Sequences', 'Logical Deduction', 'Time & Distance Puzzles'],
  },
  COMM: {
    name: 'Professional Communication',
    description: 'Technical documentation, team articulation, and presentation',
    focus_topics: ['Technical RFC Writing', 'System Walkthroughs', 'Concise Code Review Comments', 'Cross-Team Communication'],
  },
  AI: {
    name: 'AI & Machine Learning',
    description: 'Machine learning fundamentals, model deployment, and AI concepts',
    focus_topics: ['Transformer Architectures', 'Vector Search & Embeddings', 'Loss Functions & Optimization', 'Evaluation Metrics'],
  },
  CLOUD: {
    name: 'Cloud & DevOps Infrastructure',
    description: 'Cloud providers, containerization, CI/CD, and infrastructure',
    focus_topics: ['Docker & Kubernetes', 'CI/CD Pipelines', 'Cloud IAM & Security', 'Infrastructure as Code (Terraform)'],
  },
  SQL: {
    name: 'Database Systems & SQL',
    description: 'Relational query design, normalization, indexing, and transactions',
    focus_topics: ['Query Plan Optimization', 'ACID & Isolation Levels', 'B-Tree & Composite Indexing', 'Sharding & Replication'],
  },
  SWE: {
    name: 'Software Engineering Principles',
    description: 'Testing methodology, version control, CI/CD, and agile delivery',
    focus_topics: ['Test-Driven Development (TDD)', 'Integration Test Suites', 'Refactoring Legacy Code', 'Git Workflows & Rebasing'],
  },
  SYSD: {
    name: 'System Architecture & Design',
    description: 'Scalability, distributed systems, caching, and service decomposition',
    focus_topics: ['Horizontal Scaling & Caching', 'Message Brokers (Kafka/RabbitMQ)', 'CAP Theorem & Fallbacks', 'Idempotent API Design'],
  },
  NETW: {
    name: 'Computer Networks',
    description: 'Network protocols (TCP/IP, HTTP), sockets, security, and routing',
    focus_topics: ['TCP Congestion Control', 'TLS 1.3 Handshake & Certificates', 'HTTP/2 & HTTP/3 Protocols', 'WebSocket & UDP Sockets'],
  },
  OS: {
    name: 'Operating Systems',
    description: 'Process scheduling, concurrency, virtual memory, and OS primitives',
    focus_topics: ['Virtual Memory & Page Tables', 'Deadlock & Race Condition Avoidance', 'Process Scheduling Algorithms', 'POSIX Threads & Mutexes'],
  },
};

