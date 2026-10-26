import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { talentMatchRequest, TalentMatchHttpError } from "../api/client";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import { getProfileCompletion } from "./completion";
import { CategoryCompletionChecklist } from "../components/CategoryCompletionChecklist";
import { consumeResumeDraftForProfile, mapResumeDraftToProfile } from "../resume-parsing/handoff";
import {
  blankProfile,
  RADIX_CATEGORIES,
  type CandidateProfile,
  type CandidateSkill,
  type Certification,
  type Education,
  type ExperienceItem,
  type Project,
  type SavedProfileRecord,
  type TopicAssessment,
  type TopicRecord,
  type TopicResponse,
  type TopicResponseValue,
} from "./types";

const CATEGORY_LABELS: Record<(typeof RADIX_CATEGORIES)[number], string> = {
  COD: "Coding",
  DSA: "Data Structures & Algorithms",
  OOD: "Object-Oriented Design",
  APTI: "Aptitude",
  COMM: "Communication",
  AI: "AI",
  CLOUD: "Cloud",
  SQL: "SQL",
  SWE: "Software Engineering",
  SYSD: "System Design",
  NETW: "Networking",
  OS: "Operating Systems",
};

const ASSESSMENT_STAGES = [
  { label: "Understand", levels: "L1–2", description: "I understand the foundations." },
  { label: "Apply", levels: "L3–4", description: "I can apply concepts with guidance." },
  { label: "Analyse", levels: "L5–6", description: "I can solve and reason independently." },
  { label: "Evaluate", levels: "L7–8", description: "I can evaluate trade-offs and designs." },
  { label: "Create", levels: "L9–10", description: "I can create advanced solutions." },
] as const;

const inputClass =
  "w-full rounded-md border border-atlas-divider bg-atlas-surface px-3 py-2 text-sm text-atlas-ink outline-none transition focus:border-atlas-focus focus:ring-2 focus:ring-atlas-focus/20";
const cardClass = "border border-atlas-divider bg-atlas-surface shadow-sm";

function readMissingCategoryCodes(details?: Array<Record<string, unknown>>): string[] {
  const detail = details?.find((item) => Array.isArray(item["missing_category_codes"]));
  const codes = detail?.["missing_category_codes"];
  return Array.isArray(codes)
    ? codes.filter((code): code is string => typeof code === "string")
    : [];
}

const emptyEducation = (): Education => ({
  degree: null,
  institution: null,
  field_of_study: null,
  graduation_year: null,
});

const emptySkill = (): CandidateSkill => ({
  skill_name: "",
  category_code: "OTHER",
  evidence: "",
  confidence: "medium",
  provenance: "candidate_entered",
  canonical_skill_key: null,
});

const emptyProject = (): Project => ({
  title: "",
  description: null,
  technologies: [],
  outcome: null,
});

const emptyExperience = (): ExperienceItem => ({
  title: null,
  organization: null,
  start_date: null,
  end_date: null,
  description: null,
});

const emptyCertification = (): Certification => ({
  name: "",
  issuer: null,
  issued_date: null,
});

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-atlas-ink">
      <span>{label}</span>
      {children}
      {hint && <span className="block text-xs font-normal text-atlas-text-secondary">{hint}</span>}
    </label>
  );
}

