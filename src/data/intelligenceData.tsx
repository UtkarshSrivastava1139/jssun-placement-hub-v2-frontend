import {
  Award,
  Briefcase,
  Building2,
  Cpu,
  Eye,
  Globe,
  Handshake,
  HeartPulse,
  Leaf,
  MapPin,
  Megaphone,
  Newspaper,
  Phone,
  Shield,
  ShieldCheck,
  Star,
  Swords,
  Target,
  TrendingUp,
  Users,
  Wallet,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { isForbiddenKey, titleCaseFromCode, type CompanyProfile } from "@/lib/companyData";

export type FieldType = "auto" | "url" | "video" | "rating" | "list" | "paragraph";

export interface IntelligenceField {
  key: string;
  label: string;
  type: FieldType;
  value?: string | undefined;
}

export interface IntelligenceSection {
  id: string;
  title: string;
  icon: LucideIcon;
  fields: IntelligenceField[];
}

export interface IntelligenceChapter {
  id: string;
  title: string;
  sectionIds: readonly string[];
}

export const INTELLIGENCE_CHAPTERS: readonly IntelligenceChapter[] = [
  { id: "firm", title: "The firm", sectionIds: ["identity", "overview", "leadership", "funding"] },
  {
    id: "market",
    title: "Market",
    sectionIds: ["presence", "products", "tech", "partnerships", "competition", "market"],
  },
  {
    id: "work",
    title: "Work",
    sectionIds: ["location", "safety", "culture", "career", "benefits"],
  },
  { id: "trust", title: "Trust", sectionIds: ["value", "risk", "news", "brand"] },
  { id: "reach", title: "Reach", sectionIds: ["sales", "digital", "contact"] },
];

type Def = [string, string, LucideIcon, (string | [string, FieldType, string?])[]];

const SECTIONS: Def[] = [
  [
    "identity",
    "Company Identity",
    Building2,
    [
      "name",
      "short_name",
      "category",
      "nature_of_company",
      "incorporation_year",
      "employee_size",
      "headquarters_address",
      "office_count",
    ],
  ],
  [
    "overview",
    "Overview & Vision",
    Eye,
    [
      ["overview_text", "paragraph"],
      ["vision_statement", "paragraph"],
      ["mission_statement", "paragraph"],
      "core_values",
      "history_timeline",
    ],
  ],
  [
    "leadership",
    "Leadership",
    Users,
    [
      "ceo_name",
      ["ceo_linkedin_url", "url", "CEO LinkedIn"],
      "key_leaders",
      "board_members",
      "warm_intro_pathways",
      "decision_maker_access",
    ],
  ],
  [
    "funding",
    "Funding & Financials",
    Wallet,
    [
      "annual_revenue",
      "annual_profit",
      "revenue_mix",
      "valuation",
      "yoy_growth_rate",
      "profitability_status",
      "key_investors",
      "recent_funding_rounds",
      "total_capital_raised",
      "customer_acquisition_cost",
      "customer_lifetime_value",
      ["cac_ltv_ratio", "auto", "CAC : LTV Ratio"],
      "churn_rate",
      "net_promoter_score",
      "burn_rate",
      "runway_months",
      "burn_multiplier",
    ],
  ],
  [
    "presence",
    "Global Presence",
    Globe,
    ["operating_countries", "office_locations", "office_count", "global_exposure"],
  ],
  [
    "products",
    "Products & Services",
    Briefcase,
    [
      "offerings_description",
      "focus_sectors",
      "pain_points_addressed",
      "top_customers",
      "product_pipeline",
      "case_studies",
    ],
  ],
  [
    "tech",
    "Technology Stack",
    Cpu,
    [
      "tech_stack",
      "technology_partners",
      "intellectual_property",
      ["r_and_d_investment", "auto", "R&D Investment"],
      ["ai_ml_adoption_level", "auto", "AI/ML Adoption Level"],
      "cybersecurity_posture",
      "tech_adoption_rating",
      "innovation_roadmap",
    ],
  ],
  [
    "partnerships",
    "Partnerships & Ecosystem",
    Handshake,
    ["partnership_ecosystem", "industry_associations", "event_participation"],
  ],
  [
    "competition",
    "Competitive Landscape",
    Swords,
    [
      "key_competitors",
      "market_share_percentage",
      "competitive_advantages",
      "unique_differentiators",
      "weaknesses_gaps",
      "benchmark_vs_peers",
    ],
  ],
  [
    "market",
    "Market Opportunity",
    Target,
    [
      ["tam", "auto", "TAM"],
      ["sam", "auto", "SAM"],
      ["som", "auto", "SOM"],
      "future_projections",
      "strategic_priorities",
      "go_to_market_strategy",
      "sales_motion",
      "key_challenges_needs",
    ],
  ],
  [
    "value",
    "Core Value Proposition & ESG",
    Leaf,
    [
      "core_value_proposition",
      ["esg_ratings", "auto", "ESG Ratings"],
      "carbon_footprint",
      "ethical_sourcing",
      "sustainability_csr",
    ],
  ],
  [
    "culture",
    "Culture & Work Life",
    HeartPulse,
    [
      "work_culture_summary",
      "manager_quality",
      "psychological_safety",
      "feedback_culture",
      "diversity_metrics",
      "diversity_inclusion_score",
      "ethical_standards",
      "burnout_risk",
      "mission_clarity",
      "crisis_behavior",
      "employee_turnover",
      "avg_retention_tenure",
      "hiring_velocity",
      "layoff_history",
    ],
  ],
  [
    "news",
    "Recent News & Milestones",
    Newspaper,
    ["recent_news", "awards_recognitions", "exit_strategy_history"],
  ],
  [
    "sales",
    "Sales & Customer Metrics",
    TrendingUp,
    [
      "sales_motion",
      "customer_concentration_risk",
      "customer_testimonials",
      "net_promoter_score",
      "churn_rate",
    ],
  ],
  [
    "risk",
    "Risk & Compliance",
    Shield,
    [
      "regulatory_status",
      "legal_issues",
      "supply_chain_dependencies",
      "geopolitical_risks",
      "macro_risks",
    ],
  ],
  [
    "location",
    "Work Location & Commute",
    MapPin,
    [
      "remote_policy_details",
      "typical_hours",
      "overtime_expectations",
      "weekend_work",
      "flexibility_level",
      "location_centrality",
      "public_transport_access",
      "cab_policy",
      "airport_commute_time",
      "office_zone_type",
    ],
  ],
  [
    "safety",
    "Safety & Wellbeing",
    ShieldCheck,
    [
      "area_safety",
      "safety_policies",
      "infrastructure_safety",
      "emergency_preparedness",
      "health_support",
    ],
  ],
  [
    "career",
    "Career Growth & Learning",
    GraduationCap,
    [
      "training_spend",
      "onboarding_quality",
      "learning_culture",
      "exposure_quality",
      "mentorship_availability",
      "internal_mobility",
      "promotion_clarity",
      "tools_access",
      "role_clarity",
      "early_ownership",
      "work_impact",
      "execution_thinking_balance",
      "automation_level",
      "cross_functional_exposure",
      "company_maturity",
      "skill_relevance",
      "exit_opportunities",
      "network_strength",
    ],
  ],
  [
    "brand",
    "Brand & Reputation",
    Award,
    [
      "brand_value",
      "brand_sentiment_score",
      "client_quality",
      "external_recognition",
      "awards_recognitions",
      ["marketing_video_url", "video", "Marketing Video"],
    ],
  ],
  [
    "benefits",
    "Compensation & Benefits",
    Star,
    [
      "leave_policy",
      "fixed_vs_variable_pay",
      "bonus_predictability",
      ["esops_incentives", "auto", "ESOPs & Incentives"],
      "family_health_insurance",
      "relocation_support",
      "lifestyle_benefits",
    ],
  ],
  [
    "digital",
    "Digital Presence & Ratings",
    Megaphone,
    [
      ["website_url", "url"],
      ["linkedin_url", "url", "LinkedIn"],
      "twitter_handle",
      ["facebook_url", "url", "Facebook"],
      ["instagram_url", "url", "Instagram"],
      "website_quality",
      ["website_rating", "rating"],
      "website_traffic_rank",
      "social_media_followers",
      ["glassdoor_rating", "rating"],
      ["indeed_rating", "rating"],
      ["google_rating", "rating"],
    ],
  ],
  [
    "contact",
    "Contact Information",
    Phone,
    [
      "primary_contact_email",
      "primary_phone_number",
      "contact_person_name",
      "contact_person_title",
      "contact_person_email",
      "contact_person_phone",
    ],
  ],
];

export function groupSectionsByChapter(sections: IntelligenceSection[]) {
  const byId = new Map(sections.map((s) => [s.id, s]));
  return INTELLIGENCE_CHAPTERS.map((chapter) => ({
    ...chapter,
    sections: chapter.sectionIds.flatMap((id) => {
      const section = byId.get(id);
      return section ? [section] : [];
    }),
  }));
}

export function buildIntelligenceSections(profile?: CompanyProfile): IntelligenceSection[] {
  return SECTIONS.map(([id, title, icon, defs]) => ({
    id,
    title,
    icon,
    fields: defs
      .map((d) => {
        const [key, type, label] = typeof d === "string" ? [d, "auto" as FieldType, undefined] : d;
        return {
          key,
          type,
          label: label ?? titleCaseFromCode(key).replace(/ Url$/, ""),
          value: profile?.[key],
        };
      })
      .filter((f) => !isForbiddenKey(f.key)),
  }));
}
