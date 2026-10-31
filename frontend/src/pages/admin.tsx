import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import {
  AlertTriangle, BarChart3, Calendar, FileCheck, Gauge, LayoutDashboard, LifeBuoy, Mail, Newspaper,
  Scale, Siren, TrendingUp, Users, Vote, Plus, Send, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useSeo } from "@/hooks/use-seo";
import { AdminShell, type NavGroup, type Notice, type QuickAction, type SearchEntity } from "@/components/admin/shell";
import { AdminContext, type Intent } from "@/components/admin/context";
import { useApplications, useArticles, useCrises, useEvents, useMembers, useTickets } from "@/components/admin/data";
import OverviewPage from "@/components/admin/pages/overview";
import MembersPage from "@/components/admin/pages/members";
import ApplicationsPage from "@/components/admin/pages/applications";
import { PressPage, EventsPage, PollsPage } from "@/components/admin/pages/content";
import { CrisesPage, SupportPage, SaharaPage } from "@/components/admin/pages/operations";
import { SystemPage } from "@/components/admin/pages/system-emails";
import { EmailsPage } from "@/components/admin/pages/emails";

// The statistics page pulls in every chart; load it only when opened.
const StatisticsPage = lazy(() => import("@/components/admin-stats"));

const TABS = ["overview", "statistics", "users", "applications", "support", "press", "events", "polls", "crises", "sahara", "emails", "system"] as const;
type Tab = (typeof TABS)[number];

const tabFromHash = (): Tab => {
  const h = window.location.hash.replace("#", "") as Tab;
  return TABS.includes(h) ? h : "overview";
};

export default function Admin() {
  const { isAdmin, isLoading, user } = useAuth();
  useSeo({ title: "Admin | Youth Capital", description: "Youth Capital platform administration.", path: "/admin", noindex: true });
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!isAdmin) return <Redirect to="/" />;
  return <AdminDashboard user={user} />;
}

