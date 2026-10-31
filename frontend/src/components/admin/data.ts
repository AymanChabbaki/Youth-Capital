import { useQuery } from "@tanstack/react-query";
import {
  useGetUsers, useGetRoleApplications, useGetCrises, useGetArticles, useGetEvents, useGetPolls,
  customFetch,
} from "@workspace/api-client-react";

// Every admin page reads through these hooks so the cache is shared: switching
// pages never refetches, and one invalidateQueries() refreshes everything.

const opts = { query: { staleTime: 30_000 } } as any;

export function useMembers() {
  const q = useGetUsers({ limit: 5000 }, opts);
  return { ...q, members: ((q.data as any)?.users || []) as any[], total: (q.data as any)?.total as number | undefined };
}

export function useApplications() {
  const q = useGetRoleApplications(undefined, opts);
  return { ...q, applications: ((q.data as any)?.applications || []) as any[] };
}

export function useArticles() {
  const q = useGetArticles({ limit: 100 } as any, opts);
  return { ...q, articles: ((q.data as any)?.articles || []) as any[] };
}

export function useEvents() {
  const q = useGetEvents(undefined, opts);
  return { ...q, events: ((q.data as any)?.events || []) as any[] };
}

export function usePolls() {
  const q = useGetPolls(opts);
  return { ...q, polls: ((q.data as any)?.polls || []) as any[] };
}

export function useCrises() {
  const q = useGetCrises(opts);
  return { ...q, crises: ((q.data as any)?.crises || []) as any[] };
}

export function useTickets() {
  const q = useQuery({
    queryKey: ["/api/support/tickets"],
    queryFn: () => customFetch<any>("/api/support/tickets"),
    staleTime: 30_000,
  });
  return { ...q, tickets: (q.data?.tickets || []) as any[] };
}

export function useKpis() {
  return useQuery({ queryKey: ["/api/admin/kpis"], queryFn: () => customFetch<any>("/api/admin/kpis"), staleTime: 30_000 });
}

export function useSaharaResponses() {
  const q = useQuery({
    queryKey: ["/api/sahara-feedback/export"],
    queryFn: () => customFetch<any>("/api/sahara-feedback/export"),
    staleTime: 30_000,
  });
  return { ...q, responses: (q.data?.entries || []) as any[] };
}

export function useAuditLogs() {
  const q = useQuery({
    queryKey: ["/api/admin/logs", 100],
    queryFn: () => customFetch<any>("/api/admin/logs?limit=100"),
    refetchInterval: 30_000,
  });
  return { ...q, logs: (q.data?.logs || []) as any[] };
}

export function useSystemLogs() {
  const q = useQuery({
    queryKey: ["/api/admin/system-logs", 100],
    queryFn: () => customFetch<any>("/api/admin/system-logs?limit=100"),
    refetchInterval: 30_000,
  });
  return { ...q, logs: (q.data?.logs || []) as any[] };
}

export const jsonPost = (url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) =>
  customFetch<any>(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

// Drops empty-string fields so optional zod fields (dates, URLs) aren't sent as "".
export function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== undefined)) as Partial<T>;
}
