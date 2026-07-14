import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import {
  Globe,
  ArrowRight,
  ArrowUpRight,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Sparkles,
  Vote,
  Link as LinkIcon,
  Check,
} from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={`fill-current ${className || ""}`} viewBox="0 0 448 512">
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
  );
}

export default function Linktree() {
  const { t, isAr, lang, setLang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyPageLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable — ignore */ }
  };

  const socials = [
    {
      title: t("WhatsApp Community", "مجتمع الواتساب"),
      subtitle: t("Debates & crisis votes happen here", "النقاشات وتصويتات الأزمات تحدث هنا"),
      href: "https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu",
      icon: <img src="/images/whatsapp.png" alt="" className="w-6 h-6" />,
      accent: "#25D366",
      featured: true,
    },
    {
      title: "Instagram",
      subtitle: "@youthcapitalhq",
      href: "https://www.instagram.com/youthcapitalhq",
      icon: <Instagram className="w-5 h-5" />,
      accent: "#E1306C",
    },
    {
      title: "TikTok",
      subtitle: "@youthcapitalhq",
      href: "https://www.tiktok.com/@youthcapitalhq",
      icon: <TikTokIcon className="w-5 h-5" />,
      accent: "#00F2EA",
    },
    {
      title: "X / Twitter",
      subtitle: "@youthcapitalhq",
      href: "https://x.com/youthcapitalhq",
      icon: <Twitter className="w-5 h-5" />,
      accent: "#9ca3af",
    },
    {
      title: "YouTube",
      subtitle: "@youthcapitalhq",
      href: "https://www.youtube.com/@youthcapitalhq",
      icon: <Youtube className="w-5 h-5" />,
      accent: "#FF0000",
    },
    {
      title: "Facebook",
      subtitle: "youthcapital",
      href: "https://www.facebook.com/youthcapital",
      icon: <Facebook className="w-5 h-5" />,
      accent: "#1877F2",
    },
    {
      title: "LinkedIn",
      subtitle: "youthcapitalhq",
      href: "https://www.linkedin.com/company/youthcapitalhq",
      icon: <Linkedin className="w-5 h-5" />,
      accent: "#0A66C2",
    },
  ];

  const siteLinks = [
    {
      title: t("Visit the Platform", "زر المنصة"),
      subtitle: t("Explore the full simulation", "استكشف المحاكاة الكاملة"),
      href: "/",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: t("Apply to Join", "قدّم طلبك"),
      subtitle: t("Claim your seat in the simulation", "احجز مقعدك في المحاكاة"),
      href: "/apply",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      title: t("Active Civic Polls", "الاستطلاعات النشطة"),
      subtitle: t("Vote on live consultations", "صوّت في الاستشارات المباشرة"),
      href: "/polls",
      icon: <Vote className="w-5 h-5" />,
    },
  ];

  const item = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="min-h-screen w-full bg-navy-dark relative overflow-hidden flex flex-col items-center px-4 py-12 md:py-16">
      {/* Texture + glows + particles */}
      <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-32 w-[480px] h-[480px] bg-primary/30 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-48 -right-32 w-[440px] h-[440px] bg-gold/10 blur-[130px] rounded-full pointer-events-none" />
      {[
        { top: "12%", left: "10%", size: 5, delay: 0 },
        { top: "28%", left: "88%", size: 4, delay: 1.2 },
        { top: "70%", left: "6%", size: 6, delay: 2.2 },
        { top: "82%", left: "90%", size: 4, delay: 0.8 },
      ].map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/50 blur-[1px] pointer-events-none"
          style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [0, -28, 0], opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 7 + i, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Top utility row */}
      <div className="relative z-10 w-full max-w-md flex justify-between items-center mb-10">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="flex items-center gap-2 text-xs font-black text-white/50 hover:text-gold px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-gold/40 transition-all duration-300"
        >
          <Globe className="w-3.5 h-3.5" />
          {isAr ? "EN" : "عربي"}
        </button>
        <button
          onClick={copyPageLink}
          className="flex items-center gap-2 text-xs font-black text-white/50 hover:text-gold px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-gold/40 transition-all duration-300"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
          {copied ? t("Copied!", "تم النسخ!") : t("Copy Link", "نسخ الرابط")}
        </button>
      </div>

      {/* Identity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center mb-10"
      >
        <div className="relative mb-6">
          <motion.span
            animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.06, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-gold/40 blur-lg"
          />
          <div className="relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-gold via-gold-pale to-gold shadow-2xl shadow-gold/25">
            <div className="w-full h-full rounded-full bg-navy-dark flex items-center justify-center overflow-hidden">
              <img src="/youth_capital_logo_dark.svg" alt="Youth Capital" className="w-14 h-14 object-contain" />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-navy-dark" title={t("Simulation Active", "المحاكاة نشطة")} />
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-black text-white mb-2">
          Youth <span className="text-gradient-gold">Capital</span>
        </h1>
        <p className="text-white/50 text-sm md:text-base max-w-xs leading-relaxed">
          {t("Morocco's digital governance simulation for the next generation of leaders 🇲🇦", "محاكاة الحوكمة الرقمية المغربية للجيل القادم من القادة 🇲🇦")}
        </p>
      </motion.div>

      {/* Links */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        className="relative z-10 w-full max-w-md space-y-3"
      >
        {/* Socials */}
        {socials.map((s) => (
          <motion.a
            key={s.title}
            variants={item}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group flex items-center gap-4 w-full p-4 rounded-3xl border backdrop-blur-md transition-colors duration-300 ${
              s.featured
                ? "bg-[#25D366]/10 border-[#25D366]/40 hover:border-[#25D366]"
                : "bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/[0.08]"
            }`}
          >
            <span
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ backgroundColor: `${s.accent}1f`, color: s.accent }}
            >
              {s.icon}
            </span>
            <span className="flex-1 text-start min-w-0">
              <span className="block font-display font-bold text-white text-sm md:text-base leading-tight">{s.title}</span>
              <span className="block text-white/40 text-xs truncate">{s.subtitle}</span>
            </span>
            <ArrowUpRight className={`w-4 h-4 text-white/30 group-hover:text-gold transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 ${isAr ? "-scale-x-100 group-hover:-translate-x-0.5" : ""}`} />
          </motion.a>
        ))}

        {/* Divider */}
        <motion.div variants={item} className="flex items-center gap-4 py-3">
          <span className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-black text-gold/70 uppercase tracking-[0.3em]">{t("The Platform", "المنصة")}</span>
          <span className="flex-1 h-px bg-white/10" />
        </motion.div>

        {/* Website links */}
        {siteLinks.map((s, i) => (
          <motion.div key={s.href} variants={item}>
            <Link href={s.href}>
              <motion.span
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center gap-4 w-full p-4 rounded-3xl cursor-pointer transition-colors duration-300 ${
                  i === 0
                    ? "bg-gradient-to-r from-gold to-gold-pale text-navy-dark shadow-xl shadow-gold/25 border border-transparent"
                    : "bg-white/5 border border-white/10 hover:border-gold/50 hover:bg-white/[0.08] text-white"
                }`}
              >
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  i === 0 ? "bg-navy-dark/15 text-navy-dark" : "bg-gold/15 text-gold"
                }`}>
                  {s.icon}
                </span>
                <span className="flex-1 text-start min-w-0">
                  <span className="block font-display font-black text-sm md:text-base leading-tight">{s.title}</span>
                  <span className={`block text-xs truncate ${i === 0 ? "text-navy-dark/60" : "text-white/40"}`}>{s.subtitle}</span>
                </span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0 ${i === 0 ? "text-navy-dark/70" : "text-white/30 group-hover:text-gold"} ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </motion.span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 mt-12 text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]"
      >
        © {new Date().getFullYear()} Youth Capital
      </motion.p>
    </div>
  );
}
