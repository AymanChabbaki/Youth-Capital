import { useState } from "react";
import * as api from "../../lib/api";
import { Spinner } from "../Spinner";
import { useLang } from "../../i18n/LanguageContext";

export function CollabRequestButton({ jihaCode, ideaId }: { jihaCode: string; ideaId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const { tr } = useLang();

  async function handleClick() {
    setStatus("sending");
    try {
      await api.requestCollab(jihaCode, ideaId);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p style={{ color: "var(--color-maghreb-gold)" }}>{tr.idea.requestSent}</p>;
  }

  return (
    <button className="primary" onClick={handleClick} disabled={status === "sending"}>
      {status === "sending" && <Spinner size={16} className="spinner-inline" />}
      {status === "sending" ? tr.idea.sending : tr.idea.requestJoin}
    </button>
  );
}
