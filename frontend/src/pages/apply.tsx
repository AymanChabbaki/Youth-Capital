import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select, Textarea, Label, Card } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister, useSubmitRoleApplication } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Fingerprint, Globe, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

function passwordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

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

const getApplySchema = (step: number) => z.object({
  fullName: z.string().min(2, "Full name is required"),
  fullNameAr: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  preferredRole: z.enum(["minister", "mp", "local_council", "diaspora_rep"]),
  region: step >= 2 ? z.string().min(1, "Region is required") : z.string().optional().or(z.literal('')),
  ministryPreference: z.string().optional(),
  parliamentHouse: z.enum(["house_of_representatives", "house_of_councillors"]).optional(),
  motivation: step >= 3 ? z.string().min(50, "Please provide a detailed motivation (min 50 chars)") : z.string().optional().or(z.literal('')),
});

type ApplyFormData = {
  fullName: string;
  fullNameAr?: string;
  email: string;
  password: string;
  preferredRole: "minister" | "mp" | "local_council" | "diaspora_rep";
  region: string;
  ministryPreference?: string;
  parliamentHouse?: "house_of_representatives" | "house_of_councillors";
  motivation: string;
};

export default function Apply() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  
  const communityLink = import.meta.env.VITE_COMMUNITY_LINK || "https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu";

  const registerMutation = useRegister();
  const applyMutation = useSubmitRoleApplication();

  const form = useForm<ApplyFormData>({
    resolver: (data, context, options) => {
      return zodResolver(getApplySchema(step))(data, context, options);
    },
    defaultValues: {
      fullName: "",
      fullNameAr: "",
      email: "",
      password: "",
      preferredRole: "mp",
      region: "",
      ministryPreference: "",
      parliamentHouse: "house_of_representatives",
      motivation: "",
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
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-navy-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-primary/25 blur-[130px] rounded-full" />
        <div className="absolute -bottom-40 -right-32 w-[420px] h-[420px] bg-gold/10 blur-[130px] rounded-full" />

        <Card className="w-full max-w-lg p-10 text-center rounded-[2.5rem] shadow-2xl shadow-navy/30 relative z-10 border border-gold/20">
          <motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gold/15 rounded-3xl flex items-center justify-center shadow-lg shadow-gold/10 animate-pulse-glow">
              <CheckCircle2 className="w-12 h-12 text-gold" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-display font-black text-foreground mb-4 tracking-tight">
            {t("Application Transmitted!", "تم إرسال طلبك!")}
          </h2>
          <p className="text-muted-foreground font-semibold mb-8 leading-relaxed">
            {t("Your civic record has been successfully queued for review by the platform overseers.", "تم وضع سجلك المدني بنجاح في قائمة الانتظار للمراجعة من قبل مشرفي المنصة.")}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gold/5 border-2 border-gold/25 p-8 rounded-[2rem] text-start mb-10 relative overflow-hidden group hover:border-gold/50 transition-all shadow-xl shadow-gold/5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-[40px] -mr-12 -mt-12" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center text-gold">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h4 className="font-black text-foreground uppercase tracking-widest text-xs">{t("Mandatory Next Step", "الخطوة التالية الإلزامية")}</h4>
            </div>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-6">
              {t("To finalize your candidacy, you MUST join our WhatsApp community to stay updated.", "لإكمال ترشيحك، يجب أن تنضم إلى مجتمع الواتساب الخاص بنا للبقاء على اطلاع.")}
            </p>
            <a href={communityLink} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="w-full h-14 rounded-2xl gap-3 shadow-lg text-md font-black bg-[#25D366] hover:bg-[#1DA851] text-white border-none">
                <img src="/images/whatsapp.png" alt="WhatsApp" className="w-5 h-5" />
                {t("Join WhatsApp Community", "انضم إلى مجتمع واتساب")}
              </Button>
            </a>
          </motion.div>

          <Link href="/login">
            <Button variant="ghost" className="w-full font-bold text-muted-foreground hover:text-gold transition-colors">{t("Proceed to Login", "المتابعة لتسجيل الدخول")}</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const stepLabels = [
    t("Identity", "الهوية"),
    t("Role", "الدور"),
    t("Motivation", "الدوافع"),
  ];

  return (
    <div className="min-h-screen pb-16 bg-background relative overflow-hidden">
      {/* Dark hero band behind the form */}
      <div className="absolute top-0 left-0 right-0 h-[420px] bg-navy-dark overflow-hidden">
        <div className="absolute inset-0 bg-grid-gold opacity-30" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-primary/25 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] bg-gold/10 blur-[110px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-20 md:pt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-gold-pale text-[11px] font-bold uppercase tracking-[0.2em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {t("Candidacy Registration", "تسجيل الترشيح")}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
            {t("Join the", "انضم إلى")} <span className="text-gradient-gold">{t("Simulation", "المحاكاة")}</span>
          </h1>
          <p className="text-white/60">
            {t("Complete the form below to apply for a role in Youth Capital.", "أكمل النموذج أدناه للتقدم لدور في شباب العاصمة.")}
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={step === i ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                    step > i
                      ? "bg-gold text-navy-dark shadow-lg shadow-gold/30"
                      : step === i
                        ? "bg-gold text-navy-dark shadow-lg shadow-gold/40 ring-4 ring-gold/20"
                        : "bg-white/10 text-white/50 border border-white/20 backdrop-blur-md"
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                </motion.div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step >= i ? "text-gold" : "text-white/40"}`}>
                  {stepLabels[i - 1]}
                </span>
              </div>
              {i < 3 && (
                <div className="w-14 sm:w-20 h-1 mx-2 mb-6 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: step > i ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-gold to-gold-pale"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Card className="p-8 md:p-10 rounded-[2rem] border border-gold/15 shadow-2xl shadow-navy/10">
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...form.register("password")}
                        error={form.formState.errors.password?.message}
                        className="pe-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute end-3 top-[24px] -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-gold transition-colors"
                        aria-label={showPassword ? t("Hide password", "إخفاء كلمة المرور") : t("Show password", "إظهار كلمة المرور")}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {(() => {
                      const pw = form.watch("password") || "";
                      const score = passwordStrength(pw);
                      const labels = [
                        t("Too weak", "ضعيفة جداً"),
                        t("Weak", "ضعيفة"),
                        t("Okay", "مقبولة"),
                        t("Strong", "قوية"),
                        t("Fortress", "حصينة"),
                      ];
                      const colors = ["bg-destructive", "bg-destructive", "bg-orange-400", "bg-gold", "bg-green-500"];
                      return pw.length > 0 ? (
                        <div className="mt-2.5">
                          <div className="flex gap-1.5 mb-1.5">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score] : "bg-border"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold">{labels[score]}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1.5">{t("Minimum 8 characters", "8 أحرف كحد أدنى")}</p>
                      );
                    })()}
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
                    {/* Live character counter */}
                    {(() => {
                      const len = (form.watch("motivation") || "").length;
                      const reached = len >= 50;
                      const pct = Math.min((len / 50) * 100, 100);
                      return (
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${reached ? "bg-green-500" : "bg-gold"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold tabular-nums shrink-0 ${reached ? "text-green-500" : "text-muted-foreground"}`}>
                            {reached ? `✓ ${len}` : `${len} / 50`}
                          </span>
                        </div>
                      );
                    })()}
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
          {t("Already have an account?", "لديك حساب بالفعل؟")} <Link href="/login" className="text-gold font-bold hover:underline">{t("Log in", "تسجيل الدخول")}</Link>
        </p>
      </div>
    </div>
  );
}
