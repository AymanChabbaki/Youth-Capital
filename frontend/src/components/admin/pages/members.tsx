import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Ban, Edit, Eye, Linkedin, Mail, MoreHorizontal, Phone, ShieldCheck, Trash2, UserCheck, UserPlus, Users, Crown, Send,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AGE_RANGES, GENDERS, ageRangeOf } from "@/components/admin-table";
import { useAdmin, useIntent } from "../context";
import { useApplications, useMembers, jsonPost } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  Avatar, Btn, DetailGrid, Field, NativeSelect, PageHeader, Pill, StatCard, StatusPill, TextArea, TextInput,
  countWithin, pctChange, bucketCounts, useConfirm, useFormat, humanize,
} from "../primitives";

const NOT_SAID = "Prefer not to say";

export default function MembersPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { user: me } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { dispatch } = useAdmin();
  const { members, isLoading } = useMembers();
  const { applications } = useApplications();
  const [confirm, confirmDialog] = useConfirm();
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useIntent("users", (i) => { if (i.kind === "open") setViewingId(Number(i.id)); });

  const viewing = members.find((m) => m.id === viewingId) || null;
  const latestApp = useMemo(() => {
    const map = new Map<number, any>();
    [...applications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).forEach((a) => { if (!map.has(a.userId)) map.set(a.userId, a); });
    return map;
  }, [applications]);

  const unset = t("Not set", "غير محدد");

  const toggleBan = async (u: any) => {
    const willBan = u.status !== "banned";
    if (willBan && !(await confirm({
      title: t(`Ban ${u.fullName}?`, `حظر ${u.fullName}؟`),
      description: t("They will be signed out and blocked from the platform until unbanned.", "سيتم إخراجه ومنعه من المنصة حتى يُلغى الحظر."),
      confirmLabel: t("Ban member", "حظر العضو"), destructive: true,
    }))) return;
    try {
      await jsonPost(`/api/users/${u.id}/${willBan ? "ban" : "unban"}`, "POST");
      toast({ title: willBan ? t("Member banned", "تم حظر العضو") : t("Member unbanned", "تم إلغاء الحظر") });
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Action failed", "فشلت العملية"), description: e?.message, variant: "destructive" });
    }
  };

  const remove = async (u: any) => {
    if (!(await confirm({
      title: t(`Delete ${u.fullName}?`, `حذف ${u.fullName}؟`),
      description: t("This permanently deletes the account, their applications, posts and votes. This cannot be undone.", "سيتم حذف الحساب وطلباته ومنشوراته وأصواته نهائياً. لا يمكن التراجع."),
      confirmLabel: t("Delete permanently", "حذف نهائي"), destructive: true,
    }))) return;
    try {
      await jsonPost(`/api/users/${u.id}`, "DELETE");
      toast({ title: t("Member deleted", "تم حذف العضو") });
      setViewingId(null);
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Deletion failed", "فشل الحذف"), description: e?.message, variant: "destructive" });
    }
  };

  const save = async (form: HTMLFormElement) => {
    const data = Object.fromEntries(new FormData(form).entries());
    setSaving(true);
    try {
      await jsonPost(`/api/users/${editing.id}`, "PATCH", data);
      toast({ title: t("Member updated", "تم تحديث العضو") });
      setEditing(null);
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Update failed", "فشل التحديث"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "name",
      accessorFn: (u) => u.fullName,
      sortingFn: textSort,
      enableHiding: false,
      meta: { label: t("Name", "الاسم") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Member", "العضو")} />,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex min-w-[200px] items-center gap-3">
            <Avatar name={u.fullName} src={u.avatarUrl} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate font-medium text-foreground">
                {u.fullName}
                {u.role === "admin" && <Crown className="size-3.5 text-gold" />}
              </div>
              <div className="truncate text-xs text-muted-foreground">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "email", accessorKey: "email", sortingFn: textSort, meta: { label: t("Email", "البريد") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Email", "البريد")} />,
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
    },
    {
      id: "phone", accessorFn: (u) => u.phone || "", sortingFn: textSort, meta: { label: t("Phone", "الهاتف") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Phone", "الهاتف")} />,
      cell: ({ getValue }) => <span className="text-muted-foreground tabular-nums">{getValue() || "—"}</span>,
    },
    {
      id: "age", accessorFn: (u) => (u.age == null ? undefined : Number(u.age)), sortUndefined: "last", meta: { label: t("Age", "العمر") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Age", "العمر")} />,
      cell: ({ getValue }) => <span className="tabular-nums">{getValue() ?? <span className="text-muted-foreground">—</span>}</span>,
    },
    {
      id: "ageRange", accessorFn: (u) => ageRangeOf(u.age), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Age range", "الفئة العمرية") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Age range", "الفئة العمرية")} />,
    },
    {
      id: "gender", accessorFn: (u) => u.gender?.trim() || NOT_SAID, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Sex", "الجنس") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Sex", "الجنس")} />,
      cell: ({ getValue }) => <span className={getValue() === NOT_SAID ? "text-muted-foreground" : ""}>{getValue() === NOT_SAID ? "—" : getValue()}</span>,
    },
    {
      id: "region", accessorFn: (u) => u.region?.trim() || unset, filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Region", "الجهة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Region", "الجهة")} />,
      cell: ({ getValue }) => <span className={getValue() === unset ? "text-muted-foreground" : "whitespace-nowrap"}>{getValue() === unset ? "—" : getValue()}</span>,
    },
    {
      id: "simulationRole", accessorFn: (u) => u.simulationRole || t("Unassigned", "غير معيّن"), filterFn: facetFilter, sortingFn: textSort,
      meta: { label: t("Simulation role", "دور المحاكاة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Role", "الدور")} />,
      cell: ({ row }) => row.original.simulationRole
        ? <Pill tone="info">{row.original.simulationRole}</Pill>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "status", accessorKey: "status", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Status", "الحالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} />,
    },
    {
      id: "role", accessorKey: "role", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Account type", "نوع الحساب") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Account", "الحساب")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} />,
    },
    {
      id: "applicationStatus", accessorFn: (u) => u.applicationStatus || "none", filterFn: facetFilter, sortingFn: textSort,
      meta: { label: t("Application", "الطلب") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Application", "الطلب")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} />,
    },
    {
      id: "joined", accessorFn: (u) => (u.createdAt ? new Date(u.createdAt) : undefined), sortingFn: "datetime", sortUndefined: "last",
      filterFn: dateRangeFilter, meta: { label: t("Joined", "تاريخ الانضمام") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Joined", "انضم")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.date(row.original.createdAt)}</span>,
    },
    {
      id: "actions", enableHiding: false, enableSorting: false, size: 44,
      header: () => <span className="sr-only">{t("Actions", "إجراءات")}</span>,
      cell: ({ row }) => {
        const u = row.original;
        const isMe = u.id === me?.id;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Btn variant="ghost" size="icon-sm" aria-label={t("Actions", "إجراءات")}><MoreHorizontal /></Btn>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setViewingId(u.id)}><Eye className="size-4 opacity-70" /> {t("View profile", "عرض الملف")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditing(u)}><Edit className="size-4 opacity-70" /> {t("Edit", "تعديل")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch({ kind: "compose", tab: "emails", emails: [u.email] })}><Mail className="size-4 opacity-70" /> {t("Send email", "إرسال بريد")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={isMe} onClick={() => toggleBan(u)}>
                {u.status === "banned" ? <><ShieldCheck className="size-4 opacity-70" /> {t("Unban", "إلغاء الحظر")}</> : <><Ban className="size-4 opacity-70" /> {t("Ban", "حظر")}</>}
              </DropdownMenuItem>
              <DropdownMenuItem disabled={isMe} onClick={() => remove(u)} className="text-rose-600 focus:text-rose-600">
                <Trash2 className="size-4" /> {t("Delete", "حذف")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, me?.id, unset]);

  const joined = members.map((m) => m.createdAt);
  const new30 = countWithin(joined, 30);
  const prev30 = countWithin(joined, 60, 30);
  const app = viewing ? latestApp.get(viewing.id) : null;

  return (
    <>
      <PageHeader
        title={t("Members", "الأعضاء")}
        description={t("Everyone with an account. Filter, sort, export, and manage access.", "كل من لديه حساب. صفِّ ورتّب وصدّر وأدر الصلاحيات.")}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label={t("Total members", "إجمالي الأعضاء")} value={fmt.number(members.length)} icon={Users} loading={isLoading} />
        <StatCard label={t("Active", "نشطون")} value={fmt.number(members.filter((m) => m.status === "active").length)} icon={UserCheck} loading={isLoading} />
        <StatCard label={t("New · 30 days", "جدد · 30 يوماً")} value={fmt.number(new30)} icon={UserPlus} loading={isLoading}
          delta={pctChange(new30, prev30)} deltaLabel={t("vs previous 30 days", "مقارنة بالـ30 السابقة")} spark={bucketCounts(joined, 12, 7)} />
        <StatCard label={t("Banned", "محظورون")} value={fmt.number(members.filter((m) => m.status === "banned").length)} icon={Ban} loading={isLoading} />
        <StatCard label={t("Admins", "المسؤولون")} value={fmt.number(members.filter((m) => m.role === "admin").length)} icon={Crown} loading={isLoading} />
      </div>

      <DataTable
        data={members}
        columns={columns}
        isLoading={isLoading}
        getRowId={(u) => String(u.id)}
        searchPlaceholder={t("Search name, email, phone, region…", "ابحث بالاسم، البريد، الهاتف، الجهة…")}
        getSearchText={(u) => [u.fullName, u.fullNameAr, u.email, u.phone, u.region, u.simulationRole].filter(Boolean).join(" ")}
        initialSort={[{ id: "name", desc: false }]}
        initialHidden={["email", "phone", "ageRange", "applicationStatus"]}
        facets={[
          { column: "ageRange", title: t("Age", "العمر"), options: AGE_RANGES.map((v) => ({ value: v })) },
          { column: "gender", title: t("Sex", "الجنس"), options: GENDERS.map((v) => ({ value: v })) },
          { column: "region", title: t("Region", "الجهة") },
          { column: "simulationRole", title: t("Role", "الدور") },
          { column: "status", title: t("Status", "الحالة"), options: [{ value: "active", label: t("Active", "نشط") }, { value: "banned", label: t("Banned", "محظور") }] },
          { column: "role", title: t("Account", "الحساب"), options: [{ value: "user", label: t("User", "مستخدم") }, { value: "admin", label: t("Admin", "مسؤول") }] },
          { column: "applicationStatus", title: t("Application", "الطلب"), options: ["none", "pending", "approved", "rejected"].map((v) => ({ value: v, label: humanize(v) })) },
        ]}
        dateColumn={{ column: "joined", title: t("Joined", "تاريخ الانضمام") }}
        onRowClick={(u) => setViewingId(u.id)}
        exportName="members"
        exportRow={(u) => ({
          id: u.id, fullName: u.fullName, fullNameAr: u.fullNameAr, email: u.email, phone: u.phone, age: u.age,
          ageRange: ageRangeOf(u.age), gender: u.gender || NOT_SAID, region: u.region, simulationRole: u.simulationRole,
          role: u.role, status: u.status, applicationStatus: u.applicationStatus, linkedinUrl: u.linkedinUrl, joined: u.createdAt,
        })}
        bulkActions={(rows, clear) => (
          <Btn size="xs" variant="outline" onClick={() => { dispatch({ kind: "compose", tab: "emails", emails: rows.map((r) => r.email) }); clear(); }}>
            <Send /> {t("Email selected", "مراسلة المحددين")}
          </Btn>
        )}
        rowClassName={(u) => (u.status === "banned" ? "opacity-60" : undefined)}
      />

      {/* Profile drawer */}
      <Drawer
        open={!!viewing}
        onOpenChange={(o) => !o && setViewingId(null)}
        title={t("Member profile", "ملف العضو")}
        footer={viewing && (
          <>
            <Btn variant="ghost" className="me-auto text-rose-600 hover:text-rose-600" disabled={viewing.id === me?.id} onClick={() => remove(viewing)}>
              <Trash2 /> {t("Delete", "حذف")}
            </Btn>
            <Btn variant="outline" disabled={viewing.id === me?.id} onClick={() => toggleBan(viewing)}>
              {viewing.status === "banned" ? <><ShieldCheck /> {t("Unban", "إلغاء الحظر")}</> : <><Ban /> {t("Ban", "حظر")}</>}
            </Btn>
            <Btn variant="primary" onClick={() => setEditing(viewing)}><Edit /> {t("Edit", "تعديل")}</Btn>
          </>
        )}
      >
        {viewing && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar name={viewing.fullName} src={viewing.avatarUrl} size="xl" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-foreground">{viewing.fullName}</h3>
                {viewing.fullNameAr && <p className="text-sm text-muted-foreground" dir="rtl">{viewing.fullNameAr}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusPill value={viewing.status} />
                  <StatusPill value={viewing.role} />
                  {viewing.simulationRole && <Pill tone="info">{viewing.simulationRole}</Pill>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Btn size="sm" variant="outline" onClick={() => dispatch({ kind: "compose", tab: "emails", emails: [viewing.email] })}><Mail /> {t("Email", "بريد")}</Btn>
              {viewing.phone && <a href={`tel:${viewing.phone}`}><Btn size="sm" variant="outline"><Phone /> {viewing.phone}</Btn></a>}
              {viewing.linkedinUrl && <a href={viewing.linkedinUrl} target="_blank" rel="noopener noreferrer"><Btn size="sm" variant="outline"><Linkedin /> LinkedIn</Btn></a>}
            </div>

            <section>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Profile", "الملف")}</h4>
              <DetailGrid items={[
                { label: t("Email", "البريد"), value: viewing.email, full: true },
                { label: t("Age", "العمر"), value: viewing.age ?? "—" },
                { label: t("Sex", "الجنس"), value: viewing.gender || "—" },
                { label: t("Region", "الجهة"), value: viewing.region || "—" },
                { label: t("Language", "اللغة"), value: viewing.languagePreference === "ar" ? "العربية" : "English" },
                { label: t("Joined", "انضم"), value: `${fmt.date(viewing.createdAt)} · ${fmt.relative(viewing.createdAt)}` },
                { label: t("Application", "الطلب"), value: <StatusPill value={viewing.applicationStatus || "none"} /> },
                ...(viewing.bio ? [{ label: t("Bio", "نبذة"), value: <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{viewing.bio}</p>, full: true }] : []),
              ]} />
            </section>

            {app && (
              <section className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Latest application", "آخر طلب")}</h4>
                  <Btn size="xs" variant="ghost" onClick={() => dispatch({ kind: "open", tab: "applications", id: app.id })}>{t("Open", "فتح")}</Btn>
                </div>
                <DetailGrid items={[
                  { label: t("Preferred role", "الدور المفضل"), value: app.preferredRole },
                  { label: t("Status", "الحالة"), value: <StatusPill value={app.status} /> },
                  { label: t("Education", "التعليم"), value: [app.educationLevel, app.fieldOfStudy].filter(Boolean).join(" — ") || "—" },
                  { label: t("Occupation", "المهنة"), value: app.occupationStatus || "—" },
                  { label: t("Country", "البلد"), value: app.country || "—" },
                  { label: t("Submitted", "تاريخ الإرسال"), value: fmt.date(app.createdAt) },
                ]} />
              </section>
            )}
          </div>
        )}
      </Drawer>

      {/* Edit drawer */}
      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={t("Edit member", "تعديل العضو")}
        description={editing?.email}
        footer={
          <>
            <Btn variant="outline" onClick={() => setEditing(null)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn type="submit" form="member-edit-form" loading={saving}>{t("Save changes", "حفظ التغييرات")}</Btn>
          </>
        }
      >
        {editing && (
          <form id="member-edit-form" key={editing.id} onSubmit={(e) => { e.preventDefault(); save(e.currentTarget); }} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Full name", "الاسم الكامل")}><TextInput name="fullName" defaultValue={editing.fullName} required /></Field>
              <Field label={t("Full name (Arabic)", "الاسم بالعربية")}><TextInput name="fullNameAr" defaultValue={editing.fullNameAr || ""} dir="rtl" /></Field>
              <Field label={t("Phone", "الهاتف")}><TextInput name="phone" defaultValue={editing.phone || ""} /></Field>
              <Field label={t("Region", "الجهة")}><TextInput name="region" defaultValue={editing.region || ""} /></Field>
              <Field label={t("LinkedIn URL", "رابط لينكدإن")} className="sm:col-span-2"><TextInput name="linkedinUrl" defaultValue={editing.linkedinUrl || ""} placeholder="https://linkedin.com/in/…" /></Field>
              <Field label={t("Simulation role", "دور المحاكاة")} className="sm:col-span-2">
                <TextInput name="simulationRole" defaultValue={editing.simulationRole || ""} placeholder="mp, minister, local_council…" />
              </Field>
              <Field label={t("Account type", "نوع الحساب")}>
                <NativeSelect name="role" defaultValue={editing.role}>
                  <option value="user">{t("User", "مستخدم")}</option>
                  <option value="admin">{t("Admin", "مسؤول")}</option>
                </NativeSelect>
              </Field>
              <Field label={t("Status", "الحالة")}>
                <NativeSelect name="status" defaultValue={editing.status}>
                  <option value="active">{t("Active", "نشط")}</option>
                  <option value="banned">{t("Banned", "محظور")}</option>
                </NativeSelect>
              </Field>
              <Field label={t("Application status", "حالة الطلب")} className="sm:col-span-2">
                <NativeSelect name="applicationStatus" defaultValue={editing.applicationStatus || "none"}>
                  {["none", "pending", "approved", "rejected"].map((v) => <option key={v} value={v}>{humanize(v)}</option>)}
                </NativeSelect>
              </Field>
              <Field label={t("Bio", "نبذة")} className="sm:col-span-2"><TextArea name="bio" defaultValue={editing.bio || ""} rows={4} /></Field>
            </div>
          </form>
        )}
      </Drawer>

      {confirmDialog}
    </>
  );
}
