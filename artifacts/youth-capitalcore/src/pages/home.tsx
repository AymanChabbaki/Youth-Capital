import { useLanguage } from "@/hooks/use-language";
import { Button, Card } from "@/components/ui-custom";
import { Link } from "wouter";
import { useGetPlatformStats } from "@workspace/api-client-react";
import { Users, FileText, Landmark, ShieldAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { t, isAr } = useLanguage();
  const { data: stats } = useGetPlatformStats();

  const heroStyle = {
    backgroundImage: `linear-gradient(to right, rgba(13, 24, 40, 0.9), rgba(27, 42, 74, 0.8)), url('${import.meta.env.BASE_URL}images/hero-bg.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 overflow-hidden" style={heroStyle}>
        <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 text-gold-pale text-sm font-semibold uppercase tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            {t("Simulation Season 2 is Live", "الموسم الثاني من المحاكاة متاح الآن")}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight max-w-4xl text-balance"
          >
            {t("Experience the Future of ", "عش مستقبل ")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-pale">
              {t("Civic Leadership", "القيادة المدنية")}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl mb-10"
          >
            {t(
              "Join the ultimate digital governance simulation for Moroccan youth. Debate policy, pass legislation, and manage crises in real-time.",
              "انضم إلى منصة محاكاة الحوكمة الرقمية للشباب المغربي. ناقش السياسات، مرر القوانين، وأدر الأزمات في الوقت الفعلي."
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/apply">
              <Button variant="gold" size="lg" className="w-full sm:w-auto text-lg px-12 group">
                {t("Apply Now", "قدّم طلبك الآن")}
                <ArrowRight className={`ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-lg px-8">
                {t("How it Works", "كيف تعمل المنصة")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="relative -mt-16 z-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="glass-panel p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="flex flex-col items-center">
              <Landmark className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.activeMinistries || 12}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Active Ministries", "الوزارات النشطة")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.billsPassed || 156}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Bills Passed", "مشاريع القوانين")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-primary mb-3" />
              <div className="text-3xl font-display font-bold text-foreground mb-1">
                {stats?.activeMembers || "1,204"}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {t("Active Members", "الأعضاء النشطين")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ShieldAlert className="w-8 h-8 text-destructive mb-3" />
              <div className="text-3xl font-display font-bold text-destructive mb-1">
                {stats?.activeCrises || 2}
              </div>
              <div className="text-sm text-destructive/80 font-medium uppercase tracking-wide">
                {t("Active Crises", "الأزمات النشطة")}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* About Features */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("What We Simulate", "ماذا نحاكي")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t("Immerse yourself in a fully functional replica of the Moroccan governance system.", "انغمس في نسخة تفاعلية كاملة من نظام الحوكمة المغربي.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t("Parliamentary Debates", "النقاشات البرلمانية"),
                desc: t("Draft, debate, and vote on legislation mirroring real-world issues.", "صياغة ومناقشة والتصويت على التشريعات التي تعكس قضايا العالم الحقيقي."),
                img: "parliament.png"
              },
              {
                title: t("Ministerial Portfolios", "الحقائب الوزارية"),
                desc: t("Take charge of a specific sector, manage budgets, and implement policies.", "تولى مسؤولية قطاع معين، أدر الميزانيات، ونفذ السياسات."),
                img: "hero-bg.png"
              },
              {
                title: t("Crisis Management", "إدارة الأزمات"),
                desc: t("Respond to unexpected national emergencies injected by the Game Masters.", "استجب لحالات الطوارئ الوطنية غير المتوقعة من قبل مديري المحاكاة."),
                img: "parliament.png"
              }
            ].map((feature, i) => (
              <Card key={i} className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none bg-secondary/50">
                <div className="h-48 overflow-hidden rounded-t-2xl relative">
                  <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={`${import.meta.env.BASE_URL}images/${feature.img}`} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2 font-display">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
