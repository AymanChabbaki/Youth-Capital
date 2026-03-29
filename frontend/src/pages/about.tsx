import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Users, Globe, Award, Landmark, Target, Sparkles, ChevronRight } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

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

  const team = [
    { nameEn: "Platform Founder", nameAr: "مؤسس المنصة", roleEn: "Vision & Strategy", roleAr: "الرؤية والاستراتيجية", initial: "F" },
    { nameEn: "Head of Simulations", nameAr: "رئيس المحاكاة", roleEn: "Game Design & Scenarios", roleAr: "تصميم المحاكاة والسيناريوهات", initial: "S" },
    { nameEn: "Community Manager", nameAr: "مدير المجتمع", roleEn: "Outreach & Engagement", roleAr: "التواصل والمشاركة", initial: "C" },
    { nameEn: "Tech Lead", nameAr: "قائد التقنية", roleEn: "Platform Development", roleAr: "تطوير المنصة", initial: "T" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative bg-navy-dark overflow-hidden py-28 px-4">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #C9A84C 0%, transparent 60%), radial-gradient(circle at 80% 20%, #1B2A4A 0%, transparent 50%)" }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
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
      <section className="bg-navy py-10 px-4">
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
                  "نحن نستنسخ مؤسسات المملكة المغربية : برلمانها ووزاراتها ومجالسها الجهوية : في بيئة رقمية حيث يمكن للشباب مناقشة السياسات الحقيقية والتصويت على التشريعات المحاكاة وإدارة سيناريوهات الأزمات."
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

      {/* Team */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-primary mb-3">{t("The Team Behind the Platform", "الفريق خلف المنصة")}</h2>
            <p className="text-muted-foreground">{t("Dedicated to empowering the next generation.", "ملتزمون بتمكين الجيل القادم.")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-display font-bold text-2xl">{m.initial}</span>
                </div>
                <div className="font-semibold text-foreground">{t(m.nameEn, m.nameAr)}</div>
                <div className="text-sm text-muted-foreground mt-1">{t(m.roleEn, m.roleAr)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-navy-dark text-center">
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
