import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/components/ui-custom";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { AuthLayout } from "@/components/auth-layout";
import { SocialAuthButtons, oauthErrorMessage } from "@/components/social-auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { t, isAr } = useLanguage();
  useSeo({
    title: t("Log In | Youth Capital", "تسجيل الدخول | يوث كابيتال"),
    description: t("Log in to your Youth Capital account.", "سجّل الدخول إلى حسابك في يوث كابيتال."),
    path: "/login",
    noindex: true,
  });
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  });

  // The API sends people back here with ?oauth_error=… when Google/LinkedIn sign-in fails.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oauth_error");
    if (!code) return;
    toast({ title: t("Sign-in failed", "فشل تسجيل الدخول"), description: oauthErrorMessage(code, t), variant: "destructive" });
    params.delete("oauth_error");
    history.replaceState(null, "", `${window.location.pathname}${params.toString() ? `?${params}` : ""}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const result = await loginMutation.mutateAsync({ data });
      await queryClient.invalidateQueries();
      window.location.href = (result as any)?.user?.role === "admin" ? "/admin" : "/dashboard";
    } catch (error: any) {
      toast({
        title: t("Login Failed", "فشل تسجيل الدخول"),
        description: error?.message || t("Invalid credentials", "بيانات الاعتماد غير صالحة"),
        variant: "destructive"
      });
    }
  };

  return (
    <AuthLayout
      eyebrow={t("Secure Access", "دخول آمن")}
      title={t("Welcome Back", "مرحباً بعودتك")}
      subtitle={t("Sign in to continue your simulation journey.", "سجل الدخول لمتابعة رحلتك في المحاكاة.")}
    >
      <div className="mb-6">
        <SocialAuthButtons divider={t("or with email", "أو بالبريد الإلكتروني")} />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label>{t("Email Address", "البريد الإلكتروني")}</Label>
          <Input
            type="email"
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
            placeholder={t("you@example.com", "you@example.com")}
            {...form.register("email")}
            error={form.formState.errors.email?.message}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>{t("Password", "كلمة المرور")}</Label>
            <Link href="/forgot-password" className="text-xs font-bold text-gold hover:underline mb-2">
              {t("Forgot password?", "نسيت كلمة المرور؟")}
            </Link>
          </div>
          <Input
            type="password"
            autoComplete="current-password"
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            {...form.register("password")}
            error={form.formState.errors.password?.message}
          />
        </div>
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full group"
          isLoading={loginMutation.isPending}
        >
          {t("Sign In", "تسجيل الدخول")}
          <ArrowRight className={`w-5 h-5 ms-2 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
        </Button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t("New here?", "جديد هنا؟")}</span>
        <span className="flex-1 h-px bg-border" />
      </div>

      <Link href="/apply">
        <Button variant="outline" size="lg" className="w-full">
          {t("Apply to Join the Simulation", "قدّم طلبك للانضمام إلى المحاكاة")}
        </Button>
      </Link>
    </AuthLayout>
  );
}
