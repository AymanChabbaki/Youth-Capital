import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useTriggerCrisis } from "@workspace/api-client-react";
import {
  AlertTriangle, LifeBuoy, MessageSquare, Scale, ShieldCheck, Siren, Zap, CheckCircle2, Clock, MapPin, Mail,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { AGE_RANGES, GENDERS } from "@/components/admin-table";
import { useAdmin, useIntent } from "../context";
import { useCrises, useSaharaResponses, useTickets, jsonPost } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer, Modal } from "../drawer";
import {
  Avatar, BarList, Btn, DetailGrid, Field, NativeSelect, PageHeader, Panel, Pill, StatCard, StatusPill, TextArea, TextInput,
  useFormat, humanize, countWithin, type Tone,
} from "../primitives";

const NOT_SAID = "Prefer not to say";
const TOOLTIP_STYLE = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--card-foreground)", fontSize: 12 };
const TICK = { fontSize: 11, fill: "var(--muted-foreground)" };

// ── Crises ───────────────────────────────────────────────────────────────────

const SEVERITY_TONE: Record<string, Tone> = { low: "neutral", medium: "warning", high: "danger", critical: "danger" };

export function CrisesPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { crises, isLoading } = useCrises();
  const trigger = useTriggerCrisis();
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });

  useIntent("crises", (i) => { if (i.kind === "create") setOpen(true); });

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    try {
      await trigger.mutateAsync({ data: form as any });
      toast({ title: t("Crisis broadcast to all members", "تم بث الأزمة لجميع الأعضاء") });
      setForm({ title: "", titleAr: "", description: "", descriptionAr: "", severity: "high" });
      setOpen(false);
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Broadcast failed", "فشل البث"), description: e?.message, variant: "destructive" });
    }
  };

  const active = crises.filter((c) => c.isActive);
  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "title", accessorFn: (c) => t(c.title, c.titleAr || c.title), sortingFn: textSort, enableHiding: false, meta: { label: t("Title", "العنوان") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Crisis", "الأزمة")} />,
      cell: ({ row }) => (
        <div className="min-w-[260px]">
          <div className="font-medium">{t(row.original.title, row.original.titleAr || row.original.title)}</div>
          <div className="line-clamp-1 text-xs text-muted-foreground">{t(row.original.description, row.original.descriptionAr || row.original.description)}</div>
        </div>
      ),
    },
    {
      id: "severity", accessorKey: "severity", filterFn: facetFilter, meta: { label: t("Severity", "الخطورة") },
      sortingFn: (a, b) => ["low", "medium", "high", "critical"].indexOf(a.original.severity) - ["low", "medium", "high", "critical"].indexOf(b.original.severity),
      header: ({ column }) => <ColumnHeader column={column} title={t("Severity", "الخطورة")} />,
      cell: ({ getValue }) => <Pill tone={SEVERITY_TONE[getValue()] || "neutral"} dot>{humanize(getValue())}</Pill>,
    },
    {
      id: "state", accessorFn: (c) => (c.isActive ? "active" : "resolved"), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Status", "الحالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} label={getValue() === "active" ? t("Active", "نشطة") : t("Resolved", "منتهية")} />,
    },
    {
      id: "createdBy", accessorFn: (c) => c.createdBy?.fullName || "", sortingFn: textSort, meta: { label: t("Triggered by", "أطلقها") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Triggered by", "أطلقها")} />,
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "createdAt", accessorFn: (c) => new Date(c.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Date", "التاريخ") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Triggered", "التاريخ")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader
        title={t("Crises", "الأزمات")}
        description={t("Broadcast crisis scenarios that every participant must respond to.", "بث سيناريوهات أزمات يتفاعل معها جميع المشاركين.")}
        actions={<Btn variant="danger" onClick={() => setOpen(true)}><Zap /> {t("Trigger crisis", "إطلاق أزمة")}</Btn>}
      />

      {active.length > 0 && (
        <div className="space-y-2">
          {active.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
              <Siren className="mt-0.5 size-5 shrink-0 animate-pulse text-rose-600" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t(c.title, c.titleAr || c.title)}</span>
                  <Pill tone={SEVERITY_TONE[c.severity] || "danger"} dot>{humanize(c.severity)}</Pill>
                  <span className="text-xs text-muted-foreground">{fmt.relative(c.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t(c.description, c.descriptionAr || c.description)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Active now", "نشطة الآن")} value={active.length} icon={Siren} loading={isLoading} tone={active.length ? "danger" : "neutral"} />
        <StatCard label={t("All time", "الإجمالي")} value={crises.length} icon={AlertTriangle} loading={isLoading} />
        <StatCard label={t("Critical", "حرجة")} value={crises.filter((c) => c.severity === "critical").length} loading={isLoading} />
        <StatCard label={t("Last 30 days", "آخر 30 يوماً")} value={countWithin(crises.map((c) => c.createdAt), 30)} loading={isLoading} />
      </div>

      <DataTable
        data={crises}
        columns={columns}
        isLoading={isLoading}
        getRowId={(c) => String(c.id)}
        searchPlaceholder={t("Search crises…", "ابحث في الأزمات…")}
        getSearchText={(c) => [c.title, c.titleAr, c.description, c.descriptionAr].filter(Boolean).join(" ")}
        initialSort={[{ id: "title", desc: false }]}
        facets={[
          { column: "severity", title: t("Severity", "الخطورة"), options: ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: humanize(v) })) },
          { column: "state", title: t("Status", "الحالة"), options: [{ value: "active", label: t("Active", "نشطة") }, { value: "resolved", label: t("Resolved", "منتهية") }] },
        ]}
        dateColumn={{ column: "createdAt", title: t("Date", "التاريخ") }}
        onRowClick={setViewing}
        exportName="crises"
        exportRow={(c) => ({ id: c.id, title: c.title, severity: c.severity, active: c.isActive, triggeredBy: c.createdBy?.fullName, createdAt: c.createdAt })}
        empty={{ title: t("No crises yet", "لا توجد أزمات") }}
      />

      <Drawer open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} title={viewing ? t(viewing.title, viewing.titleAr || viewing.title) : ""}>
        {viewing && (
          <div className="space-y-5">
            <div className="flex gap-1.5">
              <Pill tone={SEVERITY_TONE[viewing.severity] || "neutral"} dot>{humanize(viewing.severity)}</Pill>
              <StatusPill value={viewing.isActive ? "active" : "resolved"} label={viewing.isActive ? t("Active", "نشطة") : t("Resolved", "منتهية")} />
            </div>
            <DetailGrid items={[
              { label: t("Description (English)", "الوصف (إنجليزي)"), value: <p className="whitespace-pre-wrap leading-relaxed">{viewing.description}</p>, full: true },
              ...(viewing.descriptionAr ? [{ label: t("Description (Arabic)", "الوصف (عربي)"), value: <p dir="rtl" className="whitespace-pre-wrap leading-relaxed">{viewing.descriptionAr}</p>, full: true }] : []),
              { label: t("Triggered by", "أطلقها"), value: viewing.createdBy?.fullName || "—" },
              { label: t("Date", "التاريخ"), value: fmt.dateTime(viewing.createdAt) },
            ]} />
          </div>
        )}
      </Drawer>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={<span className="flex items-center gap-2"><Siren className="size-4 text-rose-600" /> {t("Trigger a crisis", "إطلاق أزمة")}</span>}
        description={t("This is broadcast immediately to every participant on the platform.", "سيتم بثها فوراً لجميع المشاركين في المنصة.")}
        className="sm:max-w-2xl"
        footer={
          <>
            <Btn variant="outline" onClick={() => setOpen(false)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn variant="danger" loading={trigger.isPending} disabled={!form.title.trim() || !form.description.trim()} onClick={submit}>
              <Siren /> {t("Broadcast now", "بث الآن")}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Title (English)", "العنوان (إنجليزي)")}><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Economic crisis" /></Field>
          <Field label={t("Title (Arabic)", "العنوان (عربي)")}><TextInput value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" placeholder="مثال: أزمة اقتصادية" /></Field>
          <Field label={t("Description (English)", "الوصف (إنجليزي)")} className="sm:col-span-2"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></Field>
          <Field label={t("Description (Arabic)", "الوصف (عربي)")} className="sm:col-span-2"><TextArea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" rows={4} /></Field>
          <Field label={t("Severity", "الخطورة")}>
            <NativeSelect value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="medium">{t("Medium", "متوسط")}</option>
              <option value="high">{t("High", "عالٍ")}</option>
              <option value="critical">{t("Critical", "حرج")}</option>
            </NativeSelect>
          </Field>
        </div>
      </Modal>
    </>
  );
}

// ── Support inbox ────────────────────────────────────────────────────────────

const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
const TICKET_CATEGORIES = ["technical", "rules", "account", "other"] as const;

export function SupportPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { dispatch } = useAdmin();
  const { tickets, isLoading } = useTickets();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<string>("in_progress");
  const [saving, setSaving] = useState(false);

  useIntent("support", (i) => { if (i.kind === "open") setViewingId(Number(i.id)); });

  const viewing = tickets.find((x) => x.id === viewingId) || null;
  useEffect(() => {
    if (viewing) { setReply(viewing.adminResponse || ""); setStatus(viewing.status === "open" ? "in_progress" : viewing.status); }
  }, [viewing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = (s: string) => ({ open: t("Open", "مفتوحة"), in_progress: t("In progress", "قيد المعالجة"), resolved: t("Resolved", "محلولة"), closed: t("Closed", "مغلقة") } as Record<string, string>)[s] || humanize(s);
  const catLabel = (c: string) => ({ technical: t("Technical", "تقني"), rules: t("Rules", "القواعد"), account: t("Account", "الحساب"), other: t("Other", "أخرى") } as Record<string, string>)[c] || humanize(c);

  const save = async (nextStatus = status) => {
    if (!viewing) return;
    setSaving(true);
    try {
      // The API overwrites the response with null when omitted, so always send it.
      await jsonPost(`/api/support/tickets/${viewing.id}`, "PATCH", { status: nextStatus, adminResponse: reply.trim() || undefined });
      toast({ title: t("Ticket updated", "تم تحديث التذكرة") });
      qc.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/kpis"] });
    } catch (e: any) {
      toast({ title: t("Update failed", "فشل التحديث"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "subject", accessorKey: "subject", sortingFn: textSort, enableHiding: false, meta: { label: t("Subject", "الموضوع") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Ticket", "التذكرة")} />,
      cell: ({ row }) => (
        <div className="min-w-[260px]">
          <div className="flex items-center gap-2 font-medium">
            {row.original.status === "open" && <span className="size-2 shrink-0 rounded-full bg-amber-500" />}
            <span className="truncate">{row.original.subject}</span>
          </div>
          <div className="line-clamp-1 text-xs text-muted-foreground">{row.original.message}</div>
        </div>
      ),
    },
    {
      id: "member", accessorFn: (x) => x.user?.fullName || "", sortingFn: textSort, meta: { label: t("Member", "العضو") },
      header: ({ column }) => <ColumnHeader column={column} title={t("From", "من")} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.original.user?.fullName} size="sm" />
          <span className="truncate text-sm">{row.original.user?.fullName || "—"}</span>
        </div>
      ),
    },
    {
      id: "category", accessorKey: "category", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Category", "الفئة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Category", "الفئة")} />,
      cell: ({ getValue }) => <Pill>{catLabel(getValue())}</Pill>,
    },
    {
      id: "status", accessorKey: "status", filterFn: facetFilter, meta: { label: t("Status", "الحالة") },
      sortingFn: (a, b) => TICKET_STATUSES.indexOf(a.original.status) - TICKET_STATUSES.indexOf(b.original.status),
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} label={label(getValue())} />,
    },
    {
      id: "createdAt", accessorFn: (x) => new Date(x.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Opened", "فُتحت") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Opened", "فُتحت")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
    {
      id: "updatedAt", accessorFn: (x) => new Date(x.updatedAt || x.createdAt), sortingFn: "datetime", meta: { label: t("Last update", "آخر تحديث") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Updated", "حُدّثت")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{fmt.relative(row.original.updatedAt || row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = tickets.filter((x) => x.status === "open").length;
  const inProgress = tickets.filter((x) => x.status === "in_progress").length;

  return (
    <>
      <PageHeader title={t("Support inbox", "صندوق الدعم")} description={t("Answer member tickets and track their status.", "أجب على تذاكر الأعضاء وتابع حالتها.")} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Open", "مفتوحة")} value={open} icon={LifeBuoy} loading={isLoading} tone={open ? "warning" : "neutral"} />
        <StatCard label={t("In progress", "قيد المعالجة")} value={inProgress} icon={Clock} loading={isLoading} />
        <StatCard label={t("Resolved", "محلولة")} value={tickets.filter((x) => x.status === "resolved" || x.status === "closed").length} icon={CheckCircle2} loading={isLoading} />
        <StatCard label={t("Last 30 days", "آخر 30 يوماً")} value={countWithin(tickets.map((x) => x.createdAt), 30)} icon={MessageSquare} loading={isLoading} />
      </div>
      <DataTable
        data={tickets}
        columns={columns}
        isLoading={isLoading}
        getRowId={(x) => String(x.id)}
        searchPlaceholder={t("Search subject, message, member…", "ابحث في الموضوع، الرسالة، العضو…")}
        getSearchText={(x) => [x.subject, x.message, x.user?.fullName, x.user?.email, x.adminResponse].filter(Boolean).join(" ")}
        initialSort={[{ id: "status", desc: false }]}
        facets={[
          { column: "status", title: t("Status", "الحالة"), options: TICKET_STATUSES.map((v) => ({ value: v, label: label(v) })) },
          { column: "category", title: t("Category", "الفئة"), options: TICKET_CATEGORIES.map((v) => ({ value: v, label: catLabel(v) })) },
        ]}
        dateColumn={{ column: "createdAt", title: t("Opened", "فُتحت") }}
        onRowClick={(x) => setViewingId(x.id)}
        exportName="support-tickets"
        exportRow={(x) => ({ id: x.id, subject: x.subject, category: x.category, status: x.status, member: x.user?.fullName, email: x.user?.email, message: x.message, response: x.adminResponse, createdAt: x.createdAt, updatedAt: x.updatedAt })}
        rowClassName={(x) => (x.status === "open" ? "font-medium" : undefined)}
        empty={{ title: t("No tickets", "لا توجد تذاكر"), description: t("Member support requests will appear here.", "ستظهر طلبات دعم الأعضاء هنا.") }}
      />

      <Drawer
        open={!!viewing}
        onOpenChange={(o) => !o && setViewingId(null)}
        width="lg"
        title={viewing?.subject}
        description={viewing && `#${viewing.id} · ${catLabel(viewing.category)} · ${fmt.dateTime(viewing.createdAt)}`}
        footer={viewing && (
          <>
            <Btn variant="outline" className="me-auto" loading={saving} onClick={() => save("closed")}>{t("Close ticket", "إغلاق التذكرة")}</Btn>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </NativeSelect>
            <Btn loading={saving} onClick={() => save()}>{t("Save reply", "حفظ الرد")}</Btn>
          </>
        )}
      >
        {viewing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={viewing.user?.fullName} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{viewing.user?.fullName}</div>
                <div className="text-xs text-muted-foreground">{viewing.user?.email}</div>
              </div>
              <StatusPill value={viewing.status} label={label(viewing.status)} />
            </div>
            <div className="flex gap-2">
              {viewing.user?.email && <Btn size="sm" variant="outline" onClick={() => dispatch({ kind: "compose", tab: "emails", emails: [viewing.user.email] })}><Mail /> {t("Email member", "مراسلة العضو")}</Btn>}
              {viewing.userId && <Btn size="sm" variant="outline" onClick={() => dispatch({ kind: "open", tab: "users", id: viewing.userId })}>{t("Open profile", "فتح الملف")}</Btn>}
            </div>
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="mb-2 text-xs text-muted-foreground">{t("Message", "الرسالة")}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{viewing.message}</p>
            </div>
            <Field label={t("Admin response", "رد المسؤول")} hint={t("Visible to the member on their support page.", "يظهر للعضو في صفحة الدعم.")}>
              <TextArea value={reply} onChange={(e) => setReply(e.target.value)} rows={6} maxLength={5000} placeholder={t("Write a reply…", "اكتب رداً…")} />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}

// ── Sahara consultation ──────────────────────────────────────────────────────

// Must match AXES in backend/src/routes/sahara.ts
const SAHARA_AXES = ["Constitutional & Legal Framework", "Distribution of Powers & Institutions", "Financial & Natural Resources", "General / Other"];

export function SaharaPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { responses, isLoading } = useSaharaResponses();
  const [viewing, setViewing] = useState<any>(null);

  const byRegion = useMemo(() => countList(responses.map((r) => r.region)), [responses]);
  const byAxis = useMemo(() => SAHARA_AXES.map((a) => ({ name: a, value: responses.filter((r) => r.axis === a).length })), [responses]);
  const shared = responses.filter((r) => (r.ageRange && r.ageRange !== NOT_SAID) || (r.gender && r.gender !== NOT_SAID)).length;

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "opinion", accessorKey: "opinion", enableSorting: false, enableHiding: false, meta: { label: t("Opinion", "الرأي") },
      header: () => <span className="text-xs font-medium text-muted-foreground">{t("Response", "الرد")}</span>,
      cell: ({ getValue }) => <p className="line-clamp-2 min-w-[280px] max-w-xl text-sm text-foreground/90" dir="auto">{getValue()}</p>,
    },
    {
      id: "region", accessorKey: "region", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Region", "الجهة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Region", "الجهة")} />,
      cell: ({ getValue }) => <span className="whitespace-nowrap">{getValue()}</span>,
    },
    {
      id: "axis", accessorFn: (r) => r.axis || "—", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Section", "المحور") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Section", "المحور")} />,
      cell: ({ getValue }) => <Pill tone="info" className="max-w-[200px] truncate">{getValue()}</Pill>,
    },
    {
      id: "ageRange", accessorFn: (r) => r.ageRange || NOT_SAID, filterFn: facetFilter, meta: { label: t("Age range", "الفئة العمرية") },
      sortingFn: (a, b) => AGE_RANGES.indexOf(a.original.ageRange || NOT_SAID) - AGE_RANGES.indexOf(b.original.ageRange || NOT_SAID),
      header: ({ column }) => <ColumnHeader column={column} title={t("Age", "العمر")} />,
      cell: ({ getValue }) => (getValue() === NOT_SAID ? <span className="text-muted-foreground">—</span> : <span className="whitespace-nowrap">{getValue()}</span>),
    },
    {
      id: "gender", accessorFn: (r) => r.gender || NOT_SAID, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Sex", "الجنس") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Sex", "الجنس")} />,
      cell: ({ getValue }) => (getValue() === NOT_SAID ? <span className="text-muted-foreground">—</span> : getValue()),
    },
    {
      id: "ipAddress", accessorFn: (r) => r.ipAddress || "", sortingFn: textSort, meta: { label: t("IP address", "عنوان IP") },
      header: ({ column }) => <ColumnHeader column={column} title="IP" />,
      cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "createdAt", accessorFn: (r) => new Date(r.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Submitted", "تاريخ الإرسال") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Submitted", "أُرسل")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.date(row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader
        title={t("Sahara consultation", "استشارة الصحراء")}
        description={t("Public responses to the Autonomy Initiative consultation.", "الردود العامة على استشارة مبادرة الحكم الذاتي.")}
        eyebrow={<Pill tone="gold"><ShieldCheck className="size-3" /> {t("Not anonymous — respondents consented to IP and browser collection", "غير مجهولة — وافق المشاركون على جمع IP والمتصفح")}</Pill>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Responses", "الردود")} value={fmt.number(responses.length)} icon={Scale} loading={isLoading}
          hint={t(`${countWithin(responses.map((r) => r.createdAt), 7)} this week`, `${countWithin(responses.map((r) => r.createdAt), 7)} هذا الأسبوع`)} />
        <StatCard label={t("Regions represented", "الجهات الممثلة")} value={byRegion.length} icon={MapPin} loading={isLoading} />
        <StatCard label={t("Most discussed", "الأكثر نقاشاً")} value={[...byAxis].sort((a, b) => b.value - a.value)[0]?.value ?? 0}
          hint={[...byAxis].sort((a, b) => b.value - a.value)[0]?.name} loading={isLoading} />
        <StatCard label={t("Shared age or sex", "شاركوا العمر أو الجنس")} value={responses.length ? `${Math.round((shared / responses.length) * 100)}%` : "—"} loading={isLoading} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("By region", "حسب الجهة")} description={t("Top regions by number of responses", "أكثر الجهات مشاركة")}>
          <BarList data={byRegion} max={8} />
        </Panel>
        <Panel title={t("By section", "حسب المحور")}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byAxis} layout="vertical" margin={{ left: 4, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={170} tick={TICK} axisLine={false} tickLine={false} interval={0} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="value" name={t("Responses", "الردود")} fill="var(--viz-1)" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <DataTable
        data={responses}
        columns={columns}
        isLoading={isLoading}
        getRowId={(r) => String(r.id)}
        searchPlaceholder={t("Search opinions, region, IP…", "ابحث في الآراء، الجهة، IP…")}
        getSearchText={(r) => [r.opinion, r.region, r.axis, r.ipAddress].filter(Boolean).join(" ")}
        initialSort={[{ id: "region", desc: false }]}
        initialHidden={["ipAddress"]}
        facets={[
          { column: "region", title: t("Region", "الجهة") },
          { column: "axis", title: t("Section", "المحور"), options: SAHARA_AXES.map((v) => ({ value: v })) },
          { column: "ageRange", title: t("Age", "العمر"), options: AGE_RANGES.map((v) => ({ value: v })) },
          { column: "gender", title: t("Sex", "الجنس"), options: GENDERS.map((v) => ({ value: v })) },
        ]}
        dateColumn={{ column: "createdAt", title: t("Submitted", "تاريخ الإرسال") }}
        onRowClick={setViewing}
        exportName="sahara-responses"
        exportRow={(r) => ({ id: r.id, region: r.region, section: r.axis, ageRange: r.ageRange || NOT_SAID, gender: r.gender || NOT_SAID, opinion: r.opinion, ipAddress: r.ipAddress, userAgent: r.userAgent, submitted: r.createdAt })}
        empty={{ title: t("No responses yet", "لا توجد ردود بعد") }}
      />
      <Drawer open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} title={t("Response", "الرد")} description={viewing && `#${viewing.id} · ${fmt.dateTime(viewing.createdAt)}`}>
        {viewing && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-1.5">
              <Pill tone="gold">{viewing.region}</Pill>
              {viewing.axis && <Pill tone="info">{viewing.axis}</Pill>}
              {viewing.ageRange && viewing.ageRange !== NOT_SAID && <Pill>{viewing.ageRange}</Pill>}
              {viewing.gender && viewing.gender !== NOT_SAID && <Pill>{viewing.gender}</Pill>}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" dir="auto">{viewing.opinion}</p>
            <DetailGrid items={[
              { label: t("IP address", "عنوان IP"), value: <span className="font-mono text-xs">{viewing.ipAddress || "—"}</span> },
              { label: t("Submitted", "أُرسل"), value: fmt.dateTime(viewing.createdAt) },
              { label: t("Browser", "المتصفح"), value: <span className="break-all font-mono text-[11px] text-muted-foreground">{viewing.userAgent || "—"}</span>, full: true },
            ]} />
          </div>
        )}
      </Drawer>
    </>
  );
}

function countList(values: (string | null | undefined)[]) {
  const m = new Map<string, number>();
  values.forEach((v) => { const k = v?.trim() || "—"; m.set(k, (m.get(k) || 0) + 1); });
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}
