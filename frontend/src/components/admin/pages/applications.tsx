import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Clock, FileCheck, Linkedin, Mail, MoreHorizontal, Phone, XCircle, Eye, Inbox,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useUpdateRoleApplication } from "@workspace/api-client-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGE_RANGES, GENDERS, ageRangeOf } from "@/components/admin-table";
import { useAdmin, useIntent } from "../context";
import { useApplications } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  Avatar, Btn, DetailGrid, Field, NativeSelect, PageHeader, Pill, Segmented, StatCard, StatusPill, TextArea,
  useConfirm, useFormat, humanize,
} from "../primitives";

const NOT_SAID = "Prefer not to say";
// Must match PREFERRED_ROLES in backend/src/routes/roles.ts
const ROLES = ["minister", "mp", "local_council", "diaspora_rep", "Active Member", "Executive Bureau Member", "Ambassador Member"];

type StatusTab = "pending" | "approved" | "rejected" | "all";

export default function ApplicationsPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { dispatch } = useAdmin();
  const { applications, isLoading } = useApplications();
  const update = useUpdateRoleApplication();
  const [confirm, confirmDialog] = useConfirm();
  const [tab, setTab] = useState<StatusTab>("pending");
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [assignedRole, setAssignedRole] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  useIntent("applications", (i) => {
    if (i.kind === "open") {
      const app = applications.find((a) => a.id === Number(i.id));
      if (app) setTab(app.status);
      setReviewId(Number(i.id));
    }
    if (i.kind === "filter") setTab(i.value as StatusTab);
  });

  const counts = useMemo(() => ({
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    all: applications.length,
  }), [applications]);

  // Queue order for prev/next in the review drawer: oldest pending first.
  const rows = useMemo(
    () => (tab === "all" ? applications : applications.filter((a) => a.status === tab))
      .slice()
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [applications, tab]
  );
  const reviewing = applications.find((a) => a.id === reviewId) || null;
  const idx = reviewing ? rows.findIndex((a) => a.id === reviewing.id) : -1;

  useEffect(() => {
    if (reviewing) { setAssignedRole(reviewing.assignedRole || reviewing.preferredRole); setAdminNote(reviewing.adminNote || ""); }
  }, [reviewing?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (app: any, status: "approved" | "rejected", opts?: { role?: string; note?: string; quiet?: boolean }) => {
    await update.mutateAsync({
      id: app.id,
      data: {
        status,
        ...(status === "approved" ? { assignedRole: (opts?.role || app.preferredRole) as any } : {}),
        ...(opts?.note ? { adminNote: opts.note } : {}),
      },
    });
    if (!opts?.quiet) {
      toast({
        title: status === "approved" ? t("Application approved", "تم قبول الطلب") : t("Application rejected", "تم رفض الطلب"),
        description: t(`${app.user?.fullName} has been notified by email.`, `تم إشعار ${app.user?.fullName} بالبريد.`),
      });
    }
  };

  const decideFromDrawer = async (status: "approved" | "rejected") => {
    if (!reviewing) return;
    if (status === "rejected" && !(await confirm({
      title: t(`Reject ${reviewing.user?.fullName}?`, `رفض ${reviewing.user?.fullName}؟`),
      description: t("The applicant will receive a rejection email.", "سيتلقى المتقدم بريد الرفض."),
      confirmLabel: t("Reject", "رفض"), destructive: true,
    }))) return;
    setBusy(status === "approved" ? "approve" : "reject");
    try {
      await decide(reviewing, status, { role: assignedRole, note: adminNote.trim() || undefined });
      // Advance to the next item in the queue so reviewing is one click per applicant.
      const next = rows[idx + 1] || rows[idx - 1];
      setReviewId(tab === "pending" && next && next.id !== reviewing.id ? next.id : null);
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Action failed", "فشلت العملية"), description: e?.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const bulkDecide = async (apps: any[], status: "approved" | "rejected", clear: () => void) => {
    const pending = apps.filter((a) => a.status === "pending");
    if (!pending.length) return;
    if (!(await confirm({
      title: status === "approved"
        ? t(`Approve ${pending.length} application(s)?`, `قبول ${pending.length} طلب؟`)
        : t(`Reject ${pending.length} application(s)?`, `رفض ${pending.length} طلب؟`),
      description: t("Each applicant gets their preferred role (when approving) and an automatic email.", "يحصل كل متقدم على دوره المفضل (عند القبول) وبريد تلقائي."),
      confirmLabel: status === "approved" ? t("Approve all", "قبول الكل") : t("Reject all", "رفض الكل"),
      destructive: status === "rejected",
    }))) return;
    let ok = 0;
    for (const app of pending) {
      try { await decide(app, status, { quiet: true }); ok++; } catch { /* counted below */ }
    }
    toast({ title: t(`${ok} of ${pending.length} updated`, `تم تحديث ${ok} من ${pending.length}`), variant: ok < pending.length ? "destructive" : "default" });
    clear();
    qc.invalidateQueries();
  };

  const unset = t("Not set", "غير محدد");
  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "applicant", accessorFn: (a) => a.user?.fullName || "", sortingFn: textSort, enableHiding: false, meta: { label: t("Applicant", "المتقدم") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Applicant", "المتقدم")} />,
      cell: ({ row }) => (
        <div className="flex min-w-[200px] items-center gap-3">
          <Avatar name={row.original.user?.fullName} src={row.original.user?.avatarUrl} />
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.user?.fullName || t("Deleted user", "مستخدم محذوف")}</div>
            <div className="truncate text-xs text-muted-foreground">{row.original.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: "preferredRole", accessorKey: "preferredRole", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Preferred role", "الدور المفضل") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Preferred role", "الدور المفضل")} />,
      cell: ({ getValue }) => <Pill tone="gold">{humanize(getValue())}</Pill>,
    },
    {
      id: "age", accessorFn: (a) => (a.age == null ? undefined : Number(a.age)), sortUndefined: "last", meta: { label: t("Age", "العمر") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Age", "العمر")} />,
      cell: ({ getValue }) => <span className="tabular-nums">{getValue() ?? "—"}</span>,
    },
    { id: "ageRange", accessorFn: (a) => ageRangeOf(a.age), filterFn: facetFilter, meta: { label: t("Age range", "الفئة العمرية") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Age range", "الفئة العمرية")} /> },
    {
      id: "gender", accessorFn: (a) => a.gender?.trim() || NOT_SAID, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Sex", "الجنس") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Sex", "الجنس")} />,
      cell: ({ getValue }) => (getValue() === NOT_SAID ? <span className="text-muted-foreground">—</span> : getValue()),
    },
    {
      id: "region", accessorFn: (a) => a.region?.trim() || unset, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Region", "الجهة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Region", "الجهة")} />,
    },
    { id: "country", accessorFn: (a) => a.country?.trim() || unset, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Country", "البلد") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Country", "البلد")} /> },
    { id: "education", accessorFn: (a) => a.educationLevel?.trim() || unset, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Education", "التعليم") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Education", "التعليم")} /> },
    { id: "occupation", accessorFn: (a) => a.occupationStatus?.trim() || unset, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Occupation", "المهنة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Occupation", "المهنة")} /> },
    {
      id: "submitted", accessorFn: (a) => new Date(a.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Submitted", "تاريخ الإرسال") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Submitted", "أُرسل")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
    {
      id: "status", accessorKey: "status", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Status", "الحالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <StatusPill value={row.original.status} />
          {row.original.status === "approved" && row.original.assignedRole && row.original.assignedRole !== row.original.preferredRole && (
            <span className="text-xs text-muted-foreground">→ {humanize(row.original.assignedRole)}</span>
          )}
        </div>
      ),
    },
    {
      id: "actions", enableHiding: false, enableSorting: false, size: 120,
      header: () => <span className="sr-only">{t("Actions", "إجراءات")}</span>,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {a.status === "pending" && (
              <>
                <Btn size="icon-sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600" aria-label={t("Approve", "قبول")} title={t("Approve with preferred role", "قبول بالدور المفضل")}
                  onClick={async () => { try { await decide(a, "approved"); qc.invalidateQueries(); } catch (e: any) { toast({ title: t("Action failed", "فشلت العملية"), description: e?.message, variant: "destructive" }); } }}>
                  <CheckCircle2 />
                </Btn>
                <Btn size="icon-sm" variant="ghost" className="text-rose-600 hover:bg-rose-500/10 hover:text-rose-600" aria-label={t("Reject", "رفض")}
                  onClick={() => { setReviewId(a.id); }}>
                  <XCircle />
                </Btn>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="ghost" size="icon-sm" aria-label={t("More", "المزيد")}><MoreHorizontal /></Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setReviewId(a.id)}><Eye className="size-4 opacity-70" /> {t("Review", "مراجعة")}</DropdownMenuItem>
                {a.user?.email && <DropdownMenuItem onClick={() => dispatch({ kind: "compose", tab: "emails", emails: [a.user.email] })}><Mail className="size-4 opacity-70" /> {t("Send email", "إرسال بريد")}</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dispatch({ kind: "open", tab: "users", id: a.userId })}>{t("Open member profile", "فتح ملف العضو")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, unset]);

  const oldestPending = applications.filter((a) => a.status === "pending").sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))[0];
  const decided = counts.approved + counts.rejected;

  return (
    <>
      <PageHeader
        title={t("Applications", "الطلبات")}
        description={t("Review role applications. Approving or rejecting emails the applicant automatically.", "راجع طلبات الأدوار. القبول أو الرفض يرسل بريداً تلقائياً للمتقدم.")}
        actions={counts.pending > 0 && oldestPending ? (
          <Btn variant="gold" onClick={() => { setTab("pending"); setReviewId(oldestPending.id); }}>
            <Inbox /> {t(`Start reviewing (${counts.pending})`, `ابدأ المراجعة (${counts.pending})`)}
          </Btn>
        ) : undefined}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Awaiting review", "بانتظار المراجعة")} value={counts.pending} icon={Clock} loading={isLoading} tone={counts.pending ? "warning" : "neutral"}
          hint={oldestPending ? t(`Oldest ${fmt.relative(oldestPending.createdAt)}`, `الأقدم ${fmt.relative(oldestPending.createdAt)}`) : undefined} />
        <StatCard label={t("Approved", "مقبولة")} value={counts.approved} icon={CheckCircle2} loading={isLoading} />
        <StatCard label={t("Rejected", "مرفوضة")} value={counts.rejected} icon={XCircle} loading={isLoading} />
        <StatCard label={t("Approval rate", "نسبة القبول")} value={decided ? `${Math.round((counts.approved / decided) * 100)}%` : "—"} icon={FileCheck} loading={isLoading}
          hint={t(`${decided} decided`, `${decided} تم البت فيها`)} />
      </div>

      <Segmented<StatusTab>
        value={tab}
        onChange={setTab}
        size="md"
        options={[
          { value: "pending", label: t("Pending", "معلقة"), count: counts.pending },
          { value: "approved", label: t("Approved", "مقبولة"), count: counts.approved },
          { value: "rejected", label: t("Rejected", "مرفوضة"), count: counts.rejected },
          { value: "all", label: t("All", "الكل"), count: counts.all },
        ]}
      />

      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        resetKey={tab}
        getRowId={(a) => String(a.id)}
        searchPlaceholder={t("Search name, email, region, motivation…", "ابحث بالاسم، البريد، الجهة، الدوافع…")}
        getSearchText={(a) => [a.user?.fullName, a.user?.email, a.region, a.country, a.fieldOfStudy, a.motivation, a.interests].filter(Boolean).join(" ")}
        initialSort={[{ id: "applicant", desc: false }]}
        initialHidden={["ageRange", "country", "occupation", ...(tab === "pending" ? ["status"] : [])]}
        facets={[
          { column: "preferredRole", title: t("Role", "الدور"), options: ROLES.map((v) => ({ value: v, label: humanize(v) })) },
          { column: "ageRange", title: t("Age", "العمر"), options: AGE_RANGES.map((v) => ({ value: v })) },
          { column: "gender", title: t("Sex", "الجنس"), options: GENDERS.map((v) => ({ value: v })) },
          { column: "region", title: t("Region", "الجهة") },
          { column: "education", title: t("Education", "التعليم") },
          { column: "occupation", title: t("Occupation", "المهنة") },
          ...(tab === "all" ? [{ column: "status", title: t("Status", "الحالة"), options: ["pending", "approved", "rejected"].map((v) => ({ value: v, label: humanize(v) })) }] : []),
        ]}
        dateColumn={{ column: "submitted", title: t("Submitted", "تاريخ الإرسال") }}
        onRowClick={(a) => setReviewId(a.id)}
        exportName={`applications-${tab}`}
        exportRow={(a) => ({
          id: a.id, fullName: a.user?.fullName, email: a.user?.email, phone: a.user?.phone, status: a.status,
          preferredRole: a.preferredRole, assignedRole: a.assignedRole, age: a.age, ageRange: ageRangeOf(a.age), gender: a.gender || NOT_SAID,
          region: a.region, country: a.country, occupationStatus: a.occupationStatus, educationLevel: a.educationLevel,
          fieldOfStudy: a.fieldOfStudy, interests: a.interests, motivation: a.motivation, adminNote: a.adminNote, submitted: a.createdAt,
        })}
        bulkActions={(sel, clear) => (
          <>
            {sel.some((a) => a.status === "pending") && (
              <>
                <Btn size="xs" variant="success" onClick={() => bulkDecide(sel, "approved", clear)}><CheckCircle2 /> {t("Approve", "قبول")}</Btn>
                <Btn size="xs" variant="outline" className="text-rose-600" onClick={() => bulkDecide(sel, "rejected", clear)}><XCircle /> {t("Reject", "رفض")}</Btn>
              </>
            )}
            <Btn size="xs" variant="outline" onClick={() => { dispatch({ kind: "compose", tab: "emails", emails: sel.map((a) => a.user?.email).filter(Boolean) }); clear(); }}>
              <Mail /> {t("Email", "بريد")}
            </Btn>
          </>
        )}
        empty={tab === "pending"
          ? { title: t("Inbox zero", "لا طلبات معلقة"), description: t("Every application has been reviewed.", "تمت مراجعة جميع الطلبات.") }
          : { title: t("No applications", "لا توجد طلبات") }}
      />

      {/* Review drawer */}
      <Drawer
        open={!!reviewing}
        onOpenChange={(o) => !o && setReviewId(null)}
        width="lg"
        title={
          <span className="flex items-center gap-2">
            {t("Review application", "مراجعة الطلب")}
            {idx >= 0 && <span className="text-xs font-normal text-muted-foreground tabular-nums">{idx + 1} / {rows.length}</span>}
          </span>
        }
        headerExtra={idx >= 0 && rows.length > 1 && (
          <div className="flex gap-1.5">
            <Btn size="xs" variant="outline" disabled={idx <= 0} onClick={() => setReviewId(rows[idx - 1].id)}><ChevronLeft className="rtl:rotate-180" /> {t("Previous", "السابق")}</Btn>
            <Btn size="xs" variant="outline" disabled={idx >= rows.length - 1} onClick={() => setReviewId(rows[idx + 1].id)}>{t("Next", "التالي")} <ChevronRight className="rtl:rotate-180" /></Btn>
          </div>
        )}
        footer={reviewing?.status === "pending" ? (
          <>
            <Btn variant="outline" className="text-rose-600" loading={busy === "reject"} disabled={!!busy} onClick={() => decideFromDrawer("rejected")}>
              <XCircle /> {t("Reject", "رفض")}
            </Btn>
            <Btn variant="success" loading={busy === "approve"} disabled={!!busy} onClick={() => decideFromDrawer("approved")}>
              <CheckCircle2 /> {t("Approve & assign", "قبول وتعيين")}
            </Btn>
          </>
        ) : undefined}
      >
        {reviewing && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar name={reviewing.user?.fullName} src={reviewing.user?.avatarUrl} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold">{reviewing.user?.fullName}</h3>
                <p className="text-sm text-muted-foreground">{reviewing.user?.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <StatusPill value={reviewing.status} />
                  <Pill tone="gold">{humanize(reviewing.preferredRole)}</Pill>
                  <span className="text-xs text-muted-foreground">{t("Submitted", "أُرسل")} {fmt.relative(reviewing.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {reviewing.user?.email && <Btn size="sm" variant="outline" onClick={() => dispatch({ kind: "compose", tab: "emails", emails: [reviewing.user.email] })}><Mail /> {t("Email", "بريد")}</Btn>}
              {reviewing.user?.phone && <a href={`tel:${reviewing.user.phone}`}><Btn size="sm" variant="outline"><Phone /> {reviewing.user.phone}</Btn></a>}
              {reviewing.user?.linkedinUrl && <a href={reviewing.user.linkedinUrl} target="_blank" rel="noopener noreferrer"><Btn size="sm" variant="outline"><Linkedin /> LinkedIn</Btn></a>}
            </div>

            <DetailGrid items={[
              { label: t("Age", "العمر"), value: reviewing.age ?? "—" },
              { label: t("Sex", "الجنس"), value: reviewing.gender || "—" },
              { label: t("Region", "الجهة"), value: reviewing.region || "—" },
              { label: t("Country", "البلد"), value: reviewing.country || "—" },
              { label: t("Education", "التعليم"), value: [reviewing.educationLevel, reviewing.fieldOfStudy].filter(Boolean).join(" — ") || "—" },
              { label: t("Occupation", "المهنة"), value: reviewing.occupationStatus || "—" },
              ...(reviewing.ministryPreference ? [{ label: t("Ministry choice", "الوزارة"), value: reviewing.ministryPreference }] : []),
              ...(reviewing.parliamentHouse ? [{ label: t("Chamber", "الغرفة"), value: humanize(reviewing.parliamentHouse) }] : []),
            ]} />

            {reviewing.interests && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">{t("Interests", "الاهتمامات")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {String(reviewing.interests).split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => <Pill key={s}>{s}</Pill>)}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs text-muted-foreground">{t("Motivation", "الدوافع")}</p>
              <blockquote className="whitespace-pre-wrap rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground/90">
                {reviewing.motivation}
              </blockquote>
            </div>

            {reviewing.status === "pending" ? (
              <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                <Field label={t("Assign role", "تعيين الدور")} hint={t("Defaults to the role they asked for.", "افتراضياً الدور الذي طلبه.")}>
                  <NativeSelect value={assignedRole} onChange={(e) => setAssignedRole(e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                  </NativeSelect>
                </Field>
                <Field label={t("Internal note (optional)", "ملاحظة داخلية (اختياري)")} className="sm:col-span-2">
                  <TextArea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} maxLength={2000}
                    placeholder={t("Only visible to admins", "مرئية للمسؤولين فقط")} />
                </Field>
              </div>
            ) : (
              <DetailGrid items={[
                { label: t("Assigned role", "الدور المعيّن"), value: reviewing.assignedRole ? humanize(reviewing.assignedRole) : "—" },
                { label: t("Internal note", "ملاحظة داخلية"), value: reviewing.adminNote || "—", full: true },
              ]} />
            )}
          </div>
        )}
      </Drawer>

      {confirmDialog}
    </>
  );
}
