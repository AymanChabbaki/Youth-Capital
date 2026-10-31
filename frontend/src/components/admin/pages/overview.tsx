import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateRoleApplication } from "@workspace/api-client-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowRight, Calendar, CheckCircle2, ChevronDown, Clock, FileCheck, LifeBuoy, MessageSquare, Newspaper, Plus,
  Scale, Siren, Users, Vote, XCircle, Video,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGE_RANGES, GENDERS, ageRangeOf } from "@/components/admin-table";
import { useAdmin } from "../context";
import {
  useApplications, useAuditLogs, useCrises, useEvents, useKpis, useMembers, useSaharaResponses, useTickets,
} from "../data";
import {
  Avatar, BarList, Btn, EmptyState, PageHeader, Panel, Pill, Segmented, StatCard,
  bucketCounts, countWithin, pctChange, useFormat, humanize,
} from "../primitives";
import { actionTone } from "./system-emails";

const TOOLTIP_STYLE = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--card-foreground)", fontSize: 12 };
const TICK = { fontSize: 11, fill: "var(--muted-foreground)" };
const NOT_SAID = "Prefer not to say";

type Range = "30d" | "90d" | "12m";

export default function OverviewPage() {
  const { t, lang } = useLanguage();
  const fmt = useFormat();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { go, dispatch } = useAdmin();
  const { members, isLoading: membersLoading } = useMembers();
  const { applications, isLoading: appsLoading } = useApplications();
  const { data: k, isLoading: kLoading } = useKpis();
  const { responses } = useSaharaResponses();
  const { tickets } = useTickets();
  const { crises } = useCrises();
  const { events } = useEvents();
  const { logs } = useAuditLogs();
  const update = useUpdateRoleApplication();
  const [range, setRange] = useState<Range>("30d");
  const [mode, setMode] = useState<"new" | "total">("new");
  const [busyId, setBusyId] = useState<number | null>(null);

  const joined = members.map((m) => m.createdAt);
  const new30 = countWithin(joined, 30);
  const prev30 = countWithin(joined, 60, 30);
  const pending = applications.filter((a) => a.status === "pending").sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const openTickets = tickets.filter((x) => x.status === "open");
  const activeCrises = crises.filter((c) => c.isActive);
  const sahara7 = countWithin(responses.map((r) => r.createdAt), 7);
  const saharaPrev7 = countWithin(responses.map((r) => r.createdAt), 14, 7);

  // Growth series: daily for 30/90 days, monthly for 12 months.
  const growth = useMemo(() => {
    const now = new Date();
    const points: { label: string; value: number; total: number }[] = [];
    const sorted = joined.filter(Boolean).map((d) => new Date(d)).sort((a, b) => +a - +b);
    const totalBefore = (date: Date) => sorted.filter((d) => d <= date).length;
    const locale = lang === "ar" ? "ar-MA" : "en-US";
    if (range === "12m") {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        points.push({
          label: start.toLocaleDateString(locale, { month: "short", year: "2-digit" }),
          value: sorted.filter((d) => d >= start && d <= end).length,
          total: totalBefore(end),
        });
      }
    } else {
      const days = range === "30d" ? 30 : 90;
      for (let i = days - 1; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const end = new Date(start.getTime() + 86399999);
        points.push({
          label: start.toLocaleDateString(locale, { day: "numeric", month: "short" }),
          value: sorted.filter((d) => d >= start && d <= end).length,
          total: totalBefore(end),
        });
      }
    }
    return points;
  }, [joined.length, range, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const periodNew = growth.reduce((s, p) => s + p.value, 0);

  const byRegion = useMemo(() => countList(members.map((m) => m.region || t("Not set", "غير محدد"))), [members, t]);
  const byRole = useMemo(() => countList(members.map((m) => m.simulationRole || t("Unassigned", "غير معيّن"))), [members, t]);
  const byAge = useMemo(() => AGE_RANGES.filter((a) => a !== NOT_SAID).map((a) => ({ name: a, value: members.filter((m) => ageRangeOf(m.age) === a).length })), [members]);
  const genderSplit = GENDERS.map((g) => ({ name: g, value: members.filter((m) => (m.gender?.trim() || NOT_SAID) === g).length }));
  const genderTotal = genderSplit.reduce((s, g) => s + g.value, 0);

  const recentMembers = [...members].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const upcoming = events.filter((e) => +new Date(e.startAt) > Date.now()).sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)).slice(0, 4);

  const quickDecide = async (app: any, status: "approved" | "rejected") => {
    setBusyId(app.id);
    try {
      await update.mutateAsync({ id: app.id, data: { status, ...(status === "approved" ? { assignedRole: app.preferredRole } : {}) } as any });
      toast({ title: status === "approved" ? t("Approved", "تم القبول") : t("Rejected", "تم الرفض"), description: app.user?.fullName });
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Action failed", "فشلت العملية"), description: e?.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("Good morning", "صباح الخير") : hour < 18 ? t("Good afternoon", "مساء الخير") : t("Good evening", "مساء الخير");
  const firstName = user?.fullName?.split(" ")[0] || "";

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={new Date().toLocaleDateString(lang === "ar" ? "ar-MA" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        actions={
          <>
            {pending.length > 0 && (
              <Btn variant="gold" onClick={() => dispatch({ kind: "open", tab: "applications", id: pending[0].id })}>
                <FileCheck /> {t(`Review ${pending.length} application(s)`, `مراجعة ${pending.length} طلب`)}
              </Btn>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="outline"><Plus /> {t("New", "جديد")} <ChevronDown className="opacity-60" /></Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => dispatch({ kind: "create", tab: "press" })}><Newspaper className="size-4 opacity-70" /> {t("Article", "مقال")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ kind: "create", tab: "events" })}><Calendar className="size-4 opacity-70" /> {t("Event", "فعالية")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ kind: "create", tab: "polls" })}><Vote className="size-4 opacity-70" /> {t("Poll", "استطلاع")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => dispatch({ kind: "create", tab: "crises" })} className="text-rose-600 focus:text-rose-600"><Siren className="size-4" /> {t("Crisis", "أزمة")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t("Members", "الأعضاء")} value={fmt.number(members.length)} icon={Users} loading={membersLoading}
          delta={pctChange(new30, prev30)} deltaLabel={t(`+${new30} in 30d`, `+${new30} خلال 30 يوماً`)} spark={bucketCounts(joined, 12, 7)} onClick={() => go("users")} />
        <StatCard label={t("Pending applications", "طلبات معلقة")} value={pending.length} icon={FileCheck} loading={appsLoading}
          tone={pending.length ? "warning" : "neutral"} hint={pending[0] ? t(`Oldest ${fmt.relative(pending[0].createdAt)}`, `الأقدم ${fmt.relative(pending[0].createdAt)}`) : t("All reviewed", "تمت المراجعة")}
          onClick={() => go("applications")} />
        <StatCard label={t("Forum posts", "منشورات المنتدى")} value={fmt.number(k?.community?.totalForumPosts)} icon={MessageSquare} loading={kLoading} onClick={() => go("statistics")} />
        <StatCard label={t("Poll votes", "أصوات الاستطلاعات")} value={fmt.number(k?.polls?.totalVotes)} icon={Vote} loading={kLoading}
          hint={`${k?.polls?.active ?? 0} ${t("active polls", "استطلاعات نشطة")}`} onClick={() => go("polls")} />
        <StatCard label={t("Sahara responses", "ردود الصحراء")} value={fmt.number(responses.length)} icon={Scale}
          delta={pctChange(sahara7, saharaPrev7)} deltaLabel={t("vs last week", "مقارنة بالأسبوع الماضي")} spark={bucketCounts(responses.map((r) => r.createdAt), 12, 7)} onClick={() => go("sahara")} />
        <StatCard label={t("Open tickets", "تذاكر مفتوحة")} value={openTickets.length} icon={LifeBuoy} tone={openTickets.length ? "warning" : "neutral"}
          hint={`${tickets.length} ${t("total", "الإجمالي")}`} onClick={() => go("support")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Growth chart */}
        <Panel
          className="xl:col-span-2"
          title={t("Member growth", "نمو الأعضاء")}
          description={mode === "new"
            ? t(`${periodNew} new members in this period`, `${periodNew} عضو جديد في هذه الفترة`)
            : t(`${members.length} members in total`, `${members.length} عضو إجمالاً`)}
          actions={
            <div className="flex flex-wrap gap-2">
              <Segmented value={mode} onChange={setMode} options={[{ value: "new", label: t("New", "جدد") }, { value: "total", label: t("Total", "الإجمالي") }]} />
              <Segmented value={range} onChange={setRange} options={[{ value: "30d", label: "30d" }, { value: "90d", label: "90d" }, { value: "12m", label: "12m" }]} />
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            {mode === "new" ? (
              // Counts per day/month: bars, so empty days read as zero instead of a wavy line.
              <BarChart data={growth} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="value" name={t("New members", "أعضاء جدد")} fill="var(--viz-1)" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            ) : (
              <AreaChart data={growth} margin={{ left: -18, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--viz-1)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--viz-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
                <Area type="monotone" dataKey="total" name={t("Total members", "إجمالي الأعضاء")} stroke="var(--viz-1)" strokeWidth={2}
                  fill="url(#growthFill)" isAnimationActive={false} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Panel>

        {/* Needs attention */}
        <Panel
          title={t("Needs attention", "يحتاج انتباهك")}
          actions={pending.length > 0 && <Btn size="xs" variant="ghost" onClick={() => go("applications")}>{t("View all", "عرض الكل")} <ArrowRight className="rtl:rotate-180" /></Btn>}
          bodyClassName="px-0 pb-2"
        >
          {activeCrises.length > 0 && (
            <button type="button" onClick={() => go("crises")} className="mx-5 mb-3 flex w-[calc(100%-2.5rem)] items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/[0.06] px-3 py-2 text-left text-sm">
              <Siren className="size-4 shrink-0 animate-pulse text-rose-600" />
              <span className="flex-1 truncate font-medium">{t(`${activeCrises.length} active crisis`, `${activeCrises.length} أزمة نشطة`)}</span>
              <ArrowRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
            </button>
          )}
          {openTickets.length > 0 && (
            <button type="button" onClick={() => go("support")} className="mx-5 mb-3 flex w-[calc(100%-2.5rem)] items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-left text-sm">
              <LifeBuoy className="size-4 shrink-0 text-amber-600" />
              <span className="flex-1 truncate font-medium">{t(`${openTickets.length} open support ticket(s)`, `${openTickets.length} تذكرة دعم مفتوحة`)}</span>
              <ArrowRight className="size-3.5 text-muted-foreground rtl:rotate-180" />
            </button>
          )}
          {pending.length === 0 ? (
            <EmptyState icon={CheckCircle2} title={t("No pending applications", "لا توجد طلبات معلقة")} description={t("You're all caught up.", "أنت على اطلاع بكل شيء.")} className="py-8" />
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 6).map((a) => (
                <li key={a.id} className="group flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/40">
                  <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => dispatch({ kind: "open", tab: "applications", id: a.id })}>
                    <Avatar name={a.user?.fullName} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{a.user?.fullName}</span>
                      <span className="block truncate text-xs text-muted-foreground">{humanize(a.preferredRole)} · {fmt.relative(a.createdAt)}</span>
                    </span>
                  </button>
                  <div className="flex shrink-0 gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
                    <Btn size="icon-sm" variant="ghost" className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-600" disabled={busyId === a.id}
                      aria-label={t("Reject", "رفض")} onClick={() => dispatch({ kind: "open", tab: "applications", id: a.id })}><XCircle /></Btn>
                    <Btn size="icon-sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600" loading={busyId === a.id}
                      aria-label={t("Approve", "قبول")} title={t("Approve with preferred role", "قبول بالدور المفضل")} onClick={() => quickDecide(a, "approved")}>
                      {busyId !== a.id && <CheckCircle2 />}
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Breakdown row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title={t("Members by region", "الأعضاء حسب الجهة")} className="xl:col-span-2">
          <BarList data={byRegion} max={7} />
        </Panel>
        <Panel title={t("Simulation roles", "أدوار المحاكاة")}>
          <BarList data={byRole} max={7} />
        </Panel>
        <Panel title={t("Demographics", "التركيبة السكانية")}>
          <p className="mb-2 text-xs text-muted-foreground">{t("Sex", "الجنس")}</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
            {genderSplit.map((g, i) => g.value > 0 && (
              <div key={g.name} title={`${g.name}: ${g.value}`} style={{ width: `${(g.value / Math.max(1, genderTotal)) * 100}%`, background: `var(--viz-${i + 1})` }} className="h-full border-e-2 border-card last:border-0" />
            ))}
          </div>
          <ul className="mt-2.5 space-y-1">
            {genderSplit.map((g, i) => (
              <li key={g.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: `var(--viz-${i + 1})` }} />{g.name}</span>
                <span className="tabular-nums text-muted-foreground">{g.value} · {genderTotal ? Math.round((g.value / genderTotal) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-4 text-xs text-muted-foreground">{t("Age", "العمر")}</p>
          <div className="flex h-16 items-end gap-1.5">
            {byAge.map((a) => {
              const peak = Math.max(1, ...byAge.map((x) => x.value));
              return (
                <div key={a.name} className="flex flex-1 flex-col items-center gap-1" title={`${a.name}: ${a.value}`}>
                  <div className="w-full rounded-t bg-[color:var(--viz-1)]" style={{ height: `${Math.max(2, (a.value / peak) * 48)}px` }} />
                  <span className="text-[10px] text-muted-foreground">{a.name}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Feeds row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t("Newest members", "أحدث الأعضاء")} actions={<Btn size="xs" variant="ghost" onClick={() => go("users")}>{t("All", "الكل")} <ArrowRight className="rtl:rotate-180" /></Btn>} bodyClassName="px-0 pb-2">
          <ul className="divide-y divide-border">
            {recentMembers.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => dispatch({ kind: "open", tab: "users", id: m.id })} className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-secondary/40">
                  <Avatar name={m.fullName} src={m.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{m.region || m.email}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{fmt.relative(m.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("Upcoming events", "الفعاليات القادمة")} actions={<Btn size="xs" variant="ghost" onClick={() => go("events")}>{t("All", "الكل")} <ArrowRight className="rtl:rotate-180" /></Btn>} bodyClassName="px-0 pb-2">
          {upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title={t("Nothing scheduled", "لا شيء مجدول")} action={<Btn size="sm" variant="outline" onClick={() => dispatch({ kind: "create", tab: "events" })}><Plus /> {t("Schedule", "جدولة")}</Btn>} className="py-8" />
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((e) => {
                const d = new Date(e.startAt);
                return (
                  <li key={e.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="flex w-10 shrink-0 flex-col items-center rounded-md border border-border py-0.5 leading-tight">
                      <span className="text-[9px] font-semibold uppercase text-rose-600">{d.toLocaleString(lang === "ar" ? "ar-MA" : "en-US", { month: "short" })}</span>
                      <span className="text-sm font-semibold tabular-nums">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t(e.title, e.titleAr || e.title)}</div>
                      <div className="text-xs text-muted-foreground">{fmt.relative(e.startAt)} · {humanize(e.type)}</div>
                    </div>
                    {e.meetingUrl && <a href={e.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label={t("Meeting link", "رابط الاجتماع")}><Video className="size-4" /></a>}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title={t("Admin activity", "نشاط المسؤولين")} actions={<Btn size="xs" variant="ghost" onClick={() => go("system")}>{t("Logs", "السجلات")} <ArrowRight className="rtl:rotate-180" /></Btn>}>
          {logs.length === 0 ? (
            <EmptyState icon={Clock} title={t("No activity yet", "لا يوجد نشاط بعد")} className="py-8" />
          ) : (
            <ol className="relative space-y-3 border-s border-border ps-4">
              {logs.slice(0, 7).map((l) => (
                <li key={l.id} className="relative">
                  <span className="absolute -start-[21px] top-1.5 size-2 rounded-full bg-border ring-4 ring-card" />
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="font-medium">{l.actor?.fullName || t("System", "النظام")}</span>
                    <Pill tone={actionTone(l.action)}>{l.action}</Pill>
                  </div>
                  <div className="text-xs text-muted-foreground">{l.targetType ? `${l.targetType} #${l.targetId} · ` : ""}{fmt.relative(l.createdAt)}</div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}

function countList(values: (string | null | undefined)[]) {
  const m = new Map<string, number>();
  values.forEach((v) => { const k = v?.trim() || "—"; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