function SectionCard({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${cardClass} scroll-mt-24 rounded-xl p-5 sm:p-7`}>
      <div className="mb-6 flex items-start gap-4">
        <span className="font-mono text-xs font-semibold text-atlas-terracotta">{eyebrow}</span>
        <div>
          <h2 className="font-heading text-xl font-semibold text-atlas-ink">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-atlas-text-secondary">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ProfileBuilderPage() {
  const [profile, setProfile] = useState<CandidateProfile>(blankProfile);
  const [savedRecord, setSavedRecord] = useState<SavedProfileRecord | null>(null);
  const [state, setState] = useState<"loading" | "editing" | "saving" | "saved" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [topics, setTopics] = useState<TopicRecord[]>([]);
  const [topicsState, setTopicsState] = useState<"loading" | "loaded" | "error">("loading");
  const [missingCategoryCodes, setMissingCategoryCodes] = useState<string[]>([]);
  const profileRef = useRef(profile);
  const topicRequestVersions = useRef<Record<number, number>>({});

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadTopics() {
    try {
      const topicCatalog = await talentMatchRequest<{
        topics: TopicRecord[];
        warnings: string[];
      }>("/api/v1/profile/topics");
      setTopics(topicCatalog.topics);
      setTopicsState("loaded");
    } catch {
      setTopicsState("error");
    }
  }

  async function loadProfile() {
    setState("loading");
    setMessage("");
    setMissingCategoryCodes([]);
    try {
      await ensureTalentMatchSession();
      const record = await talentMatchRequest<SavedProfileRecord>("/api/v1/profile");
      setSavedRecord(record);
      const resumeDraft = consumeResumeDraftForProfile();
      setProfile(
        resumeDraft ? mapResumeDraftToProfile(resumeDraft, record.profile) : record.profile,
      );
      setSavedSnapshot(JSON.stringify(record.profile));
      await loadTopics();
      if (resumeDraft) {
        setMessage("Resume draft transferred. Review the fields before saving.");
      }
      setState("editing");
    } catch (error) {
      if (error instanceof TalentMatchHttpError && error.code === "INCOMPLETE_CANDIDATE_PROFILE") {
        setMissingCategoryCodes(readMissingCategoryCodes(error.details));
      }
      if (
        error instanceof TalentMatchHttpError &&
        (error.status === 404 || error.code === "profile_not_found")
      ) {
        const empty = blankProfile();
        setProfile(empty);
        setSavedSnapshot("");
        await loadTopics();
        const resumeDraft = consumeResumeDraftForProfile();
        if (resumeDraft) {
          setProfile(mapResumeDraftToProfile(resumeDraft, empty));
          setMessage("Resume draft transferred. Review the fields before saving.");
        }
        setState("editing");
        return;
      }

      setTopicsState("error");
      setMessage(error instanceof Error ? error.message : "Unable to load the profile.");
      setState("error");
    }
  }

  const completion = useMemo(() => {
    return getProfileCompletion(profile);
  }, [profile]);

  const dirty = savedSnapshot !== JSON.stringify(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  function updateProfile<K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setState("editing");
  }

  async function updateTopicResponse(index: number, response: TopicResponse): Promise<void> {
    const assessment = profileRef.current.category_assessments[index];
    if (!assessment) return;
    const currentTopicAssessment: TopicAssessment = assessment.topic_assessment ?? {
      responses: [],
      suggested_level: null,
      status: "insufficient_evidence",
      scoring_version: "topic-self-assessment-v1",
      confirmed: false,
    };
    const responses = [
      ...currentTopicAssessment.responses.filter((item) => item.topic_id !== response.topic_id),
      response,
    ];
    const nextTopicAssessment = { ...currentTopicAssessment, responses };
    const requestVersion = (topicRequestVersions.current[index] ?? 0) + 1;
    topicRequestVersions.current[index] = requestVersion;
    profileRef.current = {
      ...profileRef.current,
      schema_version: "1.1.0",
      category_assessments: profileRef.current.category_assessments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, topic_assessment: nextTopicAssessment } : item,
      ),
    };
    setProfile((current) => ({
      ...current,
      schema_version: "1.1.0",
      category_assessments: current.category_assessments.map((item, itemIndex) =>
        itemIndex === index ? { ...item, topic_assessment: nextTopicAssessment } : item,
      ),
    }));
    setState("editing");
    try {
      const result = await talentMatchRequest<{
        suggested_level: number | null;
        status: TopicAssessment["status"];
        scoring_version: TopicAssessment["scoring_version"];
      }>("/api/v1/profile/topics/score", {
        method: "POST",
        body: JSON.stringify({
          category_code: assessment.category_code,
          responses,
        }),
      });
      if (topicRequestVersions.current[index] !== requestVersion) return;
      setProfile((current) => ({
        ...current,
        category_assessments: current.category_assessments.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                topic_assessment: {
                  responses,
                  suggested_level: result.suggested_level,
                  status: result.status,
                  scoring_version: result.scoring_version,
                  confirmed: false,
                },
              }
            : item,
        ),
      }));
    } catch {
      setMessage("Topic response saved locally, but the suggestion could not be recalculated.");
    }
  }

  function confirmTopicAssessment(index: number) {
    const assessment = profile.category_assessments[index];
    if (!assessment) return;
    const topicAssessment = assessment.topic_assessment;
    if (!topicAssessment || topicAssessment.suggested_level === null) return;
    updateProfile(
      "category_assessments",
      profile.category_assessments.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              self_assessed_level: topicAssessment.suggested_level,
              assessment_basis: "candidate_self_assessment",
              topic_assessment: { ...topicAssessment, confirmed: true },
            }
          : item,
      ),
    );
  }

  function setSelfAssessedLevel(index: number, level: number) {
    updateProfile(
      "category_assessments",
      profile.category_assessments.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              self_assessed_level: level,
              assessment_basis: "candidate_self_assessment",
            }
          : item,
      ),
    );
  }

  async function saveProfile() {
    if (!profile.name.trim()) {
      setMessage("Add your name before saving.");
      setState("error");
      document.getElementById("identity")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setState("saving");
    setMessage("");
    const payload = {
      ...profile,
      name: profile.name.trim(),
      email: profile.email?.trim() || null,
      resume_metadata: { ...profile.resume_metadata, raw_file_retained: false as const },
    };
    try {
      const record = await talentMatchRequest<SavedProfileRecord>("/api/v1/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSavedRecord(record);
      setProfile(record.profile);
      setSavedSnapshot(JSON.stringify(record.profile));
      setState("saved");
    } catch (error) {
      if (error instanceof TalentMatchHttpError && error.code === "INCOMPLETE_CANDIDATE_PROFILE") {
        setMissingCategoryCodes(readMissingCategoryCodes(error.details));
      }
      setMessage(error instanceof Error ? error.message : "Unable to save the profile.");
      setState("error");
    }
  }

  function resetDraft() {
    setProfile(savedRecord?.profile ?? blankProfile());
    setMessage("");
    setState("editing");
  }

  if (state === "loading") {
    return (
      <div className="py-16 text-atlas-text-secondary" role="status">
        Loading your Talent Match profile…
      </div>
    );
  }

  return (
    <div>
      <main className="py-8 sm:py-12">
        <div className="mb-8 border-b border-atlas-divider pb-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">
            <span>Talent Match</span>
            <span className="text-atlas-divider">/</span>
            <span className="text-atlas-text-secondary">Profile Builder</span>
          </div>
          <div className="mt-4 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-atlas-ink sm:text-5xl">
                Build your candidate profile
              </h1>
              <p className="mt-4 text-base leading-7 text-atlas-text-secondary">
                Turn your experience into an evidence-backed profile for company readiness and
                job-specific matching. You can complete it manually now; resume import will appear
                when a validated draft is available.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-3 py-1.5 font-medium ${
                  completion.ready
                    ? "bg-atlas-success/10 text-atlas-success"
                    : "bg-atlas-selected text-atlas-text-secondary"
                }`}
              >
                {completion.ready ? "Ready for assessment" : "Draft in progress"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-6">
            <SectionCard
              id="identity"
              eyebrow="01"
              title="Identity"
              description="Keep this profile focused on information needed for matching."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    className={inputClass}
                    value={profile.name}
                    onChange={(event) => updateProfile("name", event.target.value)}
                    maxLength={160}
                    required
                  />
                </Field>
                <Field label="Email" hint="Optional; used only as profile contact information.">
                  <input
                    className={inputClass}
                    type="email"
                    value={profile.email ?? ""}
                    onChange={(event) => updateProfile("email", event.target.value || null)}
                    maxLength={254}
                  />
                </Field>
              </div>
              <p className="mt-4 text-xs text-atlas-text-secondary">
                Your Talent Match profile is private to your authenticated session.
              </p>
            </SectionCard>

            <SectionCard
              id="education"
              eyebrow="02"
              title="Education"
              description="Add your degree or current programme. Unknown values can remain blank."
              children={
                <RepeatableEditor
                  items={profile.education}
                  emptyLabel="No education added yet."
                  addLabel="Add education"
                  onAdd={() => updateProfile("education", [...profile.education, emptyEducation()])}
                  onRemove={(index) =>
                    updateProfile(
                      "education",
                      profile.education.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  renderItem={(education, index) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField
                        label="Degree"
                        value={education.degree}
                        maxLength={160}
                        onChange={(value) =>
                          updateProfile(
                            "education",
                            updateAt(profile.education, index, {
                              ...education,
                              degree: value || null,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Institution"
                        value={education.institution}
                        maxLength={200}
                        onChange={(value) =>
                          updateProfile(
                            "education",
                            updateAt(profile.education, index, {
                              ...education,
                              institution: value || null,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Field of study"
                        value={education.field_of_study}
                        maxLength={160}
                        onChange={(value) =>
                          updateProfile(
                            "education",
                            updateAt(profile.education, index, {
                              ...education,
                              field_of_study: value || null,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Graduation year"
                        value={education.graduation_year?.toString() ?? ""}
                        type="number"
                        onChange={(value) =>
                          updateProfile(
                            "education",
                            updateAt(profile.education, index, {
                              ...education,
                              graduation_year: value ? Number(value) : null,
                            }),
                          )
                        }
                      />
                    </div>
                  )}
                />
              }
            />

            <SectionCard
              id="skills"
              eyebrow="03"
              title="Skills and evidence"
              description="Evidence explains where a skill appears. Confidence describes extraction reliability, not verified competency."
              children={
                <RepeatableEditor
                  items={profile.skills}
                  emptyLabel="No skills added yet."
                  addLabel="Add skill"
                  onAdd={() => updateProfile("skills", [...profile.skills, emptySkill()])}
                  onRemove={(index) =>
                    updateProfile(
                      "skills",
                      profile.skills.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  renderItem={(skill, index) => (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <TextField
                        label="Skill name"
                        value={skill.skill_name}
                        maxLength={120}
                        onChange={(value) =>
                          updateProfile(
                            "skills",
                            updateAt(profile.skills, index, { ...skill, skill_name: value }),
                          )
                        }
                      />
                      <SelectField
                        label="RADIX category"
                        value={skill.category_code}
                        options={[...RADIX_CATEGORIES, "OTHER"]}
                        onChange={(value) =>
                          updateProfile(
                            "skills",
                            updateAt(profile.skills, index, {
                              ...skill,
                              category_code: value as CandidateSkill["category_code"],
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Evidence"
                        value={skill.evidence}
                        maxLength={500}
                        onChange={(value) =>
                          updateProfile(
                            "skills",
                            updateAt(profile.skills, index, { ...skill, evidence: value }),
                          )
                        }
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <SelectField
                          label="Confidence"
                          value={skill.confidence}
                          options={["high", "medium", "low"]}
                          onChange={(value) =>
                            updateProfile(
                              "skills",
                              updateAt(profile.skills, index, {
                                ...skill,
                                confidence: value as CandidateSkill["confidence"],
                              }),
                            )
                          }
                        />
                        <SelectField
                          label="Provenance"
                          value={skill.provenance}
                          options={[
                            "resume_extraction",
                            "candidate_entered",
                            "project",
                            "internship",
                            "certification",
                            "other",
                          ]}
                          onChange={(value) =>
                            updateProfile(
                              "skills",
                              updateAt(profile.skills, index, {
                                ...skill,
                                provenance: value as CandidateSkill["provenance"],
                              }),
                            )
                          }
                        />
                      </div>
                      <TextField
                        label="Canonical skill key (optional)"
                        value={skill.canonical_skill_key}
                        maxLength={120}
                        onChange={(value) =>
                          updateProfile(
                            "skills",
                            updateAt(profile.skills, index, {
                              ...skill,
                              canonical_skill_key: value || null,
                            }),
                          )
                        }
                      />
                    </div>
                  )}
                />
              }
            />

            <SectionCard
              id="projects"
              eyebrow="04"
              title="Projects"
              description="Capture the work that best demonstrates how you apply your skills."
              children={
                <RepeatableEditor
                  items={profile.projects}
                  emptyLabel="No projects added yet."
                  addLabel="Add project"
                  onAdd={() => updateProfile("projects", [...profile.projects, emptyProject()])}
                  onRemove={(index) =>
                    updateProfile(
                      "projects",
                      profile.projects.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  renderItem={(project, index) => (
                    <div className="grid gap-3">
                      <TextField
                        label="Project title"
                        value={project.title}
                        maxLength={200}
                        onChange={(value) =>
                          updateProfile(
                            "projects",
                            updateAt(profile.projects, index, { ...project, title: value }),
                          )
                        }
                      />
                      <TextAreaField
                        label="Description"
                        value={project.description}
                        maxLength={1500}
                        onChange={(value) =>
                          updateProfile(
                            "projects",
                            updateAt(profile.projects, index, {
                              ...project,
                              description: value || null,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Technologies"
                        value={project.technologies.join(", ")}
                        hint="Separate technologies with commas."
                        onChange={(value) =>
                          updateProfile(
                            "projects",
                            updateAt(profile.projects, index, {
                              ...project,
                              technologies: value
                                .split(",")
                                .map((technology) => technology.trim())
                                .filter(Boolean),
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Outcome"
                        value={project.outcome}
                        maxLength={500}
                        onChange={(value) =>
                          updateProfile(
                            "projects",
                            updateAt(profile.projects, index, {
                              ...project,
                              outcome: value || null,
                            }),
                          )
                        }
                      />
                    </div>
                  )}
                />
              }
            />

            <SectionCard
              id="experience"
              eyebrow="05"
              title="Experience"
              description="Internships and hackathons are stored separately so downstream matching can explain their provenance."
              children={
                <div className="space-y-6">
                  <ExperienceGroup
                    title="Internships"
                    items={profile.internships}
                    onAdd={() =>
                      updateProfile("internships", [...profile.internships, emptyExperience()])
                    }
                    onRemove={(index) =>
                      updateProfile(
                        "internships",
                        profile.internships.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    onChange={(items) => updateProfile("internships", items)}
                  />
                  <ExperienceGroup
                    title="Hackathons"
                    items={profile.hackathons}
                    onAdd={() =>
                      updateProfile("hackathons", [...profile.hackathons, emptyExperience()])
                    }
                    onRemove={(index) =>
                      updateProfile(
                        "hackathons",
                        profile.hackathons.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    onChange={(items) => updateProfile("hackathons", items)}
                  />
                </div>
              }
            />

            <SectionCard
              id="certifications"
              eyebrow="06"
              title="Certifications"
              description="Add credentials you want to make visible as profile evidence."
              children={
                <RepeatableEditor
                  items={profile.certifications}
                  emptyLabel="No certifications added yet."
                  addLabel="Add certification"
                  onAdd={() =>
                    updateProfile("certifications", [
                      ...profile.certifications,
                      emptyCertification(),
                    ])
                  }
                  onRemove={(index) =>
                    updateProfile(
                      "certifications",
                      profile.certifications.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  renderItem={(certification, index) => (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <TextField
                        label="Certification name"
                        value={certification.name}
                        maxLength={200}
                        onChange={(value) =>
                          updateProfile(
                            "certifications",
                            updateAt(profile.certifications, index, {
                              ...certification,
                              name: value,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Issuer"
                        value={certification.issuer}
                        maxLength={200}
                        onChange={(value) =>
                          updateProfile(
                            "certifications",
                            updateAt(profile.certifications, index, {
                              ...certification,
                              issuer: value || null,
                            }),
                          )
                        }
                      />
                      <TextField
                        label="Issued date"
                        value={certification.issued_date}
                        maxLength={40}
                        onChange={(value) =>
                          updateProfile(
                            "certifications",
                            updateAt(profile.certifications, index, {
                              ...certification,
                              issued_date: value || null,
                            }),
                          )
                        }
                      />
                    </div>
                  )}
                />
              }
            />

            <SectionCard
              id="roles"
              eyebrow="07"
              title="Preferred roles"
              description="Add the roles you want future matching views to prioritize."
              children={
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_roles.map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full bg-atlas-selected px-3 py-1.5 text-sm text-atlas-ink"
                      >
                        {role}
                        <button
                          type="button"
                          className="text-atlas-text-secondary hover:text-atlas-danger"
                          aria-label={`Remove ${role}`}
                          onClick={() =>
                            updateProfile(
                              "preferred_roles",
                              profile.preferred_roles.filter((_, roleIndex) => roleIndex !== index),
                            )
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <RoleInput
                    onAdd={(role) =>
                      updateProfile("preferred_roles", [...profile.preferred_roles, role])
                    }
                  />
                </div>
              }
            />

            <SectionCard
              id="assessments"
              eyebrow="08"
              title="RADIX self-assessment"
              description="Select one level only when you can support it with your own evidence. This is not a verified competency result."
              children={
                <div className="space-y-4">
                  <div className="grid gap-2 rounded-lg border border-atlas-divider bg-atlas-page p-4 text-xs text-atlas-text-secondary sm:grid-cols-5">
                    <span>
                      <strong className="text-atlas-ink">L1–2</strong> Understand
                    </span>
                    <span>
                      <strong className="text-atlas-ink">L3–4</strong> Apply
                    </span>
                    <span>
                      <strong className="text-atlas-ink">L5–6</strong> Analyse
                    </span>
                    <span>
                      <strong className="text-atlas-ink">L7–8</strong> Evaluate
                    </span>
                    <span>
                      <strong className="text-atlas-ink">L9–10</strong> Create
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {profile.category_assessments.map((assessment, index) => (
                      <TopicAssessmentCard
                        key={assessment.category_code}
                        assessment={assessment}
                        label={CATEGORY_LABELS[assessment.category_code]}
                        topics={topics.filter(
                          (topic) => topic.category_code === assessment.category_code,
                        )}
                        topicsState={topicsState}
                        onResponse={(response) => void updateTopicResponse(index, response)}
                        onEvidence={(evidence) =>
                          updateProfile(
                            "category_assessments",
                            profile.category_assessments.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, evidence_note: evidence || null }
                                : item,
                            ),
                          )
                        }
                        onConfirm={() => confirmTopicAssessment(index)}
                        onLevelSelect={(level) => setSelfAssessedLevel(index, level)}
                      />
                    ))}
                  </div>
                </div>
              }
            />

            {message && (
              <p
                className={`rounded-md border p-4 text-sm ${
                  message.startsWith("Resume draft transferred")
                    ? "border-atlas-success/30 bg-atlas-success/10 text-atlas-success"
                    : "border-atlas-danger/30 bg-atlas-danger/10 text-atlas-danger"
                }`}
                role={message.startsWith("Resume draft transferred") ? "status" : "alert"}
              >
                {message}
              </p>
            )}
          </div>

          <aside className="h-fit space-y-4 lg:sticky lg:top-5">
            <CategoryCompletionChecklist
              completedCodes={profile.category_assessments
                .filter((assessment) => assessment.self_assessed_level !== null)
                .map((assessment) => assessment.category_code)}
              missingCodes={missingCategoryCodes}
            />
            <div className={`${cardClass} rounded-xl p-5`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">
                Profile progress
              </p>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-heading text-4xl font-semibold text-atlas-ink">
                  {completion.percent}%
                </span>
                <span className="pb-1 text-xs text-atlas-text-secondary">
                  {completion.completed}/{completion.total} sections
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-atlas-selected">
                <div
                  className="h-full rounded-full bg-atlas-terracotta transition-all"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {Object.entries(completion.sections).map(([key, complete]) => (
                  <li key={key} className="flex items-center justify-between gap-2">
                    <span className="capitalize text-atlas-text-secondary">{key}</span>
                    <span className={complete ? "text-atlas-success" : "text-atlas-text-secondary"}>
                      {complete ? "Complete" : "Open"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${cardClass} rounded-xl p-5`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">
                Resume source
              </p>
              <p className="mt-3 text-sm font-medium text-atlas-ink">
                {profile.resume_metadata.original_filename ?? "No resume added"}
              </p>
              <p className="mt-1 text-xs leading-5 text-atlas-text-secondary">
                You can build this profile manually. A validated Role 2 draft can prefill it later
                for your review.
              </p>
            </div>
            <div className={`${cardClass} rounded-xl p-5`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-atlas-terracotta">
                Assessment readiness
              </p>
              <p className="mt-3 text-sm leading-6 text-atlas-text-secondary">
                {completion.unassessed
                  ? `${completion.unassessed} RADIX categories still need a self-assessed level.`
                  : "All 12 RADIX categories have explicit levels."}
              </p>
              <p className="mt-3 text-xs leading-5 text-atlas-text-secondary">
                Talent Check remains separate from self-assessment and compares these levels with a
                company rubric.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <div className="sticky bottom-0 z-20 border-t border-atlas-divider bg-atlas-surface/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-atlas-text-secondary" aria-live="polite">
            {state === "saving"
              ? "Saving profile…"
              : state === "saved" && savedRecord
                ? `Saved ${new Date(savedRecord.updated_at).toLocaleString()}`
                : dirty
                  ? "Unsaved changes"
                  : savedRecord
                    ? "All changes saved"
                    : "Manual profile draft"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-atlas-divider px-4 py-2 text-sm font-medium text-atlas-ink hover:bg-atlas-selected disabled:opacity-50"
              onClick={resetDraft}
              disabled={!dirty || state === "saving"}
            >
              Reset draft
            </button>
            <button
              type="button"
              className="rounded-md bg-atlas-terracotta px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-atlas-terracotta/90 disabled:opacity-50"
              onClick={() => void saveProfile()}
              disabled={state === "saving"}
            >
              {state === "saving" ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function updateAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function TextField({
  label,
  value,
  onChange,
  maxLength,
  type = "text",
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  maxLength?: number;
  type?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputClass}
        type={type}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        className={`${inputClass} min-h-24 resize-y`}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </Field>
  );
}

function RepeatableEditor<T>({
  items,
  emptyLabel,
  addLabel,
  onAdd,
  onRemove,
  renderItem,
}: {
  items: T[];
  emptyLabel: string;
  addLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-atlas-divider p-5 text-sm text-atlas-text-secondary">
          {emptyLabel}
        </p>
      )}
      {items.map((item, index) => (
        <div key={index} className="relative rounded-lg border border-atlas-divider p-4">
          <button
            type="button"
            className="absolute right-3 top-3 text-xs font-medium text-atlas-text-secondary hover:text-atlas-danger"
            onClick={() => onRemove(index)}
          >
            Remove
          </button>
          <div className="pr-16">{renderItem(item, index)}</div>
        </div>
      ))}
      <button
        type="button"
        className="rounded-md border border-atlas-terracotta px-3 py-2 text-sm font-medium text-atlas-terracotta hover:bg-atlas-terracotta/10"
        onClick={onAdd}
      >
        + {addLabel}
      </button>
    </div>
  );
}

function ExperienceGroup({
  title,
  items,
  onAdd,
  onRemove,
  onChange,
}: {
  title: string;
  items: ExperienceItem[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (items: ExperienceItem[]) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-heading text-base font-semibold text-atlas-ink">{title}</h3>
      <RepeatableEditor
        items={items}
        emptyLabel={`No ${title.toLowerCase()} added yet.`}
        addLabel={`Add ${title.slice(0, -1).toLowerCase()}`}
        onAdd={onAdd}
        onRemove={onRemove}
        renderItem={(experience, index) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Title"
              value={experience.title}
              maxLength={160}
              onChange={(value) =>
                onChange(updateAt(items, index, { ...experience, title: value || null }))
              }
            />
            <TextField
              label="Organization"
              value={experience.organization}
              maxLength={200}
              onChange={(value) =>
                onChange(updateAt(items, index, { ...experience, organization: value || null }))
              }
            />
            <TextField
              label="Start date"
              value={experience.start_date}
              maxLength={40}
              onChange={(value) =>
                onChange(updateAt(items, index, { ...experience, start_date: value || null }))
              }
            />
            <TextField
              label="End date"
              value={experience.end_date}
              maxLength={40}
              onChange={(value) =>
                onChange(updateAt(items, index, { ...experience, end_date: value || null }))
              }
            />
            <div className="sm:col-span-2">
              <TextAreaField
                label="Description"
                value={experience.description}
                maxLength={1500}
                onChange={(value) =>
                  onChange(updateAt(items, index, { ...experience, description: value || null }))
                }
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}

function RoleInput({ onAdd }: { onAdd: (role: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className={inputClass}
        value={value}
        maxLength={160}
        placeholder="e.g. Backend Developer"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (value.trim()) {
              onAdd(value.trim());
              setValue("");
            }
          }
        }}
      />
      <button
        type="button"
        className="shrink-0 rounded-md border border-atlas-divider px-3 text-sm font-medium hover:bg-atlas-selected"
        onClick={() => {
          if (value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
      >
        Add
      </button>
    </div>
  );
}

function TopicAssessmentCard({
  assessment,
  label,
  topics,
  topicsState,
  onResponse,
  onEvidence,
  onConfirm,
}: {
  assessment: CandidateProfile["category_assessments"][number];
  label: string;
  topics: TopicRecord[];
  topicsState: "loading" | "loaded" | "error";
  onResponse: (response: TopicResponse) => void;
  onEvidence: (evidence: string) => void;
  onConfirm: () => void;
  onLevelSelect: (level: number) => void;
}) {
  const suggestedStage = assessment.topic_assessment?.suggested_level
    ? Math.ceil(assessment.topic_assessment.suggested_level / 2)
    : assessment.self_assessed_level
      ? Math.ceil(assessment.self_assessed_level / 2)
      : 1;
  const [stage, setStage] = useState(suggestedStage);
  const responses = new Map(
    (assessment.topic_assessment?.responses ?? []).map((response) => [
      response.topic_id,
      response.response,
    ]),
  );
  const answeredCount = responses.size;
  const currentStage = ASSESSMENT_STAGES[stage - 1];
  const currentLevels = [stage * 2 - 1, stage * 2];
  const checkpointLevels = [
    ...new Set([currentLevels[0] - 1, ...currentLevels, currentLevels[1] + 1]),
  ].filter((level) => level >= 1 && level <= 10);
  const checkpointTopics = checkpointLevels
    .flatMap((level) => topics.filter((topic) => topic.level_number === level).slice(0, 1))
    .slice(0, 4);
  const renderTopic = (topic: TopicRecord) => (
    <div key={topic.topic_id} className="rounded-md border border-atlas-divider p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-5 text-atlas-ink">{topic.topic}</p>
        <span className="shrink-0 font-mono text-[10px] text-atlas-text-secondary">
          L{topic.level_number}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] sm:grid-cols-4">
        {(
          [
            ["unfamiliar", "Not familiar"],
            ["recognize", "Recognize"],
            ["guided", "With guidance"],
            ["independent", "Independent"],
          ] as const
        ).map(([value, text]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center justify-center rounded border border-atlas-divider px-2 py-1.5 text-center text-atlas-text-secondary transition hover:border-atlas-terracotta/50 has-[:checked]:border-atlas-terracotta has-[:checked]:bg-atlas-terracotta/10 has-[:checked]:font-medium has-[:checked]:text-atlas-terracotta"
          >
            <input
              className="sr-only"
              type="radio"
              name={`topic-${assessment.category_code}-${topic.topic_id}`}
              checked={responses.get(topic.topic_id) === value}
              onChange={() =>
                onResponse({
                  topic_id: topic.topic_id,
                  response: value as TopicResponseValue,
                })
              }
            />
            {text}
          </label>
        ))}
      </div>
    </div>
  );
  return (
    <div
      id={`assessment-${assessment.category_code}`}
      className="scroll-mt-24 rounded-lg border border-atlas-divider p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-atlas-ink">{label}</h3>
          <p className="font-mono text-xs text-atlas-text-secondary">{assessment.category_code}</p>
        </div>
        <span className="rounded-full bg-atlas-selected px-2 py-1 text-[11px] text-atlas-text-secondary">
          {assessment.topic_assessment?.suggested_level
            ? `Suggested L${assessment.topic_assessment.suggested_level}`
            : assessment.self_assessed_level === null
              ? "Unassessed"
              : `Self-assessed L${assessment.self_assessed_level}`}
        </span>
      </div>
      <p className="mt-3 text-xs text-atlas-text-secondary">
        {topicsState === "loaded"
          ? `${answeredCount} of ${topics.length} topics answered`
          : topicsState === "loading"
            ? "Loading topic guidance…"
            : "Topic guidance is unavailable; existing profile fields remain usable."}
      </p>
      {topicsState === "loaded" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-atlas-page p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-atlas-terracotta">
                  Quick calibration
                </p>
                <p className="mt-1 text-sm font-medium text-atlas-ink">
                  Where do you feel most comfortable today?
                </p>
              </div>
              <span className="rounded-full bg-atlas-terracotta px-2.5 py-1 font-mono text-xs font-semibold text-white">
                {currentStage.levels}
              </span>
            </div>
            <input
              className="mt-5 h-2 w-full cursor-pointer accent-atlas-terracotta"
              type="range"
              min="1"
              max="5"
              step="1"
              value={stage}
              aria-label={`${label} comfort stage`}
              onChange={(event) => setStage(Number(event.target.value))}
            />
            <div className="mt-2 grid grid-cols-5 gap-1">
              {ASSESSMENT_STAGES.map((item, index) => (
                <button
                  key={item.levels}
                  type="button"
                  className={`text-center text-[10px] leading-4 transition sm:text-xs ${
                    stage === index + 1
                      ? "font-semibold text-atlas-terracotta"
                      : "text-atlas-text-secondary hover:text-atlas-ink"
                  }`}
                  onClick={() => setStage(index + 1)}
                >
                  <span className="block font-mono">{item.levels}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-atlas-text-secondary">
              {currentStage.description} Choose one exact level below to save your self-assessment.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {currentLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                    assessment.self_assessed_level === level
                      ? "border-atlas-terracotta bg-atlas-terracotta/10 text-atlas-terracotta"
                      : "border-atlas-divider text-atlas-text-secondary hover:border-atlas-terracotta/50 hover:text-atlas-ink"
                  }`}
                  onClick={() => onLevelSelect(level)}
                  aria-pressed={assessment.self_assessed_level === level}
                >
                  Use Level {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-atlas-ink">Quick checkpoints</h4>
                <p className="text-xs text-atlas-text-secondary">
                  Start with these representative topics. You can review the full ladder below.
                </p>
              </div>
              <span className="shrink-0 text-xs text-atlas-text-secondary">
                {checkpointTopics.filter((topic) => responses.has(topic.topic_id)).length}/
                {checkpointTopics.length}
              </span>
            </div>
            <div className="space-y-2">
              {checkpointTopics.length ? (
                checkpointTopics.map(renderTopic)
              ) : (
                <p className="rounded-md border border-dashed border-atlas-divider p-3 text-xs text-atlas-text-secondary">
                  No checkpoints are available for this category yet.
                </p>
              )}
            </div>
          </div>

          <details className="rounded-lg border border-atlas-divider">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-atlas-ink">
              Review all {topics.length} topics
            </summary>
            <div className="space-y-2 border-t border-atlas-divider p-3">
              {topics.map(renderTopic)}
            </div>
          </details>
        </div>
      )}
      {assessment.topic_assessment?.suggested_level !== null &&
        assessment.topic_assessment?.suggested_level !== undefined && (
          <div className="mt-4 rounded-md bg-atlas-selected p-3 text-sm text-atlas-ink">
            <p className="font-medium">
              Suggested Level {assessment.topic_assessment.suggested_level}
            </p>
            <p className="mt-1 text-xs leading-5 text-atlas-text-secondary">
              {assessment.topic_assessment.status === "suggested"
                ? "This recommendation met topic coverage and prerequisite thresholds."
                : "Review more topics before confirming this self-assessment."}
            </p>
            {!assessment.topic_assessment.confirmed && (
              <button
                type="button"
                className="mt-3 rounded-md bg-atlas-terracotta px-3 py-1.5 text-xs font-medium text-white"
                onClick={onConfirm}
              >
                Confirm as my self-assessment
              </button>
            )}
          </div>
        )}
      <label className="mt-3 block text-sm font-medium">
        Evidence note (optional)
        <textarea
          className={`${inputClass} mt-1.5 min-h-20 resize-y`}
          maxLength={500}
          value={assessment.evidence_note ?? ""}
          placeholder="What supports this self-assessment?"
          onChange={(event) => onEvidence(event.target.value)}
        />
      </label>
      <p className="mt-2 text-xs leading-5 text-atlas-text-secondary">
        L1–2 Understand · L3–4 Apply · L5–6 Analyse · L7–8 Evaluate · L9–10 Create
      </p>
    </div>
  );
}
