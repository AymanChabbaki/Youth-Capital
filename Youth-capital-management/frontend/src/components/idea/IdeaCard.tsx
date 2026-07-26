import { Link } from "react-router-dom";
import { IdeaPublic } from "../../types/idea";
import { useLang } from "../../i18n/LanguageContext";

const STATUS_COLOR: Record<string, string> = {
  submitted: "var(--color-signal-cyan)",
  regional_review: "var(--color-signal-cyan)",
  national_review: "var(--color-signal-cyan)",
  approved: "var(--color-maghreb-gold)",
  rejected: "var(--color-text-muted)",
  draft: "var(--color-text-muted)",
};

export function IdeaCard({ idea, jihaCode }: { idea: IdeaPublic; jihaCode: string }) {
  const { tr } = useLang();
  const dept = tr.deptName[idea.departmentId];

  return (
    <Link to={`/jihat/${jihaCode}/ideas/${idea.id}`} style={{ textDecoration: "none" }}>
      <article className="card idea-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.6rem" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontFamily: "var(--font-body)", fontWeight: 600 }}>{idea.title}</h3>
          <span
            className="status-pill"
            style={{ color: STATUS_COLOR[idea.status], border: `1px solid ${STATUS_COLOR[idea.status]}` }}
          >
            {tr.status[idea.status]}
          </span>
        </div>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{idea.description}</p>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center", marginTop: "0.2rem" }}>
          {dept && <span style={{ fontSize: "0.74rem", color: "var(--color-signal-cyan)" }}>{dept}</span>}
          <span style={{ fontSize: "0.74rem", color: "var(--color-rose-deep)" }}>
            {idea.openToCollab ? tr.idea.openCollab : tr.idea.notOpenCollab} · {tr.idea.lockedShort}
          </span>
        </div>
      </article>
    </Link>
  );
}
