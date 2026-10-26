/**
 * Resume upload zone — file selection with drag-and-drop and validation.
 *
 * Supports PDF/DOCX files up to 10 MB. Shows file name after selection,
 * validates client-side, and calls the onFileSelected callback.
 */

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateFile } from "./api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface ResumeUploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  error?: string | null;
}

export function ResumeUploadZone({
  onFileSelected,
  disabled = false,
  error = null,
}: ResumeUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateFile(file);
      if (validation) {
        setLocalError(validation);
        return;
      }
      setLocalError(null);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile],
  );

  const displayError = localError ?? error;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload resume file"
        aria-disabled={disabled}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-atlas-divider hover:border-primary/50",
          disabled && "cursor-not-allowed opacity-60",
          displayError && "border-atlas-danger",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Upload className="h-8 w-8 text-atlas-text-secondary" />
        <p className="mt-2 text-sm font-medium text-atlas-ink">
          Drop your resume here or click to browse
        </p>
        <p className="mt-1 text-xs text-atlas-text-secondary">
          PDF or DOCX, up to 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
          aria-label="Select resume file"
        />
      </div>

      {displayError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-atlas-danger/30 bg-atlas-danger/5 px-3 py-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-atlas-danger" />
          <p className="text-sm text-atlas-danger">{displayError}</p>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-atlas-page px-3 py-2">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-atlas-text-secondary" />
        <p className="text-xs text-atlas-text-secondary">
          Document content will be processed to extract information. The raw
          file is not stored after processing.
        </p>
      </div>
    </div>
  );
}
