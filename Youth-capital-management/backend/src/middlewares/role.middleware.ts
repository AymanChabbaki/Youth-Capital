import { NextFunction, Request, Response } from "express";
import { supabaseAdmin, jihaSchema } from "../config/supabase";
import { OrgRole } from "../types/domain";

const ROLE_RANK: Record<OrgRole, number> = {
  member: 0,
  regional_coordinator: 1,
  national_lead: 2,
  leadership: 3,
};

// Works out the caller's highest applicable role for one idea: are they
// its department's regional coordinator, a national lead for that
// department, national leadership, or just a member.
export async function resolveRoleForIdea(
  userId: string,
  jihaCode: string,
  departmentId: string
): Promise<OrgRole> {
  const schema = jihaSchema(jihaCode);

  const { data: leadership } = await supabaseAdmin
    .from("national_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "leadership")
    .maybeSingle();
  if (leadership) return "leadership";

  const { data: department } = await supabaseAdmin
    .schema(schema)
    .from("departments")
    .select("department_catalog_id, coordinator_user_id")
    .eq("id", departmentId)
    .maybeSingle();

  if (department?.coordinator_user_id === userId) return "regional_coordinator";

  if (department) {
    const { data: nationalLead } = await supabaseAdmin
      .from("national_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "national_lead")
      .eq("department_id", department.department_catalog_id)
      .maybeSingle();
    if (nationalLead) return "national_lead";
  }

  return "member";
}

// Route guard factory: requireMinRole('regional_coordinator') blocks
// plain members from hitting a review/decision endpoint.
export function requireMinRole(minRole: OrgRole) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { jihaCode, departmentId } = req.params;
    if (!req.userId) return res.status(401).json({ error: "Not authenticated" });

    const role = await resolveRoleForIdea(req.userId, jihaCode, departmentId);
    if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
      return res.status(403).json({ error: `Requires at least ${minRole}` });
    }

    next();
  };
}
