import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff, Lock, Loader2, ShieldAlert } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@/hooks/use-seo";
import { Button, Input, Label } from "@/components/ui-custom";
import { AuthLayout } from "@/components/auth-layout";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export default function ResetPassword() {
  const { t } = useLanguage();
  useSeo({
    title: t("Reset Password | Youth Capital", "إعادة تعيين كلمة المرور | يوث كابيتال"),
    description: t("Choose a new password.", "اختر كلمة مرور جديدة."),
    path: "/reset-password",
    noindex: true,
  });
  const qc = useQueryClient();
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | { role?: string }>(null);

  const check = useQuery({
    queryKey: ["/api/auth/reset-password", token],
    queryFn: () => customFetch<{ valid: boolean }>(`/api/auth/reset-password/${encodeURIComponent(token)}`),
    enabled: token.length >= 32,
    retry: false,
  });
  const invalid = token.length < 32 || check.data?.valid === false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = t("At least 8 characters", "8 أحرف على الأقل");
    if (password.length > 72) next.password = t("At most 72 characters", "72 حرفاً كحد أقصى");
    if (confirm !== password) next.confirm = t("Passwords don't match", "كلمتا المرور غير متطابقتين");
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setSubmitError("");
    try {
      const res = await customFetch<any>("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      await qc.invalidateQueries();
      setDone({ role: res?.user?.role });
      // Remove the token from the address bar and browser history.
      history.replaceState(null, "", "/reset-password");
    } catch (err: any) {
      setSubmitError(err?.message || t("Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout eyebrow={t("All set", "تم")} title={t("Password updated", "تم تحديث كلمة المرور")}>
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-6">
          <CheckCircle2 className="mb-4 size-10 text-emerald-600" />
          <p className="text-sm leading-relaxed text-foreground">
            {t("Your new password is saved and you're signed in. For your security, any other devices were signed out.", "تم حفظ كلمة المرور الجديدة وتسجيل دخولك. لحمايتك، تم تسجيل الخروج من الأجهزة الأخرى.")}
          </p>
        </div>
        <Button variant="gold" size="lg" className="mt-6 w-full" onClick={() => (window.location.href = done.role === "admin" ? "/admin" : "/dashboard")}>
          {t("Continue", "متابعة")}
        </Button>
      </AuthLayout>
    );
  }

  if (check.isLoading && !invalid) {
    return (
      <AuthLayout eyebrow={t("Account recovery", "استعادة الحساب")} title={t("Checking your link…", "جارٍ التحقق من الرابط…")}>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </AuthLayout>
    );
  }

  if (invalid) {
    return (
      <AuthLayout eyebrow={t("Account recovery", "استعادة الحساب")} title={t("Link expired", "انتهت صلاحية الرابط")}>
        <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6">
          <ShieldAlert className="mb-4 size-10 text-destructive" />
          <p className="text-sm leading-relaxed text-foreground">
            {t("This reset link is invalid, was already used, or is more than an hour old. Request a new one — it only takes a moment.", "رابط إعادة التعيين هذا غير صالح أو استُخدم من قبل أو مضى عليه أكثر من ساعة. اطلب رابطاً جديداً.")}
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="gold" size="lg" className="mt-6 w-full">{t("Request a new link", "طلب رابط جديد")}</Button>
        </Link>
      </AuthLayout>
    );
  }

  const score = strength(password);
  const colors = ["bg-destructive", "bg-destructive", "bg-orange-400", "bg-gold", "bg-green-500"];

  return (
    <AuthLayout
      eyebrow={t("Account recovery", "استعادة الحساب")}
      title={t("Choose a new password", "اختر كلمة مرور جديدة")}
      subtitle={t("Use at least 8 characters. A longer password with numbers and symbols is stronger.", "استخدم 8 أحرف على الأقل. كلمة مرور أطول بأرقام ورموز أقوى.")}
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div>
          <Label>{t("New password", "كلمة المرور الجديدة")}</Label>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              className="pe-12"
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t("Hide password", "إخفاء") : t("Show password", "إظهار")}
              className="absolute end-3 top-[24px] -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-gold transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2.5 flex gap-1.5">
              {[0, 1, 2, 3].map((i) => <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? colors[score] : "bg-border"}`} />)}
            </div>
          )}
        </div>
        <div>
          <Label>{t("Confirm new password", "تأكيد كلمة المرور")}</Label>
          <Input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            icon={<Lock className="w-4 h-4" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />
        </div>
        {submitError && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{submitError}</p>}
        <Button type="submit" variant="gold" size="lg" className="w-full" isLoading={loading}>
          {t("Save new password", "حفظ كلمة المرور")}
        </Button>
      </form>
    </AuthLayout>
  );
}
