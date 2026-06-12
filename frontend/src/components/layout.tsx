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
  Settings,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Send,
  MessageCircle,
  Youtube
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

  return (
    <header 
      className="relative z-50 w-full bg-background border-b border-border/30 py-2"
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
            {/* Social Media Icons Desktop */}
            <div className="hidden md:flex flex-col items-center mr-1 gap-0.5">
              <div className="flex items-center gap-1">
                <a href="https://x.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5" title="Twitter / X">
                  <Twitter className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.facebook.com/youthcapital" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5" title="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.instagram.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5" title="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.linkedin.com/company/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5" title="LinkedIn">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.tiktok.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5 flex items-center justify-center" title="TikTok">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 448 512">
                    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5" title="YouTube">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a href="https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu" target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg text-muted-foreground/80 hover:text-accent transition-colors hover:bg-white/5 flex items-center justify-center" title="WhatsApp Community">
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
              <span className="text-[7.5px] font-black tracking-widest text-muted-foreground/50 uppercase select-none mt-0.5 leading-none">{t("Follow Us", "تابعنا")}</span>
            </div>

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
                      {/* Social Media Icons Mobile Sheet */}
                      <div className="flex flex-col items-center gap-1 py-2">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <a href="https://x.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Twitter className="w-5 h-5" />
                          </a>
                          <a href="https://www.facebook.com/youthcapital" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Facebook className="w-5 h-5" />
                          </a>
                          <a href="https://www.instagram.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Instagram className="w-5 h-5" />
                          </a>
                          <a href="https://www.linkedin.com/company/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Linkedin className="w-5 h-5" />
                          </a>
                          <a href="https://www.tiktok.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 448 512">
                              <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                            </svg>
                          </a>
                          <a href="https://www.youtube.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <Youtube className="w-5 h-5" />
                          </a>
                          <a href="https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu" target="_blank" rel="noopener noreferrer" className="p-2.5 text-muted-foreground hover:text-accent transition-colors bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5" />
                          </a>
                        </div>
                        <span className="text-[9px] font-black tracking-widest text-muted-foreground/45 uppercase select-none mt-1 leading-none">{t("Follow Us", "تابعنا")}</span>
                      </div>

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
          <p>© {new Date().getFullYear()} Youth Capital. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</p>
          <div className="flex gap-4 flex-wrap">
            <a href="https://x.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Twitter className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
            <a href="https://www.facebook.com/youthcapital" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Facebook className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
            <a href="https://www.instagram.com/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Instagram className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
            <a href="https://www.linkedin.com/company/youthcapitalhq" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Linkedin className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
            <a href="https://www.tiktok.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-white/80 hover:text-white fill-current" viewBox="0 0 448 512">
                <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@youthcapitalhq" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Youtube className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
            <a href="https://chat.whatsapp.com/LC5mqBrIPXdLJhK6cLJsmu" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <MessageCircle className="w-4 h-4 text-white/80 hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PoliticalHelperChatbot() {
  const { t, isAr } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
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
      {/* Floating Trigger Button Style & Element */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-gentle {
          animation: float-gentle 3s ease-in-out infinite;
        }
      `}</style>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 hover:scale-110 active:scale-95 transition-all duration-300 animate-float-gentle select-none pointer-events-auto bg-transparent border-none p-0 focus:outline-none"
      >
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
          <img 
            src="/chatbot.png" 
            alt="Political Helper Bot" 
            className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]" 
          />
          <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-lg" />
        </div>
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 md:bottom-24 md:right-8 z-50 w-[88vw] sm:w-[380px] h-[480px] bg-background/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-primary/20 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-navy-dark">
                <img src="/chatbot.png" alt="Helper Bot" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{t("Political Advisor", "المستشار السياسي")}</h4>
                <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-accent-foreground">
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
      <PoliticalHelperChatbot />
    </div>
  );
}
