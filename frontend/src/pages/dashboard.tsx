import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, Badge, Button, CountUp, Reveal } from "@/components/ui-custom";
import { useGetCrises, useGetPolls } from "@workspace/api-client-react";
import { AlertTriangle, Vote, MessageSquare, Calendar, User as UserIcon, ShieldCheck, Activity } from "lucide-react";
import { Link, Redirect } from "wouter";
import { motion } from "framer-motion";
import { useSeo } from "@/hooks/use-seo";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, isAr } = useLanguage();
  useSeo({
    title: t("Dashboard | Youth Capital", "لوحة التحكم | يوث كابيتال"),
    description: t("Your Youth Capital simulation dashboard.", "لوحة محاكاة يوث كابيتال الخاصة بك."),
    path: "/dashboard",
    noindex: true,
  });
  const { data: crisesData } = useGetCrises({ query: { enabled: !isLoading && isAuthenticated } } as any);
  const { data: pollsData } = useGetPolls({ query: { enabled: !isLoading && isAuthenticated } } as any);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gold/20 border-t-gold" />
        <p className="text-muted-foreground font-bold animate-pulse text-sm uppercase tracking-widest">
          {t("Opening Command Center...", "جاري فتح مركز القيادة...")}
        </p>
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/login" />;

  const activeCrises = crisesData?.crises.filter(c => c.isActive) || [];
  const activePolls = pollsData?.polls.filter(p => p.status === "active") || [];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Command Banner */}
      <div className="relative bg-navy-dark overflow-hidden px-4 pt-14 pb-24">
        <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-primary/25 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] bg-gold/10 blur-[110px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-gold-pale text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              {t("Simulation Command Center", "مركز قيادة المحاكاة")}
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2">
              {t("Welcome, ", "مرحباً، ")}
              <span className="text-gradient-gold">{isAr && user?.fullNameAr ? user.fullNameAr : user?.fullName}</span>
            </h1>
            <p className="text-white/50 text-lg">
              {t("Your nation awaits your next move.", "أمتك تنتظر خطوتك التالية.")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-gold/25 backdrop-blur-md text-sm font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-gold" />
              {user?.applicationStatus?.toUpperCase()}
            </span>
            {user?.simulationRole && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/15 border border-gold/30 backdrop-blur-md text-sm font-black text-gold uppercase tracking-wide">
                {user.simulationRole}
              </span>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 space-y-10">
        {/* Live Stats Strip */}
        <Reveal>
          <div className="glass-panel rounded-[2rem] p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-display font-black text-foreground"><CountUp value={activePolls.length} /></div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{t("Open Votes", "تصويتات مفتوحة")}</div>
            </div>
            <div className="md:border-s md:border-border/50">
              <div className={`text-3xl font-display font-black ${activeCrises.length > 0 ? "text-destructive" : "text-foreground"}`}>
                <CountUp value={activeCrises.length} />
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{t("Live Crises", "أزمات نشطة")}</div>
            </div>
            <div className="col-span-2 md:col-span-1 md:border-s md:border-border/50 flex flex-col items-center justify-center">
              <Activity className="w-6 h-6 text-gold mb-1" />
              <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">{t("Simulation Active", "المحاكاة نشطة")}</div>
            </div>
          </div>
        </Reveal>

        {/* Active Crises Alert */}
        {activeCrises.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 text-destructive">
              <span className="p-2 rounded-2xl bg-destructive/10"><AlertTriangle className="w-6 h-6" /></span>
              {t("Active Crises", "الأزمات النشطة")}
            </h2>
            {activeCrises.map((crisis, idx) => (
              <Reveal key={crisis.id} delay={idx * 0.08}>
                <Card className="border-s-4 border-s-destructive bg-destructive/5 p-6 md:p-8 rounded-[2rem] hover:shadow-xl hover:shadow-destructive/10 transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                      <Badge variant="destructive" className="mb-3 animate-pulse">{crisis.severity.toUpperCase()}</Badge>
                      <h3 className="text-xl md:text-2xl font-display font-black mb-2">{isAr ? crisis.titleAr : crisis.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{isAr ? crisis.descriptionAr : crisis.description}</p>
                    </div>
                    <Link href="/community">
                      <Button variant="danger" size="sm" className="shrink-0">{t("Discuss Strategy", "ناقش الاستراتيجية")}</Button>
                    </Link>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
              {t("Active", "التصويتات")} <span className="text-gradient-gold">{t("Polls", "النشطة")}</span>
            </h2>
            {activePolls.length > 0 ? (
              <div className="grid gap-5">
                {activePolls.map((poll, idx) => (
                  <Reveal key={poll.id} delay={idx * 0.06}>
                    <Card className="p-6 md:p-8 rounded-[2rem] border-border/50 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300 group">
                      <div className="flex justify-between items-center mb-4 gap-4">
                        <h3 className="text-lg md:text-xl font-display font-bold group-hover:text-gold transition-colors">{isAr ? poll.titleAr : poll.title}</h3>
                        <Badge variant="gold" className="shrink-0">{t("Active", "نشط")}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{poll.description}</p>
                      <Link href={`/polls/${poll.id}`}>
                        <Button variant="outline" className="w-full gap-2 group-hover:border-gold group-hover:text-gold transition-colors">
                          <Vote className="w-4 h-4" /> {t("Cast Your Vote", "أدل بصوتك")}
                        </Button>
                      </Link>
                    </Card>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Card className="p-10 text-center text-muted-foreground border-dashed rounded-[2rem]">
                {t("No active polls at the moment.", "لا توجد تصويتات نشطة حالياً.")}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">{t("Quick Actions", "إجراءات سريعة")}</h2>
            {[
              { href: "/community", icon: MessageSquare, title: t("Parliament Forum", "منتدى البرلمان"), desc: t("Join the latest policy debates", "انضم لأحدث مناقشات السياسات") },
              { href: "/events", icon: Calendar, title: t("Upcoming Sessions", "الجلسات القادمة"), desc: t("View schedule and join live", "شاهد الجدول وانضم للبث") },
              { href: "/profile", icon: UserIcon, title: t("Civic Identity", "الهوية المدنية"), desc: t("Manage Profile & Media", "إدارة الملف الشخصي والوسائط") },
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <Reveal key={action.href} delay={idx * 0.08}>
                  <Link href={action.href} className="block">
                    <Card className="p-6 rounded-[1.75rem] border-border/50 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:bg-gold/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg mb-1 group-hover:text-gold transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.desc}</p>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
