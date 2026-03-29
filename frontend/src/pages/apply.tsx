import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select, Textarea, Label, Card } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister, useSubmitRoleApplication } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const applySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  fullNameAr: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  preferredRole: z.enum(["minister", "mp", "local_council", "diaspora_rep"]),
  region: z.string().min(1, "Region is required"),
  ministryPreference: z.string().optional(),
  parliamentHouse: z.enum(["house_of_representatives", "house_of_councillors"]).optional(),
  motivation: z.string().min(50, "Please provide a detailed motivation (min 50 chars)"),
});

type ApplyFormData = z.infer<typeof applySchema>;

export default function Apply() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const registerMutation = useRegister();
  const applyMutation = useSubmitRoleApplication();

  const form = useForm<ApplyFormData>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      preferredRole: "mp",
    }
  });

  const onSubmit = async (data: ApplyFormData) => {
    try {
      // 1. Create User
      await registerMutation.mutateAsync({
        data: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          fullNameAr: data.fullNameAr,
          languagePreference: "en",
        }
      });

      // 2. Submit Application
      await applyMutation.mutateAsync({
        data: {
          preferredRole: data.preferredRole as any,
          region: data.region,
          ministryPreference: data.ministryPreference,
          parliamentHouse: data.parliamentHouse as any,
          motivation: data.motivation,
        }
      });

      setIsSuccess(true);
    } catch (error: any) {
      toast({
        title: t("Application Failed", "فشل التقديم"),
        description: error?.message || t("Please check your details and try again.", "الرجاء التحقق من بياناتك والمحاولة مرة أخرى."),
        variant: "destructive"
      });
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ["fullName", "email", "password"] 
      : ["preferredRole", "region"];
      
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) setStep(step + 1);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-secondary/30">
        <Card className="w-full max-w-md p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">
            {t("Application Submitted!", "تم تقديم الطلب بنجاح!")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("Your application is now under review by the Platform Managers. You will be notified via email once a decision is made.", "طلبك الآن قيد المراجعة من قبل مديري المنصة. سيتم إعلامك عبر البريد الإلكتروني بمجرد اتخاذ قرار.")}
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">{t("Go to Login", "الذهاب لتسجيل الدخول")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">
            {t("Join the Simulation", "انضم إلى المحاكاة")}
          </h1>
          <p className="text-muted-foreground">
            {t("Complete the form below to apply for a role in Youth CapitalCore.", "أكمل النموذج أدناه للتقدم لدور في شباب العاصمة.")}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-primary text-white' : 'bg-white text-muted-foreground border border-border'}`}>
                {i}
              </div>
              {i < 3 && <div className={`w-12 h-1 transition-colors ${step > i ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">{t("Personal Details", "التفاصيل الشخصية")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("Full Name (English)", "الاسم الكامل (انجليزي)")}</Label>
                      <Input {...form.register("fullName")} error={form.formState.errors.fullName?.message} />
                    </div>
                    <div>
                      <Label>{t("Full Name (Arabic - Optional)", "الاسم الكامل (عربي - اختياري)")}</Label>
                      <Input {...form.register("fullNameAr")} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("Email Address", "البريد الإلكتروني")}</Label>
                    <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} />
                  </div>
                  <div>
                    <Label>{t("Password", "كلمة المرور")}</Label>
                    <Input type="password" {...form.register("password")} error={form.formState.errors.password?.message} />
                  </div>
                  <Button type="button" onClick={nextStep} className="w-full mt-6">{t("Next Step", "الخطوة التالية")}</Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">{t("Role Selection", "اختيار الدور")}</h3>
                  <div>
                    <Label>{t("Preferred Role", "الدور المفضل")}</Label>
                    <Select {...form.register("preferredRole")} error={form.formState.errors.preferredRole?.message}>
                      <option value="mp">{t("Member of Parliament", "عضو برلمان")}</option>
                      <option value="minister">{t("Minister", "وزير")}</option>
                      <option value="local_council">{t("Local Council", "مجلس محلي")}</option>
                      <option value="diaspora_rep">{t("Diaspora Representative", "ممثل الجالية")}</option>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Region", "الجهة / المنطقة")}</Label>
                    <Input {...form.register("region")} placeholder="e.g. Casablanca-Settat" error={form.formState.errors.region?.message} />
                  </div>
                  {form.watch("preferredRole") === "mp" && (
                    <div>
                      <Label>{t("Parliament House", "مجلس البرلمان")}</Label>
                      <Select {...form.register("parliamentHouse")}>
                        <option value="house_of_representatives">{t("House of Representatives", "مجلس النواب")}</option>
                        <option value="house_of_councillors">{t("House of Councillors", "مجلس المستشارين")}</option>
                      </Select>
                    </div>
                  )}
                  {form.watch("preferredRole") === "minister" && (
                    <div>
                      <Label>{t("Ministry Preference", "الوزارة المفضلة")}</Label>
                      <Input {...form.register("ministryPreference")} placeholder="e.g. Ministry of Health" />
                    </div>
                  )}
                  <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">{t("Back", "رجوع")}</Button>
                    <Button type="button" onClick={nextStep} className="w-full">{t("Next Step", "الخطوة التالية")}</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b pb-2">{t("Motivation", "خطاب التحفيز")}</h3>
                  <div>
                    <Label>{t("Why do you want this role?", "لماذا تريد هذا الدور؟")}</Label>
                    <Textarea 
                      {...form.register("motivation")} 
                      placeholder={t("Write at least 50 characters explaining your goals and qualifications...", "اكتب ما لا يقل عن 50 حرفًا تشرح فيها أهدافك ومؤهلاتك...")}
                      error={form.formState.errors.motivation?.message}
                      className="h-40"
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">{t("Back", "رجوع")}</Button>
                    <Button 
                      type="submit" 
                      variant="gold" 
                      className="w-full"
                      isLoading={registerMutation.isPending || applyMutation.isPending}
                    >
                      {t("Submit Application", "تقديم الطلب")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-muted-foreground">
          {t("Already have an account?", "لديك حساب بالفعل؟")} <Link href="/login" className="text-primary font-bold hover:underline">{t("Log in", "تسجيل الدخول")}</Link>
        </p>
      </div>
    </div>
  );
}
