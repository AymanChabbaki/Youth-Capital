export type NationalRoleType = "national_lead" | "leadership";

// The 4 organizational roles. "founder" is intentionally not here —
// it's a per-idea attribute, not a platform-wide role (see Idea below).
export type OrgRole = "member" | "regional_coordinator" | "national_lead" | "leadership";

export type IdeaStatus =
  | "draft"
  | "submitted"
  | "regional_review"
  | "national_review"
  | "approved"
  | "rejected";

export type CollabRequestStatus = "pending" | "approved" | "rejected";

export interface Jiha {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
  schemaName: string;
}

export interface DepartmentCatalogEntry {
  id: string;
  code: string;
  nameAr: string;
  nameFr: string;
}

export interface Department {
  id: string;
  departmentCatalogId: string;
  coordinatorUserId: string | null;
}

// Public-facing shape — what a regular member reads from `ideas_public`.
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

// Full shape — only ever returned to founder / collaborator /
// coordinator / national lead / leadership. See ideas.service.ts.
export interface IdeaFull extends IdeaPublic {
  pdfUrl: string | null;
  contactInfo: string | null;
}

export interface CollabRequest {
  id: string;
  ideaId: string;
  requesterId: string;
  status: CollabRequestStatus;
  requestedAt: string;
  decidedAt: string | null;
}
