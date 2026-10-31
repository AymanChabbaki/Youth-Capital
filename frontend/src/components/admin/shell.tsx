import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { useTheme } from "next-themes";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell, ChevronRight, Globe, Languages, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen,
  RefreshCw, Search, Sun, ExternalLink, ChevronsUpDown, Command as CommandIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogTitle } from "@/components/ui/dialog";
import { Avatar, Pill, type Tone } from "./primitives";

export type NavItem = { id: string; label: string; icon: any; badge?: number; badgeTone?: Tone; keywords?: string };
export type NavGroup = { label: string; items: NavItem[] };
export type QuickAction = { id: string; label: string; icon: any; run: () => void; shortcut?: string };
export type SearchEntity = { id: string; label: string; sublabel?: string; group: string; icon?: any; run: () => void };
export type Notice = { id: string; label: string; description?: string; tone: Tone; count?: number; run: () => void };

type ShellProps = {
  groups: NavGroup[];
  active: string;
  onNavigate: (id: string) => void;
  user: { fullName?: string | null; email?: string | null; avatarUrl?: string | null } | null;
  onLogout: () => void;
  quickActions: QuickAction[];
  searchEntities: SearchEntity[];
  notices: Notice[];
  children: ReactNode;
};

const COLLAPSE_KEY = "admin-sidebar-collapsed";

