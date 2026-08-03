import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Input, Select, Label, Card } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { useRegister, useSubmitRoleApplication } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Fingerprint, Eye, EyeOff } from "lucide-react";
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

const INTERESTS_OPTIONS = [
  "Politics",
  "Climate & Environment",
  "Entrepreneurship",
  "Tech & Innovation",
  "Education",
  "Law",
  "Economy",
  "Culture & Cultural Dialogue"
];

const applySchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  age: z.coerce.number().min(12, "Invalid age").max(100, "Invalid age"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  
  status: z.string().min(1, "Status is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  region: z.string().min(2, "City / Region is required"),
  country: z.string().min(2, "Country is required"),
  
  interests: z.array(z.string()).min(1, "Select at least 1 interest").max(5, "Select up to 5 interests"),
  
  preferredRole: z.string().min(1, "Role is required"),
});

type ApplyFormData = z.infer<typeof applySchema>;

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
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      age: undefined as any,
      password: "",
      status: "",
      fieldOfStudy: "",
      educationLevel: "",
      region: "",
      country: "Morocco",
      interests: [],
      preferredRole: "",
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
          languagePreference: "en",
        }
      });

      // 2. Submit Application
      await applyMutation.mutateAsync({
        data: {
          preferredRole: data.preferredRole as any,
          region: data.region,
          motivation: `Interests: ${data.interests.join(", ")}\nStatus: ${data.status}\nEducation: ${data.educationLevel} in ${data.fieldOfStudy}`,
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
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["fullName", "email", "phone", "gender", "age", "password"];
    if (step === 2) fieldsToValidate = ["status", "fieldOfStudy", "educationLevel", "region", "country"];
    if (step === 3) fieldsToValidate = ["interests"];
      
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const toggleInterest = (interest: string) => {
    const current = form.getValues("interests");
    if (current.includes(interest)) {
      form.setValue("interests", current.filter(i => i !== interest), { shouldValidate: true });
    } else {
      if (current.length < 5) {
        form.setValue("interests", [...current, interest], { shouldValidate: true });
      }
    }
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
    t("Profile", "الملف الشخصي"),
    t("Interests", "الاهتمامات"),
    t("Role", "الدور")
  ];

  return (
    <div className="min-h-screen pb-16 bg-background relative overflow-hidden">
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
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={step === i ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${
                    step > i
                      ? "bg-gold text-navy-dark shadow-lg shadow-gold/30"
                      : step === i
                        ? "bg-gold text-navy-dark shadow-lg shadow-gold/40 ring-4 ring-gold/20"
                        : "bg-white/10 text-white/50 border border-white/20 backdrop-blur-md"
                  }`}
                >
                  {step > i ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : i}
                </motion.div>
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${step >= i ? "text-gold" : "text-white/40"}`}>
                  {stepLabels[i - 1]}
                </span>
              </div>
              {i < 4 && (
                <div className="w-8 sm:w-12 md:w-16 h-1 mx-2 mb-6 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: step > i ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-gold to-gold-pale"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 md:p-10 rounded-[2rem] border border-gold/15 shadow-2xl shadow-navy/10 bg-card">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">{t("Step 1 — Identity", "الخطوة 1 — الهوية")}</h3>
                  
                  <div>
                    <Label>{t("Full Name", "الاسم الكامل")}</Label>
                    <Input {...form.register("fullName")} error={form.formState.errors.fullName?.message} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("Email", "البريد الإلكتروني")}</Label>
                      <Input type="email" {...form.register("email")} error={form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <Label>{t("Phone Number (Optional)", "رقم الهاتف (اختياري)")}</Label>
                      <Input type="tel" {...form.register("phone")} error={form.formState.errors.phone?.message} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("Gender", "الجنس")}</Label>
                      <Select {...form.register("gender")} error={form.formState.errors.gender?.message}>
                        <option value="">{t("Select Gender", "اختر الجنس")}</option>
                        <option value="Male">{t("Male", "ذكر")}</option>
                        <option value="Female">{t("Female", "أنثى")}</option>
                        <option value="Prefer not to say">{t("Prefer not to say", "أفضل عدم القول")}</option>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("Age", "العمر")}</Label>
                      <Input type="number" {...form.register("age")} error={form.formState.errors.age?.message} />
                    </div>
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
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {(() => {
                      const pw = form.watch("password") || "";
                      const score = passwordStrength(pw);
                      const colors = ["bg-destructive", "bg-destructive", "bg-orange-400", "bg-gold", "bg-green-500"];
                      return pw.length > 0 ? (
                        <div className="mt-2.5">
                          <div className="flex gap-1.5 mb-1.5">
                            {[0, 1, 2, 3].map(i => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score] : "bg-border"}`} />
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <Button type="button" onClick={nextStep} className="w-full mt-6">{t("Next Step", "الخطوة التالية")}</Button>
                </motion.div>
              )}

              {/* STEP 2: PROFILE & STATUS */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">{t("Step 2 — Profile & Status", "الخطوة 2 — الملف الشخصي")}</h3>
                  
                  <div>
                    <Label>{t("Status", "الحالة")}</Label>
                    <Select {...form.register("status")} error={form.formState.errors.status?.message}>
                      <option value="">{t("Select Status", "اختر الحالة")}</option>
                      <option value="Student">Student</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>

                  <div>
                    <Label>{t("Field of Study / Specialty", "مجال الدراسة / التخصص")}</Label>
                    <Input {...form.register("fieldOfStudy")} placeholder="Law, Economics, Engineering, etc." error={form.formState.errors.fieldOfStudy?.message} />
                  </div>

                  <div>
                    <Label>{t("Education Level", "المستوى التعليمي")}</Label>
                    <Select {...form.register("educationLevel")} error={form.formState.errors.educationLevel?.message}>
                      <option value="">{t("Select Education Level", "اختر المستوى")}</option>
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t("City / Region", "المدينة / الجهة")}</Label>
                      <Input {...form.register("region")} error={form.formState.errors.region?.message} />
                    </div>
                    <div>
                      <Label>{t("Country", "البلد")}</Label>
                      <Input {...form.register("country")} error={form.formState.errors.country?.message} />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">{t("Back", "رجوع")}</Button>
                    <Button type="button" onClick={nextStep} className="w-full">{t("Next Step", "الخطوة التالية")}</Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: INTERESTS */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-2 border-b border-border pb-2">{t("Step 3 — Interests", "الخطوة 3 — الاهتمامات")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Select up to 5 interests that align with your civic goals.", "اختر ما يصل إلى 5 اهتمامات تتماشى مع أهدافك المدنية.")}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {INTERESTS_OPTIONS.map((interest) => {
                      const isSelected = form.watch("interests").includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                            isSelected 
                              ? "bg-gold/20 border-gold text-gold shadow-sm shadow-gold/10 scale-105" 
                              : "bg-secondary/50 border-border text-foreground hover:border-gold/50 hover:bg-secondary"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.interests && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.interests.message}</p>
                  )}

                  <div className="flex gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">{t("Back", "رجوع")}</Button>
                    <Button type="button" onClick={nextStep} className="w-full">{t("Next Step", "الخطوة التالية")}</Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: ROLE SELECTION */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">{t("Step 4 — Role Selection", "الخطوة 4 — اختيار الدور")}</h3>
                  
                  <div className="space-y-3">
                    {[
                      {
                        id: "Active Member",
                        title: t("Active Member", "عضو نشط"),
                        desc: t("Participates in Youth Capital's activities, discussions, and votes. The standard membership tier for engaged youth.", "يشارك في أنشطة شباب العاصمة، والمناقشات، والتصويت. مستوى العضوية الأساسي للشباب المتفاعل.")
                      },
                      {
                        id: "Executive Bureau Member",
                        title: t("Executive Bureau Member", "عضو المكتب التنفيذي"),
                        desc: t("Part of the executive board; involved in strategic decisions and internal governance of the organization.", "جزء من المكتب التنفيذي؛ يشارك في القرارات الاستراتيجية والحوكمة الداخلية للمنظمة.")
                      },
                      {
                        id: "Ambassador Member",
                        title: t("Ambassador Member", "عضو سفير"),
                        desc: t("Represents Youth Capital on specific missions or projects, without a permanent governance role.", "يمثل شباب العاصمة في مهام أو مشاريع محددة، دون دور دائم في الحوكمة.")
                      }
                    ].map((role) => {
                      const isSelected = form.watch("preferredRole") === role.id;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => form.setValue("preferredRole", role.id, { shouldValidate: true })}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? "border-gold bg-gold/5 shadow-md shadow-gold/10" 
                              : "border-border bg-card hover:border-gold/30 hover:bg-gold/5"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-bold ${isSelected ? "text-gold" : "text-foreground"}`}>{role.title}</h4>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-gold" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  {form.formState.errors.preferredRole && (
                    <p className="text-sm text-destructive font-medium">{form.formState.errors.preferredRole.message}</p>
                  )}

                  <div className="flex gap-4 mt-8">
                    <Button type="button" variant="outline" onClick={() => setStep(3)} className="w-full">{t("Back", "رجوع")}</Button>
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

