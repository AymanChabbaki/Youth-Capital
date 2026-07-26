import { useParams } from "react-router-dom";
import { CollabRequestButton } from "../components/idea/CollabRequestButton";
import { PageLoader } from "../components/Spinner";
import { useIdea } from "../hooks/useIdeas";
import { useLang } from "../i18n/LanguageContext";
import { isUnlocked } from "../types/idea";

export function IdeaDetail() {
  const { jihaCode = "casablanca", ideaId = "" } = useParams();
  const { idea, loading, error } = useIdea(jihaCode, ideaId);
  const { tr } = useLang();

  if (loading) return <PageLoader />;
  if (error) return <p style={{ padding: "1.5rem", color: "var(--color-istiqlal-rose)" }}>{error}</p>;
  if (!idea) return null;

  return (
    <main className="page" style={{ maxWidth: 720, display: "grid", gap: "1rem" }}>
      <h2>{idea.title}</h2>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-signal-cyan)" }}>
        {tr.status[idea.status]}
      </span>
      <p>{idea.description}</p>

      {isUnlocked(idea) ? (
        <div className="card" style={{ display: "grid", gap: "0.5rem" }}>
          <strong>{tr.idea.fullFile}</strong>
          {idea.pdfUrl ? (
            <a href={idea.pdfUrl} target="_blank" rel="noreferrer">
              {tr.idea.openPdf}
            </a>
          ) : (
            <span>{tr.idea.noPdf}</span>
          )}
          <span>{idea.contactInfo}</span>
        </div>
      ) : (
        <div className="card">
          <p style={{ color: "var(--color-text-muted)" }}>{tr.idea.lockedMsg}</p>
          {idea.openToCollab && <CollabRequestButton jihaCode={jihaCode} ideaId={idea.id} />}
        </div>
      )}
    </main>
  );
}
