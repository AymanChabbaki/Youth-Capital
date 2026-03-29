import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select, Textarea, Label, Card } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister, useSubmitRoleApplication } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Fingerprint, Globe } from "lucide-react";
import { Link } from "wouter";

const MOROCCAN_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "L'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab",
  "Moroccan Diaspora / الجالية المغربية",
];

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
  
  const discordLink = import.meta.env.VITE_DISCORD_LINK || "https://discord.gg/example";

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
        <Card className="w-full max-w-lg p-10 text-center rounded-[40px] shadow-2xl shadow-slate-200">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center shadow-lg shadow-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-display font-black text-slate-900 mb-4 tracking-tight">
            {t("Application Transmitted!", "تم إرسال طلبك!")}
          </h2>
          <p className="text-slate-500 font-bold mb-8 leading-relaxed">
            {t("Your civic record has been successfully queued for review by the platform overseers.", "تم وضع سجلك المدني بنجاح في قائمة الانتظار للمراجعة من قبل مشرفي المنصة.")}
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[32px] text-left mb-10 relative overflow-hidden group hover:border-primary/40 transition-all shadow-xl shadow-primary/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[40px] -mr-12 -mt-12" />
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Fingerprint className="w-5 h-5" />
               </div>
               <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t("Mandatory Next Step", "الخطوة التالية الإلزامية")}</h4>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6">
               {t("To finalize your candidacy, you MUST join our Discord server and complete the verification form pinned in #onboarding.", "لإكمال ترشيحك، يجب أن تنضم إلى خادم Discord الخاص بنا وتكمل نموذج التحقق المثبت في #onboarding.")}
            </p>
            <a href={discordLink} target="_blank" rel="noopener noreferrer">
               <Button variant="primary" className="w-full h-14 rounded-2xl gap-3 shadow-lg shadow-primary/20 text-md font-black">
                  <Globe className="w-5 h-5" />
                  {t("Join Official Discord", "انضم إلى Discord الرسمي")}
               </Button>
            </a>
          </motion.div>

          <Link href="/login">
            <Button variant="ghost" className="w-full font-bold text-slate-400 hover:text-primary transition-colors">{t("Proceed to Login", "المتابعة لتسجيل الدخول")}</Button>
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
                    <Select {...form.register("region")} error={form.formState.errors.region?.message}>
                      <option value="">{t("Select a Region", "اختر جهة")}</option>
                      {MOROCCAN_REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </Select>
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