export function AdminShell({ groups, active, onNavigate, user, onLogout, quickActions, searchEntities, notices, children }: ShellProps) {
  const { t, isAr } = useLanguage();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"); } catch { /* storage unavailable */ }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") { e.preventDefault(); setCollapsed((c) => !c); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeItem = groups.flatMap((g) => g.items).find((i) => i.id === active);
  const go = (id: string) => { onNavigate(id); setMobileOpen(false); setPaletteOpen(false); };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="admin-root viz-root flex min-h-screen bg-background text-foreground">
        {/* Desktop sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 68 : 252 }}
          transition={{ type: "spring", stiffness: 400, damping: 38 }}
          className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-e border-white/5 bg-navy-dark lg:block"
        >
          <SidebarBody groups={groups} active={active} onNavigate={go} collapsed={collapsed} user={user} onLogout={onLogout} />
        </motion.aside>

        {/* Mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side={isAr ? "right" : "left"} className="w-[280px] border-none bg-navy-dark p-0 sm:max-w-[280px] [&>button]:text-white">
            <SheetTitle className="sr-only">{t("Navigation", "التنقل")}</SheetTitle>
            <SidebarBody groups={groups} active={active} onNavigate={go} collapsed={false} user={user} onLogout={onLogout} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-5">
            <IconButton label={t("Open menu", "فتح القائمة")} className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></IconButton>
            <IconButton
              label={collapsed ? t("Expand sidebar (Ctrl+B)", "توسيع الشريط (Ctrl+B)") : t("Collapse sidebar (Ctrl+B)", "طي الشريط (Ctrl+B)")}
              className="hidden lg:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed !== isAr ? <PanelLeftOpen /> : <PanelLeftClose />}
            </IconButton>
            <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
              <span className="hidden text-muted-foreground sm:inline">{t("Admin", "الإدارة")}</span>
              <ChevronRight className="hidden size-3.5 text-muted-foreground/60 sm:inline rtl:rotate-180" />
              <span className="truncate font-medium text-foreground">{activeItem?.label}</span>
            </nav>

            <div className="ms-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden h-8 w-64 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-secondary md:flex"
              >
                <Search className="size-3.5" />
                <span className="flex-1 text-left rtl:text-right">{t("Search or jump to…", "ابحث أو انتقل إلى…")}</span>
                <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-secondary px-1.5 font-mono text-[10px]">
                  <CommandIcon className="size-2.5" />K
                </kbd>
              </button>
              <IconButton label={t("Search", "بحث")} className="md:hidden" onClick={() => setPaletteOpen(true)}><Search /></IconButton>
              <RefreshButton />
              <NoticesButton notices={notices} />
              <ThemeButton />
            </div>
          </header>

          <main className="flex-1 px-3 py-6 sm:px-6 lg:px-8">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mx-auto w-full max-w-[1400px] space-y-6"
            >
              {children}
            </motion.div>
          </main>
        </div>

        {/* Command palette */}
        <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
          <DialogTitle className="sr-only">{t("Command palette", "لوحة الأوامر")}</DialogTitle>
          <CommandInput placeholder={t("Type a command or search members, articles…", "اكتب أمراً أو ابحث عن أعضاء، مقالات…")} />
          <CommandList className="max-h-[420px]">
            <CommandEmpty>{t("No results found.", "لا توجد نتائج.")}</CommandEmpty>
            <CommandGroup heading={t("Go to", "انتقل إلى")}>
              {groups.flatMap((g) => g.items).map((i) => (
                <CommandItem key={i.id} value={`go ${i.label} ${i.keywords || ""}`} onSelect={() => go(i.id)} className="gap-2">
                  <i.icon className="size-4 text-muted-foreground" /> {i.label}
                  {!!i.badge && <CommandShortcut>{i.badge}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={t("Actions", "إجراءات")}>
              {quickActions.map((a) => (
                <CommandItem key={a.id} value={`action ${a.label}`} onSelect={() => { setPaletteOpen(false); a.run(); }} className="gap-2">
                  <a.icon className="size-4 text-muted-foreground" /> {a.label}
                  {a.shortcut && <CommandShortcut>{a.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            {Object.entries(groupBy(searchEntities, (e) => e.group)).map(([group, items]) => (
              <div key={group}>
                <CommandSeparator />
                <CommandGroup heading={group}>
                  {items.map((e) => (
                    <CommandItem key={e.id} value={`${e.label} ${e.sublabel || ""} ${e.id}`} onSelect={() => { setPaletteOpen(false); e.run(); }} className="gap-2">
                      {e.icon ? <e.icon className="size-4 text-muted-foreground" /> : <Avatar name={e.label} size="sm" />}
                      <span className="truncate">{e.label}</span>
                      {e.sublabel && <span className="truncate text-xs text-muted-foreground">{e.sublabel}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            ))}
          </CommandList>
        </CommandDialog>
      </div>
    </TooltipProvider>
  );
}

function groupBy<T>(items: T[], key: (i: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, i) => { (acc[key(i)] ||= []).push(i); return acc; }, {});
}

function SidebarBody({ groups, active, onNavigate, collapsed, user, onLogout }: {
  groups: NavGroup[]; active: string; onNavigate: (id: string) => void; collapsed: boolean;
  user: ShellProps["user"]; onLogout: () => void;
}) {
  const { t, lang, setLang } = useLanguage();
  return (
    <div className="flex h-full flex-col text-white">
      <div className={cn("flex h-14 shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-2" : "px-4")}>
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          {collapsed ? (
            <span className="flex size-8 items-center justify-center rounded-lg bg-gold font-display text-sm font-bold text-navy-dark">YC</span>
          ) : (
            <img src="/youth_capital_logo_dark.svg" alt="Youth Capital" className="h-8 w-auto" />
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3 [scrollbar-width:none]">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            {!collapsed && <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">{g.label}</div>}
            {collapsed && <div className="mx-auto mb-2 h-px w-6 bg-white/10" />}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const isActive = item.id === active;
                const btn = (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      collapsed ? "h-10 justify-center" : "h-9 px-2.5",
                      isActive ? "bg-white/[0.09] text-white" : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {isActive && <motion.span layoutId="admin-nav-indicator" className="absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-gold" />}
                    <item.icon className={cn("size-[18px] shrink-0", isActive ? "text-gold" : "text-white/50 group-hover:text-white/80")} />
                    {!collapsed && <span className="flex-1 truncate text-start">{item.label}</span>}
                    {!!item.badge && (
                      collapsed ? (
                        <span className={cn("absolute end-1.5 top-1.5 size-2 rounded-full", item.badgeTone === "danger" ? "bg-rose-500" : "bg-gold")} />
                      ) : (
                        <span className={cn(
                          "rounded-md px-1.5 py-px text-[11px] font-semibold tabular-nums",
                          item.badgeTone === "danger" ? "bg-rose-500/20 text-rose-300" : "bg-gold/20 text-gold"
                        )}>{item.badge}</span>
                      )
                    )}
                  </button>
                );
                return (
                  <li key={item.id}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">{item.label}{item.badge ? ` · ${item.badge}` : ""}</TooltipContent>
                      </Tooltip>
                    ) : btn}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn("flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-white/[0.06]", collapsed && "justify-center")}>
              <Avatar name={user?.fullName} src={user?.avatarUrl} size="md" className="ring-2 ring-gold/40" />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-white">{user?.fullName}</span>
                    <span className="block truncate text-[11px] text-white/45">{user?.email}</span>
                  </span>
                  <ChevronsUpDown className="size-4 text-white/40" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/"><Globe className="size-4 opacity-70" /> {t("Back to website", "العودة للموقع")} <ExternalLink className="ms-auto size-3.5 opacity-50" /></Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
              <Languages className="size-4 opacity-70" /> {lang === "ar" ? "English" : "العربية"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-rose-600 focus:text-rose-600">
              <LogOut className="size-4" /> {t("Log out", "تسجيل الخروج")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function IconButton({ children, label, className, onClick }: { children: ReactNode; label: string; className?: string; onClick?: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className={cn("inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&_svg]:size-4", className)}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

function RefreshButton() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const fetching = useIsFetching();
  return (
    <IconButton label={t("Refresh data", "تحديث البيانات")} onClick={() => qc.invalidateQueries()}>
      <RefreshCw className={cn(fetching > 0 && "animate-spin")} />
    </IconButton>
  );
}

function ThemeButton() {
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <IconButton label={dark ? t("Light mode", "الوضع الفاتح") : t("Dark mode", "الوضع الداكن")} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <Sun /> : <Moon />}
    </IconButton>
  );
}

function NoticesButton({ notices }: { notices: Notice[] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const live = notices.filter((n) => (n.count ?? 1) > 0);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={t("Notifications", "الإشعارات")} className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Bell className="size-4" />
          {live.length > 0 && <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{t("Needs your attention", "يحتاج انتباهك")}</p>
        </div>
        {live.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground">{t("You're all caught up.", "لا يوجد ما يتطلب انتباهك.")}</p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {live.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => { setOpen(false); n.run(); }} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary/60">
                  <Pill tone={n.tone} dot>{n.count ?? "!"}</Pill>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{n.label}</span>
                    {n.description && <span className="block text-xs text-muted-foreground">{n.description}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
