import { Link, useParams } from "react-router-dom";
import emptyArt from "../assets/images/empty-dashborad.png";
import { IdeaCard } from "../components/idea/IdeaCard";
import { PageLoader } from "../components/Spinner";
import { useBoard } from "../hooks/useIdeas";
import { useLang } from "../i18n/LanguageContext";

export function Board({ kind }: { kind: "submitted" | "approved" }) {
  // TODO: replace with the signed-in member's actual jiha once auth profile is wired up.
  const jihaCode = useParams().jihaCode ?? "casablanca";
  const { ideas, loading, error } = useBoard(jihaCode, kind);
  const { tr, fmt } = useLang();

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <h2>{kind === "submitted" ? tr.board.submittedTitle : tr.board.approvedTitle}</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            {tr.board.region} {tr.jihaName[jihaCode] ?? jihaCode} · {fmt(ideas.length)}{" "}
            {kind === "submitted" ? tr.board.ideasWord : tr.board.projectsWord}
          </span>
        </div>
        <Link to={`/jihat/${jihaCode}/ideas/new`}>
          <button className="primary">{tr.board.newIdea}</button>
        </Link>
      </div>

      {loading && <PageLoader />}
      {error && <p style={{ color: "var(--color-istiqlal-rose)" }}>{error}</p>}

      {!loading && !error && ideas.length === 0 && (
        <div className="empty-state">
          <img src={emptyArt} alt="" />
          <p>{tr.board.empty}</p>
        </div>
      )}

      {!loading && (
        <div className="board-grid stagger">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} jihaCode={jihaCode} />
          ))}
        </div>
      )}
    </main>
  );
}
