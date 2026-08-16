import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@/hooks/use-seo";
import { Link } from "wouter";
import { 
  Users, 
  Globe, 
  Award, 
  Landmark, 
  Target, 
  Sparkles, 
  ChevronRight, 
  X, 
  ShieldCheck,
  Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero, Reveal, TiltCard, CountUp, Button } from "@/components/ui-custom";
import team from "@/data/team.json";

function TeamAvatar({ member, className = "w-16 h-16 text-2xl" }: { member: any; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = member.nameEn.charAt(0);

  // Determine border gradient class based on tier
  const borderGradient = member.tier === "executive" 
    ? "from-gold via-amber-500 to-yellow-600" 
    : member.tier === "admin" 
    ? "from-blue-500 to-indigo-600" 
    : member.tier === "ops" 
    ? "from-teal-500 to-emerald-600" 
    : "from-purple-500 to-fuchsia-600";

  // Determine text color class for initials
  const textClass = member.tier === "executive"
    ? "text-gold"
    : member.tier === "admin"
    ? "text-blue-500 dark:text-blue-400"
    : member.tier === "ops"
    ? "text-teal-600 dark:text-teal-300"
    : "text-purple-600 dark:text-purple-300";

  return (
    <div className={`rounded-full bg-gradient-to-tr ${borderGradient} p-0.5 shadow-md shrink-0`}>
      <div className={`rounded-full bg-background flex items-center justify-center font-display font-black overflow-hidden ${className}`}>
        {!hasError && member.picture ? (
          <img 
            src={member.picture} 
            alt={member.nameEn} 
            className="w-full h-full object-cover animate-in fade-in duration-300" 
            onError={() => setHasError(true)} 
          />
        ) : (
          <span className={`${textClass} shrink-0`}>{initials}</span>
        )}
      </div>
    </div>
  );
}

export default function About() {
  const { t, isAr } = useLanguage();
  useSeo({
    title: t(
      "About Youth Capital | Morocco's Youth Governance Simulation",
      "عن يوث كابيتال | محاكاة الحوكمة للشباب المغربي"
    ),
    description: t(
      "Learn how Youth Capital simulates the Moroccan Parliament, Ministries, and Regional Councils to give young Moroccans hands-on civic and leadership experience.",
      "تعرف على كيفية محاكاة يوث كابيتال للبرلمان المغربي والوزارات والمجالس الجهوية لمنح الشباب المغربي تجربة مدنية وقيادية عملية."
    ),
    path: "/about",
  });
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const pillars = [
    {
      icon: Landmark,
      en: "Simulate Real Government",
      ar: "محاكاة الحكومة الحقيقية",
      descEn: "Experience the full structure of the Moroccan state : Parliament, Ministries, Regional Councils : from the inside.",
      descAr: "اختبر الهيكل الكامل للدولة المغربية : البرلمان، الوزارات، المجالس الجهوية : من الداخل.",
    },
    {
      icon: Users,
      en: "Build Leadership Skills",
      ar: "بناء مهارات القيادة",
      descEn: "Develop negotiation, public speaking, coalition-building, and policy drafting in a risk-free simulation environment.",
      descAr: "طوّر مهارات التفاوض والخطابة وبناء التحالفات وصياغة السياسات في بيئة محاكاة آمنة.",
    },
    {
      icon: Globe,
      en: "Connect Across Borders",
      ar: "التواصل عبر الحدود",
      descEn: "Join Moroccan youth from every region, the diaspora, and across the African and Arab world in one shared civic space.",
      descAr: "انضم إلى شباب مغربي من كل جهة والمهجر وعبر أفريقيا والعالم العربي في فضاء مدني مشترك.",
    },
    {
      icon: Award,
      en: "Earn Recognition",
      ar: "نيل الاعتراف",
      descEn: "Outstanding participants are recognized by mentors, featured in our Press section, and given leadership opportunities.",
      descAr: "يحظى المشاركون المتميزون باعتراف من المرشدين وإبراز في قسم الأخبار ومنحهم فرص قيادية.",
    },
  ];

  const stats = [
    { value: "22", labelEn: "Simulated Ministries", labelAr: "وزارة محاكاة" },
    { value: "2", labelEn: "Parliamentary Houses", labelAr: "غرفة برلمانية" },
    { value: "12", labelEn: "Regions Represented", labelAr: "جهة ممثَّلة" },
    { value: "3", labelEn: "Languages Supported", labelAr: "لغات مدعومة" },
  ];

  const roots = [
    { labelEn: "Civic Awareness", labelAr: "الوعي المدني" },
    { labelEn: "Moroccan Identity", labelAr: "الهوية المغربية" },
    { labelEn: "Democratic Practice", labelAr: "الممارسة الديمقراطية" },
    { labelEn: "Youth Empowerment", labelAr: "تمكين الشباب" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      <PageHero
        eyebrow={t("Our Mission", "مهمتنا")}
        title={t("Shaping Tomorrow's", "تشكيل قادة")}
        highlight={t("Leaders Today", "الغد اليوم")}
        subtitle={t(
          "Youth Capital is Morocco's first digital civic governance simulation platform : built to give ambitious young people an authentic experience of how government works.",
          "Youth Capital هي أول منصة مغربية لمحاكاة الحوكمة المدنية الرقمية : بُنيت لمنح الشباب الطموح تجربة حقيقية لكيفية عمل الحكومة."
        )}
      />

      {/* Stats Bar */}
      <section className="px-4 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto glass-panel rounded-[2.5rem] py-10 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`cursor-default ${i > 0 ? "md:border-s md:border-border/50" : ""}`}
            >
              <div className="text-4xl md:text-5xl font-display font-black text-gradient-gold mb-2">
                <CountUp value={s.value} />
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest">{t(s.labelEn, s.labelAr)}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-black text-foreground mb-4">
              {t("What We", "ما")} <span className="text-gradient-gold">{t("Offer", "نقدمه")}</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              {t(
                "Four core pillars define the Youth Capital experience.",
                "أربعة محاور أساسية تحدد تجربة Youth Capital."
              )}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <TiltCard className="group h-full flex gap-5 p-7 rounded-3xl border border-border/50 bg-card hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 transition-[border-color,box-shadow] duration-300">
                  <div className="relative z-10 flex gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <p.icon className="w-7 h-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-gold transition-colors duration-300">{t(p.en, p.ar)}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t(p.descEn, p.descAr)}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-4 bg-ice-blue/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal direction="right">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
                <Target className="w-3.5 h-3.5" />
                {t("Our Story", "قصتنا")}
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-6">
                {t("Born from a", "وُلد من")} <span className="text-gradient-gold">{t("Belief", "إيمان")}</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t(
                  "Youth Capital was born from a simple belief: that young Moroccans have the intelligence, passion, and drive to lead : they just need the right stage to practice.",
                  "وُلد Youth Capital من إيمان بسيط: أن الشباب المغربي يمتلك الذكاء والشغف والطموح للقيادة : وكل ما يحتاجونه هو المنصة الصحيحة للتدرب."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t(
                  "We replicate the institutions of the Kingdom of Morocco : its Parliament, Ministries, and Regional Councils : in a digital environment where youth can debate real policies, vote on simulated legislation, and manage crisis scenarios.",
                  "نحن نستنسخ مؤسسات المملكة المغربية : برلمانها ووزاراتها ومجالسها جهوية : في بيئة رقمية حيث يمكن للشباب مناقشة السياسات الحقيقية والتصويت على التشريعات المحاكاة وإدارة سيناريوهات الأزمات."
                )}
              </p>
              <Link href="/apply">
                <Button variant="gold" size="lg" className="rounded-2xl px-8 group">
                  {t("Join the Simulation", "انضم للمحاكاة")}
                  <ChevronRight className={`w-4 h-4 ms-1 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </Button>
              </Link>
            </Reveal>
            <Reveal direction="left">
              <div className="relative rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl shadow-navy/10 group">
                <img
                  src="/images/parliament.webp"
                  alt="Parliament simulation"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 start-5 px-4 py-2 rounded-2xl glass-panel">
                  <span className="text-[10px] font-black text-gold uppercase tracking-widest block">
                    {t("Est. 2025", "تأسست 2025")}
                  </span>
                  <span className="text-sm font-display font-bold text-white">
                    {t("Kingdom of Morocco Simulation", "محاكاة المملكة المغربية")}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Team - Organic Tree Diagram with leaves, roots & pixel-perfect CSS alignments */}
      <section className="py-28 px-4 bg-background relative overflow-visible">
        
        {/* Glow ambient background effects and floating elements wrapped to clip horizontal overflow while maintaining scroll sticky */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow ambient background effects */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 dark:bg-gold/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />

          {/* High-tech matrix line details */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

          {/* Floating background leaves */}
          <div className="absolute top-1/3 left-10 text-emerald-500/10 dark:text-emerald-500/5 rotate-12 animate-bounce" style={{ animationDuration: "6s" }}>
            <LeafIcon className="w-20 h-20" />
          </div>
          <div className="absolute bottom-1/3 right-10 text-emerald-500/10 dark:text-emerald-500/5 -rotate-45 animate-bounce" style={{ animationDuration: "8s" }}>
            <LeafIcon className="w-24 h-24" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-full text-xs font-semibold tracking-wider text-primary dark:text-gold-pale mb-4"
            >
              <LeafIcon className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: "10s" }} />
              {t("INTERACTIVE ARBRE NETWORK", "الشجرة التنظيمية التفاعلية")}
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">
              {t("The Platform's Arbre", "شجرة الهيكل التنظيمي للمنصة")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-4 text-sm font-medium">
              {t(
                "Click on any node to view their profile details and discover their responsibilities.",
                "اضغط على أي عقدة لعرض تفاصيل الملف الشخصي واكتشاف مسؤولياتهم."
              )}
            </p>
            {/* Mobile tap hint */}
            <div className="lg:hidden flex items-center justify-center gap-2 text-xs text-amber-500/80 font-bold mt-4 animate-pulse">
              <span>{isAr ? "اضغط على أي عضو لعرض التفاصيل الكاملة" : "Tap on any member to view details"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative min-h-[500px]">
            
            {/* Left/Center: Organic Tree Graph (Spans 8 cols) */}
            <div className="lg:col-span-8 w-full relative h-auto overflow-visible flex flex-col items-center">
              
              {/* Tree Nodes Layout with responsive grid columns */}
              <div className="w-full relative z-10 flex flex-col items-center py-4">
                
                {/* APEX LEVEL: President (The Crown of the Tree) */}
                <div className="flex flex-col items-center w-full">
                  {team.filter(m => m.roleEn === "President").map((m) => (
                    <div key={m.nameEn} className="relative flex flex-col items-center group">
                      
                      {/* Leaf Crown Highlights above President */}
                      <div className="absolute -top-7 text-emerald-500/80 flex gap-4 animate-pulse">
                        <LeafIcon className="w-5 h-5 -rotate-45" />
                        <LeafIcon className="w-5 h-5 rotate-45" />
                      </div>

                      <motion.div 
                        whileHover={{ scale: 1.06, y: -4 }}
                        onClick={() => setSelectedMember(m)}
                        className="relative flex flex-col items-center bg-card border-2 border-gold rounded-2xl px-5 py-4 cursor-pointer shadow-xl transition-all duration-300 w-56 text-foreground z-10"
                        style={{ boxShadow: `0 0 20px ${m.glowColor}` }}
                      >
                        <div className="absolute top-0 right-0 -mt-2.5 -mr-2 bg-gold text-navy-dark text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                          {t("PRESIDENT", "الرئيس")}
                        </div>
                        {/* Avatar container */}
                        <TeamAvatar member={m} className="w-14 h-14 text-xl" />
                        <h4 className="font-display font-black text-base mt-2.5">{t(m.nameEn, m.nameAr)}</h4>
                        <p className="text-[9px] font-black tracking-widest text-gold uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                      </motion.div>

                      {/* Branch Trunk Downwards (Perfectly aligned center CSS line) */}
                      <div className="w-0.5 h-12 bg-gradient-to-b from-gold to-border hidden lg:block" />
                    </div>
                  ))}
                </div>

                {/* EXECUTIVE LEVEL 2: VPs (Split branches) */}
                <div className="w-full flex flex-col items-center">
                  {/* Left & Right branches horizontal bridge */}
                  <div className="w-1/2 h-0.5 bg-border relative hidden lg:block">
                    <div className="absolute left-0 w-0.5 h-6 bg-border" />
                    <div className="absolute right-0 w-0.5 h-6 bg-border" />
                  </div>
                  
                  {/* VP Nodes */}
                  <div className="grid grid-cols-2 w-full max-w-[340px] md:max-w-none md:w-4/5 justify-items-center pt-6 pb-8 gap-4">
                    {team.filter(m => m.tier === "executive" && m.roleEn !== "President").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center w-full relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-gold/25 rounded-2xl px-4 py-3.5 cursor-pointer shadow-md transition-all duration-300 w-40 text-foreground z-10"
                          style={{ boxShadow: `0 0 12px ${m.glowColor}` }}
                        >
                          {/* Small Leaf icon attached to the VP pod */}
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500">
                            <LeafIcon className="w-4 h-4 rotate-12" />
                          </div>

                          <TeamAvatar member={m} className="w-12 h-12 text-lg" />
                          <h4 className="font-display font-bold text-sm mt-2.5">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[8px] font-bold tracking-widest text-gold uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>

                        {/* Connection downward line */}
                        <div className="w-0.5 h-8 bg-border hidden lg:block" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Central Admin Hub */}
                  <div className="w-1/2 h-0.5 bg-border relative -mt-8 hidden lg:block">
                    {/* Centered pipeline going down */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border" />
                  </div>
                </div>

                {/* TIER 3: Admin & Finance (Branching to 4 nodes) */}
                <div className="w-full pt-8 flex flex-col items-center">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest rounded-full dark:text-blue-400 mb-6 z-10">
                    {t("ADMINISTRATION & FINANCE", "الإدارة والمالية")}
                  </span>

                  {/* Horizontal Bridge for 4 columns */}
                  <div className="w-full h-0.5 bg-border relative hidden lg:block">
                    <div className="absolute left-[12.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[37.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[62.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[87.5%] w-0.5 h-6 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 w-full justify-items-center gap-4 lg:gap-6 pt-6 pb-8">
                    {team.filter(m => m.tier === "admin").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-blue-500/20 rounded-2xl p-3 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-32 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500">
                            <LeafIcon className="w-3.5 h-3.5 -rotate-12" />
                          </div>

                          <TeamAvatar member={m} className="w-10 h-10 text-base" />
                          <h4 className="font-bold text-xs mt-2">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[8px] font-medium tracking-tight text-blue-500 dark:text-blue-400 uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        <div className="w-0.5 h-8 bg-border hidden lg:block" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Operations */}
                  <div className="w-full h-0.5 bg-border relative -mt-8 hidden lg:block">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border" />
                  </div>
                </div>

                {/* TIER 4: Operations & Departments (Branching to 4 nodes) */}
                <div className="w-full pt-8 flex flex-col items-center">
                  <span className="px-3 py-1 bg-teal-500/10 text-teal-600 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest rounded-full dark:text-teal-400 mb-6 z-10">
                    {t("OPERATIONS & PROJECTS", "العمليات والمشاريع")}
                  </span>

                  {/* Horizontal Bridge for 4 columns */}
                  <div className="w-full h-0.5 bg-border relative hidden lg:block">
                    <div className="absolute left-[12.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[37.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[62.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[87.5%] w-0.5 h-6 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 w-full justify-items-center gap-4 lg:gap-6 pt-6 pb-8">
                    {team.filter(m => m.tier === "ops").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-teal-500/20 rounded-2xl p-2 md:p-4 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-20 md:w-32 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500/70">
                            <LeafIcon className="w-2.5 h-2.5 rotate-45" />
                          </div>

                          <TeamAvatar member={m} className="w-7 h-7 text-xs md:w-11 md:h-11 md:text-sm" />
                          <h4 className="font-semibold text-[9px] md:text-xs mt-2 md:mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[7px] md:text-[8px] font-medium text-teal-600 dark:text-teal-300 uppercase tracking-tighter mt-1 text-center leading-none">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        <div className="w-0.5 h-6 bg-border hidden lg:block" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Advisors */}
                  <div className="w-full h-0.5 bg-border relative -mt-6 hidden lg:block">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-border" />
                  </div>
                </div>

                {/* TIER 5: General Advisors */}
                <div className="w-full pt-6 flex flex-col items-center">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest rounded-full dark:text-purple-400 mb-4 z-10">
                    {t("GENERAL ADVISORS", "المستشارون العامون")}
                  </span>

                  {/* Horizontal Bridge for 4 columns */}
                  <div className="w-full h-0.5 bg-border relative hidden lg:block">
                    <div className="absolute left-[12.5%] w-0.5 h-4 bg-border" />
                    <div className="absolute left-[37.5%] w-0.5 h-4 bg-border" />
                    <div className="absolute left-[62.5%] w-0.5 h-4 bg-border" />
                    <div className="absolute left-[87.5%] w-0.5 h-4 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 w-full justify-items-center gap-4 lg:gap-6 pt-4 pb-6">
                    {team.filter(m => m.tier === "advisors").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-purple-500/20 rounded-2xl p-3 md:p-4 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-28 md:w-36 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500/70">
                            <LeafIcon className="w-3.5 h-3.5 -rotate-45" />
                          </div>

                          <TeamAvatar member={m} className="w-8 h-8 text-xs md:w-10 md:h-10 md:text-xs" />
                          <h4 className="font-semibold text-[10px] md:text-xs mt-2 md:mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[7px] md:text-[8px] font-medium text-purple-600 dark:text-purple-300 uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        {/* Final trunk segment leading to the roots */}
                        <div className="w-0.5 h-10 bg-gradient-to-b from-border to-emerald-500/40 hidden lg:block" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* THE RACINE (The Roots of the Tree) */}
                <div className="w-full flex flex-col items-center -mt-8 pt-8">
                  {/* Roots visual merging hub */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent relative mb-8 hidden lg:block">
                    
                    {/* Roots organic lines branching into the ground */}
                    <div className="absolute left-[20%] w-0.5 h-8 bg-gradient-to-b from-emerald-500/30 to-emerald-500/10 skew-x-12" />
                    <div className="absolute left-[40%] w-0.5 h-8 bg-gradient-to-b from-emerald-500/40 to-emerald-500/15 -skew-x-6" />
                    <div className="absolute left-[60%] w-0.5 h-8 bg-gradient-to-b from-emerald-500/40 to-emerald-500/15 skew-x-6" />
                    <div className="absolute left-[80%] w-0.5 h-8 bg-gradient-to-b from-emerald-500/30 to-emerald-500/10 -skew-x-12" />
                  </div>

                  <div className="text-center mb-6">
                    <span className="px-3 py-1 bg-emerald-555/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest rounded-full">
                      {t("FOUNDATIONAL ROOTS (RACINE)", "الجذور التأسيسية")}
                    </span>
                  </div>

                  {/* Roots Foundation Pills */}
                  <div className="flex flex-wrap justify-center gap-3 max-w-2xl px-4">
                    {roots.map((r, i) => (
                      <div 
                        key={i} 
                        className="bg-card hover:bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shadow-sm transition-all duration-300 cursor-default"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {t(r.labelEn, r.labelAr)}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Dynamic Profile details panel (Spans 4 cols) */}
            <div className="hidden lg:block lg:col-span-4 text-foreground relative self-stretch">
              <AnimatePresence mode="wait">
                {selectedMember ? (
                  <motion.div 
                    key={selectedMember.nameEn}
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-card border border-border/80 dark:border-white/10 rounded-3xl p-6 relative shadow-2xl text-foreground sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"
                    style={{ borderTopColor: selectedMember.accent.includes("amber") ? "#C9A84C" : selectedMember.accent.includes("blue") ? "#3B82F6" : selectedMember.accent.includes("teal") ? "#10B981" : "#A855F7" }}
                  >
                    {/* Glow highlight inside */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                    
                    {/* Close button */}
                    <button 
                      onClick={() => setSelectedMember(null)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full bg-secondary/20 hover:bg-secondary/40"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Meta info details */}
                    <div className="flex flex-col items-center text-center mt-4">
                      {/* Stylized Big Avatar Frame */}
                      <div className="mb-4">
                        <TeamAvatar member={selectedMember} className="w-24 h-24 text-3xl" />
                      </div>
                      
                      <h3 className="text-2xl font-display font-black">{t(selectedMember.nameEn, selectedMember.nameAr)}</h3>
                      <span className="text-xs font-bold text-gold uppercase tracking-widest mt-1 px-3 py-1 rounded-full bg-gold/15 border border-gold/10">
                        {t(selectedMember.roleEn, selectedMember.roleAr)}
                      </span>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">
                        {t(selectedMember.tier.toUpperCase(), selectedMember.tier.toUpperCase())}
                      </p>
                    </div>

                    <hr className="border-border my-6" />

                    <div className="space-y-6">
                      {/* Biography */}
                      <div>
                        <h5 className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-2">
                          {t("Biography", "السيرة الذاتية")}
                        </h5>
                        <p className="text-sm text-muted-foreground leading-relaxed text-start md:text-justify">
                          {t(selectedMember.descEn, selectedMember.descAr)}
                        </p>
                      </div>

                      {/* Missions / Key duties */}
                      <div>
                        <h5 className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-3">
                          {t("Key Responsibilities", "المسؤوليات الرئيسية")}
                        </h5>
                        <div className="space-y-2">
                          {(isAr ? selectedMember.missionsAr : selectedMember.missionsEn).map((mission: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                              <span>{mission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-card/20 sticky top-24 min-h-[400px]"
                  >
                    <Workflow className="w-12 h-12 text-muted-foreground/30 mb-4 animate-pulse" />
                    <h4 className="font-display font-bold text-foreground/80 mb-2">{t("Select a Node", "اختر عضوًا")}</h4>
                    <p className="text-xs max-w-xs leading-relaxed">
                      {t("Click on any member in the network tree to view their responsibilities and complete details.", "اضغط على أي عضو في شجرة الشبكة لعرض مسؤولياته وتفاصيله الكاملة.")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Mobile Profile Bottom Sheet Modal */}
          <AnimatePresence>
            {selectedMember && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-end lg:hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="bg-card border-t border-border w-full max-h-[85vh] rounded-t-3xl p-6 pb-16 relative shadow-2xl text-foreground overflow-y-auto"
                  style={{ borderTopColor: selectedMember.accent.includes("amber") ? "#C9A84C" : selectedMember.accent.includes("blue") ? "#3B82F6" : selectedMember.accent.includes("teal") ? "#10B981" : "#A855F7" }}
                >
                  {/* Close handler drag bar */}
                  <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-6 cursor-pointer" onClick={() => setSelectedMember(null)} />
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full bg-secondary/20 hover:bg-secondary/40"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Meta info details */}
                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="mb-4">
                      <TeamAvatar member={selectedMember} className="w-24 h-24 text-3xl" />
                    </div>
                    
                    <h3 className="text-2xl font-display font-black">{t(selectedMember.nameEn, selectedMember.nameAr)}</h3>
                    <span className="text-xs font-bold text-gold uppercase tracking-widest mt-1 px-3 py-1 rounded-full bg-gold/15 border border-gold/10">
                      {t(selectedMember.roleEn, selectedMember.roleAr)}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">
                      {t(selectedMember.tier.toUpperCase(), selectedMember.tier.toUpperCase())}
                    </p>
                  </div>

                  <hr className="border-border my-6" />

                  <div className="space-y-6">
                    {/* Biography */}
                    <div>
                      <h5 className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-2">
                        {t("Biography", "السيرة الذاتية")}
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed text-start">
                        {t(selectedMember.descEn, selectedMember.descAr)}
                      </p>
                    </div>

                    {/* Missions / Key duties */}
                    <div>
                      <h5 className="text-xs font-black tracking-widest text-muted-foreground uppercase mb-3">
                        {t("Key Responsibilities", "المسؤوليات الرئيسية")}
                      </h5>
                      <div className="space-y-2 mb-6">
                        {(isAr ? selectedMember.missionsAr : selectedMember.missionsEn).map((mission: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                            <span>{mission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-4 bg-navy-dark text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10">
          <Reveal>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-6">
              {t("Ready to", "مستعد")} <span className="text-gradient-gold">{t("Lead?", "للقيادة؟")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-white/60 mb-10 text-lg leading-relaxed">
              {t("Apply for your simulation role and start shaping policy today.", "تقدّم لدورك في المحاكاة وابدأ صياغة السياسات اليوم.")}
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link href="/apply">
              <Button variant="gold" size="lg" className="rounded-2xl px-12 h-16 text-lg shadow-2xl shadow-gold/25 animate-pulse-glow">
                {t("Apply Now", "قدّم طلبك الآن")}
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

// Simple Leaf SVG helper
function LeafIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M17 2a5 5 0 0 1 5 5v1a10 10 0 0 1-10 10c0-1.264-.42-2.43-1.127-3.376L16.2 9.3a1 1 0 1 0-1.4-1.4l-5.326 5.327C8.53 12.52 8.006 12 7.5 12A8.5 8.5 0 0 0 2 19.5c0-4.694 3.806-8.5 8.5-8.5.506 0 1.03.52 1.974 1.474l5.326-5.327a1 1 0 0 0-1.4-1.4l-5.326 5.327C12.13 10.127 10.963 10 9.7 10A10 10 0 0 1 19.7 0H20a2 2 0 0 1-3 2Z"/>
    </svg>
  );
}
