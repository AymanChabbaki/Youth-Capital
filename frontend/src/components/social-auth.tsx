import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { useLanguage } from "@/hooks/use-language";

// The OAuth flow is a full-page redirect through the API (which sets the
// session cookie on its own domain), so these are links to the API, not fetches.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function useOAuthProviders() {
  return useQuery({
    queryKey: ["/api/auth/oauth/providers"],
    queryFn: () => customFetch<{ google: boolean; linkedin: boolean }>("/api/auth/oauth/providers"),
    staleTime: 5 * 60 * 1000,
  });
}

export function SocialAuthButtons({ mode = "login", divider }: { mode?: "login" | "signup"; divider?: string }) {
  const { t, lang } = useLanguage();
  const { data } = useOAuthProviders();
  if (!data?.google && !data?.linkedin) return null;

  const href = (provider: string) => `${API_BASE}/api/auth/oauth/${provider}?lang=${lang}`;
  const label = (name: string) => (mode === "signup"
    ? t(`Sign up with ${name}`, `التسجيل عبر ${name}`)
    : t(`Continue with ${name}`, `المتابعة عبر ${name}`));
  const btn = "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md";

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${data.google && data.linkedin ? "sm:grid-cols-2" : ""}`}>
        {data.google && (
          <a href={href("google")} className={btn}>
            <FcGoogle className="size-5" /> {label("Google")}
          </a>
        )}
        {data.linkedin && (
          <a href={href("linkedin")} className={btn}>
            <FaLinkedin className="size-5 text-[#0A66C2]" /> {label("LinkedIn")}
          </a>
        )}
      </div>
      {divider && (
        <div className="flex items-center gap-4 pt-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{divider}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
      )}
    </div>
  );
}

// Messages for ?oauth_error=… set by the API when a social sign-in fails.
export function oauthErrorMessage(code: string, t: (en: string, ar: string) => string) {
  const map: Record<string, [string, string]> = {
    cancelled: ["Sign-in was cancelled.", "تم إلغاء تسجيل الدخول."],
    email_not_verified: ["That account has no verified email address. Verify it with the provider, or sign in with your password.", "لا يحتوي هذا الحساب على بريد إلكتروني مُتحقق منه. تحقق منه لدى المزوّد أو سجّل الدخول بكلمة المرور."],
    banned: ["This account has been suspended.", "تم تعليق هذا الحساب."],
    provider_unavailable: ["This sign-in method isn't available right now.", "طريقة تسجيل الدخول هذه غير متاحة حالياً."],
    invalid_state: ["Your sign-in session expired. Please try again.", "انتهت صلاحية جلسة تسجيل الدخول. حاول مرة أخرى."],
  };
  const [en, ar] = map[code] || ["Social sign-in failed. Please try again.", "فشل تسجيل الدخول. حاول مرة أخرى."];
  return t(en, ar);
}
