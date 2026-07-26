export type IdeaStatus =
  | "draft"
  | "submitted"
  | "regional_review"
  | "national_review"
  | "approved"
  | "rejected";

export type OrgRole = "member" | "regional_coordinator" | "national_lead" | "leadership";

export interface IdeaPublic {
  id: string;
  name: string;
  title: string;
  description: string;
  founderId: string;
  departmentId: string;
  openToCollab: boolean;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
}

// Present only when the caller is unlocked for this idea
// (founder / collaborator / coordinator / national lead / leadership).
export interface IdeaFull extends IdeaPublic {
  pdfUrl: string | null;
  contactInfo: string | null;
}

export function isUnlocked(idea: IdeaPublic | IdeaFull): idea is IdeaFull {
  return "pdfUrl" in idea;
}

export const STATUS_LABEL_AR: Record<IdeaStatus, string> = {
  draft: "مسودة",
  submitted: "تم التقديم",
  regional_review: "مراجعة جهوية",
  national_review: "مراجعة وطنية",
  approved: "معتمد",
  rejected: "مرفوض",
};
