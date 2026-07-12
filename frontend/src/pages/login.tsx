import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label } from "@/components/ui-custom";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Landmark, Gavel, ShieldCheck, ArrowRight, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { t, isAr } = useLanguage();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema)
  });

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

  const perks = [
    { icon: Landmark, text: t("Enter your assigned chamber", "ادخل إلى غرفتك المخصصة") },
    { icon: Gavel, text: t("Vote on live legislation", "صوّت على التشريعات المباشرة") },
    { icon: ShieldCheck, text: t("Respond to national crises", "استجب للأزمات الوطنية") },
  ];

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Brand Panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy-dark p-14 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-primary/30 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 -right-32 w-[440px] h-[440px] bg-gold/10 blur-[130px] rounded-full" />

        <Link href="/" className="relative z-10 inline-block w-fit group">
          <img src="/youth_capital_logo_dark.svg" alt="Youth Capital" className="h-11 w-auto group-hover:opacity-80 transition-opacity" />
        </Link>

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl xl:text-6xl font-display font-black text-white leading-[1.08] mb-8 text-balance"
          >
            {t("The Nation", "الأمة")}{" "}
            <span className="text-gradient-gold">{t("Awaits Your Vote", "تنتظر صوتك")}</span>
          </motion.h2>

          <div className="space-y-5">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-4 text-white/70"
                >
                  <span className="p-2.5 rounded-xl bg-gold/10 border border-gold/20">
                    <Icon className="w-5 h-5 text-gold" />
                  </span>
                  <span className="font-semibold">{perk.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 text-white/30 text-xs font-bold uppercase tracking-[0.25em]"
        >
          {t("Youth Capital — Govern the Future", "عاصمة الشباب — احكم المستقبل")}
        </motion.p>
      </div>

      {/* Form Panel */}
      <div className="flex items-center justify-center px-4 py-16 lg:py-0 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <Link href="/" className="lg:hidden inline-block mb-10">
            <img src="/youth_capital_logo_light.svg" alt="Youth Capital" className="h-12 w-auto" />
          </Link>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {t("Secure Access", "دخول آمن")}
          </span>

          <h1 className="text-4xl md:text-5xl font-display font-black text-foreground mb-3">
            {t("Welcome Back", "مرحباً بعودتك")}
          </h1>
          <p className="text-muted-foreground mb-10">
            {t("Sign in to continue your simulation journey.", "سجل الدخول لمتابعة رحلتك في المحاكاة.")}
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label>{t("Email Address", "البريد الإلكتروني")}</Label>
              <Input
                type="email"
                icon={<Mail className="w-4 h-4" />}
                placeholder={t("you@example.com", "you@example.com")}
                {...form.register("email")}
                error={form.formState.errors.email?.message}
              />
            </div>
            <div>
              <Label>{t("Password", "كلمة المرور")}</Label>
              <Input
                type="password"
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
        </motion.div>
      </div>
    </div>
  );
}
