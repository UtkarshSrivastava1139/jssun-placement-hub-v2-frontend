/**
 * Resume draft review — displays the extracted resume data with evidence
 * for candidate review. Shows skills, candidate details, and warnings.
 * Includes a "Use this draft in Profile Builder" action.
 */

import {
  Mail,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Trophy,
  ScrollText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ResumeExtractionResult } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
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
  OTHER: "Other",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface ResumeDraftReviewProps {
  result: ResumeExtractionResult;
  onUseInProfileBuilder: () => void;
}

export function ResumeDraftReview({
  result,
  onUseInProfileBuilder,
}: ResumeDraftReviewProps) {
  const { candidate_details: details, skills, warnings } = result;

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-300/50 bg-yellow-50 p-4 dark:border-yellow-700/50 dark:bg-yellow-950/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Extraction Warnings ({warnings.length})
            </h3>
          </div>
          <ul className="mt-2 space-y-1">
            {warnings.map((w, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-yellow-700 dark:text-yellow-500"
              >
                <span className="mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contact info */}
      <ReviewSection icon={Mail} title="Contact Information">
        <div className="space-y-1">
          <DetailRow label="Name" value={details.name} />
          <DetailRow label="Email" value={details.email} />
        </div>
      </ReviewSection>

      {/* Skills */}
      <ReviewSection icon={Award} title={`Extracted Skills (${skills.length})`}>
        <div className="space-y-2">
          {skills.length === 0 ? (
            <EmptyField label="No skills were identified in the resume." />
          ) : (
            skills.map((skill, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-atlas-ink">
                    {skill.skill_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[skill.category_code] ?? skill.category_code}
                    </Badge>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-medium",
                        CONFIDENCE_STYLES[skill.confidence],
                      )}
                    >
                      {skill.confidence}
                    </span>
                  </div>
                </div>
                {skill.evidence && (
                  <p className="mt-1.5 text-xs text-atlas-text-secondary">
                    {skill.evidence}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </ReviewSection>

      {/* Education */}
      {details.education.length > 0 && (
        <ReviewSection icon={GraduationCap} title="Education">
          <div className="space-y-2">
            {details.education.map((edu, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">
                  {edu.degree ?? "Degree not specified"}
                </p>
                {edu.institution && (
                  <p className="text-xs text-atlas-text-secondary">
                    {edu.institution}
                  </p>
                )}
                {edu.field_of_study && (
                  <p className="text-xs text-atlas-text-secondary">
                    {edu.field_of_study}
                  </p>
                )}
                {edu.graduation_year && (
                  <p className="text-xs text-atlas-text-secondary">
                    Graduation: {edu.graduation_year}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Experience */}
      {details.experience.length > 0 && (
        <ReviewSection icon={Briefcase} title="Work Experience">
          <div className="space-y-2">
            {details.experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">
                  {exp.title ?? "Title not specified"}
                </p>
                {exp.organization && (
                  <p className="text-xs text-atlas-text-secondary">
                    {exp.organization}
                  </p>
                )}
                {(exp.start_date || exp.end_date) && (
                  <p className="text-xs text-atlas-text-secondary">
                    {[exp.start_date, exp.end_date].filter(Boolean).join(" — ")}
                  </p>
                )}
                {exp.description && (
                  <p className="mt-1 text-xs text-atlas-text-secondary">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Projects */}
      {details.projects.length > 0 && (
        <ReviewSection icon={FolderGit2} title="Projects">
          <div className="space-y-2">
            {details.projects.map((proj, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">{proj.title}</p>
                {proj.description && (
                  <p className="text-xs text-atlas-text-secondary">
                    {proj.description}
                  </p>
                )}
                {proj.technologies.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {proj.technologies.map((tech, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Internships */}
      {details.internships.length > 0 && (
        <ReviewSection icon={Briefcase} title="Internships">
          <div className="space-y-2">
            {details.internships.map((intern, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">
                  {intern.title ?? "Role not specified"}
                </p>
                {intern.organization && (
                  <p className="text-xs text-atlas-text-secondary">
                    {intern.organization}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Hackathons */}
      {details.hackathons.length > 0 && (
        <ReviewSection icon={Trophy} title="Hackathons">
          <div className="space-y-2">
            {details.hackathons.map((hack, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">
                  {hack.title ?? "Hackathon"}
                </p>
                {hack.description && (
                  <p className="text-xs text-atlas-text-secondary">
                    {hack.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Certifications */}
      {details.certifications.length > 0 && (
        <ReviewSection icon={ScrollText} title="Certifications">
          <div className="space-y-2">
            {details.certifications.map((cert, i) => (
              <div
                key={i}
                className="rounded-lg border border-atlas-divider bg-atlas-surface p-3"
              >
                <p className="text-sm font-medium text-atlas-ink">{cert.name}</p>
                {cert.issuer && (
                  <p className="text-xs text-atlas-text-secondary">
                    {cert.issuer}
                  </p>
                )}
                {cert.issued_date && (
                  <p className="text-xs text-atlas-text-secondary">
                    {cert.issued_date}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ReviewSection>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-atlas-divider bg-atlas-page p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-atlas-text-secondary">
            Review the extracted draft above. You can edit it in Profile Builder.
          </p>
        </div>
        <Button onClick={onUseInProfileBuilder} className="shrink-0">
          Use this draft in Profile Builder
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// --- Helper components -------------------------------------------------

function ReviewSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-atlas-text-secondary" />
        <h3 className="text-sm font-semibold text-atlas-ink">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-medium text-atlas-text-secondary min-w-[60px]">
        {label}:
      </span>
      <span className="text-xs text-atlas-ink">
        {value ?? <span className="italic text-atlas-text-secondary">Not found in resume</span>}
      </span>
    </div>
  );
}

function EmptyField({ label }: { label: string }) {
  return (
    <p className="text-xs italic text-atlas-text-secondary">{label}</p>
  );
}
