import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle, Ban, Calendar, CheckCircle2, Clock, MessageSquare, Newspaper, Siren,
  UserPlus, Users, Vote,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuditLogs, useKpis, useSystemLogs } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  DetailGrid, PageHeader, Pill, Segmented, StatCard, useFormat,
} from "../primitives";

// ── System & logs ────────────────────────────────────────────────────────────

export function SystemPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { data: k, isLoading } = useKpis();
  const audit = useAuditLogs();
  const errors = useSystemLogs();
  const [view, setView] = useState<"activity" | "errors">("activity");
  const [detail, setDetail] = useState<any>(null);

  const auditCols = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "action", accessorKey: "action", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Action", "الإجراء") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Action", "الإجراء")} />,
      cell: ({ getValue }) => <Pill tone={actionTone(getValue())}>{getValue()}</Pill>,
    },
    {
      id: "actor", accessorFn: (l) => l.actor?.fullName || t("System", "النظام"), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Admin", "المسؤول") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Admin", "المسؤول")} />,
    },
    {
      id: "target", accessorFn: (l) => (l.targetType ? `${l.targetType} #${l.targetId}` : ""), sortingFn: textSort, meta: { label: t("Target", "الهدف") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Target", "الهدف")} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "details", accessorFn: (l) => (l.metadata ? JSON.stringify(l.metadata) : ""), enableSorting: false, meta: { label: t("Details", "التفاصيل") },
      header: () => <span className="text-xs font-medium text-muted-foreground">{t("Details", "التفاصيل")}</span>,
      cell: ({ getValue }) => <span className="block max-w-sm truncate font-mono text-[11px] text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "when", accessorFn: (l) => new Date(l.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("When", "الوقت") },
      header: ({ column }) => <ColumnHeader column={column} title={t("When", "الوقت")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const errorCols = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "level", accessorKey: "level", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Level", "المستوى") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Level", "المستوى")} />,
      cell: ({ getValue }) => <Pill tone={getValue() === "error" ? "danger" : "warning"} dot>{getValue()}</Pill>,
    },
    {
      id: "message", accessorKey: "message", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Message", "الرسالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Message", "الرسالة")} />,
      cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
    },
    {
      id: "route", accessorFn: (l) => (l.context?.req ? `${l.context.req.method} ${l.context.req.url}` : ""), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Route", "المسار") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Route", "المسار")} />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "cause", accessorFn: (l) => l.context?.err?.message || "", enableSorting: false, meta: { label: t("Cause", "السبب") },
      header: () => <span className="text-xs font-medium text-muted-foreground">{t("Cause", "السبب")}</span>,
      cell: ({ getValue }) => <span className="block max-w-md truncate font-mono text-[11px] text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "when", accessorFn: (l) => new Date(l.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("When", "الوقت") },
      header: ({ column }) => <ColumnHeader column={column} title={t("When", "الوقت")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const errors24h = errors.logs.filter((l) => l.level === "error" && Date.now() - +new Date(l.createdAt) < 86400000).length;

  return (
    <>
      <PageHeader title={t("System & logs", "النظام والسجلات")} description={t("Platform health, admin activity, and server errors. Refreshes every 30 seconds.", "صحة المنصة ونشاط المسؤولين وأخطاء الخادم. يتحدث كل 30 ثانية.")} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label={t("Users", "المستخدمون")} value={fmt.number(k?.users?.total)} icon={Users} loading={isLoading} hint={`${k?.users?.active ?? 0} ${t("active", "نشط")}`} />
        <StatCard label={t("New · 7 days", "جدد · 7 أيام")} value={fmt.number(k?.users?.newLast7Days)} icon={UserPlus} loading={isLoading} hint={`${k?.users?.newLast30Days ?? 0} ${t("in 30 days", "خلال 30 يوماً")}`} />
        <StatCard label={t("Banned", "محظورون")} value={fmt.number(k?.users?.banned)} icon={Ban} loading={isLoading} />
        <StatCard label={t("Orphaned signups", "تسجيلات بلا طلب")} value={fmt.number(k?.users?.orphanedRegistrations)} icon={AlertTriangle} loading={isLoading} hint={t("Registered, no application", "مسجل بدون طلب")} />
        <StatCard label={t("Pending apps", "طلبات معلقة")} value={fmt.number(k?.applications?.pending)} icon={Clock} loading={isLoading} />
        <StatCard label={t("Approved apps", "طلبات مقبولة")} value={fmt.number(k?.applications?.approved)} icon={CheckCircle2} loading={isLoading} />
        <StatCard label={t("Articles", "المقالات")} value={fmt.number(k?.articles?.total)} icon={Newspaper} loading={isLoading} />
        <StatCard label={t("Events", "الفعاليات")} value={fmt.number(k?.events?.total)} icon={Calendar} loading={isLoading} hint={`${k?.events?.upcoming ?? 0} ${t("upcoming", "قادمة")}`} />
        <StatCard label={t("Poll votes", "أصوات الاستطلاعات")} value={fmt.number(k?.polls?.totalVotes)} icon={Vote} loading={isLoading} hint={`${k?.polls?.active ?? 0} ${t("active polls", "استطلاعات نشطة")}`} />
        <StatCard label={t("Crises", "الأزمات")} value={fmt.number(k?.crises?.total)} icon={Siren} loading={isLoading} hint={`${k?.crises?.active ?? 0} ${t("active", "نشطة")}`} />
        <StatCard label={t("Forum posts", "منشورات المنتدى")} value={fmt.number(k?.community?.totalForumPosts)} icon={MessageSquare} loading={isLoading} />
        <StatCard label={t("Errors · 24h", "أخطاء · 24 ساعة")} value={errors24h} icon={AlertTriangle} loading={errors.isLoading} tone={errors24h ? "danger" : "neutral"} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          onChange={setView}
          size="md"
          options={[
            { value: "activity", label: t("Admin activity", "نشاط المسؤولين"), count: audit.logs.length },
            { value: "errors", label: t("Errors & warnings", "الأخطاء والتحذيرات"), count: errors.logs.length },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
          {t("Live · latest 100 entries", "مباشر · آخر 100 سجل")}
        </span>
      </div>

      {view === "activity" ? (
        <DataTable
          key="activity"
          data={audit.logs}
          columns={auditCols}
          isLoading={audit.isLoading}
          getRowId={(l) => String(l.id)}
          searchPlaceholder={t("Search actions, admins, details…", "ابحث في الإجراءات والمسؤولين…")}
          getSearchText={(l) => [l.action, l.actor?.fullName, l.targetType, l.targetId, JSON.stringify(l.metadata || {})].join(" ")}
          initialSort={[{ id: "when", desc: true }]}
          facets={[{ column: "action", title: t("Action", "الإجراء") }, { column: "actor", title: t("Admin", "المسؤول") }]}
          dateColumn={{ column: "when", title: t("Date", "التاريخ") }}
          onRowClick={setDetail}
          exportName="admin-activity"
          exportRow={(l) => ({ id: l.id, action: l.action, admin: l.actor?.fullName, targetType: l.targetType, targetId: l.targetId, metadata: l.metadata, createdAt: l.createdAt })}
          empty={{ title: t("No activity yet", "لا يوجد نشاط بعد") }}
        />
      ) : (
        <DataTable
          key="errors"
          data={errors.logs}
          columns={errorCols}
          isLoading={errors.isLoading}
          getRowId={(l) => String(l.id)}
          searchPlaceholder={t("Search messages, routes, causes…", "ابحث في الرسائل والمسارات…")}
          getSearchText={(l) => [l.level, l.message, JSON.stringify(l.context || {})].join(" ")}
          initialSort={[{ id: "when", desc: true }]}
          facets={[{ column: "level", title: t("Level", "المستوى") }, { column: "message", title: t("Message", "الرسالة") }, { column: "route", title: t("Route", "المسار") }]}
          dateColumn={{ column: "when", title: t("Date", "التاريخ") }}
          onRowClick={setDetail}
          exportName="system-errors"
          exportRow={(l) => ({ id: l.id, level: l.level, message: l.message, context: l.context, createdAt: l.createdAt })}
          empty={{ title: t("No errors logged", "لا توجد أخطاء"), description: t("Everything is running smoothly.", "كل شيء يعمل بسلاسة.") }}
        />
      )}

      <Drawer open={!!detail} onOpenChange={(o) => !o && setDetail(null)} width="lg"
        title={detail?.action || detail?.message}
        description={detail && fmt.dateTime(detail.createdAt)}>
        {detail && (
          <div className="space-y-4">
            {detail.action && (
              <DetailGrid items={[
                { label: t("Admin", "المسؤول"), value: detail.actor?.fullName || t("System", "النظام") },
                { label: t("Target", "الهدف"), value: detail.targetType ? `${detail.targetType} #${detail.targetId}` : "—" },
              ]} />
            )}
            <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-secondary/40 p-4 font-mono text-[11px] leading-relaxed" dir="ltr">
              {JSON.stringify(detail.metadata ?? detail.context ?? {}, null, 2)}
            </pre>
          </div>
        )}
      </Drawer>
    </>
  );
}

function actionTone(action: string) {
  if (/delete|ban|reject/i.test(action)) return "danger" as const;
  if (/approve|unban|create/i.test(action)) return "success" as const;
  if (/update|edit/i.test(action)) return "info" as const;
  return "neutral" as const;
}

export { actionTone };
