import { useLanguage } from "@/hooks/use-language";
import { useGetPolls, Poll } from "@workspace/api-client-react";
import { Badge, PageHero, HeroStat, Reveal, PageSkeleton } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Info, ChevronDown, Scale, Pin, MessageSquareText } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useSeo } from "@/hooks/use-seo";

export default function Polls() {
  const { t, isAr } = useLanguage();
  useSeo({
    title: t("Civic Polls & Consultations | Youth Capital Morocco", "الاستطلاعات المدنية والاستشارات | يوث كابيتال"),
    description: t(
      "Vote on live civic consultations and legislative polls in Youth Capital's simulated Moroccan governance platform.",
      "صوّت في الاستشارات المدنية والاستطلاعات التشريعية المباشرة في منصة يوث كابيتال لمحاكاة الحوكمة المغربية."
    ),
    path: "/polls",
  });
  const { data, isLoading } = useGetPolls();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");

  if (isLoading) {
    return <PageSkeleton rows={3} />;
  }

  const polls = data?.polls || [];
  // +1: the Sahara consultation is always open and pinned to the agenda.
  const activePollsCount = polls.filter((p: Poll) => p.status === "active").length + 1;
  const shownPolls = polls.filter((p: Poll) => filter === "all" || (filter === "active" ? p.status === "active" : p.status !== "active"));
  const showSahara = filter !== "closed";
  const totalVotesAcrossAll = polls.reduce((sum: number, p: Poll) => sum + (p.totalVotes || 0), 0);

  const faqs = [
    {
      q: t("How are these votes used?", "كيف يتم استخدام هذه الأصوات؟"),
      a: t("Every vote is presented to the Simulation Cabinet. Results directly influence the 'Impact Score' of proposed digital reforms.", "يتم تقديم كل صوت إلى مجلس وزراء المحاكاة. تؤثر النتائج بشكل مباشر على 'درجة التأثير' للإصلاحات الرقمية المقترحة.")
    },
    {
      q: t("Can I change my vote?", "هل يمكنني تغيير تصويتي؟"),
      a: t("To ensure simulation integrity, once a vote is cast, it is recorded in the immutable digital ledger.", "لضمان نزاهة المحاكاة، بمجرد تسجيل الصوت، يتم تدوينه في السجل الرقمي غير القابل للتغيير.")
    },
    {
      q: t("Who can participate?", "من يمكنه المشاركة؟"),
      a: t("All registered delegates with an 'Approved' status are eligible to participate in active consultations.", "يحق لجميع المندوبين المسجلين ذوي حالة 'مقبول' المشاركة في الاستشارات النشطة.")
    }
  ];

  return (
    <div className="w-full flex flex-col bg-background">
      <PageHero
        eyebrow={t("Civic Pulse Agency", "وكالة النبض المدني")}
        title={t("Direct", "الديمقراطية")}
        highlight={t("Engagement", "المباشرة")}
        subtitle={t("Formal legislative consultations where every delegate's voice shapes national policy.", "استشارات تشريعية رسمية حيث يشكل صوت كل مندوب السياسة الوطنية.")}
      >
        <div className="flex flex-wrap gap-8 sm:gap-14">
          <HeroStat label={t("Live Sessions", "جلسات مباشرة")} value={activePollsCount} accent />
          <HeroStat label={t("Community Impact", "أثر المجتمع")} value={totalVotesAcrossAll} />
          <div className="space-y-1">
            <p className="text-white/40 text-[10px] sm:text-xs uppercase font-bold tracking-[0.2em]">{t("Quorum Status", "حالة النصاب")}</p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-gold to-gold-pale rounded-full"
                />
              </div>
              <span className="text-gold font-black font-display text-xl">75%</span>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Consultation Agenda */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-20 relative z-20 pb-24">
        <div className="glass-panel rounded-[2.5rem] overflow-hidden">
          <div className="p-6 md:p-12 border-b border-border/50 flex flex-wrap items-center justify-between gap-4 md:gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">{t("Consultation Agenda", "أجندة الاستشارات")}</h2>
              <p className="text-muted-foreground mt-1">{t("Formal legislative requests for community decision-making.", "طلبات تشريعية رسمية لاتخاذ القرار المجتمعي.")}</p>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-1 rounded-2xl border border-border/50 bg-secondary/40 p-1">
              {([
                ["all", t("All", "الكل"), polls.length + 1],
                ["active", t("Open", "مفتوحة"), activePollsCount],
                ["closed", t("Closed", "مغلقة"), polls.length + 1 - activePollsCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    filter === value ? "bg-navy-dark text-white shadow-md dark:bg-gold dark:text-navy-dark" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${filter === value ? "bg-white/15 dark:bg-navy-dark/15" : "bg-secondary"}`}>{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border/40">
            {showSahara && <SaharaAgendaItem t={t} isAr={isAr} />}
            {shownPolls.length === 0 && !showSahara ? (
              <div className="p-20 text-center text-muted-foreground italic">
                {t("No closed consultations yet.", "لا توجد استشارات مغلقة بعد.")}
              </div>
            ) : (
              shownPolls.map((poll: Poll, idx: number) => (
                <AgendaItem key={poll.id} poll={poll} idx={idx + (showSahara ? 1 : 0)} t={t} isAr={isAr} />
              ))
            )}
          </div>

          {/* Upcoming Cycle Banner */}
          <div className="p-10 md:p-12 bg-navy-dark text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-gold opacity-20" />
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700">
              <Scale className="w-32 h-32 text-gold" />
            </div>
            <div className="max-w-2xl relative z-10">
              <h3 className="text-2xl md:text-3xl font-display font-black mb-4">
                {t("Upcoming Legislative", "الدورة التشريعية")}{" "}
                <span className="text-gradient-gold">{t("Cycle", "القادمة")}</span>
              </h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                {t("Our simulation engine is preparing new modules for Urban Planning and Digital Rights. Get ready for next month's focus.", "يعمل محرك المحاكاة لدينا على إعداد نماذج جديدة للتخطيط الحضري والحقوق الرقمية. استعد لتركيز الشهر المقبل.")}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 hover:border-gold/40 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-sm font-medium">Urban Renewal 2026</span>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 hover:border-gold/40 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gold-pale animate-pulse" />
                  <span className="text-sm font-medium">Data Privacy Act</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Constitutional FAQ */}
      <section className="max-w-4xl mx-auto w-full px-4 pb-32">
        <Reveal className="text-center mb-14">
          <div className="inline-block p-3 rounded-2xl bg-gold/10 text-gold mb-4">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-black text-foreground">{t("Constitutional FAQ", "الأسئلة الدستورية الشائعة")}</h2>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div
                className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                  activeFaq === i ? "border-gold/40 bg-card shadow-xl shadow-gold/5" : "border-border/50 bg-card/60 hover:border-gold/25"
                }`}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  aria-expanded={activeFaq === i}
                  className="w-full p-6 flex items-center justify-between text-start gap-4"
                >
                  <span className="font-bold text-lg text-foreground">{faq.q}</span>
                  <span className={`p-1.5 rounded-full transition-all duration-300 shrink-0 ${activeFaq === i ? "bg-gold/15 rotate-180" : "bg-secondary/50"}`}>
                    <ChevronDown className={`w-4 h-4 ${activeFaq === i ? "text-gold" : "text-muted-foreground"}`} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

// Pinned first row of the agenda: the public Sahara Autonomy consultation.
// It isn't a poll (free-text answers by region/section), so it links to its own page.
function SaharaAgendaItem({ t, isAr }: { t: (en: string, ar: string) => string; isAr: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="group">
      <Link href="/autonomy-initiative">
        <div className="relative overflow-hidden p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 cursor-pointer bg-gradient-to-r from-gold/[0.08] via-gold/[0.03] to-transparent hover:from-gold/[0.12] transition-colors">
          <span className="absolute inset-y-0 start-0 w-1 bg-gold" />
          <Scale className="pointer-events-none absolute -end-6 -top-6 size-40 text-gold/[0.07] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6" />

          <span className="hidden md:flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
            <Scale className="size-7" />
          </span>

          <div className="relative flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-widest text-navy-dark">
                <Pin className="size-3" /> {t("Featured", "مميّزة")}
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <span className="size-2.5 rounded-full bg-gold animate-pulse" />
                {t("Open to everyone · no account needed", "مفتوحة للجميع · بدون حساب")}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-foreground group-hover:text-gold transition-colors duration-300">
              {t("The Autonomy Initiative for the Sahara", "المبادرة المغربية للحكم الذاتي في الصحراء")}
            </h3>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
              {t(
                "Read the framework section by section — constitutional, institutional and financial — and share your perspective by region and topic.",
                "اطّلع على الإطار محوراً محوراً — الدستوري والمؤسساتي والمالي — وشارك رأيك حسب الجهة والمحور."
              )}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[t("Constitutional", "دستوري"), t("Institutions", "المؤسسات"), t("Resources", "الموارد")].map((tag) => (
                <span key={tag} className="rounded-lg border border-border/60 bg-card/60 px-2.5 py-1 text-[11px] font-bold text-foreground/70">{tag}</span>
              ))}
            </div>
          </div>

          <div className="relative flex md:flex-col items-center gap-4 md:gap-2 min-w-[120px]">
            <div className="text-center">
              <MessageSquareText className="mx-auto size-6 text-gold" />
              <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("Share opinion", "شارك رأيك")}</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block" />
            <div className="p-4 rounded-full bg-gold text-navy-dark shadow-lg shadow-gold/25 transition-transform duration-300 group-hover:scale-110">
              <ArrowRight className={`w-6 h-6 ${isAr ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function AgendaItem({ poll, idx, t, isAr }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.08 }}
      className="group"
    >
      <Link href={`/polls/${poll.id}`}>
        <div className="p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 cursor-pointer hover:bg-gold/[0.04] transition-colors relative">
          {/* Gold accent bar on hover */}
          <span className="absolute inset-y-0 start-0 w-1 bg-gold scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300" />

          <span className="hidden md:block font-display font-black text-3xl text-muted-foreground/20 group-hover:text-gold/60 transition-colors w-14 shrink-0">
            {String(idx + 1).padStart(2, "0")}
          </span>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${poll.status === "active" ? "bg-gold animate-pulse" : "bg-muted/40"}`} />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {poll.status === "active" ? t("Submission Open", "باب التقديم مفتوح") : t("Finalized", "تم الانتهاء")}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-foreground group-hover:text-gold transition-colors duration-300">
              {isAr ? poll.titleAr : poll.title}
            </h3>
            <p className="text-muted-foreground text-base md:text-lg line-clamp-2 max-w-3xl leading-relaxed">
              {poll.description}
            </p>
          </div>

          <div className="flex md:flex-col items-center gap-6 md:gap-2 min-w-[120px]">
            <div className="text-center">
              <p className="text-2xl font-black font-display text-foreground">{poll.totalVotes || 0}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("Votes", "الأصوات")}</p>
            </div>
            <div className="h-10 w-px bg-border hidden md:block" />
            <div className="p-4 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy-dark transition-all duration-300 transform group-hover:scale-110">
              <ArrowRight className={`w-6 h-6 ${isAr ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
