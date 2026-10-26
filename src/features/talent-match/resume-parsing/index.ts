/**
 * Resume Parsing feature module exports.
 *
 * The integration owner imports ResumeParsingPage and wraps it in a route.
 * Do not register routes from within feature modules.
 */

export { ResumeParsingPage } from "./ResumeParsingPage";
export { ResumeUploadZone } from "./ResumeUploadZone";
export { ResumeDraftReview } from "./ResumeDraftReview";
export { extractResume, validateFile, ResumeParsingError } from "./api";
export type {
  ResumeExtractionResult,
  ResumeSkill,
  CandidateDetails,
  Education,
  ExperienceItem,
  Project,
  Certification,
  CategoryCode,
  ConfidenceLevel,
  ResumeParsingState,
} from "./types";
