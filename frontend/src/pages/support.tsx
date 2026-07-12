import { useLanguage } from "@/hooks/use-language";
import { Button, Input, Textarea, Label, Select, PageHero, Reveal, TiltCard } from "@/components/ui-custom";
import { useCreateSupportTicket } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Mail, MessageCircle, ChevronDown, Zap, BookOpen, LifeBuoy } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

export default function Support() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createTicketMutation = useCreateSupportTicket();

  const [form, setForm] = useState({ subject: "", message: "", category: "technical" });
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;

    try {
      await createTicketMutation.mutateAsync({ data: form as any });
      toast({ title: t("Ticket Submitted!", "تم تقديم التذكرة بنجاح!") });
      setForm({ subject: "", message: "", category: "technical" });
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const faqs = [
    { q: t("How do I get assigned a role?", "كيف أحصل على دور؟"), a: t("After applying, admins will review your motivation and assign you a role.", "بعد التقديم، سيراجع المسؤولون طلبك ويخصصون لك دورًا.") },
    { q: t("Can I propose a new bill?", "هل يمكنني اقتراح قانون جديد؟"), a: t("Yes, Members of Parliament can propose bills in the Community forums.", "نعم، يمكن لأعضاء البرلمان اقتراح قوانين في منتديات المجتمع.") },
    { q: t("How do crises work?", "كيف تعمل الأزمات؟"), a: t("Crises are triggered by admins. All users will be notified to discuss and vote on solutions.", "يتم إطلاق الأزمات من قبل المسؤولين. سيتم إخطار جميع المستخدمين لمناقشة الحلول والتصويت عليها.") },
  ];

  const channels = [
    { icon: Zap, title: t("Fast Response", "استجابة سريعة"), desc: t("Tickets are reviewed within 24 hours by the platform team.", "تتم مراجعة التذاكر خلال 24 ساعة من قبل فريق المنصة.") },
    { icon: BookOpen, title: t("Simulation Rules", "قواعد المحاكاة"), desc: t("Most answers live in the official rulebook.", "معظم الإجابات موجودة في كتاب القواعد الرسمي."), href: "/rules" },
    { icon: LifeBuoy, title: t("Community Help", "مساعدة المجتمع"), desc: t("Ask fellow delegates in the WhatsApp community.", "اسأل زملاءك المندوبين في مجتمع الواتساب.") },
  ];

  return (
    <div className="w-full flex flex-col bg-background">
      <PageHero
        compact
        eyebrow={t("Support Command Center", "مركز قيادة الدعم")}
        title={t("How Can We", "كيف يمكننا")}
        highlight={t("Help You?", "مساعدتك؟")}
        subtitle={t("From technical hiccups to constitutional questions — the platform team is on standby.", "من المشاكل التقنية إلى الأسئلة الدستورية — فريق المنصة في الخدمة.")}
      />

      {/* Channel cards overlapping the hero */}
      <section className="px-4 -mt-16 md:-mt-20 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((ch, i) => {
            const Icon = ch.icon;
            const card = (
              <TiltCard className="h-full p-7 rounded-3xl glass-panel hover:border-gold/40 transition-colors duration-300 group">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{ch.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ch.desc}</p>
                </div>
              </TiltCard>
            );
            return (
              <Reveal key={i} delay={i * 0.1} className="h-full">
                {ch.href ? <Link href={ch.href} className="block h-full cursor-pointer">{card}</Link> : card}
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* FAQ Accordion */}
          <div>
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-display font-black text-foreground flex items-center gap-3 mb-8">
                <span className="p-2.5 rounded-2xl bg-gold/10"><HelpCircle className="w-6 h-6 text-gold" /></span>
                {t("Frequently Asked", "الأسئلة الشائعة")}
              </h2>
            </Reveal>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div
                    className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                      activeFaq === i ? "border-gold/40 bg-card shadow-xl shadow-gold/5" : "border-border/50 bg-card/50 hover:border-gold/25"
                    }`}
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      aria-expanded={activeFaq === i}
                      className="w-full p-6 flex items-center justify-between text-start gap-4"
                    >
                      <span className="font-bold text-base md:text-lg text-foreground">{faq.q}</span>
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
          </div>

          {/* Contact Form */}
          <Reveal direction="left">
            <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-gold/40 via-border to-transparent">
              <div className="bg-card rounded-[2rem] p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-display font-black text-foreground flex items-center gap-3 mb-2">
                  <span className="p-2.5 rounded-2xl bg-primary/10"><Mail className="w-6 h-6 text-primary" /></span>
                  {t("Open a Ticket", "افتح تذكرة")}
                </h2>
                <p className="text-muted-foreground text-sm mb-8">
                  {t("Describe your issue and we'll route it to the right department.", "صف مشكلتك وسنوجهها إلى القسم المناسب.")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label>{t("Category", "الفئة")}</Label>
                    <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="technical">{t("Technical Issue", "مشكلة تقنية")}</option>
                      <option value="rules">{t("Simulation Rules", "قواعد المحاكاة")}</option>
                      <option value="account">{t("Account Help", "مساعدة في الحساب")}</option>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Subject", "الموضوع")}</Label>
                    <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                  <div>
                    <Label>{t("Message", "الرسالة")}</Label>
                    <Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required className="h-36" />
                  </div>
                  <Button type="submit" variant="gold" size="lg" className="w-full gap-2" isLoading={createTicketMutation.isPending}>
                    <MessageCircle className="w-5 h-5" /> {t("Submit Ticket", "إرسال التذكرة")}
                  </Button>
                </form>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
