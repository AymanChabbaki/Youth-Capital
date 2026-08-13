import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui-custom";
import { useLanguage } from "@/hooks/use-language";
import { Home, Compass, ArrowRight } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";

export default function NotFound() {
  const { t, isAr } = useLanguage();
  useSeo({
    title: t("Page Not Found | Youth Capital", "الصفحة غير موجودة | يوث كابيتال"),
    description: t("The page you're looking for doesn't exist.", "الصفحة التي تبحث عنها غير موجودة."),
    path: typeof window !== "undefined" ? window.location.pathname : "/404",
    noindex: true,
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-navy-dark relative overflow-hidden px-4 py-24">
      {/* Texture + glows */}
      <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/25 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 -right-32 w-[440px] h-[440px] bg-gold/10 blur-[130px] rounded-full" />

      <div className="relative z-10 text-center flex flex-col items-center max-w-2xl">
        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative select-none"
        >
          <span className="text-[10rem] sm:text-[14rem] md:text-[18rem] font-display font-black leading-none text-gradient-gold">
            404
          </span>
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 sm:top-2 sm:right-2 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
          >
            <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-2xl sm:text-4xl font-display font-black text-white mt-4 mb-4 text-balance"
        >
          {t("This Chamber Doesn't Exist", "هذه الغرفة غير موجودة")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-white/60 text-base sm:text-lg mb-10 max-w-md leading-relaxed"
        >
          {t(
            "The page you're looking for was moved, dissolved by parliamentary decree, or never legislated into existence.",
            "الصفحة التي تبحث عنها تم نقلها، أو حُلّت بمرسوم برلماني، أو لم يتم تشريع وجودها أساساً."
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/">
            <Button variant="gold" size="lg" className="px-10 group w-full sm:w-auto">
              <Home className="w-5 h-5 me-2" />
              {t("Return to the Capital", "العودة إلى العاصمة")}
            </Button>
          </Link>
          <Link href="/support">
            <Button variant="outline" size="lg" className="px-8 w-full sm:w-auto text-white border-white/20 hover:bg-white/10 group">
              {t("Get Help", "احصل على مساعدة")}
              <ArrowRight className={`w-5 h-5 ms-2 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
