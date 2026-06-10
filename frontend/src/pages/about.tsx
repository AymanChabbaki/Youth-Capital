import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
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

      {/* Hero */}
      <section className="relative bg-navy-dark overflow-hidden py-28 px-4 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #C9A84C 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1B2A4A 0%, transparent 50%)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold border border-gold/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            {t("Our Mission", "مهمتنا")}
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {t("Shaping Tomorrow's", "تشكيل")}
            <span className="text-gold block">{t("Leaders Today", "قادة الغد اليوم")}</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t(
              "Youth CapitalCore is Morocco's first digital civic governance simulation platform : built to give ambitious young people an authentic experience of how government works.",
              "Youth CapitalCore هي أول منصة مغربية لمحاكاة الحوكمة المدنية الرقمية : بُنيت لمنح الشباب الطموح تجربة حقيقية لكيفية عمل الحكومة."
            )}
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-navy py-10 px-4 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-display font-bold text-gold mb-1">{s.value}</div>
              <div className="text-sm text-white/60">{t(s.labelEn, s.labelAr)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">
              {t("What We Offer", "ما نقدمه")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t(
                "Four core pillars define the Youth CapitalCore experience.",
                "أربعة محاور أساسية تحدد تجربة Youth CapitalCore."
              )}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className="group flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <p.icon className="w-6 h-6 text-primary group-hover:text-gold transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{t(p.en, p.ar)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(p.descEn, p.descAr)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 px-4 bg-ice-blue/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-gold text-sm font-semibold mb-4">
                <Target className="w-4 h-4" />
                {t("Our Story", "قصتنا")}
              </div>
              <h2 className="text-3xl font-display font-bold text-primary mb-6">
                {t("Born from a Belief", "وُلد من إيمان")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t(
                  "Youth CapitalCore was born from a simple belief: that young Moroccans have the intelligence, passion, and drive to lead : they just need the right stage to practice.",
                  "وُلد Youth CapitalCore من إيمان بسيط: أن الشباب المغربي يمتلك الذكاء والشغف والطموح للقيادة : وكل ما يحتاجونه هو المنصة الصحيحة للتدرب."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t(
                  "We replicate the institutions of the Kingdom of Morocco : its Parliament, Ministries, and Regional Councils : in a digital environment where youth can debate real policies, vote on simulated legislation, and manage crisis scenarios.",
                  "نحن نستنسخ مؤسسات المملكة المغربية : برلمانها ووزاراتها ومجالسها جهوية : في بيئة رقمية حيث يمكن للشباب مناقشة السياسات الحقيقية والتصويت على التشريعات المحاكاة وإدارة سيناريوهات الأزمات."
                )}
              </p>
              <Link href="/apply">
                <button className="inline-flex items-center gap-2 bg-gold text-navy-dark font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
                  {t("Join the Simulation", "انضم للمحاكاة")} <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
              <img
                src="/images/parliament.png"
                alt="Parliament simulation"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team - Organic Tree Diagram with leaves, roots & pixel-perfect CSS alignments */}
      <section className="py-28 px-4 bg-background relative overflow-visible">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 dark:bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* High-tech matrix line details */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        {/* Floating background leaves */}
        <div className="absolute top-1/3 left-10 text-emerald-500/10 dark:text-emerald-500/5 rotate-12 pointer-events-none animate-bounce" style={{ animationDuration: "6s" }}>
          <LeafIcon className="w-20 h-20" />
        </div>
        <div className="absolute bottom-1/3 right-10 text-emerald-500/10 dark:text-emerald-500/5 -rotate-45 pointer-events-none animate-bounce" style={{ animationDuration: "8s" }}>
          <LeafIcon className="w-24 h-24" />
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative min-h-[700px]">
            
            {/* Left/Center: Organic Tree Graph (Spans 8 cols) */}
            <div className="lg:col-span-8 relative flex flex-col items-center">
              
              {/* Tree Nodes Layout with Pixel-Perfect CSS alignments */}
              <div className="w-full relative z-10 flex flex-col items-center">
                
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
                        className="relative flex flex-col items-center bg-card border-2 border-gold rounded-2xl px-6 py-4 cursor-pointer shadow-xl transition-all duration-300 w-64 text-foreground z-10"
                        style={{ boxShadow: `0 0 20px ${m.glowColor}` }}
                      >
                        <div className="absolute top-0 right-0 -mt-2.5 -mr-2 bg-gold text-navy-dark text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                          {t("PRESIDENT", "الرئيس")}
                        </div>
                        {/* Avatar container */}
                        <TeamAvatar member={m} className="w-16 h-16 text-2xl" />
                        <h4 className="font-display font-black text-lg mt-3">{t(m.nameEn, m.nameAr)}</h4>
                        <p className="text-[10px] font-black tracking-widest text-gold uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                      </motion.div>

                      {/* Branch Trunk Downwards (Perfectly aligned center CSS line) */}
                      <div className="w-0.5 h-12 bg-gradient-to-b from-gold to-border" />
                    </div>
                  ))}
                </div>

                {/* EXECUTIVE LEVEL 2: VPs (Split branches) */}
                <div className="w-full flex flex-col items-center">
                  {/* Left & Right branches horizontal bridge */}
                  <div className="w-1/2 md:w-3/5 h-0.5 bg-border relative">
                    <div className="absolute left-0 w-0.5 h-6 bg-border" />
                    <div className="absolute right-0 w-0.5 h-6 bg-border" />
                  </div>
                  
                  {/* VP Nodes */}
                  <div className="flex justify-between w-full md:w-4/5 pt-6 pb-8">
                    {team.filter(m => m.tier === "executive" && m.roleEn !== "President").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center w-1/2 relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-gold/25 rounded-2xl px-5 py-4 cursor-pointer shadow-md transition-all duration-300 w-48 text-foreground z-10"
                          style={{ boxShadow: `0 0 12px ${m.glowColor}` }}
                        >
                          {/* Small Leaf icon attached to the VP pod */}
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500">
                            <LeafIcon className="w-4 h-4 rotate-12" />
                          </div>

                          <TeamAvatar member={m} className="w-14 h-14 text-lg" />
                          <h4 className="font-display font-bold text-base mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[9px] font-bold tracking-widest text-gold uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>

                        {/* Connection downward line */}
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Central Admin Hub */}
                  <div className="w-1/2 md:w-3/5 h-0.5 bg-border relative -mt-8">
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
                  <div className="w-4/5 h-0.5 bg-border relative">
                    <div className="absolute left-[12.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[37.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[62.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[87.5%] w-0.5 h-6 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full pt-6 pb-8">
                    {team.filter(m => m.tier === "admin").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-blue-500/20 rounded-2xl p-4 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-40 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500">
                            <LeafIcon className="w-3.5 h-3.5 -rotate-12" />
                          </div>

                          <TeamAvatar member={m} className="w-12 h-12 text-base" />
                          <h4 className="font-bold text-sm mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[9px] font-medium tracking-tight text-blue-500 dark:text-blue-400 uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Operations */}
                  <div className="w-4/5 h-0.5 bg-border relative -mt-8">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border" />
                  </div>
                </div>

                {/* TIER 4: Operations & Departments (Branching to 5 nodes) */}
                <div className="w-full pt-8 flex flex-col items-center">
                  <span className="px-3 py-1 bg-teal-500/10 text-teal-600 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest rounded-full dark:text-teal-400 mb-6 z-10">
                    {t("OPERATIONS & PROJECTS", "العمليات والمشاريع")}
                  </span>

                  {/* Horizontal Bridge for 5 columns */}
                  <div className="w-[90%] h-0.5 bg-border relative">
                    <div className="absolute left-[10%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[30%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[50%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[70%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[90%] w-0.5 h-6 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full pt-6 pb-8">
                    {team.filter(m => m.tier === "ops").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-teal-500/20 rounded-2xl p-4 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-32 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500/70">
                            <LeafIcon className="w-3 h-3 rotate-45" />
                          </div>

                          <TeamAvatar member={m} className="w-11 h-11 text-sm" />
                          <h4 className="font-semibold text-xs mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[8px] font-medium text-teal-600 dark:text-teal-300 uppercase tracking-tighter mt-1 text-center leading-none">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Bridge to Advisors */}
                  <div className="w-[90%] h-0.5 bg-border relative -mt-8">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border" />
                  </div>
                </div>

                {/* TIER 5: General Advisors */}
                <div className="w-full pt-8 flex flex-col items-center">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest rounded-full dark:text-purple-400 mb-6 z-10">
                    {t("GENERAL ADVISORS", "المستشارون العامون")}
                  </span>

                  {/* Horizontal Bridge for 4 columns */}
                  <div className="w-4/5 h-0.5 bg-border relative">
                    <div className="absolute left-[12.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[37.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[62.5%] w-0.5 h-6 bg-border" />
                    <div className="absolute left-[87.5%] w-0.5 h-6 bg-border" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full pt-6 pb-8">
                    {team.filter(m => m.tier === "advisors").map((m) => (
                      <div key={m.nameEn} className="flex flex-col items-center relative">
                        <motion.div 
                          whileHover={{ scale: 1.05, y: -4 }}
                          onClick={() => setSelectedMember(m)}
                          className="relative flex flex-col items-center bg-card border border-purple-500/20 rounded-2xl p-4 cursor-pointer shadow-sm transition-all duration-300 text-foreground w-36 z-10"
                          style={{ boxShadow: `0 0 8px ${m.glowColor}` }}
                        >
                          <div className="absolute -top-1.5 -left-1.5 text-emerald-500/70">
                            <LeafIcon className="w-3.5 h-3.5 -rotate-45" />
                          </div>

                          <TeamAvatar member={m} className="w-10 h-10 text-xs" />
                          <h4 className="font-semibold text-xs mt-3">{t(m.nameEn, m.nameAr)}</h4>
                          <p className="text-[8px] font-medium text-purple-600 dark:text-purple-300 uppercase mt-0.5">{t(m.roleEn, m.roleAr)}</p>
                        </motion.div>
                        
                        {/* Final trunk segment leading to the roots */}
                        <div className="w-0.5 h-10 bg-gradient-to-b from-border to-emerald-500/40" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* THE RACINE (The Roots of the Tree) */}
                <div className="w-full flex flex-col items-center -mt-8 pt-8">
                  {/* Roots visual merging hub */}
                  <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent relative mb-8">
                    
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
            <div className="lg:col-span-4 text-foreground relative self-stretch">
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
                        <p className="text-sm text-muted-foreground leading-relaxed text-left md:text-justify">
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

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-navy-dark text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            {t("Ready to Lead?", "مستعد للقيادة؟")}
          </h2>
          <p className="text-white/70 mb-8">
            {t("Apply for your simulation role and start shaping policy today.", "تقدّم لدورك في المحاكاة وابدأ صياغة السياسات اليوم.")}
          </p>
          <Link href="/apply">
            <button className="bg-gold text-navy-dark font-bold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-gold/30">
              {t("Apply Now", "قدّم طلبك الآن")}
            </button>
          </Link>
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
