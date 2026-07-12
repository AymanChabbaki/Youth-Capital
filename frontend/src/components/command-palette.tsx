import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useGetPolls, useGetArticles } from "@workspace/api-client-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  Info,
  Vote,
  Users,
  Newspaper,
  Calendar,
  LifeBuoy,
  LayoutDashboard,
  User,
  FileText,
  Moon,
  Sun,
  Globe,
  Sparkles,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { t, lang, setLang, isAr } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  // Only fetch searchable content once the palette has been opened
  const { data: pollsData } = useGetPolls({ query: { enabled: open } } as any);
  const { data: articlesData } = useGetArticles({ query: { enabled: open } } as any);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    const openFromEvent = () => setOpen(true);
    document.addEventListener("keydown", down);
    window.addEventListener("open-cmdk", openFromEvent);
    return () => {
      document.removeEventListener("keydown", down);
      window.removeEventListener("open-cmdk", openFromEvent);
    };
  }, []);

  const go = useCallback((path: string) => {
    setOpen(false);
    setLocation(path);
  }, [setLocation]);

  const pages = [
    { icon: Home, label: t("Home", "الرئيسية"), path: "/" },
    { icon: Info, label: t("About Us", "من نحن"), path: "/about" },
    { icon: Vote, label: t("Civic Polls", "الاستطلاعات المدنية"), path: "/polls" },
    ...(isAuthenticated ? [{ icon: Users, label: t("Community", "المجتمع"), path: "/community" }] : []),
    { icon: Newspaper, label: t("Press & News", "الأخبار والصحافة"), path: "/press" },
    { icon: Calendar, label: t("Events", "الفعاليات"), path: "/events" },
    { icon: LifeBuoy, label: t("Support", "الدعم"), path: "/support" },
    ...(isAuthenticated
      ? [
          { icon: LayoutDashboard, label: isAdmin ? t("Admin Panel", "لوحة الإدارة") : t("Dashboard", "لوحة التحكم"), path: isAdmin ? "/admin" : "/dashboard" },
          { icon: User, label: t("My Profile", "ملفي الشخصي"), path: "/profile" },
        ]
      : [{ icon: Sparkles, label: t("Apply to Join", "قدّم طلبك"), path: "/apply" }]),
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("Search pages, polls, articles...", "ابحث في الصفحات والاستطلاعات والمقالات...")} />
      <CommandList>
        <CommandEmpty>{t("No results found.", "لم يتم العثور على نتائج.")}</CommandEmpty>

        <CommandGroup heading={t("Navigation", "التنقل")}>
          {pages.map(page => {
            const Icon = page.icon;
            return (
              <CommandItem key={page.path} onSelect={() => go(page.path)} className="gap-3">
                <Icon className="text-gold" />
                {page.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {(pollsData?.polls?.length ?? 0) > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("Active Polls", "الاستطلاعات النشطة")}>
              {pollsData!.polls.slice(0, 5).map((poll: any) => (
                <CommandItem key={`poll-${poll.id}`} onSelect={() => go(`/polls/${poll.id}`)} className="gap-3">
                  <Vote className="text-gold" />
                  {isAr ? poll.titleAr : poll.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {(articlesData?.articles?.length ?? 0) > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t("Press Articles", "المقالات الصحفية")}>
              {articlesData!.articles.slice(0, 5).map((article: any) => (
                <CommandItem key={`article-${article.id}`} onSelect={() => go(`/press/${article.id}`)} className="gap-3">
                  <FileText className="text-gold" />
                  {isAr ? article.titleAr : article.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading={t("Actions", "إجراءات")}>
          <CommandItem
            onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); setOpen(false); }}
            className="gap-3"
          >
            {resolvedTheme === "dark" ? <Sun className="text-gold" /> : <Moon className="text-gold" />}
            {resolvedTheme === "dark" ? t("Switch to Light Mode", "التبديل إلى الوضع الفاتح") : t("Switch to Dark Mode", "التبديل إلى الوضع الداكن")}
          </CommandItem>
          <CommandItem
            onSelect={() => { setLang(lang === "en" ? "ar" : "en"); setOpen(false); }}
            className="gap-3"
          >
            <Globe className="text-gold" />
            {isAr ? "Switch to English" : "التبديل إلى العربية"}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
