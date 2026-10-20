import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Scale, Landmark, Coins, Info, CheckCircle2, FileText } from "lucide-react";
import { PageHero, Reveal, Button, Textarea, Select, Label, Card } from "@/components/ui-custom";
import { Checkbox } from "@/components/ui/checkbox";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/use-seo";
import { Link } from "wouter";

const REGIONS: [string, string][] = [
  ["Tanger-Tétouan-Al Hoceïma", "طنجة تطوان الحسيمة"],
  ["L'Oriental", "الشرق"],
  ["Fès-Meknès", "فاس مكناس"],
  ["Rabat-Salé-Kénitra", "الرباط سلا القنيطرة"],
  ["Béni Mellal-Khénifra", "بني ملال خنيفرة"],
  ["Casablanca-Settat", "الدار البيضاء سطات"],
  ["Marrakech-Safi", "مراكش آسفي"],
  ["Drâa-Tafilalet", "درعة تافيلالت"],
  ["Souss-Massa", "سوس ماسة"],
  ["Guelmim-Oued Noun", "كلميم واد نون"],
  ["Laâyoune-Sakia El Hamra", "العيون الساقية الحمراء"],
  ["Dakhla-Oued Ed-Dahab", "الداخلة وادي الذهب"],
  ["Moroccan Diaspora", "الجالية المغربية"],
  ["Prefer not to say", "أفضل عدم القول"],
];

const AXES: [string, string][] = [
  ["Constitutional & Legal Framework", "الإطار الدستوري والقانوني"],
  ["Distribution of Powers & Institutions", "توزيع الاختصاصات والمؤسسات"],
  ["Financial & Natural Resources", "الموارد المالية والطبيعية"],
  ["General / Other", "عام / أخرى"],
];

