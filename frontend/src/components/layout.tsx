import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui-custom";
import { Globe, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function Navbar() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { lang, setLang, t, isAr } = useLanguage();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const navLinks = [
    { href: "/", label: t("Home", "الرئيسية") },
    { href: "/polls", label: t("Polls", "تصويتات") },
    { href: "/community", label: t("Community", "المجتمع"), protected: true },
    { href: "/press", label: t("Press", "الأخبار") },
    { href: "/events", label: t("Events", "الفعاليات") },
    { href: "/support", label: t("Support", "الدعم") },
  ];

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries();
        window.location.href = "/";
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/youth_capital_logo_light.svg" 
              alt="Youth Capital" 
              className="h-12 w-auto group-hover:scale-105 transition-transform" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.filter(l => !l.protected || isAuthenticated).map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-accent ${
                  location === link.href ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              {isAr ? "EN" : "عربي"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <UserIcon className="w-4 h-4 text-primary" />
                    {isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-slate-100">
                    {user?.avatarUrl ? (
                      <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200">
                        <img src={user.avatarUrl} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                        {user?.fullName.charAt(0)}
                      </div>
                    )}
                    {t("Profile", "الملف الشخصي")}
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title={t("Logout", "تسجيل خروج")}>
                  <LogOut className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">{t("Log in", "تسجيل الدخول")}</Button>
                </Link>
                <Link href="/apply">
                  <Button variant="gold" size="sm">{t("Apply Now", "قدّم طلبك")}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.filter(l => !l.protected || isAuthenticated).map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-semibold text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px w-full bg-border my-2" />
              <button 
                onClick={toggleLang}
                className="flex items-center gap-2 text-lg font-medium text-foreground text-left"
              >
                <Globe className="w-5 h-5" />
                {isAr ? "Switch to English" : "التبديل للعربية"}
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      {isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}
                    </Button>
                  </Link>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      {user?.avatarUrl ? (
                        <div className="w-6 h-6 rounded-lg overflow-hidden border border-slate-200">
                          <img src={user.avatarUrl} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                           {user?.fullName.charAt(0)}
                        </div>
                      )}
                      {t("Profile", "الملف الشخصي")}
                    </Button>
                  </Link>
                  <Button variant="danger" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    {t("Logout", "تسجيل خروج")}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t("Log in", "تسجيل الدخول")}</Button>
                  </Link>
                  <Link href="/apply" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="gold" className="w-full">{t("Apply Now", "قدّم طلبك")}</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-navy-dark text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6">
              <Link href="/" className="inline-block group">
                <img 
                  src="/youth_capital_logo_dark.svg" 
                  alt="Youth Capital" 
                  className="h-10 w-auto group-hover:opacity-80 transition-opacity" 
                />
              </Link>
            </div>
            <p className="text-white/70 max-w-sm text-balance">
              {t(
                "A digital civic governance simulation platform empowering the next generation of leaders.",
                "منصة محاكاة رقمية للحوكمة المدنية لتمكين الجيل القادم من القادة."
              )}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gold mb-4">{t("Platform", "المنصة")}</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">{t("About Us", "من نحن")}</Link></li>
              <li><Link href="/press" className="text-white/70 hover:text-white transition-colors">{t("Press & News", "الأخبار والصحافة")}</Link></li>
              <li><Link href="/events" className="text-white/70 hover:text-white transition-colors">{t("Events", "الفعاليات")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gold mb-4">{t("Support", "الدعم")}</h4>
            <ul className="space-y-3">
              <li><Link href="/support" className="text-white/70 hover:text-white transition-colors">{t("Help Center", "مركز المساعدة")}</Link></li>
              <li><Link href="/rules" className="text-white/70 hover:text-white transition-colors">{t("Simulation Rules", "قواعد المحاكاة")}</Link></li>
              <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">{t("Privacy Policy", "سياسة الخصوصية")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Youth CapitalCore. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</p>
          <div className="flex gap-4">
            <span className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer" />
            <span className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer" />
            <span className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-accent-foreground">
      <Navbar />
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={useLocation()[0]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
