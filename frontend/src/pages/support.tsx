import { useLanguage } from "@/hooks/use-language";
import { Card, Button, Input, Textarea, Label, Select } from "@/components/ui-custom";
import { useCreateSupportTicket } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Support() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const createTicketMutation = useCreateSupportTicket();
  
  const [form, setForm] = useState({ subject: "", message: "", category: "technical" });

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

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold text-primary mb-4">{t("Help & Support", "المساعدة والدعم")}</h1>
          <p className="text-lg text-muted-foreground">{t("We're here to help you navigate the platform.", "نحن هنا لمساعدتك في تصفح المنصة.")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <HelpCircle className="text-gold" /> {t("Frequently Asked Questions", "الأسئلة الشائعة")}
            </h2>
            
            {[
              { q: t("How do I get assigned a role?", "كيف أحصل على دور؟"), a: t("After applying, admins will review your motivation and assign you a role.", "بعد التقديم، سيراجع المسؤولون طلبك ويخصصون لك دورًا.") },
              { q: t("Can I propose a new bill?", "هل يمكنني اقتراح قانون جديد؟"), a: t("Yes, Members of Parliament can propose bills in the Community forums.", "نعم، يمكن لأعضاء البرلمان اقتراح قوانين في منتديات المجتمع.") },
              { q: t("How do crises work?", "كيف تعمل الأزمات؟"), a: t("Crises are triggered by admins. All users will be notified to discuss and vote on solutions.", "يتم إطلاق الأزمات من قبل المسؤولين. سيتم إخطار جميع المستخدمين لمناقشة الحلول والتصويت عليها.") },
            ].map((faq, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-bold text-lg mb-2 text-foreground">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 shadow-xl shadow-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <Mail className="text-primary" /> {t("Contact Support", "تواصل مع الدعم")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t("Category", "الفئة")}</Label>
                <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  <option value="technical">{t("Technical Issue", "مشكلة تقنية")}</option>
                  <option value="rules">{t("Simulation Rules", "قواعد المحاكاة")}</option>
                  <option value="account">{t("Account Help", "مساعدة في الحساب")}</option>
                </Select>
              </div>
              <div>
                <Label>{t("Subject", "الموضوع")}</Label>
                <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
              </div>
              <div>
                <Label>{t("Message", "الرسالة")}</Label>
                <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required className="h-32" />
              </div>
              <Button type="submit" variant="gold" className="w-full gap-2" isLoading={createTicketMutation.isPending}>
                <MessageCircle className="w-4 h-4" /> {t("Submit Ticket", "إرسال التذكرة")}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
