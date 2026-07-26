import { supabaseAdmin, jihaSchema } from "../config/supabase";
import { resolveRoleForIdea } from "../middlewares/role.middleware";
import { IdeaFull, IdeaPublic } from "../types/domain";

interface CreateIdeaInput {
  name: string;
  title: string;
  description: string;
  departmentId: string;
  openToCollab: boolean;
  pdfUrl: string;
  contactInfo: string;
}

export async function createIdea(jihaCode: string, founderId: string, input: CreateIdeaInput) {
  const schema = jihaSchema(jihaCode);
  const { data, error } = await supabaseAdmin
    .schema(schema)
    .from("ideas")
    .insert({
      name: input.name,
      title: input.title,
      description: input.description,
      department_id: input.departmentId,
      open_to_collab: input.openToCollab,
      pdf_url: input.pdfUrl,
      contact_info: input.contactInfo,
      founder_id: founderId,
      status: "submitted",
    })
    .select()
    .single();

  if (error) throw error;

  // Keep the national cross-jiha index in sync so national leads can
  // find this idea without querying every jiha schema.
  await supabaseAdmin.from("idea_index").upsert({
    idea_id: data.id,
    title: data.title,
    status: data.status,
    open_to_collab: data.open_to_collab,
    department_id: data.department_id,
    updated_at: new Date().toISOString(),
  });

  return data;
}

// The single most important function: decides whether a caller gets
// the public teaser or the full row (with pdf_url + contact_info).
export async function getIdeaForUser(
  jihaCode: string,
  ideaId: string,
  userId: string
): Promise<IdeaPublic | IdeaFull> {
  const schema = jihaSchema(jihaCode);

  const { data: idea, error } = await supabaseAdmin
    .schema(schema)
    .from("ideas")
    .select("*")
    .eq("id", ideaId)
    .single();
  if (error) throw error;

  const isFounder = idea.founder_id === userId;

  const { data: collaborator } = await supabaseAdmin
    .schema(schema)
    .from("idea_collaborators")
    .select("user_id")
    .eq("idea_id", ideaId)
    .eq("user_id", userId)
    .maybeSingle();

  const role = await resolveRoleForIdea(userId, jihaCode, idea.department_id);
  const isReviewer = role === "regional_coordinator" || role === "national_lead" || role === "leadership";

  const unlocked = isFounder || Boolean(collaborator) || isReviewer;

  const base = {
    id: idea.id,
    name: idea.name,
    title: idea.title,
    description: idea.description,
    founderId: idea.founder_id,
    departmentId: idea.department_id,
    openToCollab: idea.open_to_collab,
    status: idea.status,
    createdAt: idea.created_at,
    updatedAt: idea.updated_at,
    approvedAt: idea.approved_at,
  };

  if (!unlocked) return base;

  // pdf_url stores a private Storage path — convert it to a 1-hour
  // signed URL so only unlocked callers ever get a working link.
  let signedPdfUrl: string | null = null;
  if (idea.pdf_url) {
    const { data: signed } = await supabaseAdmin.storage
      .from("idea-pdfs")
      .createSignedUrl(idea.pdf_url, 60 * 60);
    signedPdfUrl = signed?.signedUrl ?? null;
  }

  return { ...base, pdfUrl: signedPdfUrl, contactInfo: idea.contact_info };
}

// "Submitted" board: everything not yet decided by leadership.
export async function listSubmittedBoard(jihaCode: string) {
  const schema = jihaSchema(jihaCode);
  const { data, error } = await supabaseAdmin
    .schema(schema)
    .from("ideas_public")
    .select("*")
    .in("status", ["submitted", "regional_review", "national_review"])
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

// "Approved / in progress" board.
export async function listApprovedBoard(jihaCode: string) {
  const schema = jihaSchema(jihaCode);
  const { data, error } = await supabaseAdmin
    .schema(schema)
    .from("ideas_public")
    .select("*")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });
  if (error) throw error;
  return data;
}
