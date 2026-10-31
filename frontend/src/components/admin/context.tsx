import { createContext, useContext, useEffect } from "react";

// Cross-page intents: the command palette, overview cards and row actions
// ask another section to open a record, start a "create" form, or prefill
// the email composer. The target page consumes the intent once it mounts.
export type Intent =
  | { kind: "open"; tab: string; id: number | string }
  | { kind: "create"; tab: string }
  | { kind: "compose"; tab: "emails"; emails: string[] }
  | { kind: "filter"; tab: string; value: string };

export type AdminContextValue = {
  tab: string;
  go: (tab: string) => void;
  dispatch: (intent: Intent) => void;
  intent: Intent | null;
  clearIntent: () => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside the admin dashboard");
  return ctx;
}

// Runs `handler` once for an intent addressed to `tab`, then clears it.
export function useIntent(tab: string, handler: (intent: Intent) => void) {
  const { intent, clearIntent } = useAdmin();
  useEffect(() => {
    if (intent && intent.tab === tab) {
      handler(intent);
      clearIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent, tab]);
}
