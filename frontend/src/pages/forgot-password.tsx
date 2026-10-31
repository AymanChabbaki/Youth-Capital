import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/use-seo";
import { Button, Input, Label } from "@/components/ui-custom";
import { AuthLayout } from "@/components/auth-layout";

export default function ForgotPassword() {
  const { t, lang, isAr } = useLanguage();
  useSeo({
    title: t("Forgot Password | Youth Capital", "نسيت كلمة المرور | يوث كابيتال"),
    description: t("Reset your Youth Capital password.", "أعد تعيين كلمة مرور يوث كابيتال."),
    path: "/forgot-password",
    noindex: true,
  });
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("Enter a valid email address", "أدخل بريداً إلكترونياً صالحاً"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await customFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), lang }),
      });
      setSentTo(email.trim());
    } catch (err: any) {
      toast({ title: t("Couldn't send the link", "تعذر إرسال الرابط"), description: err?.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const back = (
    <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-gold transition-colors">
      <ArrowLeft className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} /> {t("Back to sign in", "العودة لتسجيل الدخول")}
    </Link>
  );

  if (sentTo) {
    return (
      <AuthLayout eyebrow={t("Check your inbox", "تحقق من بريدك")} title={t("Link sent", "تم إرسال الرابط")}>
        <div className="rounded-2xl border border-gold/25 bg-gold/5 p-6">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gold/15">
            <MailCheck className="size-6 text-gold" />
          </div>
          <p className="text-sm leading-relaxed text-foreground">
            {t("If an account exists for", "إذا كان هناك حساب مرتبط بـ")} <strong className="break-all">{sentTo}</strong>
            {t(", you'll get an email with a link to choose a new password. The link expires in 1 hour.", "، فستصلك رسالة تحتوي على رابط لاختيار كلمة مرور جديدة. ينتهي الرابط خلال ساعة.")}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("Nothing after a few minutes? Check your spam folder, or", "لم يصلك شيء بعد بضع دقائق؟ تحقق من مجلد الرسائل غير المرغوب فيها، أو")}{" "}
            <button type="button" onClick={() => setSentTo(null)} className="font-bold text-gold hover:underline">{t("try again", "حاول مرة أخرى")}</button>.
          </p>
        </div>
        {back}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={t("Account recovery", "استعادة الحساب")}
      title={t("Forgot password?", "نسيت كلمة المرور؟")}
      subtitle={t("Enter the email you signed up with and we'll send you a link to reset it.", "أدخل البريد الإلكتروني الذي سجلت به وسنرسل لك رابطاً لإعادة تعيينها.")}
    >
      <form onSubmit={submit} className="space-y-6" noValidate>
        <div>
          <Label>{t("Email Address", "البريد الإلكتروني")}</Label>
          <Input
            type="email"
            autoComplete="email"
            autoFocus
            icon={<Mail className="w-4 h-4" />}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full" isLoading={loading}>
          {t("Send reset link", "إرسال رابط إعادة التعيين")}
        </Button>
      </form>
      <p className="mt-6 text-xs text-muted-foreground">
        {t("Signed up with Google or LinkedIn? You can keep using that button, or use this form to also set a password.", "سجلت عبر Google أو LinkedIn؟ يمكنك الاستمرار في استخدامه، أو استخدام هذا النموذج لتعيين كلمة مرور أيضاً.")}
      </p>
      {back}
    </AuthLayout>
  );
}
