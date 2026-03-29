import { useLanguage } from "@/hooks/use-language";
import { useGetPolls, Poll } from "@workspace/api-client-react";
import { Button, Badge } from "@/components/ui-custom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Vote as VoteIcon, 
  ArrowRight, 
  BarChart3, 
  Users, 
  Calendar, 
  Sparkles,
  Info,
  ChevronDown,
  Activity,
  Scale
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Polls() {
  const { t, isAr } = useLanguage();
  const { data, isLoading } = useGetPolls();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const polls = data?.polls || [];
  const activePollsCount = polls.filter(p => p.status === "active").length;
  const totalVotesAcrossAll = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

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
    <div className="w-full flex flex-col bg-slate-50/50">
      {/* Immersive Pulse Hero */}
      <section className="relative pt-32 pb-48 px-4 overflow-hidden bg-navy-dark">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-px bg-gold/50" />
            <span className="text-gold font-display font-medium uppercase tracking-[0.3em] text-sm">
               {t("Civic Pulse Agency", "وكالة النبض المدني")}
            </span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-[1.1]">
            {t("Direct ", "الديمقراطية ")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-white">
               {t("Engagement", "المباشرة")}
            </span>
          </h1>
          
          <div className="flex flex-wrap gap-12 mt-16">
             <div className="space-y-1">
                <p className="text-white/40 text-sm uppercase font-bold tracking-widest">{t("Live Sessions", "جلسات مباشرة")}</p>
                <p className="text-4xl text-white font-display font-bold">{activePollsCount}</p>
             </div>
             <div className="space-y-1">
                <p className="text-white/40 text-sm uppercase font-bold tracking-widest">{t("Community Impact", "أثر المجتمع")}</p>
                <p className="text-4xl text-white font-display font-bold">{totalVotesAcrossAll.toLocaleString()}</p>
             </div>
             <div className="space-y-1">
                <p className="text-white/40 text-sm uppercase font-bold tracking-widest">{t("Quorum Status", "حالة النصاب")}</p>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold w-3/4" />
                  </div>
                  <span className="text-gold font-bold">75%</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Modern 'Civic Agenda' List - No Cards */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-24 relative z-20 pb-24">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-border/40 shadow-2xl shadow-navy-dark/5 overflow-hidden">
          <div className="p-8 md:p-12 border-b border-border/50 flex flex-wrap items-center justify-between gap-6">
             <div>
               <h2 className="text-3xl font-display font-bold text-navy-dark">{t("Consultation Agenda", "أجندة الاستشارات")}</h2>
               <p className="text-muted-foreground">{t("Formal legislative requests for community decision-making.", "طلبات تشريعية رسمية لاتخاذ القرار المجتمعي.")}</p>
             </div>
             <div className="flex gap-2">
                <Badge variant="outline" className="px-4 py-1.5">{t("All Categories", "جميع الفئات")}</Badge>
                <Badge variant="gold" className="px-4 py-1.5">{t("High Priority", "أولوية عالية")}</Badge>
             </div>
          </div>

          <div className="divide-y divide-border/40">
            {polls.length === 0 ? (
               <div className="p-20 text-center text-muted-foreground italic">
                 {t("The legislative floor is currently clear.", "قاعة التشريع خالية حالياً.")}
               </div>
            ) : (
              polls.map((poll: Poll, idx: number) => (
                <AgendaItem 
                  key={poll.id} 
                  poll={poll} 
                  idx={idx} 
                  t={t} 
                  isAr={isAr} 
                />
              ))
            )}
          </div>

          {/* Fill Content: Engagement Roadmap */}
          <div className="p-12 bg-navy-dark text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Scale className="w-32 h-32" />
             </div>
             <div className="max-w-2xl relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4">{t("Upcoming Legislative Cycle", "الدورة التشريعية القادمة")}</h3>
                <p className="text-white/60 mb-8">{t("Our simulation engine is prepairing new modules for Urban Planning and Digital Rights. Get ready for next month's focus.", "يعمل محرك المحاكاة لدينا على إعداد نماذج جديدة للتخطيط الحضري والحقوق الرقمية. استعد لتركيز الشهر المقبل.")}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm font-medium">Urban Renewal 2026</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-sm font-medium">Data Privacy Act</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Technical FAQ Section to fill the page */}
      <section className="max-w-4xl mx-auto w-full px-4 pb-32">
        <div className="text-center mb-16">
          <div className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-4">
             <Info className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-display font-bold">{t("Constitutional FAQ", "الأسئلة الدستورية الشائعة")}</h2>
        </div>

        <div className="space-y-4">
           {faqs.map((faq, i) => (
             <motion.div 
               key={i}
               className={`rounded-2xl border border-border/50 bg-white transition-all duration-300 ${activeFaq === i ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}
             >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-start"
                >
                  <span className="font-bold text-lg text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                   {activeFaq === i && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="p-6 pt-0 text-muted-foreground border-t border-border/30 mt-2">
                          {faq.a}
                       </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </motion.div>
           ))}
        </div>
      </section>
    </div>
  );
}

function AgendaItem({ poll, idx, t, isAr }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1 }}
      className="group"
    >
      <Link href={`/polls/${poll.id}`}>
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex-1 space-y-3">
             <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${poll.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                   {poll.status === 'active' ? t("Submission Open", "باب التقديم مفتوح") : t("Finalized", "تم الانتهاء")}
                </span>
             </div>
             <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                {isAr ? poll.titleAr : poll.title}
             </h3>
             <p className="text-muted-foreground text-lg line-clamp-2 max-w-3xl leading-relaxed">
               {poll.description}
             </p>
          </div>

          <div className="flex md:flex-col items-center gap-6 md:gap-2 min-w-[120px]">
             <div className="text-center">
                <p className="text-2xl font-black text-navy-dark">{poll.totalVotes || 0}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t("Votes", "الأصوات")}</p>
             </div>
             <div className="h-10 w-px bg-border hidden md:block" />
             <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
                <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

