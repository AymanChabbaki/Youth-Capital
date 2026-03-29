import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import {
  useGetRoleApplications, useUpdateRoleApplication,
  useGetUsers, useTriggerCrisis, useGetPlatformStats,
  useGetCrises, useGetArticles, useGetEvents,
} from "@workspace/api-client-react";
import { Badge, Button, Input, Textarea, Select } from "@/components/ui-custom";
import { Redirect } from "wouter";
import {
  Shield, Users, FileCheck, AlertTriangle, LayoutDashboard,
  TrendingUp, MessageSquare, Calendar, Newspaper, Activity,
  CheckCircle, Clock, XCircle, Search, ChevronRight, Zap,
  Globe, BarChart3, PieChart as PieChartIcon, UserCheck, Siren,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

const COLORS = ["#1B2A4A", "#C9A84C", "#C41230", "#4A7FA5", "#6B8E5A", "#8A5AA0"];

const MONTHLY_ACTIVITY = [
  { month: "Oct", posts: 18, users: 3 },
  { month: "Nov", posts: 34, users: 5 },
  { month: "Dec", posts: 28, users: 4 },
  { month: "Jan", posts: 52, users: 8 },
  { month: "Feb", posts: 67, users: 11 },
  { month: "Mar", posts: 89, users: 15 },
];

function KpiCard({ icon: Icon, label, value, sub, color = "primary" }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/10 text-gold",
    rose: "bg-rose/10 text-rose",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-foreground">{value}</div>
        <div className="text-sm font-semibold text-foreground/80">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${active
          ? "bg-gold text-navy-dark shadow-md shadow-gold/20"
          : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {label}
    </button>
  );
}

export default function Admin() {
  const { isAdmin, isLoading, user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appsData, refetch: refetchApps } = useGetRoleApplications({ status: "pending" });
  const { data: usersData } = useGetUsers();
  const { data: statsData } = useGetPlatformStats();
  const { data: crisesData } = useGetCrises();
  const { data: articlesData } = useGetArticles();
  const { data: eventsData } = useGetEvents();

  const updateAppMutation = useUpdateRoleApplication();
  const triggerCrisisMutation = useTriggerCrisis();
  const [crisisForm, setCrisisForm] = useState({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });

  if (isLoading) return null;
  if (!isAdmin) return <Redirect to="/" />;

  const handleApprove = async (id: number, role: string) => {
    await updateAppMutation.mutateAsync({ id, data: { status: "approved", assignedRole: role } });
    toast({ title: t("Application Approved!", "تمت الموافقة على الطلب!") });
    refetchApps();
    queryClient.invalidateQueries();
  };

  const handleReject = async (id: number) => {
    await updateAppMutation.mutateAsync({ id, data: { status: "rejected" } });
    toast({ title: t("Application Rejected", "تم رفض الطلب"), variant: "destructive" });
    refetchApps();
  };

  const handleCrisisSubmit = async () => {
    if (!crisisForm.title) return;
    await triggerCrisisMutation.mutateAsync({ data: crisisForm as any });
    toast({ title: t("Crisis Triggered!", "تم إطلاق الأزمة!") });
    setCrisisForm({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });
    queryClient.invalidateQueries();
  };

  const users = usersData?.users || [];
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const pendingApps = appsData?.applications || [];
  const activeCrises = (crisesData as any)?.crises?.filter((c: any) => c.isActive) || [];

  const roleDistribution = (() => {
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const role = u.simulationRole || u.role || "unassigned";
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: t("Overview", "نظرة عامة") },
    { id: "users", icon: Users, label: t("Users", "المستخدمون") },
    { id: "applications", icon: FileCheck, label: t("Applications", "الطلبات") },
    { id: "crises", icon: AlertTriangle, label: t("Crises", "الأزمات") },
    { id: "content", icon: Newspaper, label: t("Content", "المحتوى") },
  ];

  return (
    <div className="min-h-screen flex bg-secondary/20">

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-navy-dark flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/30">
              <Shield className="w-5 h-5 text-navy-dark" />
            </div>
            <div>
              <div className="text-white font-display font-bold text-sm">Admin Panel</div>
              <div className="text-white/40 text-xs">Youth CapitalCore</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-sm font-bold flex-shrink-0">
              {user?.fullName?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.fullName}</div>
              <div className="text-white/40 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-white/50 text-xs">
            <Activity className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-semibold">{t("System Online", "النظام يعمل")}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-muted-foreground">{t("Platform Administration", "إدارة المنصة")}</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingApps.length > 0 && (
              <button
                onClick={() => setActiveTab("applications")}
                className="flex items-center gap-2 bg-gold/10 text-gold border border-gold/30 rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-gold/20 transition-colors"
              >
                <Clock className="w-3 h-3" />
                {pendingApps.length} {t("pending", "معلق")}
              </button>
            )}
            {activeCrises.length > 0 && (
              <div className="flex items-center gap-2 bg-rose/10 text-rose border border-rose/30 rounded-xl px-3 py-1.5 text-xs font-semibold">
                <Siren className="w-3 h-3 animate-pulse" />
                {activeCrises.length} {t("active crisis", "أزمة نشطة")}
              </div>
            )}
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard icon={Users} label={t("Total Members", "إجمالي الأعضاء")} value={users.length} color="primary" />
                <KpiCard icon={UserCheck} label={t("Active Members", "الأعضاء النشطون")} value={statsData?.activeMembers ?? ":"} color="green" />
                <KpiCard icon={FileCheck} label={t("Pending Apps", "طلبات معلقة")} value={pendingApps.length} sub={t("Awaiting review", "في انتظار المراجعة")} color="gold" />
                <KpiCard icon={MessageSquare} label={t("Forum Posts", "منشورات المنتدى")} value={statsData?.totalForumPosts ?? ":"} color="blue" />
                <KpiCard icon={AlertTriangle} label={t("Active Crises", "الأزمات النشطة")} value={statsData?.activeCrises ?? ":"} color="rose" />
                <KpiCard icon={Calendar} label={t("Upcoming Events", "الفعاليات القادمة")} value={statsData?.upcomingEvents ?? ":"} color="purple" />
              </div>

              {/* Charts Row */}
              <div className="grid md:grid-cols-3 gap-6">

                {/* Activity Area Chart */}
                <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">{t("Platform Activity (6 months)", "نشاط المنصة (6 أشهر)")}</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={MONTHLY_ACTIVITY}>
                      <defs>
                        <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1B2A4A" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1B2A4A" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Legend />
                      <Area type="monotone" dataKey="posts" name={t("Posts", "منشورات")} stroke="#1B2A4A" fill="url(#postsGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="users" name={t("New Users", "مستخدمون جدد")} stroke="#C9A84C" fill="url(#usersGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Role Distribution Pie */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">{t("Role Distribution", "توزيع الأدوار")}</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {roleDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-1.5">
                    {roleDistribution.map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-muted-foreground capitalize">{r.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Recent Applications */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2"><FileCheck className="w-4 h-4 text-gold" /> {t("Recent Applications", "الطلبات الأخيرة")}</h3>
                    <button onClick={() => setActiveTab("applications")} className="text-xs text-primary hover:underline flex items-center gap-1">
                      {t("View all", "عرض الكل")} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  {pendingApps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      {t("All applications reviewed!", "تمت مراجعة جميع الطلبات!")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingApps.slice(0, 4).map(app => (
                        <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {app.user?.fullName?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{app.user?.fullName}</div>
                              <div className="text-xs text-muted-foreground capitalize">{app.preferredRole}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleReject(app.id)} className="p-1.5 rounded-lg hover:bg-rose/10 text-rose transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleApprove(app.id, app.preferredRole)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Users */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> {t("Recent Members", "الأعضاء الأخيرون")}</h3>
                    <button onClick={() => setActiveTab("users")} className="text-xs text-primary hover:underline flex items-center gap-1">
                      {t("View all", "عرض الكل")} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm">
                            {u.fullName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{u.fullName}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{u.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Simulation Stats Bar */}
              <div className="bg-navy-dark rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[
                  { icon: Globe, label: t("Active Ministries", "الوزارات النشطة"), value: statsData?.activeMinistries ?? 22 },
                  { icon: BarChart3, label: t("Bills Passed", "قوانين أُقرَّت"), value: statsData?.billsPassed ?? 47 },
                  { icon: Newspaper, label: t("Press Articles", "مقالات صحفية"), value: (articlesData as any)?.articles?.length ?? ":" },
                  { icon: Calendar, label: t("Total Events", "إجمالي الفعاليات"), value: (eventsData as any)?.events?.length ?? ":" },
                ].map((item, i) => (
                  <div key={i}>
                    <item.icon className="w-6 h-6 text-gold mx-auto mb-2" />
                    <div className="text-2xl font-display font-bold text-white">{item.value}</div>
                    <div className="text-xs text-white/50 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-bold text-lg">{t("All Members", "جميع الأعضاء")} <span className="text-muted-foreground text-sm font-normal">({users.length})</span></h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t("Search users...", "ابحث عن مستخدمين...")}
                    className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Member", "العضو")}</th>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Email", "البريد")}</th>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Role", "الدور")}</th>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Status", "الحالة")}</th>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Type", "النوع")}</th>
                      <th className="px-6 py-3 font-semibold text-muted-foreground">{t("Actions", "إجراءات")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {u.fullName?.[0]}
                            </div>
                            <span className="font-medium">{u.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                            {u.simulationRole || ":"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>{u.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-gold/20 text-gold" : "bg-secondary text-muted-foreground"
                            }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs font-semibold text-rose hover:underline">
                            {t("Ban", "حظر")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {t("No users found.", "لا يوجد مستخدمون.")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── APPLICATIONS ── */}
          {activeTab === "applications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">
                  {t("Pending Applications", "الطلبات المعلقة")}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({pendingApps.length})</span>
                </h2>
              </div>
              {pendingApps.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-16 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                  <p className="font-semibold text-foreground">{t("All caught up!", "أنت على اطلاع!")}</p>
                  <p className="text-muted-foreground text-sm mt-1">{t("No pending applications to review.", "لا توجد طلبات معلقة للمراجعة.")}</p>
                </div>
              ) : (
                pendingApps.map(app => (
                  <div key={app.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg">
                          {app.user?.fullName?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{app.user?.fullName}</h3>
                          <p className="text-muted-foreground text-sm">{app.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold/20 text-gold border border-gold/30 uppercase tracking-wide">
                          {app.preferredRole}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          <Clock className="w-3 h-3 inline mr-1" />{t("Pending", "معلق")}
                        </span>
                      </div>
                    </div>
                    <div className="bg-secondary/40 p-4 rounded-xl mb-5 border border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{t("Motivation Statement", "بيان الدوافع")}</p>
                      <p className="text-sm text-foreground italic">"{app.motivation}"</p>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleReject(app.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose/30 text-rose text-sm font-semibold hover:bg-rose/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> {t("Reject", "رفض")}
                      </button>
                      <button
                        onClick={() => handleApprove(app.id, app.preferredRole)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> {t("Approve & Assign Role", "قبول وتعيين الدور")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── CRISES ── */}
          {activeTab === "crises" && (
            <div className="space-y-6">
              {/* Active Crises */}
              {activeCrises.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-lg text-rose flex items-center gap-2">
                    <Siren className="w-5 h-5 animate-pulse" /> {t("Active Crises", "الأزمات النشطة")}
                  </h2>
                  {activeCrises.map((crisis: any) => (
                    <div key={crisis.id} className="bg-rose/5 border border-rose/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground">{crisis.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${crisis.severity === "critical" ? "bg-red-100 text-red-700" :
                            crisis.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"
                          }`}>{crisis.severity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{crisis.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Trigger Crisis Form */}
              <div className="bg-card border border-rose/20 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose" /> {t("Trigger New Crisis", "إطلاق أزمة جديدة")}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">{t("This will broadcast a crisis scenario to all platform participants.", "سيتم بث سيناريو الأزمة لجميع المشاركين في المنصة.")}</p>
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">{t("Title (English)", "العنوان (إنجليزي)")}</label>
                      <Input value={crisisForm.title} onChange={e => setCrisisForm({ ...crisisForm, title: e.target.value })} placeholder="e.g. Economic Crisis" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">{t("Title (Arabic)", "العنوان (عربي)")}</label>
                      <Input value={crisisForm.titleAr} onChange={e => setCrisisForm({ ...crisisForm, titleAr: e.target.value })} dir="rtl" placeholder="مثال: أزمة اقتصادية" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">{t("Description (English)", "الوصف (إنجليزي)")}</label>
                    <Textarea value={crisisForm.description} onChange={e => setCrisisForm({ ...crisisForm, description: e.target.value })} className="h-24" placeholder={t("Describe the crisis scenario...", "صف سيناريو الأزمة...")} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">{t("Description (Arabic)", "الوصف (عربي)")}</label>
                    <Textarea value={crisisForm.descriptionAr} onChange={e => setCrisisForm({ ...crisisForm, descriptionAr: e.target.value })} dir="rtl" className="h-24" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">{t("Severity Level", "مستوى الخطورة")}</label>
                    <Select value={crisisForm.severity} onChange={e => setCrisisForm({ ...crisisForm, severity: e.target.value })}>
                      <option value="medium">{t("Medium", "متوسط")}</option>
                      <option value="high">{t("High", "عالٍ")}</option>
                      <option value="critical">{t("Critical", "حرج")}</option>
                    </Select>
                  </div>
                  <button
                    onClick={handleCrisisSubmit}
                    disabled={!crisisForm.title || triggerCrisisMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Siren className="w-4 h-4" />
                    {triggerCrisisMutation.isPending ? t("Broadcasting...", "جارٍ البث...") : t("Broadcast Crisis to All Users", "بث الأزمة لجميع المستخدمين")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTENT ── */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Newspaper className="w-5 h-5 text-primary" /> {t("Press Articles", "المقالات الصحفية")}
                  </h3>
                  <div className="space-y-3">
                    {((articlesData as any)?.articles || []).map((a: any) => (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.isPublished ? "bg-green-400" : "bg-yellow-400"}`} />
                        <div>
                          <p className="text-sm font-semibold">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.category} · {a.isPublished ? t("Published", "منشور") : t("Draft", "مسودة")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" /> {t("Events", "الفعاليات")}
                  </h3>
                  <div className="space-y-3">
                    {((eventsData as any)?.events || []).map((e: any) => (
                      <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-primary" />
                        <div>
                          <p className="text-sm font-semibold">{e.title}</p>
                          <p className="text-xs text-muted-foreground">{e.eventType} · {new Date(e.startAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
