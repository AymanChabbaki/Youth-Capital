import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button, DiscordIcon } from "@/components/ui-custom";
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
  Settings,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Send,
  MessageCircle,
  Youtube,
  ArrowRight,
  Sun,
  Moon,
  Search as SearchIcon,
  Bell,
  AlertTriangle,
  Vote as VoteBellIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { CommandPalette } from "@/components/command-palette";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLogout, useGetCrises, useGetPolls } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function ThemeToggle({ variant = "navbar" }: { variant?: "navbar" | "sheet" }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const icon = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex"
      >
        {isDark ? <Moon className="w-4 h-4 text-gold" /> : <Sun className="w-4 h-4 text-gold" />}
      </motion.span>
    </AnimatePresence>
  );

  if (variant === "sheet") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/40 hover:bg-white/10 transition-all group"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold">{isDark ? t("Dark Mode", "الوضع الداكن") : t("Light Mode", "الوضع الفاتح")}</span>
        </div>
        <span className="text-xs text-white/40 group-hover:text-gold transition-colors">{t("Switch", "تبديل")}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-secondary/40 border border-border/50 hover:border-gold/40 hover:bg-gold/10 transition-all duration-300"
      title={isDark ? t("Switch to Light Mode", "التبديل إلى الوضع الفاتح") : t("Switch to Dark Mode", "التبديل إلى الوضع الداكن")}
      aria-label={t("Toggle theme", "تبديل المظهر")}
    >
      {icon}
    </button>
  );
}

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { t, isAr } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: crisesData } = useGetCrises({ query: { enabled: isAuthenticated } } as any);
  const { data: pollsData } = useGetPolls({ query: { enabled: isAuthenticated } } as any);
  const [lastSeen, setLastSeen] = useState<number>(() => Number(localStorage.getItem("yc-notif-seen") || 0));

  const notifications = useMemo(() => {
    const crises = (crisesData?.crises || [])
      .filter((c: any) => c.isActive)
      .map((c: any) => ({
        id: `c-${c.id}`,
        type: "crisis" as const,
        title: isAr ? c.titleAr : c.title,
        href: "/community",
        at: new Date(c.createdAt || Date.now()).getTime(),
      }));
    const polls = (pollsData?.polls || [])
      .filter((p: any) => p.status === "active")
      .map((p: any) => ({
        id: `p-${p.id}`,
        type: "poll" as const,
        title: isAr ? p.titleAr : p.title,
        href: `/polls/${p.id}`,
        at: new Date(p.createdAt || Date.now()).getTime(),
      }));
    return [...crises, ...polls].sort((a, b) => b.at - a.at).slice(0, 8);
  }, [crisesData, pollsData, isAr]);

  const unread = notifications.filter(n => n.at > lastSeen).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const now = Date.now();
      setLastSeen(now);
      localStorage.setItem("yc-notif-seen", String(now));
    }
    setOpen(o => !o);
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={toggle}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/40 border border-border/50 hover:border-gold/40 hover:bg-gold/10 transition-all duration-300 relative"
        aria-label={t("Notifications", "الإشعارات")}
      >
        <Bell className="w-4 h-4 text-gold" />
        {unread > 0 && (
          <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[9px] font-black flex items-center justify-center border-2 border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-12 w-80 max-w-[85vw] rounded-3xl bg-card border border-border/60 shadow-2xl shadow-navy/15 overflow-hidden z-50"
          >
            <div className="p-4 bg-navy-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-gold opacity-25" />
              <h4 className="relative font-display font-bold text-sm text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-gold" />
                {t("Simulation Alerts", "تنبيهات المحاكاة")}
              </h4>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t("All quiet in the capital.", "كل شيء هادئ في العاصمة.")}
                </p>
              ) : (
                notifications.map(n => (
                  <Link key={n.id} href={n.href} onClick={() => setOpen(false)}>
                    <div className="p-4 flex items-start gap-3 hover:bg-gold/[0.05] transition-colors cursor-pointer">
                      <span className={`p-2 rounded-xl shrink-0 ${n.type === "crisis" ? "bg-destructive/10" : "bg-gold/10"}`}>
                        {n.type === "crisis"
                          ? <AlertTriangle className="w-4 h-4 text-destructive" />
                          : <VoteBellIcon className="w-4 h-4 text-gold" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
                          {n.type === "crisis" ? t("Live Crisis", "أزمة نشطة") : t("Active Poll", "تصويت نشط")}
                        </p>
                        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{n.title}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { lang, setLang, t, isAr } = useLanguage();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { mutate: logout } = useLogout();
  const queryClient = useQueryClient();
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  const navLinks = [
    { href: "/", label: t("Home", "الرئيسية") },
    { href: "/about", label: t("About Us", "من نحن") },
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

  const visibleLinks = navLinks.filter(l => !l.protected || isAuthenticated);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-background/75 backdrop-blur-2xl border-b border-gold/15 shadow-lg shadow-navy/10 py-1.5"
          : "bg-background border-b border-border/30 py-2.5"
      }`}
    >
      {/* Gold scroll progress bar */}
      <motion.div
        style={{ scaleX: progressX }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold via-gold-pale to-gold origin-left rtl:origin-right z-10"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">

          {/* Logo (swaps with theme) */}
          <Link href="/" className="flex items-center group relative shrink-0 z-10">
            <img
              src="/youth_capital_logo_light.svg"
              alt="Youth Capital"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 dark:hidden"
            />
            <img
              src="/youth_capital_logo_dark.svg"
              alt="Youth Capital"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 hidden dark:block"
            />
          </Link>

          {/* Desktop Nav — glass pill rail with animated active indicator */}
          <nav className="hidden lg:flex items-center gap-0.5 p-1.5 rounded-full bg-secondary/40 border border-border/50 backdrop-blur-md absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {visibleLinks.map(link => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 lg:px-4 py-2 rounded-full text-[13px] font-bold transition-colors duration-300 whitespace-nowrap ${
                    isActive ? "text-navy-dark" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-gold-pale shadow-md shadow-gold/30"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-secondary/40 border border-border/50 hover:border-gold/40 text-muted-foreground hover:text-foreground transition-all duration-300 text-xs font-bold"
              title={t("Search (Ctrl+K)", "بحث (Ctrl+K)")}
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <kbd className="px-1.5 py-0.5 rounded-md bg-background/80 border border-border/50 text-[10px] font-black text-muted-foreground">⌘K</kbd>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationBell />

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-gold px-3.5 py-2 rounded-full bg-secondary/40 border border-border/50 hover:border-gold/40 transition-all duration-300 group"
              title={t("Switch Language", "تبديل اللغة")}
            >
              <Globe className="w-3.5 h-3.5 group-hover:rotate-[20deg] transition-transform duration-300" />
              {isAr ? "EN" : "عربي"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-dark text-white text-xs font-black hover:shadow-lg hover:shadow-navy/20 hover:-translate-y-0.5 transition-all duration-300 border border-gold/20">
                    <LayoutDashboard className="w-4 h-4 text-gold" />
                    <span className="hidden lg:inline">{isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}</span>
                  </button>
                </Link>

                <Link href="/profile">
                  <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-gold via-gold-pale to-gold cursor-pointer hover:shadow-lg hover:shadow-gold/30 hover:scale-105 transition-all duration-300">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-background">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-navy-dark flex items-center justify-center text-gold text-xs font-black">
                          {user?.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                </Link>

                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex rounded-full" title={t("Logout", "تسجيل خروج")}>
                  <LogOut className="w-4.5 h-4.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="font-bold rounded-full hover:text-gold">{t("Log in", "دخول")}</Button>
                </Link>
                <Link href="/apply">
                  <Button variant="gold" size="sm" className="h-10 px-5 font-black shadow-lg shadow-gold/25 rounded-full group">
                    {t("Join", "انضم")}
                    <ArrowRight className={`w-4 h-4 ms-1.5 transition-transform group-hover:translate-x-0.5 ${isAr ? "rotate-180 group-hover:-translate-x-0.5" : ""}`} />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Sheet Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full border border-border/50 bg-secondary/40">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? "left" : "right"} className="w-[85vw] sm:w-[360px] p-0 border-none bg-navy-dark text-white">
                <div className="flex flex-col h-full relative overflow-hidden">
                  {/* Texture + glows */}
                  <div className="absolute inset-0 bg-grid-gold opacity-25 pointer-events-none" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 blur-[90px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/25 blur-[90px] rounded-full pointer-events-none" />

                  <SheetHeader className="p-6 pb-4 border-b border-white/10 relative z-10">
                    <SheetTitle className="text-start">
                      <img src="/youth_capital_logo_dark.svg" alt="Logo" className="h-9 w-auto" />
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto py-6 px-5 relative z-10">
                    {isAuthenticated && (
                      <Link href={isAdmin ? "/admin" : "/dashboard"}>
                        <motion.div
                          initial={{ opacity: 0, x: isAr ? -24 : 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center gap-4 px-5 py-4 mb-6 rounded-2xl bg-gold text-navy-dark shadow-lg shadow-gold/25"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-black text-lg">{isAdmin ? t("Admin", "الإدارة") : t("Dashboard", "لوحة التحكم")}</span>
                        </motion.div>
                      </Link>
                    )}

                    <div className="space-y-1">
                      {visibleLinks.map((link, idx) => {
                        const isActive = location === link.href;
                        return (
                          <Link key={link.href} href={link.href}>
                            <motion.div
                              initial={{ opacity: 0, x: isAr ? -28 : 28 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 + idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                                isActive
                                  ? "bg-white/10 border border-gold/40 text-white"
                                  : "hover:bg-white/5 text-white/60 hover:text-white border border-transparent"
                              }`}
                            >
                              <span className={`font-display font-black text-sm w-8 ${isActive ? "text-gold" : "text-white/25 group-hover:text-gold/70"} transition-colors`}>
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span className="font-bold text-lg flex-1">{link.label}</span>
                              {isActive && <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>

                    {!isAuthenticated && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="mt-6"
                      >
                        <Link href="/apply">
                          <Button variant="gold" size="lg" className="w-full rounded-2xl font-black shadow-xl shadow-gold/20">
                            {t("Join the Simulation", "انضم إلى المحاكاة")}
                          </Button>
                        </Link>
                      </motion.div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                      {/* Social Icons */}
                      <div className="flex flex-col items-center gap-2 py-1">
                        <div className="flex justify-center gap-2 flex-wrap">
                          {[
                            { title: "Twitter / X", href: "https://x.com/youthcapitalhq", icon: <Twitter className="w-[18px] h-[18px]" /> },
                            { title: "Facebook", href: "https://www.facebook.com/youthcapital", icon: <Facebook className="w-[18px] h-[18px]" /> },
                            { title: "Instagram", href: "https://www.instagram.com/youthcapitalhq", icon: <Instagram className="w-[18px] h-[18px]" /> },
                            { title: "LinkedIn", href: "https://www.linkedin.com/company/youthcapitalhq", icon: <Linkedin className="w-[18px] h-[18px]" /> },
                            {
                              title: "TikTok",
                              href: "https://www.tiktok.com/@youthcapitalhq",
                              icon: (
                                <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 448 512">
                                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                                </svg>
                              ),
                            },
                            { title: "YouTube", href: "https://www.youtube.com/@youthcapitalhq", icon: <Youtube className="w-[18px] h-[18px]" /> },
                            { title: "Discord", href: "https://discord.gg/K87zstYzYE", icon: <DiscordIcon className="w-[18px] h-[18px]" /> },
                          ].map(s => (
                            <a
                              key={s.title}
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={s.title}
                              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-gold hover:border-gold/50 hover:bg-gold/10 flex items-center justify-center transition-all duration-300"
                            >
                              {s.icon}
                            </a>
                          ))}
                        </div>
                        <span className="text-[9px] font-black tracking-[0.25em] text-white/30 uppercase select-none leading-none">{t("Follow Us", "تابعنا")}</span>
                      </div>

                      <ThemeToggle variant="sheet" />

                      <button
                        onClick={toggleLang}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/40 hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gold" />
                          <span className="font-bold">{isAr ? "English" : "العربية"}</span>
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-gold transition-colors">{isAr ? "Switch" : "تبديل"}</span>
                      </button>

                      {isAuthenticated && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-4 p-4 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive rounded-2xl border border-transparent hover:border-destructive/30"
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-2xl border-t border-white/10 rounded-t-[1.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex items-center justify-around p-2 pb-4">
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
  );
}

function Footer() {
  const { t, isAr } = useLanguage();

  const socials = [
    { title: "Twitter / X", href: "https://x.com/youthcapitalhq", icon: <Twitter className="w-[18px] h-[18px]" /> },
    { title: "Facebook", href: "https://www.facebook.com/youthcapital", icon: <Facebook className="w-[18px] h-[18px]" /> },
    { title: "Instagram", href: "https://www.instagram.com/youthcapitalhq", icon: <Instagram className="w-[18px] h-[18px]" /> },
    { title: "LinkedIn", href: "https://www.linkedin.com/company/youthcapitalhq", icon: <Linkedin className="w-[18px] h-[18px]" /> },
    {
      title: "TikTok",
      href: "https://www.tiktok.com/@youthcapitalhq",
      icon: (
        <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 448 512">
          <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
        </svg>
      ),
    },
    { title: "YouTube", href: "https://www.youtube.com/@youthcapitalhq", icon: <Youtube className="w-[18px] h-[18px]" /> },
    { title: "Discord", href: "https://discord.gg/K87zstYzYE", icon: <DiscordIcon className="w-[18px] h-[18px]" /> },
  ];

  const columns = [
    {
      title: t("Platform", "المنصة"),
      links: [
        { href: "/about", label: t("About Us", "من نحن") },
        { href: "/press", label: t("Press & News", "الأخبار والصحافة") },
        { href: "/events", label: t("Events", "الفعاليات") },
        { href: "/polls", label: t("Civic Polls", "الاستطلاعات المدنية") },
      ],
    },
    {
      title: t("Support", "الدعم"),
      links: [
        { href: "/support", label: t("Help Center", "مركز المساعدة") },
        { href: "/rules", label: t("Simulation Rules", "قواعد المحاكاة") },
        { href: "/privacy", label: t("Privacy Policy", "سياسة الخصوصية") },
      ],
    },
  ];

  return (
    <footer className="relative bg-navy-dark text-white pt-0 pb-28 md:pb-10 border-t border-white/10 overflow-hidden">
      {/* Texture + ambient glows */}
      <div className="absolute inset-0 bg-grid-gold opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute -top-32 left-1/4 w-[500px] h-72 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 right-0 w-[420px] h-[420px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA Band */}
        <div className="py-14 md:py-20 border-b border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-start">
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-5xl font-display font-black leading-tight mb-3"
            >
              {t("Ready to Govern", "مستعد لحكم")}{" "}
              <span className="text-gradient-gold">{t("the Future?", "المستقبل؟")}</span>
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-white/50 text-base md:text-lg max-w-xl"
            >
              {t("Claim your seat in Morocco's boldest youth governance simulation.", "احجز مقعدك في أجرأ محاكاة للحوكمة الشبابية في المغرب.")}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="shrink-0"
          >
            <Link href="/apply">
              <Button variant="gold" size="lg" className="rounded-2xl px-10 h-16 text-lg shadow-2xl shadow-gold/25 group">
                {t("Apply Now", "قدّم طلبك الآن")}
                <ArrowRight className={`ms-2 w-5 h-5 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-14 md:py-16">
          {/* Brand Column */}
          <div className="md:col-span-5 text-center md:text-start">
            <Link href="/" className="inline-block group mb-6">
              <img
                src="/youth_capital_logo_dark.svg"
                alt="Youth Capital"
                className="h-11 w-auto group-hover:opacity-80 group-hover:scale-105 transition-all duration-300"
              />
            </Link>
            <p className="text-white/60 max-w-sm text-balance mx-auto md:mx-0 leading-relaxed mb-8">
              {t(
                "A digital civic governance simulation platform empowering the next generation of leaders.",
                "منصة محاكاة رقمية للحوكمة المدنية لتمكين الجيل القادم من القادة."
              )}
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              {socials.map((s) => (
                <a
                  key={s.title}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.title}
                  className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-gold hover:border-gold/50 hover:bg-gold/10 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-gold/20 flex items-center justify-center transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2 text-center md:text-start">
              <h4 className="font-display font-bold text-gold mb-5 uppercase tracking-[0.15em] text-sm flex items-center justify-center md:justify-start gap-2">
                <span className="hidden md:block w-4 h-px bg-gold/50" />
                {col.title}
              </h4>
              <ul className="space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/60 hover:text-gold transition-colors animated-underline text-sm font-medium">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Community Card */}
          <div className="md:col-span-3">
            <div className="p-6 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#25D366]/40 transition-colors duration-300 group text-center md:text-start">
              <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/15 flex items-center justify-center mb-4 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300">
                <DiscordIcon className="w-6 h-6 text-[#5865F2]" />
              </div>
              <h4 className="font-display font-bold text-white mb-2">{t("Live Community", "المجتمع المباشر")}</h4>
              <p className="text-white/50 text-xs leading-relaxed mb-4">
                {t("Debates, crisis votes, and coordination happen on Discord in real time.", "النقاشات وتصويتات الأزمات والتنسيق تحدث على ديسكورد في الوقت الفعلي.")}
              </p>
              <a
                href="https://discord.gg/K87zstYzYE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#5865F2] text-xs font-black uppercase tracking-widest hover:gap-3 transition-all"
              >
                {t("Join Now", "انضم الآن")}
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-white/40 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Youth Capital. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</p>
          <p className="flex items-center gap-1.5 font-bold uppercase tracking-[0.2em] text-[10px]">
            {t("Made in Morocco", "صنع في المغرب")}
            <span className="text-gold">🇲🇦</span>
          </p>
        </div>
      </div>

      {/* Giant Watermark */}
      <div className="relative z-0 mt-10 -mb-6 md:-mb-10 overflow-hidden select-none pointer-events-none" dir="ltr">
        <p className="text-center font-display font-black uppercase text-[13vw] leading-[0.75] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/[0.06] to-transparent whitespace-nowrap">
          Youth Capital
        </p>
      </div>
    </footer>
  );
}

function PoliticalHelperChatbot() {
  const { t, isAr } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isBotHovered, setIsBotHovered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);

  // Pop the greeting bubble shortly after load, hide it again after a while
  useEffect(() => {
    const showTimer = setTimeout(() => setShowGreeting(true), 2500);
    const hideTimer = setTimeout(() => setShowGreeting(false), 14000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: isAr
        ? "مرحباً! أنا مستشارك ومساعدك السياسي هنا في منصة عاصمة الشباب المغربي. كيف يمكنني إرشادك اليوم بشأن مناقشة السياسات، القوانين، الأزمات، أو التصويت؟"
        : "Hello! I am your political and civic helper for the Moroccan Youth Capital simulation. How can I guide you today regarding debates, legislation, crisis response, or voting?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user" as const, content: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated })
      });
      if (!res.ok) throw new Error("Failed to connect to assistant");
      const data = await res.json();
      if (data?.message) {
        setMessages([...updated, data.message]);
      }
    } catch (error) {
      setMessages([
        ...updated,
        {
          role: "assistant",
          content: isAr
            ? "عذراً، فشلت في الاتصال بالخادم. يرجى المحاولة لاحقاً."
            : "Sorry, I failed to connect to the political helper service. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Greeting Bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && !greetingDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-48 right-6 md:bottom-40 md:right-10 z-50 max-w-[240px]"
          >
            <div className="relative glass-panel rounded-3xl rounded-br-md p-4 shadow-2xl border border-gold/30">
              <button
                onClick={() => setGreetingDismissed(true)}
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-navy-dark text-white/70 hover:text-white border border-white/20 flex items-center justify-center shadow-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs font-bold text-foreground leading-relaxed mb-2">
                {t("👋 Need guidance, delegate? Ask your Political Advisor anything!", "👋 تحتاج إرشاداً أيها المندوب؟ اسأل مستشارك السياسي أي شيء!")}
              </p>
              <button
                onClick={() => { setIsOpen(true); setShowGreeting(false); }}
                className="text-[10px] font-black text-gold uppercase tracking-widest inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
              >
                {t("Start Chatting", "ابدأ المحادثة")}
                <ArrowRight className={`w-3 h-3 ${isAr ? "rotate-180" : ""}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => { setIsOpen(!isOpen); setShowGreeting(false); }}
        onHoverStart={() => setIsBotHovered(true)}
        onHoverEnd={() => setIsBotHovered(false)}
        animate={
          isBotHovered
            ? { y: [0, -14, 0, -8, 0], rotate: [0, -8, 8, -5, 0], scale: 1.08 }
            : { y: [0, -10, 0], rotate: 0, scale: 1 }
        }
        transition={
          isBotHovered
            ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
        }
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-50 select-none pointer-events-auto bg-transparent border-none p-0 focus:outline-none group"
        aria-label={t("Open Political Advisor", "افتح المستشار السياسي")}
      >
        <div className="relative w-20 h-20 md:w-26 md:h-26 flex items-center justify-center">
          <motion.img
            src="/chatbot.png"
            alt="Political Helper Bot"
            animate={isOpen ? { rotate: 8, scale: 1.05 } : { rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative w-full h-full object-contain filter drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)] group-hover:drop-shadow-[0_18px_36px_rgba(201,168,76,0.35)] transition-[filter] duration-300"
          />

          {/* Online status */}
          <span className="absolute top-2 right-2 flex">
            <span className="absolute w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full animate-ping opacity-60" />
            <span className="relative w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-background shadow-lg" />
          </span>

          {/* Chat hint badge */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-navy-dark border border-gold/40 text-gold text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap">
            {isOpen ? t("Close", "إغلاق") : t("Ask Me", "اسألني")}
          </span>
        </div>
      </motion.button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-48 right-5 md:bottom-40 md:right-8 z-50 w-[88vw] sm:w-[380px] h-[460px] md:h-[480px] bg-background/90 backdrop-blur-xl border border-gold/20 rounded-3xl shadow-2xl shadow-navy/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-navy-dark border-b border-gold/20 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-gold opacity-25 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/40 bg-navy-dark shadow-lg shadow-gold/10">
                <img src="/chatbot.png" alt="Helper Bot" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">{t("Political Advisor", "المستشار السياسي")}</h4>
                <p className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {t("Online", "متصل الآن")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white/5 border border-white/10 text-foreground rounded-bl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isAr ? "اسأل مستشارك السياسي..." : "Ask your advisor..."}
              className="flex-1 bg-white/5 border border-white/10 text-xs rounded-xl px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-50 disabled:hover:bg-primary flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function SplashScreen() {
  const { t } = useLanguage();
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "";
    }, 2400);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] bg-navy-dark flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Texture + glows */}
          <div className="absolute inset-0 bg-grid-gold opacity-30 pointer-events-none" />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[500px] h-[500px] bg-gold/10 blur-[130px] rounded-full pointer-events-none"
          />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/25 blur-[120px] rounded-full pointer-events-none" />

          {/* Logo */}
          <motion.img
            src="/youth_capital_logo_dark.svg"
            alt="Youth Capital"
            initial={{ opacity: 0, scale: 0.7, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 h-16 md:h-24 w-auto mb-10"
          />

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.45em" }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="relative z-10 text-gold text-[10px] md:text-xs font-bold uppercase mb-12"
          >
            {t("Govern the Future", "احكم المستقبل")}
          </motion.p>

          {/* Loading bar */}
          <div className="relative z-10 w-48 md:w-64 h-[3px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.9, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-gradient-to-r from-gold to-gold-pale rounded-full shadow-[0_0_12px_rgba(201,168,76,0.6)]"
            />
          </div>

          {/* Gold edge revealed as the panel slides away */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-accent-foreground">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[300] focus:px-6 focus:py-3 focus:rounded-2xl focus:bg-gold focus:text-navy-dark focus:font-black focus:shadow-2xl"
      >
        Skip to content
      </a>
      <SplashScreen />
      <Navbar />
      <main id="main-content" className="flex-1 w-full relative">
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
      <PoliticalHelperChatbot />
      <CommandPalette />
    </div>
  );
}
