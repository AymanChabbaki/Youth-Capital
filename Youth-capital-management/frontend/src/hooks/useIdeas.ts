import { useEffect, useState } from "react";
import * as api from "../lib/api";
import { IdeaFull, IdeaPublic } from "../types/idea";

export function useBoard(jihaCode: string, board: "submitted" | "approved") {
  const [ideas, setIdeas] = useState<IdeaPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetcher = board === "submitted" ? api.getSubmittedBoard : api.getApprovedBoard;
    setLoading(true);
    fetcher(jihaCode)
      .then(setIdeas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jihaCode, board]);

  return { ideas, loading, error };
}

export function useIdea(jihaCode: string, ideaId: string) {
  const [idea, setIdea] = useState<IdeaPublic | IdeaFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getIdea(jihaCode, ideaId)
      .then(setIdea)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jihaCode, ideaId]);

  return { idea, loading, error };
}
