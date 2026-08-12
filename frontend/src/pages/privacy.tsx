import { useLanguage } from "@/hooks/use-language";
import { Lock, Eye, Database, Mail, Shield, UserCheck, Globe, FileText } from "lucide-react";
import { PageHero, Reveal } from "@/components/ui-custom";
import { useSeo } from "@/hooks/use-seo";

export default function Privacy() {
  const { t } = useLanguage();
  useSeo({
    title: t("Privacy Policy | Youth Capital", "سياسة الخصوصية | يوث كابيتال"),
    description: t(
      "How Youth Capital collects, uses, and protects your information on Morocco's youth governance simulation platform.",
      "كيف تجمع يوث كابيتال معلوماتك وتستخدمها وتحميها على منصة محاكاة الحوكمة الشبابية المغربية."
    ),
    path: "/privacy",
    noindex: true,
  });

  const sections = [
    {
      icon: Database,
      titleEn: "1. Information We Collect",
      titleAr: "1. المعلومات التي نجمعها",
      contentEn: [
        "Account Information: Your full name (in both English and Arabic if provided), email address, region, language preference, and password (stored as a secure hash : never in plain text).",
        "Profile & Simulation Data: Your assigned simulation role, motivation statement submitted during your application, forum posts, votes, and participation activity.",
        "Technical Data: IP address, browser type, and access timestamps : collected automatically for security and platform performance purposes.",
        "Communications: Support tickets and messages you send through the platform.",
      ],
      contentAr: [
        "معلومات الحساب: اسمك الكامل (بالعربية والإنجليزية إذا أُدرج)، عنوان بريدك الإلكتروني، جهتك، تفضيل لغتك، وكلمة مرورك (مخزّنة كرمز تشفير آمن : ليس نصًا عاديًا أبدًا).",
        "بيانات الملف الشخصي والمحاكاة: دورك المعيَّن في المحاكاة، رسالة الدوافع المقدَّمة خلال طلبك، منشورات المنتديات، أصواتك، ونشاط مشاركتك.",
        "البيانات التقنية: عنوان IP، نوع المتصفح، وطوابع وقت الوصول : تُجمَع تلقائيًا لأغراض الأمان وأداء المنصة.",
        "المراسلات: تذاكر الدعم والرسائل التي ترسلها عبر المنصة.",
      ],
    },
    {
      icon: Eye,
      titleEn: "2. How We Use Your Information",
      titleAr: "2. كيف نستخدم معلوماتك",
      contentEn: [
        "To operate and improve the Youth Capital simulation platform.",
        "To assign and manage simulation roles based on your application and performance.",
        "To facilitate community discussions, voting, and crisis scenarios.",
        "To send you platform-related notifications (role assignments, event reminders, crisis alerts).",
        "To respond to your support requests.",
        "To detect and prevent fraud, abuse, or violations of our Simulation Rules.",
      ],
      contentAr: [
        "لتشغيل منصة محاكاة Youth Capital وتحسينها.",
        "لتعيين وإدارة أدوار المحاكاة بناءً على طلبك وأدائك.",
        "لتيسير نقاشات المجتمع والتصويت وسيناريوهات الأزمات.",
        "لإرسال إشعارات متعلقة بالمنصة (تعيين الأدوار، تذكيرات الفعاليات، تنبيهات الأزمات).",
        "للرد على طلبات الدعم الخاصة بك.",
        "لاكتشاف الاحتيال أو الإساءة أو مخالفات قواعد المحاكاة لدينا ومنعها.",
      ],
    },
    {
      icon: UserCheck,
      titleEn: "3. Who Sees Your Data",
      titleAr: "3. من يطّلع على بياناتك",
      contentEn: [
        "Public Data: Your display name, simulation role, and forum posts are visible to all authenticated platform members.",
        "Admin Access: Platform administrators can view all member data for moderation and role management purposes.",
        "Third Parties: We do not sell, rent, or share your personal data with third-party advertisers or commercial entities.",
        "Legal Obligations: We may disclose data when required by Moroccan law (Law 09-08) or a valid legal order.",
      ],
      contentAr: [
        "البيانات العامة: اسمك المعروض ودورك في المحاكاة ومنشورات المنتديات مرئية لجميع أعضاء المنصة المصادق عليهم.",
        "وصول المسؤولين: يمكن لمسؤولي المنصة الاطلاع على جميع بيانات الأعضاء لأغراض الإشراف وإدارة الأدوار.",
        "أطراف ثالثة: لا نبيع أو نؤجر أو نشارك بياناتك الشخصية مع معلنين تجاريين أو جهات تجارية.",
        "الالتزامات القانونية: قد نفصح عن بيانات عند الاقتضاء القانون المغربي (القانون 09-08) أو أمر قانوني سار.",
      ],
    },
    {
      icon: Shield,
      titleEn: "4. Data Security",
      titleAr: "4. أمان البيانات",
      contentEn: [
        "Passwords are hashed using industry-standard cryptographic algorithms. They are never stored or transmitted in plain text.",
        "All data transmission between your browser and our servers uses HTTPS encryption.",
        "Access to production databases is restricted to authorized platform administrators only.",
        "In the event of a data breach affecting your personal information, we will notify affected users within 72 hours.",
      ],
      contentAr: [
        "تُجزَّأ كلمات المرور باستخدام خوارزميات تشفير معيارية. لا تُخزَّن أو تُنقَل أبدًا كنص عادي.",
        "تستخدم جميع نقل البيانات بين متصفحك وخوادمنا تشفير HTTPS.",
        "الوصول إلى قواعد البيانات الإنتاجية مقتصر على مسؤولي المنصة المصرَّح لهم فقط.",
        "في حالة اختراق بيانات يؤثر على معلوماتك الشخصية، سنخطر المستخدمين المتضررين في غضون 72 ساعة.",
      ],
    },
    {
      icon: Globe,
      titleEn: "5. Your Rights (GDPR & Law 09-08)",
      titleAr: "5. حقوقك (GDPR والقانون 09-08)",
      contentEn: [
        "Right of Access: You may request a copy of all personal data we hold about you at any time.",
        "Right of Rectification: You can update your personal information through your profile settings or by contacting support.",
        "Right of Erasure: You may request deletion of your account and all associated data. Simulation posts may be anonymized rather than deleted.",
        "Right to Object: You may object to certain processing of your data by contacting us through the Support page.",
        "Right to Portability: You may request an export of your data in a machine-readable format.",
      ],
      contentAr: [
        "حق الوصول: يمكنك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك في أي وقت.",
        "حق التصحيح: يمكنك تحديث معلوماتك الشخصية من خلال إعدادات ملفك الشخصي أو بالتواصل مع الدعم.",
        "حق المحو: يمكنك طلب حذف حسابك وجميع البيانات المرتبطة به. قد يُجهَّل اسمك على منشورات المحاكاة بدلًا من حذفها.",
        "حق الاعتراض: يمكنك الاعتراض على معالجة معينة لبياناتك بالتواصل معنا عبر صفحة الدعم.",
        "حق النقل: يمكنك طلب تصدير بياناتك بتنسيق قابل للقراءة آليًا.",
      ],
    },
    {
      icon: FileText,
      titleEn: "6. Cookies & Local Storage",
      titleAr: "6. ملفات تعريف الارتباط والتخزين المحلي",
      contentEn: [
        "We use session cookies to keep you logged in securely. These expire after 7 days of inactivity.",
        "Language preference and other UI settings are stored in your browser's local storage for a better user experience.",
        "We do not use third-party advertising or tracking cookies.",
      ],
      contentAr: [
        "نستخدم ملفات تعريف ارتباط الجلسة لإبقائك مسجلًا بأمان. تنتهي صلاحيتها بعد 7 أيام من عدم النشاط.",
        "يتم تخزين تفضيلات اللغة وإعدادات واجهة المستخدم الأخرى في التخزين المحلي لمتصفحك لتحسين تجربة المستخدم.",
        "لا نستخدم ملفات تعريف الارتباط الإعلانية أو التتبعية من أطراف ثالثة.",
      ],
    },
    {
      icon: Mail,
      titleEn: "7. Contact & Data Requests",
      titleAr: "7. التواصل وطلبات البيانات",
      contentEn: [
        "For any privacy-related requests, including data access, correction, or deletion, please use the Support page and select 'Account Help' as the category.",
        "We aim to respond to all data requests within 30 days as required by applicable law.",
      ],
      contentAr: [
        "لأي طلبات متعلقة بالخصوصية، بما في ذلك الوصول إلى البيانات أو تصحيحها أو حذفها، يُرجى استخدام صفحة الدعم واختيار 'مساعدة في الحساب' كفئة.",
        "نهدف إلى الرد على جميع طلبات البيانات في غضون 30 يومًا وفقًا للقانون المعمول به.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      <PageHero
        compact
        eyebrow={t("Privacy Policy", "سياسة الخصوصية")}
        title={t("Your Privacy", "خصوصيتك")}
        highlight={t("Matters", "تهمنا")}
        subtitle={t(
          "We are committed to protecting your personal information and being transparent about what we collect and how we use it.",
          "نلتزم بحماية معلوماتك الشخصية والشفافية بشأن ما نجمعه وكيفية استخدامه."
        )}
      >
        <p className="text-sm text-white/40">
          {t("Last updated: March 2026 : Compliant with GDPR and Moroccan Law 09-08 on personal data protection.",
            "آخر تحديث: مارس 2026 : متوافق مع GDPR والقانون المغربي 09-08 بشأن حماية البيانات الشخصية.")}
        </p>
      </PageHero>

      {/* Commitment Banner */}
      <section className="py-10 px-4 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: Lock, en: "No data sold", ar: "لا بيع للبيانات" },
            { icon: Shield, en: "HTTPS encrypted", ar: "مشفّر بـ HTTPS" },
            { icon: UserCheck, en: "You control your data", ar: "تتحكم في بياناتك" },
            { icon: Globe, en: "GDPR compliant", ar: "متوافق مع GDPR" },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="flex items-center gap-2.5 text-sm font-bold text-primary px-4 py-2 rounded-full bg-card border border-gold/20 shadow-sm hover:border-gold/50 hover:-translate-y-0.5 transition-all duration-300">
                <item.icon className="w-4 h-4 text-gold" />
                {t(item.en, item.ar)}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, i) => (
            <Reveal key={i} delay={0.05}>
              <div className="border border-border/50 rounded-[2rem] overflow-hidden bg-card hover:border-gold/30 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 group">
                <div className="flex items-center gap-4 p-6 md:p-7 border-b border-border/50 bg-secondary/10">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
                    <section.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-display font-black text-foreground">
                    {t(section.titleEn, section.titleAr)}
                  </h2>
                </div>
                <ul className="divide-y divide-border/40">
                  {section.contentEn.map((_, j) => (
                    <li key={j} className="px-6 md:px-7 py-5 flex items-start gap-4 text-sm text-muted-foreground leading-relaxed hover:bg-gold/[0.04] transition-colors">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gold mt-2" />
                      {t(section.contentEn[j], section.contentAr[j])}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-10 px-4 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          {t(
            "This Privacy Policy applies to all users of the Youth Capital platform. By registering and using the platform, you agree to the collection and use of information as described herein.",
            "تنطبق سياسة الخصوصية هذه على جميع مستخدمي منصة Youth Capital. بالتسجيل واستخدام المنصة، فإنك توافق على جمع المعلومات واستخدامها على النحو الموضح هنا."
          )}
        </p>
      </section>

    </div>
  );
}
