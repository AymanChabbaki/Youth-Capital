import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Label, Card } from "@/components/ui-custom";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { t } = useLanguage();
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

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 flex items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-md p-8 shadow-2xl shadow-primary/10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-6">
            <img 
              src="/youth_capital_logo_light.svg" 
              alt="Youth Capital" 
              className="h-16 w-auto group-hover:scale-105 transition-transform" 
            />
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            {t("Welcome Back", "مرحباً بعودتك")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("Sign in to continue your simulation journey", "سجل الدخول لمتابعة رحلتك في المحاكاة")}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label>{t("Email Address", "البريد الإلكتروني")}</Label>
            <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} />
          </div>
          <div>
            <Label>{t("Password", "كلمة المرور")}</Label>
            <Input type="password" {...form.register("password")} error={form.formState.errors.password?.message} />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            isLoading={loginMutation.isPending}
          >
            {t("Sign In", "تسجيل الدخول")}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {t("Don't have an account?", "ليس لديك حساب؟")} <Link href="/apply" className="text-accent font-bold hover:underline">{t("Apply Now", "قدّم طلبك الآن")}</Link>
        </p>
      </Card>
    </div>
  );
}
