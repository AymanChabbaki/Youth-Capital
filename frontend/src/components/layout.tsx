import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui-custom";
import { 
  Globe, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Home as HomeIcon, 
  Vote as VoteIcon, 
  Users as UsersIcon, 
  LayoutDashboard,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Navbar() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { lang, setLang, t, isAr } = useLanguage();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "glass-nav py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/youth_capital_logo_light.svg" 
              alt="Youth Capital" 
              className="h-10 w-auto group-hover:scale-105 transition-transform" 
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => !l.protected || isAuthenticated).map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-semibold transition-all hover:text-accent relative py-1 ${
                  location === link.href ? "text-accent" : "text-muted-foreground/80"
                }`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-white/5 px-2 py-1.5 rounded-lg border border-white/10"
            >
              <Globe className="w-3.5 h-3.5" />
              {isAr ? "EN" : "عربي"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
                  <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 hover:bg-primary/5 bg-white/5">
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span className="hidden lg:inline">{isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}</span>
                  </Button>
                </Link>
                
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
                   <Link href="/profile">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:ring-2 hover:ring-accent transition-all">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-[10px] sm:text-xs font-black">
                          {user?.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex">
                  <LogOut className="w-4.5 h-4.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="font-bold">{t("Log in", "دخول")}</Button>
                </Link>
                <Link href="/apply">
                  <Button variant="gold" size="sm" className="h-9 px-4 font-black shadow-lg shadow-gold/20">{t("Join", "انضم")}</Button>
                </Link>
              </div>
            )}

            {/* Mobile Sheet Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? "left" : "right"} className="w-[85vw] sm:w-[350px] p-0 border-none bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col h-full bg-gradient-to-b from-primary/10 via-transparent to-transparent">
                  <SheetHeader className="p-6 pb-2 border-b border-white/5">
                    <SheetTitle className="text-start">
                      <img src="/youth_capital_logo_light.svg" alt="Logo" className="h-8 w-auto" />
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto py-6 px-4">
                    <div className="space-y-1">
                      {isAuthenticated && (
                        <Link href={isAdmin ? "/admin" : "/dashboard"}>
                          <div className={`flex items-center gap-4 px-4 py-4 mb-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/5`}>
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-black text-lg">{isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}</span>
                          </div>
                        </Link>
                      )}
                      
                      {navLinks.filter(l => !l.protected || isAuthenticated).map(link => (
                        <Link key={link.href} href={link.href}>
                          <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                            location === link.href ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground"
                          }`}>
                            <span className="font-bold text-lg">{link.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <button 
                        onClick={toggleLang}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-primary" />
                          <span className="font-bold">{isAr ? "English" : "العربية"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-primary">{isAr ? "Switch" : "تبديل"}</span>
                      </button>

                      {isAuthenticated && (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-4 p-4 h-auto text-destructive hover:bg-destructive/5 rounded-2xl" 
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5" />
                          <span className="font-bold">{t("Logout", "تسجيل خروج")}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

  const bottomLinks = [
    { href: "/", label: t("Home", "الرئيسية"), icon: HomeIcon },
    { href: "/polls", label: t("Polls", "تصويتات"), icon: VoteIcon },
    { href: "/community", label: t("Social", "مجتمع"), icon: UsersIcon, protected: true },
    { href: isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/login", label: t("Account", "حسابي"), icon: UserIcon },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-around p-2">
          {bottomLinks.map(link => {
            const isActive = location === link.href || (link.href === "/dashboard" && location.startsWith("/admin"));
            const Icon = link.icon;
            
            return (
              <Link key={link.href} href={link.href}>
                <div className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/5"
                }`}>
                  <Icon className={`w-5.5 h-5.5 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"}`} />
                  <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{link.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-dot"
                      className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-navy-dark text-white pt-16 pb-24 md:pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-6 text-center md:text-start">
              <Link href="/" className="inline-block group">
                <img 
                  src="/youth_capital_logo_dark.svg" 
                  alt="Youth Capital" 
                  className="h-10 w-auto group-hover:opacity-80 transition-opacity" 
                />
              </Link>
            </div>
            <p className="text-white/70 max-w-sm text-balance text-center md:text-start mx-auto md:mx-0">
              {t(
                "A digital civic governance simulation platform empowering the next generation of leaders.",
                "منصة محاكاة رقمية للحوكمة المدنية لتمكين الجيل القادم من القادة."
              )}
            </p>
          </div>
          <div className="hidden md:block">
            <h4 className="font-bold text-gold mb-4">{t("Platform", "المنصة")}</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">{t("About Us", "من نحن")}</Link></li>
              <li><Link href="/press" className="text-white/70 hover:text-white transition-colors">{t("Press & News", "الأخبار والصحافة")}</Link></li>
              <li><Link href="/events" className="text-white/70 hover:text-white transition-colors">{t("Events", "الفعاليات")}</Link></li>
            </ul>
          </div>
          <div className="hidden md:block">
            <h4 className="font-bold text-gold mb-4">{t("Support", "الدعم")}</h4>
            <ul className="space-y-3">
              <li><Link href="/support" className="text-white/70 hover:text-white transition-colors">{t("Help Center", "مركز المساعدة")}</Link></li>
              <li><Link href="/rules" className="text-white/70 hover:text-white transition-colors">{t("Simulation Rules", "قواعد المحاكاة")}</Link></li>
              <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">{t("Privacy Policy", "سياسة الخصوصية")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-white/50 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
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
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-accent-foreground overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
