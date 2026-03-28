import { useLanguage } from "@/hooks/use-language";
import { Shield, BookOpen, Users, AlertTriangle, CheckCircle, XCircle, Gavel } from "lucide-react";

export default function Rules() {
  const { t } = useLanguage();

  const sections = [
    {
      icon: Users,
      titleEn: "1. Membership & Roles",
      titleAr: "1. العضوية والأدوار",
      rules: [
        {
          en: "All participants must register with their real identity. Impersonation of real political figures is prohibited.",
          ar: "يجب على جميع المشاركين التسجيل بهويتهم الحقيقية. يُحظر انتحال شخصية شخصيات سياسية حقيقية.",
        },
        {
          en: "Each member may hold only one simulation role at a time (Minister, MP, Regional Councillor, or Diaspora Rep).",
          ar: "يحق لكل عضو شغل دور محاكاة واحد في كل مرة (وزير، برلماني، مستشار جهوي، أو ممثل مهجر).",
        },
        {
          en: "Role assignments are made by platform administrators based on applications and motivations submitted through the Form page.",
          ar: "تُمنح الأدوار من قِبَل مسؤولي المنصة بناءً على الطلبات والدوافع المقدَّمة عبر صفحة التقديم.",
        },
        {
          en: "Participants may apply for a role transfer after 30 days in their current role, subject to admin approval.",
          ar: "يجوز للمشاركين طلب تغيير الدور بعد 30 يومًا من شغلهم للدور الحالي، بموافقة المسؤول.",
        },
      ],
    },
    {
      icon: BookOpen,
      titleEn: "2. Debate & Forum Conduct",
      titleAr: "2. آداب النقاش والمنتديات",
      rules: [
        {
          en: "All discussions must remain focused on policy, governance, and civic issues. Personal attacks against other participants are strictly prohibited.",
          ar: "يجب أن تبقى جميع النقاشات مركّزة على السياسة والحوكمة والقضايا المدنية. يُحظر تمامًا الهجوم الشخصي على المشاركين الآخرين.",
        },
        {
          en: "Arguments must be evidence-based or clearly labeled as opinion. Misinformation presented as fact may result in post removal.",
          ar: "يجب أن تستند الحجج إلى أدلة أو تُصنَّف بوضوح على أنها آراء. قد تؤدي المعلومات المضللة المقدَّمة كحقائق إلى حذف المنشور.",
        },
        {
          en: "Arabic and English are both equally valid in all forums. Participants should not pressure others to use a specific language.",
          ar: "العربية والإنجليزية كلتاهما مقبولتان على قدم المساواة في جميع المنتديات. لا ينبغي للمشاركين الضغط على الآخرين لاستخدام لغة معينة.",
        },
        {
          en: "Ministers and MPs are expected to actively participate in their designated forums at least once per active simulation week.",
          ar: "يُتوقع من الوزراء وأعضاء البرلمان المشاركة الفعّالة في منتدياتهم المخصصة مرة واحدة على الأقل في كل أسبوع محاكاة نشط.",
        },
      ],
    },
    {
      icon: Gavel,
      titleEn: "3. Voting & Legislation",
      titleAr: "3. التصويت والتشريع",
      rules: [
        {
          en: "Each eligible participant has one vote per poll. Votes are anonymous and cannot be changed once cast.",
          ar: "لكل مشارك مؤهل صوت واحد في كل استطلاع. الأصوات سرية ولا يمكن تغييرها بعد الإدلاء بها.",
        },
        {
          en: "Bills proposed in the House of Representatives require a simple majority (50%+1) to pass. Constitutional amendments require a two-thirds majority.",
          ar: "تتطلب مشاريع القوانين المقترحة في مجلس النواب أغلبية بسيطة (50%+1) للمصادقة عليها. يتطلب تعديل الدستور أغلبية الثلثين.",
        },
        {
          en: "Polls remain open for a minimum of 48 hours unless an emergency vote is declared by administrators.",
          ar: "تبقى الاستطلاعات مفتوحة لمدة 48 ساعة على الأقل ما لم يُعلن المسؤولون عن تصويت طارئ.",
        },
        {
          en: "Any participant found to be coordinating to manipulate voting outcomes will be removed from their role.",
          ar: "أي مشارك يُضبط وهو ينسق للتلاعب بنتائج التصويت سيُزال من دوره.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      titleEn: "4. Crisis Scenarios",
      titleAr: "4. سيناريوهات الأزمات",
      rules: [
        {
          en: "Crisis scenarios are activated exclusively by platform administrators. Participants may not fabricate or announce crises independently.",
          ar: "تُفعَّل سيناريوهات الأزمات حصريًا من قِبَل مسؤولي المنصة. لا يجوز للمشاركين اختلاق أزمات أو الإعلان عنها باستقلالية.",
        },
        {
          en: "During an active crisis, relevant ministers and regional heads are expected to respond within 24 hours with a policy draft.",
          ar: "خلال الأزمات النشطة، يُتوقع من الوزراء ورؤساء الجهات المعنيين الرد خلال 24 ساعة بمسودة سياسة.",
        },
        {
          en: "Crisis responses are evaluated by admin judges and peer participants. Outstanding responses may be featured in the Press section.",
          ar: "يتم تقييم ردود الأزمات من قبل محكّمين من المسؤولين والمشاركين. قد تُبرز الردود المتميزة في قسم الأخبار.",
        },
      ],
    },
    {
      icon: Shield,
      titleEn: "5. Code of Conduct & Enforcement",
      titleAr: "5. مدونة السلوك والإنفاذ",
      rules: [
        {
          en: "Discrimination, hate speech, or offensive content based on religion, ethnicity, gender, or political affiliation is grounds for immediate removal.",
          ar: "التمييز والخطاب المكروه أو المحتوى المسيء القائم على الدين أو العرق أو الجنس أو الانتماء السياسي سبب للإزالة الفورية.",
        },
        {
          en: "Sharing private information of other participants without their consent is strictly prohibited (GDPR & Moroccan Law 09-08 compliance).",
          ar: "يُحظر تمامًا مشاركة المعلومات الخاصة بالمشاركين الآخرين دون موافقتهم (امتثالًا للائحة GDPR والقانون المغربي 09-08).",
        },
        {
          en: "Violations are handled on a three-strike basis: Warning → Temporary Suspension → Permanent Ban.",
          ar: "يُعالَج انتهاك القواعد وفق نظام الثلاث مخالفات: إنذار ← تعليق مؤقت ← حظر دائم.",
        },
        {
          en: "Appeals against administrative decisions must be submitted through the Support page within 7 days of the decision.",
          ar: "يجب تقديم الطعون في القرارات الإدارية عبر صفحة الدعم في غضون 7 أيام من تاريخ القرار.",
        },
      ],
    },
  ];

  const canDo = [
    { en: "Propose and debate simulated legislation", ar: "اقتراح ومناقشة التشريعات المحاكاة" },
    { en: "Vote on polls and policy decisions", ar: "التصويت على استطلاعات وقرارات السياسة" },
    { en: "Participate in crisis scenario management", ar: "المشاركة في إدارة سيناريوهات الأزمات" },
    { en: "Write opinion posts and reply to debates", ar: "كتابة منشورات رأي والرد على النقاشات" },
    { en: "Attend and host live simulation events", ar: "حضور وتنظيم فعاليات المحاكاة المباشرة" },
  ];

  const cannotDo = [
    { en: "Impersonate real public figures or officials", ar: "انتحال شخصية مسؤولين أو شخصيات عامة حقيقية" },
    { en: "Share offensive, hateful, or discriminatory content", ar: "نشر محتوى مسيء أو مكروه أو تمييزي" },
    { en: "Manipulate or attempt to rig voting outcomes", ar: "التلاعب بنتائج التصويت أو محاولة تزويرها" },
    { en: "Disclose other participants' personal information", ar: "الإفصاح عن المعلومات الشخصية للمشاركين الآخرين" },
    { en: "Use the platform to promote real-world political parties", ar: "استخدام المنصة للترويج لأحزاب سياسية حقيقية" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="bg-navy-dark py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold border border-gold/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
            <Gavel className="w-4 h-4" />
            {t("Simulation Rules", "قواعد المحاكاة")}
          </div>
          <h1 className="text-5xl font-display font-bold text-white mb-6">
            {t("Rules & Guidelines", "القواعد والإرشادات")}
          </h1>
          <p className="text-xl text-white/70 leading-relaxed">
            {t(
              "These rules ensure our simulation stays fair, respectful, and meaningful for every participant. Please read them carefully before participating.",
              "تضمن هذه القواعد أن محاكاتنا تبقى عادلة ومحترمة وذات معنى لكل مشارك. يُرجى قراءتها بعناية قبل المشاركة."
            )}
          </p>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 px-4 bg-ice-blue/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-primary mb-8 text-center">
            {t("Quick Summary", "ملخص سريع")}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-6 border border-green-200">
              <h3 className="font-bold text-green-700 flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" /> {t("You CAN", "يُمكنك")}
              </h3>
              <ul className="space-y-3">
                {canDo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {t(item.en, item.ar)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-red-200">
              <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5" /> {t("You CANNOT", "لا يُمكنك")}
              </h3>
              <ul className="space-y-3">
                {cannotDo.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {t(item.en, item.ar)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Full Rules */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-6 bg-card border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {t(section.titleEn, section.titleAr)}
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {section.rules.map((rule, j) => (
                  <li key={j} className="px-6 py-4 flex items-start gap-3 text-sm text-muted-foreground leading-relaxed hover:bg-muted/30 transition-colors">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center mt-0.5">
                      {j + 1}
                    </span>
                    {t(rule.en, rule.ar)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-10 px-4 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">
          {t("Last updated: March 2026 — Rules are subject to revision. Major changes will be announced via the Press page.", 
             "آخر تحديث: مارس 2026 — القواعد قابلة للمراجعة. سيتم الإعلان عن التغييرات الرئيسية عبر صفحة الأخبار.")}
        </p>
      </section>

    </div>
  );
}