export default function AutonomyInitiative() {
  const { t } = useLanguage();
  useSeo({
    title: t(
      "Moroccan Autonomy Initiative for the Sahara | Youth Capital Morocco",
      "المبادرة المغربية للحكم الذاتي في الصحراء | يوث كابيتال"
    ),
    description: t(
      "Understand the constitutional, institutional, and financial framework of Morocco's Autonomy Initiative for the Sahara, and share your perspective.",
      "تعرّف على الإطار الدستوري والمؤسساتي والمالي للمبادرة المغربية للحكم الذاتي في الصحراء، وشارك رأيك."
    ),
    path: "/autonomy-initiative",
  });

  const { toast } = useToast();
  const [region, setRegion] = useState("");
  const [axis, setAxis] = useState("");
  const [opinion, setOpinion] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sections = [
    {
      icon: Scale,
      titleEn: "Constitutional & Legal Framework",
      titleAr: "الإطار الدستوري والقانوني",
      subtitleEn: "Axes 1, 2 & 4",
      subtitleAr: "المحاور 1، 2، 4",
      points: [
        { en: "Introduction to the document, its methodology, and its limits", ar: "تقديم الوثيقة والمنهجية وحدودها" },
        { en: "The framing principles and legal references", ar: "المبادئ المؤطرة والمرجعيات القانونية" },
        { en: "The territorial scope and the populations concerned", ar: "المجال الترابي والسكان المعنيون" },
        { en: "The legal rank of the Autonomy Statute and its relationship to the Constitution and the law", ar: "المرتبة القانونية للنظام الأساسي وعلاقته بالدستور والقوانين" },
        { en: "Verification of constitutional articles, organic laws, and legal references", ar: "التحقق من الفصول الدستورية والقوانين التنظيمية والإحالات القانونية" },
      ],
      outputEn: "Output: a legal memo identifying the legal basis for each proposal, and the issues that require constitutional, legislative, or negotiated grounding.",
      outputAr: "المخرج: مذكرة قانونية تحدد الأساس القانوني لكل مقترح، والمسائل التي تتطلب سنداً دستورياً أو تشريعياً أو اتفاقاً تفاوضياً.",
    },
    {
      icon: Landmark,
      titleEn: "Distribution of Powers & Institutions",
      titleAr: "توزيع الاختصاصات والمؤسسات",
      subtitleEn: "Axes 5 & 6",
      subtitleAr: "المحوران 5 و6",
      points: [
        { en: "Distribution of powers between the State and the Region, and shared or undefined powers", ar: "توزيع الاختصاصات بين الدولة والجهة والاختصاصات المشتركة وغير المحددة" },
        { en: "Coordination mechanisms, decentralized external cooperation, and State representation", ar: "آليات التنسيق والتعاون الخارجي اللامركزي وتمثيل الدولة" },
        { en: "The Regional Council, its president, and the executive body", ar: "المجلس الجهوي والرئيس والجهاز التنفيذي" },
        { en: "Democratic representation and national representation", ar: "التمثيلية الديمقراطية والتمثيل الوطني" },
        { en: "Judicial organization and the resolution of disputes linked to these powers", ar: "التنظيم القضائي وتسوية المنازعات المرتبطة بالاختصاصات" },
      ],
      outputEn: "Output: an institutional table defining each power, how institutions are formed, how they relate to one another, and the issues that need further detail.",
      outputAr: "المخرج: جدول مؤسساتي يحدد الاختصاصات، وطريقة تشكيل المؤسسات، وعلاقاتها المتبادلة، والإشكالات التي تستدعي التفصيل.",
    },
    {
      icon: Coins,
      titleEn: "Financial & Natural Resources",
      titleAr: "الموارد المالية والطبيعية",
      subtitleEn: "Axis 7",
      subtitleAr: "المحور 7",
      points: [
        { en: "The Region's own resources, financial transfers, and State contributions", ar: "موارد الجهة الذاتية والتحويلات المالية ومساهمات الدولة" },
        { en: "Management of revenues linked to natural resources", ar: "تدبير العائدات المرتبطة بالموارد الطبيعية" },
        { en: "Options for a Regional Development and Solidarity Fund", ar: "خيارات صندوق التنمية والتضامن الجهوي" },
        { en: "Transparency, accountability, and financial auditing", ar: "الشفافية والمحاسبة والتدقيق المالي" },
        { en: "Consultation on strategic projects", ar: "التشاور بشأن المشاريع الاستراتيجية" },
      ],
      outputEn: "Output: an initial financial and economic outline, documenting funding sources and proposed mechanisms : without assuming figures or percentages that aren't grounded in the source material.",
      outputAr: "المخرج: تصور مالي واقتصادي أولي، مع توثيق مصادر التمويل والآليات المقترحة، وعدم افتراض نسب أو أرقام دون سند.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !axis || opinion.trim().length < 10) {
      toast({
        title: t("Please complete the form", "يرجى إكمال النموذج"),
        description: t("Select a region, select a section, and share at least a few words.", "اختر جهة ومحوراً وشارك بضع كلمات على الأقل."),
        variant: "destructive",
      });
      return;
    }
    if (!consent) {
      toast({
        title: t("Consent Required", "الموافقة مطلوبة"),
        description: t("You must consent to answers collection to submit a response.", "يجب الموافقة على جمع الإجابات لإرسال ردّك."),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await customFetch("/api/sahara-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, axis, opinion: opinion.trim(), consentToDataCollection: consent }),
      });
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: t("Submission Failed", "فشل الإرسال"),
        description: error?.message || t("Please try again later.", "يرجى المحاولة مرة أخرى لاحقاً."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        compact
        eyebrow={t("Civic Consultation", "استشارة مدنية")}
        title={t("The Autonomy", "مبادرة الحكم")}
        highlight={t("Initiative", "الذاتي")}
        subtitle={t(
          "Morocco's proposal for an Autonomy Statute for the Sahara region, explained section by section : and a space for young Moroccans to share their perspective.",
          "المبادرة المغربية لنظام الحكم الذاتي في جهة الصحراء، موضحة محوراً محوراً : ومساحة للشباب المغربي لمشاركة رأيهم."
        )}
      />

      {/* Explainer */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-10">
          <Reveal>
            <div className="flex items-start gap-4 p-6 rounded-3xl bg-secondary/30 border border-border/50 mb-4">
              <FileText className="w-6 h-6 text-gold shrink-0 mt-1" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "This page summarizes the working structure of the Moroccan Autonomy Initiative consultation document for the Sahara region, organized into three parts below. It's presented here as civic education material : to help you form an informed opinion, not to tell you what to think.",
                  "تلخّص هذه الصفحة الهيكل العام لوثيقة التشاور الخاصة بالمبادرة المغربية للحكم الذاتي في جهة الصحراء، مقسّمة إلى ثلاثة أقسام أدناه. وهي مقدَّمة هنا كمادة للتربية المدنية : لمساعدتك على تكوين رأي مستنير، وليس لإملاء ما يجب أن تفكر فيه."
                )}
              </p>
            </div>
          </Reveal>

          {sections.map((section, i) => (
            <Reveal key={i} delay={0.05}>
              <div className="border border-border/50 rounded-[2rem] overflow-hidden bg-card hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 group">
                <div className="flex items-center gap-4 p-6 md:p-7 border-b border-border/50 bg-secondary/10">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
                    <section.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold mb-1">{t(section.subtitleEn, section.subtitleAr)}</p>
                    <h2 className="text-xl md:text-2xl font-display font-black text-foreground">
                      {t(section.titleEn, section.titleAr)}
                    </h2>
                  </div>
                </div>
                <ul className="divide-y divide-border/40">
                  {section.points.map((point, j) => (
                    <li key={j} className="px-6 md:px-7 py-5 flex items-start gap-4 text-sm text-muted-foreground leading-relaxed hover:bg-gold/[0.04] transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/15 text-gold text-xs font-black flex items-center justify-center mt-0.5">
                        {j + 1}
                      </span>
                      {t(point.en, point.ar)}
                    </li>
                  ))}
                </ul>
                <div className="px-6 md:px-7 py-5 bg-secondary/20 border-t border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground italic">{t(section.outputEn, section.outputAr)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-4">
                {t("Share Your", "شارك")} <span className="text-gradient-gold">{t("Perspective", "رأيك")}</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {t(
                  "What stands out to you, what concerns you, what questions does this raise? your response is genuinely anonymous.",
                  "ما الذي يلفت انتباهك؟ ما الذي يقلقك؟ ما الأسئلة التي يثيرها هذا؟ ردّك مجهول الهوية حقاً."
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="p-6 md:p-10 rounded-[2rem] border border-gold/15 shadow-2xl shadow-navy/10">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gold/15 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-gold" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-foreground mb-3">
                    {t("Thank You", "شكراً لك")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("Your anonymous response has been recorded.", "تم تسجيل ردّك المجهول.")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label>{t("Your Region", "جهتك")}</Label>
                    <Select value={region} onChange={(e) => setRegion(e.target.value)}>
                      <option value="">{t("Select a region", "اختر جهة")}</option>
                      {REGIONS.map(([en, ar]) => (
                        <option key={en} value={en}>{t(en, ar)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Which Section", "أي محور")}</Label>
                    <Select value={axis} onChange={(e) => setAxis(e.target.value)}>
                      <option value="">{t("Select a section", "اختر محوراً")}</option>
                      {AXES.map(([en, ar]) => (
                        <option key={en} value={en}>{t(en, ar)}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>{t("Your Opinion", "رأيك")}</Label>
                    <Textarea
                      value={opinion}
                      onChange={(e) => setOpinion(e.target.value)}
                      placeholder={t("Share your perspective on the Autonomy Initiative...", "شارك رأيك حول مبادرة الحكم الذاتي...")}
                      className="h-40 rounded-2xl"
                      maxLength={4000}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/50">
                    <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(
                        "No login required, no name, no email. We don't record your IP address or location with your response : only your selected region and your text are stored.",
                        "لا حاجة لتسجيل الدخول، ولا اسم، ولا بريد إلكتروني. لا نسجّل عنوان IP الخاص بك أو موقعك مع ردّك : يُحفظ فقط الجهة التي اخترتها ونص ردّك."
                   )}
                      <Link href="/privacy" target="_blank" className="text-gold font-bold hover:underline">
                        {t("Privacy Policy", "سياسة الخصوصية")}
                      </Link>
                      {t(" for details.", " لمزيد من التفاصيل.")}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consentToDataCollection"
                      checked={consent}
                      onCheckedChange={(checked) => setConsent(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="consentToDataCollection" className="text-sm text-foreground leading-relaxed cursor-pointer">
                      {t(
                        "I understand my answers will be recorded and visible to administrators, and I consent to this.",
                        "أفهم أن ردودي ستُسجَّل وستكون مرئية للمسؤولين، وأوافق على ذلك."
                         )}
                    </label>
                  </div>

                  <Button type="submit" variant="gold" className="w-full h-14 rounded-2xl" isLoading={isSubmitting} disabled={!consent}>
                    {t("Submit anonymously", "إرسال بشكل مجهول")}
                  </Button>
                </form>
              )}
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
