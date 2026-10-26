/**
 * ResumeParsingPage — main component for the resume parsing feature.
 *
 * Manages the full UI state flow:
 *   idle → uploading → processing → needs_review → ready
 * with error handling and retry at each step.
 *
 * Integration note: the integration owner wraps this in a route file
 * (e.g. talent-match.resume-parsing.tsx) and registers it in the route tree.
 * This component does not register routes.
 */

import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureTalentMatchSession } from "../auth/talentMatchSupabaseClient";
import { ResumeUploadZone } from "./ResumeUploadZone";
import { ResumeDraftReview } from "./ResumeDraftReview";
import { extractResume, ResumeParsingError } from "./api";
import { storeResumeDraftForProfile } from "./handoff";
import type { ResumeExtractionResult, ResumeParsingState } from "./types";

export function ResumeParsingPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<ResumeParsingState>("idle");
  const [result, setResult] = useState<ResumeExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setState("uploading");
      setError(null);
      setFileName(file.name);

      try {
        await ensureTalentMatchSession();
        setState("processing");
        const extractionResult = await extractResume(file);
        setResult(extractionResult);
        setState("needs_review");
      } catch (err) {
        const message =
          err instanceof ResumeParsingError
            ? err.message
            : "An unexpected error occurred while parsing your resume.";
        setError(message);
        setState("error");
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setFileName(null);
  }, []);

  const handleUseInProfileBuilder = useCallback(() => {
    if (result) {
      if (!storeResumeDraftForProfile(result)) {
        setError("The draft could not be transferred. Please try again.");
        setState("error");
        return;
      }
      void navigate({ to: "/talent-match/profile" });
    }
  }, [navigate, result]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-atlas-ink">
          Resume Parsing
        </h1>
        <p className="mt-1 text-sm text-atlas-text-secondary">
          Upload your resume to extract skills, education, and experience.
          Review the extracted draft before using it in Profile Builder.
        </p>
      </div>

      {/* State: idle — show upload zone */}
      {state === "idle" && (
        <div className="rounded-xl border border-atlas-divider bg-atlas-surface p-6 shadow-sm">
          <ResumeUploadZone
            onFileSelected={handleFileSelected}
            error={error}
          />
        </div>
      )}

      {/* State: uploading / processing — show loader */}
      {(state === "uploading" || state === "processing") && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-atlas-divider bg-atlas-surface p-12 text-center">
          {fileName && (
            <div className="mb-4 flex items-center gap-2 text-sm text-atlas-text-secondary">
              <FileText className="h-4 w-4" />
              <span>{fileName}</span>
            </div>
          )}
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-medium text-atlas-ink">
            {state === "uploading"
              ? "Uploading resume..."
              : "Parsing resume content..."}
          </p>
          <p className="mt-1 text-xs text-atlas-text-secondary">
            Extracting skills, education, and experience from your document.
          </p>
        </div>
      )}

      {/* State: needs_review — show draft review */}
      {state === "needs_review" && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-atlas-text-secondary">
              <FileText className="h-4 w-4" />
              <span>{result.source_file}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Parse another resume
            </Button>
          </div>
          <ResumeDraftReview
            result={result}
            onUseInProfileBuilder={handleUseInProfileBuilder}
          />
        </div>
      )}

      {/* State: error — show error with retry */}
      {state === "error" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-atlas-danger/30 bg-atlas-surface p-12 text-center">
          <p className="text-sm font-medium text-atlas-danger">{error}</p>
          <p className="mt-1 text-xs text-atlas-text-secondary">
            Please check your file and try again.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