function AdminDashboard({ user }: { user: any }) {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const logout = useLogout();
  const [tab, setTab] = useState<Tab>(tabFromHash);
  const [intent, setIntent] = useState<Intent | null>(null);

  // Keep the section in the URL so it survives reloads and can be shared.
  useEffect(() => {
    if (window.location.hash !== `#${tab}`) history.replaceState(null, "", `#${tab}`);
    window.scrollTo({ top: 0 });
  }, [tab]);
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((next: string) => setTab((TABS as readonly string[]).includes(next) ? (next as Tab) : "overview"), []);
  const dispatch = useCallback((i: Intent) => { setIntent(i); go(i.tab); }, [go]);
  const ctx = useMemo(() => ({ tab, go, dispatch, intent, clearIntent: () => setIntent(null) }), [tab, go, dispatch, intent]);

  // Live counts for nav badges, notifications and the command palette.
  const { members } = useMembers();
  const { applications } = useApplications();
  const { tickets } = useTickets();
  const { crises } = useCrises();
  const { articles } = useArticles();
  const { events } = useEvents();
  const pending = applications.filter((a) => a.status === "pending");
  const openTickets = tickets.filter((x) => x.status === "open");
  const activeCrises = crises.filter((c) => c.isActive);

  const groups: NavGroup[] = [
    {
      label: t("Dashboard", "لوحة التحكم"),
      items: [
        { id: "overview", label: t("Overview", "نظرة عامة"), icon: LayoutDashboard, keywords: "home dashboard" },
        { id: "statistics", label: t("Statistics", "الإحصائيات"), icon: TrendingUp, keywords: "analytics charts export" },
      ],
    },
    {
      label: t("People", "الأشخاص"),
      items: [
        { id: "users", label: t("Members", "الأعضاء"), icon: Users, keywords: "users accounts" },
        { id: "applications", label: t("Applications", "الطلبات"), icon: FileCheck, badge: pending.length || undefined, keywords: "review roles" },
        { id: "support", label: t("Support", "الدعم"), icon: LifeBuoy, badge: openTickets.length || undefined, keywords: "tickets help" },
      ],
    },
    {
      label: t("Content", "المحتوى"),
      items: [
        { id: "press", label: t("Press office", "مكتب الصحافة"), icon: Newspaper, keywords: "articles news" },
        { id: "events", label: t("Events", "الفعاليات"), icon: Calendar, keywords: "calendar sessions" },
        { id: "polls", label: t("Polls", "الاستطلاعات"), icon: Vote, keywords: "votes" },
        { id: "crises", label: t("Crises", "الأزمات"), icon: AlertTriangle, badge: activeCrises.length || undefined, badgeTone: "danger", keywords: "emergency" },
      ],
    },
    {
      label: t("Engagement", "التفاعل"),
      items: [
        { id: "sahara", label: t("Sahara consultation", "استشارة الصحراء"), icon: Scale, keywords: "autonomy feedback" },
        { id: "emails", label: t("Emails", "البريد"), icon: Mail, keywords: "newsletter send" },
      ],
    },
    {
      label: t("System", "النظام"),
      items: [{ id: "system", label: t("System & logs", "النظام والسجلات"), icon: Gauge, keywords: "errors audit kpis" }],
    },
  ];

  const quickActions: QuickAction[] = [
    { id: "new-article", label: t("New article", "مقال جديد"), icon: Newspaper, run: () => dispatch({ kind: "create", tab: "press" }) },
    { id: "new-event", label: t("Schedule event", "جدولة فعالية"), icon: Calendar, run: () => dispatch({ kind: "create", tab: "events" }) },
    { id: "new-poll", label: t("Create poll", "إنشاء استطلاع"), icon: BarChart3, run: () => dispatch({ kind: "create", tab: "polls" }) },
    { id: "crisis", label: t("Trigger crisis", "إطلاق أزمة"), icon: Siren, run: () => dispatch({ kind: "create", tab: "crises" }) },
    { id: "email", label: t("Compose email", "كتابة بريد"), icon: Send, run: () => go("emails") },
    ...(pending.length ? [{ id: "review", label: t(`Review pending applications (${pending.length})`, `مراجعة الطلبات (${pending.length})`), icon: Plus, run: () => dispatch({ kind: "open", tab: "applications", id: pending[0].id }) }] : []),
  ];

  const searchEntities: SearchEntity[] = [
    ...members.slice(0, 2000).map((m) => ({
      id: `member-${m.id}`, label: m.fullName, sublabel: m.email, group: t("Members", "الأعضاء"),
      run: () => dispatch({ kind: "open", tab: "users", id: m.id }),
    })),
    ...pending.map((a) => ({
      id: `app-${a.id}`, label: a.user?.fullName || `#${a.id}`, sublabel: t("Pending application", "طلب معلق"), group: t("Applications", "الطلبات"), icon: FileCheck,
      run: () => dispatch({ kind: "open", tab: "applications", id: a.id }),
    })),
    ...articles.map((a) => ({
      id: `article-${a.id}`, label: a.title, sublabel: a.slug, group: t("Articles", "المقالات"), icon: Newspaper,
      run: () => dispatch({ kind: "open", tab: "press", id: a.id }),
    })),
    ...events.map((e) => ({
      id: `event-${e.id}`, label: e.title, group: t("Events", "الفعاليات"), icon: Calendar, run: () => go("events"),
    })),
  ];

  const notices: Notice[] = [
    { id: "apps", label: t("Pending applications", "طلبات معلقة"), description: t("Waiting for your review", "بانتظار مراجعتك"), tone: "warning", count: pending.length, run: () => go("applications") },
    { id: "crises", label: t("Active crises", "أزمات نشطة"), description: t("Broadcast to all members", "مبثوثة لجميع الأعضاء"), tone: "danger", count: activeCrises.length, run: () => go("crises") },
    { id: "tickets", label: t("Open support tickets", "تذاكر دعم مفتوحة"), description: t("Members waiting for a reply", "أعضاء ينتظرون الرد"), tone: "info", count: openTickets.length, run: () => go("support") },
  ];

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/login");
  };

  return (
    <AdminContext.Provider value={ctx}>
      <AdminShell
        groups={groups}
        active={tab}
        onNavigate={go}
        user={user}
        onLogout={handleLogout}
        quickActions={quickActions}
        searchEntities={searchEntities}
        notices={notices}
      >
        {tab === "overview" && <OverviewPage />}
        {tab === "statistics" && (
          <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>}>
            <StatisticsPage />
          </Suspense>
        )}
        {tab === "users" && <MembersPage />}
        {tab === "applications" && <ApplicationsPage />}
        {tab === "support" && <SupportPage />}
        {tab === "press" && <PressPage />}
        {tab === "events" && <EventsPage />}
        {tab === "polls" && <PollsPage />}
        {tab === "crises" && <CrisesPage />}
        {tab === "sahara" && <SaharaPage />}
        {tab === "emails" && <EmailsPage />}
        {tab === "system" && <SystemPage />}
      </AdminShell>
    </AdminContext.Provider>
  );
}
