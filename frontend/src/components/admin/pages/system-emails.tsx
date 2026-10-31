import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  AlertTriangle, Ban, Calendar, CheckCircle2, Clock, MessageSquare, Newspaper, Send, Siren,
  UserPlus, Users, Vote, Mail, Info, CircleCheck, CircleX,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useIntent } from "../context";
import { useAuditLogs, useKpis, useSystemLogs, jsonPost } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  Btn, DetailGrid, Field, NativeSelect, PageHeader, Panel, Pill, Segmented, StatCard, TextArea, TextInput,
  useConfirm, useFormat,
} from "../primitives";
import { cn } from "@/lib/utils";

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

// ── Emails ───────────────────────────────────────────────────────────────────

const SEGMENTS = [
  "active_users", "all_users", "pending_applicants", "approved_applicants", "rejected_applicants", "banned_users", "custom",
] as const;

export function EmailsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [segment, setSegment] = useState<string>("active_users");
  const [customList, setCustomList] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  useIntent("emails", (i) => {
    if (i.kind === "compose") {
      setSegment("custom");
      setCustomList(Array.from(new Set(i.emails)).join("\n"));
      setResult(null);
    }
  });

  const { data: mailer } = useQuery({ queryKey: ["/api/admin/email/status"], queryFn: () => customFetch<any>("/api/admin/email/status") });
  const { data: preview } = useQuery({
    queryKey: ["/api/admin/email/recipients", segment],
    queryFn: () => customFetch<any>(`/api/admin/email/recipients?segment=${segment}`),
    enabled: segment !== "custom",
  });

  const customEmails = customList.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
  const invalid = customEmails.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  const count = segment === "custom" ? customEmails.length : preview?.count ?? null;

  const segLabel = (s: string) => ({
    active_users: t("Active members", "الأعضاء النشطون"), all_users: t("All members", "جميع الأعضاء"), banned_users: t("Banned members", "المحظورون"),
    pending_applicants: t("Pending applicants", "المتقدمون المعلّقون"), approved_applicants: t("Approved applicants", "المتقدمون المقبولون"),
    rejected_applicants: t("Rejected applicants", "المتقدمون المرفوضون"), custom: t("Custom list", "قائمة مخصصة"),
  } as Record<string, string>)[s];

  const send = async () => {
    if (!subject.trim() || !message.trim()) { toast({ title: t("Subject and message are required", "العنوان والرسالة مطلوبان"), variant: "destructive" }); return; }
    if (segment === "custom" && (!customEmails.length || invalid.length)) {
      toast({ title: invalid.length ? t("Fix the invalid addresses first", "صحّح العناوين غير الصالحة أولاً") : t("Add at least one address", "أضف عنواناً واحداً على الأقل"), variant: "destructive" });
      return;
    }
    if (!(await confirm({
      title: t(`Send to ${count ?? "?"} recipient(s)?`, `الإرسال إلى ${count ?? "?"} مستلم؟`),
      description: t(`"${subject}" will be sent to ${segLabel(segment)}. This cannot be undone.`, `سيُرسل "${subject}" إلى ${segLabel(segment)}. لا يمكن التراجع.`),
      confirmLabel: t("Send now", "أرسل الآن"),
    }))) return;
    setSending(true);
    setResult(null);
    try {
      const r = await jsonPost("/api/admin/email/send", "POST", {
        segment, customEmails: segment === "custom" ? customEmails : undefined, subject, message, lang,
      });
      setResult(r);
      toast({ title: t(`Sent to ${r.sent} recipient(s)`, `تم الإرسال إلى ${r.sent} مستلم`), variant: r.failed > 0 ? "destructive" : "default" });
      if (r.failed === 0) { setSubject(""); setMessage(""); }
    } catch (e: any) {
      toast({ title: t("Send failed", "فشل الإرسال"), description: e?.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const paragraphs = message.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <PageHeader
        title={t("Emails", "البريد الإلكتروني")}
        description={t("Send branded emails to a segment of members or a custom list.", "أرسل رسائل بهوية المنصة إلى فئة من الأعضاء أو قائمة مخصصة.")}
        eyebrow={mailer && (mailer.configured
          ? <Pill tone="success" dot>{t("SMTP connected", "SMTP متصل")}</Pill>
          : <Pill tone="danger" dot>{t("SMTP not configured", "SMTP غير مهيأ")}</Pill>)}
      />

      {mailer && !mailer.configured && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rose-600" />
          <p className="text-rose-700 dark:text-rose-300">
            {t("Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (and optionally SMTP_FROM_NAME / SMTP_FROM_EMAIL) in the backend environment, then redeploy.",
              "عيّن SMTP_HOST وSMTP_PORT وSMTP_USER وSMTP_PASSWORD (واختيارياً SMTP_FROM_NAME / SMTP_FROM_EMAIL) في بيئة الخادم ثم أعد النشر.")}
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          <Panel title={t("1 · Audience", "١ · الجمهور")} description={t("Who should receive this email?", "من يجب أن يستلم هذا البريد؟")}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SEGMENTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSegment(s)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                    segment === s ? "border-primary bg-primary/[0.05] ring-1 ring-primary" : "border-border hover:border-foreground/25 hover:bg-secondary/40"
                  )}
                >
                  <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border", segment === s ? "border-primary" : "border-border")}>
                    {segment === s && <span className="size-2 rounded-full bg-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{segLabel(s)}</span>
                    <span className="block text-xs text-muted-foreground tabular-nums">
                      {s === "custom" ? t("Paste addresses", "الصق العناوين") : segment === s ? (preview ? `${preview.count} ${t("recipients", "مستلم")}` : "…") : " "}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {segment === "custom" && (
              <Field className="mt-4" label={t("Addresses — one per line, or comma-separated", "العناوين — واحد في كل سطر أو مفصولة بفواصل")}
                hint={<span className="tabular-nums">{customEmails.length} {t("address(es)", "عنوان")}{invalid.length > 0 && <span className="text-rose-600"> · {invalid.length} {t("invalid", "غير صالح")}: {invalid.slice(0, 3).join(", ")}</span>}</span>}>
                <TextArea value={customList} onChange={(e) => setCustomList(e.target.value)} rows={4} className="font-mono text-xs" placeholder="ahmed@example.com, sara@example.com" />
              </Field>
            )}
          </Panel>

          <Panel title={t("2 · Message", "٢ · الرسالة")}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <Field label={t("Subject", "العنوان")}><TextInput value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} /></Field>
                <Field label={t("Template language", "لغة القالب")}>
                  <NativeSelect value={lang} onChange={(e) => setLang(e.target.value as "en" | "ar")}>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </NativeSelect>
                </Field>
              </div>
              <Field label={t("Message", "الرسالة")} hint={t("Leave a blank line between paragraphs.", "اترك سطراً فارغاً بين الفقرات.")}>
                <TextArea value={message} onChange={(e) => setMessage(e.target.value)} rows={12} maxLength={20000} dir={lang === "ar" ? "rtl" : "ltr"}
                  placeholder={t("Write your message…", "اكتب رسالتك…")} />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="size-3.5" />
                  {t("Applicants are also emailed automatically when you approve or reject them.", "يُرسل للمتقدمين بريد تلقائي عند القبول أو الرفض.")}
                </p>
                <Btn variant="gold" size="lg" loading={sending} disabled={!mailer?.configured || !count} onClick={send}>
                  <Send /> {t(`Send to ${count ?? "…"}`, `إرسال إلى ${count ?? "…"}`)}
                </Btn>
              </div>
              {result && (
                <div className={cn("flex items-center gap-2 rounded-lg p-3 text-sm", result.failed ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
                  {result.failed ? <CircleX className="size-4" /> : <CircleCheck className="size-4" />}
                  {t(`Sent: ${result.sent} · Failed: ${result.failed}`, `أُرسل: ${result.sent} · فشل: ${result.failed}`)}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Live preview */}
        <div className="xl:sticky xl:top-20 xl:self-start">
          <Panel title={t("Preview", "معاينة")} description={t("Approximate rendering of the email", "عرض تقريبي للبريد")} bodyClassName="p-0 px-0 pb-0">
            <div className="border-t border-border bg-secondary/50 p-4">
              <div className="overflow-hidden rounded-lg bg-[#ffffff] text-[#1B2A4A] shadow-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
                <div className="bg-[#0d1626] px-6 py-5"><img src="/email-logo.png" alt="Youth Capital" className="h-8" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /></div>
                <div className="space-y-3 px-6 py-6">
                  <h3 className="text-lg font-bold">{subject || <span className="text-gray-300">{t("Subject", "العنوان")}</span>}</h3>
                  {paragraphs.length
                    ? paragraphs.map((p, i) => <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed text-[#3b4660]">{p}</p>)
                    : <p className="text-sm text-gray-300">{t("Your message will appear here.", "ستظهر رسالتك هنا.")}</p>}
                </div>
                <div className="border-t border-gray-100 px-6 py-4 text-[11px] text-gray-400">Youth Capital · youthcapital.org</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {segLabel(segment)}</span>
                <span className="tabular-nums">{count ?? "…"} {t("recipients", "مستلم")}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
      {confirmDialog}
    </>
  );
}

export { actionTone };
