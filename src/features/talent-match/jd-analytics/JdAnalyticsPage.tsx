import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, FileText, LoaderCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RADIX_CATEGORY_CODES,
  type ExtractJd,
  type JdExtractionResult,
  type JdSkillRequirement,
  type SaveJd,
  validateJdExtractionResult,
} from "./types";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "docx"]);
const CATEGORY_OPTIONS = RADIX_CATEGORY_CODES.map((code) => ({
  value: code,
  label: code,
}));

function validateFile(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ACCEPTED_EXTENSIONS.has(extension)) return "Choose a PDF or DOCX job description.";
  if (file.size === 0) return "The selected file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return "The selected file exceeds the 10 MB limit.";
  return null;
}

function updateSkill(
  draft: JdExtractionResult,
  index: number,
  patch: Partial<JdSkillRequirement>,
): JdExtractionResult {
  return {
    ...draft,
    skills: draft.skills.map((skill, skillIndex) =>
      skillIndex === index ? { ...skill, ...patch } : skill,
    ),
  };
}

export interface JdAnalyticsPageProps {
  /** Injected by the integration owner using the shared Talent Match API client. */
  onExtract?: ExtractJd;
  /** Optional save callback; it should use the shared API client too. */
  onSave?: SaveJd;
}

export function JdAnalyticsPage({ onExtract, onSave }: JdAnalyticsPageProps) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<JdExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"extract" | "save" | null>(null);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null;
    setText("");
    setDraft(null);
    setNotice(null);
    setError(selected ? validateFile(selected) : null);
    setFile(selected && !validateFile(selected) ? selected : null);
  }

  async function extract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file && !text.trim()) {
      setError("Choose a PDF/DOCX file or paste a job description first.");
      return;
    }
    if (!onExtract) {
      setError("Extraction is unavailable until the Talent Match API is connected.");
      return;
    }
    setError(null);
    setNotice(null);
    setBusy("extract");
    try {
      const result = await onExtract(file ?? text.trim());
      if (validateJdExtractionResult(result).length > 0) {
        throw new Error("The extraction result did not match the approved schema. Retry analysis.");
      }
      const validatedResult = result as JdExtractionResult;
      if (validatedResult.skills.length === 0) {
        throw new Error(
          "No skills were extracted. Review the document and retry with another file.",
        );
      }
      setDraft(validatedResult);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not analyze this job description.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function saveDraft() {
    if (!draft || !onSave) return;
    const validationErrors = validateJdExtractionResult(draft);
    if (validationErrors.length > 0) {
      setError(`Fix the draft before saving: ${validationErrors[0]}`);
      setNotice(null);
      return;
    }
    if (draft.skills.length === 0) {
      setError("Add a source-supported skill requirement before saving this job description.");
      setNotice(null);
      return;
    }
    setError(null);
    setNotice(null);
    setBusy("save");
    try {
      await onSave(draft);
      setNotice("Reviewed job description saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this job description.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6" aria-labelledby="jd-title">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-atlas-text-secondary">
          Talent Match · Role 1
        </p>
        <h1 id="jd-title" className="font-heading text-2xl font-semibold text-atlas-ink">
          Job description analysis
        </h1>
        <p className="max-w-2xl text-sm text-atlas-text-secondary">
          Upload a PDF or DOCX to extract evidence backed skills from role summaries,
          responsibilities, and Required or Preferred sections. Unclear priority stays unknown.
          Review every field before saving; extracted skills do not represent candidate proficiency.
        </p>
      </header>

      <form
        onSubmit={extract}
        className="space-y-4 rounded-xl border border-atlas-divider bg-atlas-surface p-5"
      >
        <Label htmlFor={inputId}>Job description file</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            id={inputId}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={chooseFile}
            disabled={busy !== null}
            aria-describedby={`${inputId}-help`}
          />
          <Button type="submit" disabled={(!file && !text.trim()) || busy !== null || !onExtract}>
            {busy === "extract" ? <LoaderCircle className="animate-spin" /> : <Upload />}
            {busy === "extract" ? "Analyzing…" : "Analyze document"}
          </Button>
        </div>
        <p id={`${inputId}-help`} className="text-xs text-atlas-text-secondary">
          PDF or DOCX · up to 10 MB. You can also paste text below. Content is sent for extraction
          and is not saved by this page. Document text may be sent to the configured extraction
          provider; review its approved privacy notice before uploading or pasting.
        </p>
        {!onExtract ? (
          <p role="status" className="text-sm text-atlas-text-secondary">
            Extraction is unavailable until the Talent Match API is configured with
            VITE_TALENT_MATCH_API_URL.
          </p>
        ) : null}
        {file ? (
          <p className="flex items-center gap-2 text-sm text-atlas-text-secondary">
            <FileText className="size-4" /> {file.name}
          </p>
        ) : null}
        <div className="space-y-1.5 border-t border-atlas-divider pt-4">
          <Label htmlFor={`${inputId}-text`}>Or paste job description text</Label>
          <Textarea
            id={`${inputId}-text`}
            value={text}
            onChange={(event) => {
              setText(event.currentTarget.value);
              setFile(null);
              setError(null);
              setNotice(null);
              setDraft(null);
            }}
            disabled={busy !== null}
            rows={10}
            maxLength={80000}
            placeholder="Paste the job description here…"
            aria-describedby={`${inputId}-text-help`}
          />
          <p id={`${inputId}-text-help`} className="text-xs text-atlas-text-secondary">
            Use either a file or pasted text. Text is limited to 80,000 characters.
          </p>
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-atlas-danger/30 bg-atlas-danger/5 p-3 text-sm text-atlas-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      {notice ? (
        <p role="status" className="flex items-center gap-2 text-sm text-atlas-success">
          <CheckCircle2 className="size-4" /> {notice}
        </p>
      ) : null}

      {draft ? (
        <section
          aria-labelledby="review-title"
          className="space-y-5 rounded-xl border border-atlas-divider bg-atlas-surface p-5"
        >
          <div>
            <h2 id="review-title" className="font-heading text-lg font-semibold text-atlas-ink">
              Review extracted details
            </h2>
            <p className="mt-1 text-sm text-atlas-text-secondary">
              Confirm that each skill and evidence excerpt is supported by the source document.
            </p>
          </div>

          {draft.warnings.length > 0 ? (
            <ul
              className="list-inside list-disc rounded-md bg-atlas-page p-3 text-sm text-atlas-text-secondary"
              aria-label="Extraction warnings"
            >
              {draft.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            {(["company", "role", "location"] as const).map((field) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={`${inputId}-${field}`}>
                  {field[0]?.toUpperCase()}
                  {field.slice(1)}
                </Label>
                <Input
                  id={`${inputId}-${field}`}
                  value={draft[field] ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, [field]: event.currentTarget.value || null })
                  }
                  disabled={busy !== null}
                  maxLength={200}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-heading font-semibold text-atlas-ink">
              Skill requirements ({draft.skills.length})
            </h3>
            {draft.skills.map((skill, index) => (
              <fieldset
                key={`${index}-${skill.skill_name}`}
                className="grid gap-3 rounded-lg border border-atlas-divider p-4 sm:grid-cols-2"
              >
                <legend className="sr-only">Skill requirement {index + 1}</legend>
                <div className="space-y-1.5">
                  <Label htmlFor={`${inputId}-skill-${index}`}>Skill name</Label>
                  <Input
                    id={`${inputId}-skill-${index}`}
                    value={skill.skill_name}
                    onChange={(event) =>
                      setDraft(updateSkill(draft, index, { skill_name: event.currentTarget.value }))
                    }
                    disabled={busy !== null}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${inputId}-category-${index}`}>RADIX category</Label>
                  <select
                    id={`${inputId}-category-${index}`}
                    value={skill.category_code}
                    onChange={(event) =>
                      setDraft(
                        updateSkill(draft, index, {
                          category_code: event.currentTarget
                            .value as JdSkillRequirement["category_code"],
                        }),
                      )
                    }
                    disabled={busy !== null}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${inputId}-priority-${index}`}>Requirement priority</Label>
                  <select
                    id={`${inputId}-priority-${index}`}
                    value={skill.requirement_type}
                    onChange={(event) =>
                      setDraft(
                        updateSkill(draft, index, {
                          requirement_type: event.currentTarget
                            .value as JdSkillRequirement["requirement_type"],
                        }),
                      )
                    }
                    disabled={busy !== null}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {(["required", "preferred", "unknown"] as const).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${inputId}-confidence-${index}`}>Extraction confidence</Label>
                  <select
                    id={`${inputId}-confidence-${index}`}
                    value={skill.confidence}
                    onChange={(event) =>
                      setDraft(
                        updateSkill(draft, index, {
                          confidence: event.currentTarget.value as JdSkillRequirement["confidence"],
                        }),
                      )
                    }
                    disabled={busy !== null}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {(["high", "medium", "low"] as const).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-atlas-text-secondary">
                    High: explicit and clear. Medium: supported but needs interpretation. Low:
                    ambiguous or conflicting. Evidence must still be an exact source excerpt.
                  </p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`${inputId}-evidence-${index}`}>Source evidence</Label>
                  <Textarea
                    id={`${inputId}-evidence-${index}`}
                    value={skill.evidence}
                    onChange={(event) =>
                      setDraft(updateSkill(draft, index, { evidence: event.currentTarget.value }))
                    }
                    disabled={busy !== null}
                    maxLength={500}
                  />
                </div>
              </fieldset>
            ))}
            {draft.skills.length === 0 ? (
              <p className="rounded-md border border-dashed border-atlas-divider p-4 text-sm text-atlas-text-secondary">
                No skills were extracted. Choose another document or retry after checking its
                contents.
              </p>
            ) : null}
          </div>

          {onSave ? (
            <div className="flex justify-end border-t border-atlas-divider pt-4">
              <Button
                type="button"
                onClick={() => void saveDraft()}
                disabled={busy !== null || draft.skills.length === 0}
              >
                {busy === "save" ? <LoaderCircle className="animate-spin" /> : null}
                {busy === "save" ? "Saving…" : "Save reviewed job description"}
              </Button>
            </div>
          ) : (
            <p
              role="status"
              className="border-t border-atlas-divider pt-4 text-sm text-atlas-text-secondary"
            >
              Saving is unavailable because authenticated job-description persistence is not
              implemented.
            </p>
          )}
        </section>
      ) : null}
    </main>
  );
}
