import { isMockMode, supabase } from "./supabaseClient";
import { delay, MOCK_IDEAS, MOCK_IDEAS_FULL } from "./mockData";
import { IdeaFull, IdeaPublic } from "../types/idea";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

async function authedFetch(path: string, init?: RequestInit) {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export function getSubmittedBoard(jihaCode: string): Promise<IdeaPublic[]> {
  if (isMockMode) {
    return delay((MOCK_IDEAS[jihaCode] ?? []).filter((i) => i.status !== "approved" && i.status !== "rejected"));
  }
  return authedFetch(`/api/jihat/${jihaCode}/ideas/board/submitted`);
}

export function getApprovedBoard(jihaCode: string): Promise<IdeaPublic[]> {
  if (isMockMode) {
    return delay((MOCK_IDEAS[jihaCode] ?? []).filter((i) => i.status === "approved"));
  }
  return authedFetch(`/api/jihat/${jihaCode}/ideas/board/approved`);
}

export function getIdea(jihaCode: string, ideaId: string): Promise<IdeaPublic | IdeaFull> {
  if (isMockMode) {
    const full = MOCK_IDEAS_FULL[ideaId];
    if (!full) return Promise.reject(new Error("الفكرة غير موجودة"));
    return delay(full);
  }
  return authedFetch(`/api/jihat/${jihaCode}/ideas/${ideaId}`);
}

export function requestCollab(jihaCode: string, ideaId: string) {
  if (isMockMode) {
    return delay({ ok: true, message: "تم إرسال طلب التعاون (وضع تجريبي)" });
  }
  return authedFetch(`/api/jihat/${jihaCode}/ideas/${ideaId}/collab-requests`, { method: "POST" });
}
