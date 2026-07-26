import { supabaseAdmin, jihaSchema } from "../config/supabase";

export async function requestCollab(jihaCode: string, ideaId: string, requesterId: string) {
  const schema = jihaSchema(jihaCode);
  const { data, error } = await supabaseAdmin
    .schema(schema)
    .from("collab_requests")
    .insert({ idea_id: ideaId, requester_id: requesterId, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Only the founder should ever call this — enforced at the route/
// controller layer (or by RLS if calling with the user's own token).
export async function decideCollabRequest(
  jihaCode: string,
  requestId: string,
  decision: "approved" | "rejected"
) {
  const schema = jihaSchema(jihaCode);

  const { data: request, error } = await supabaseAdmin
    .schema(schema)
    .from("collab_requests")
    .update({ status: decision, decided_at: new Date().toISOString() })
    .eq("id", requestId)
    .select()
    .single();
  if (error) throw error;

  if (decision === "approved") {
    await supabaseAdmin
      .schema(schema)
      .from("idea_collaborators")
      .insert({ idea_id: request.idea_id, user_id: request.requester_id });
  }

  return request;
}
