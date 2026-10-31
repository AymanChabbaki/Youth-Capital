import { useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import {
  Edit, ExternalLink, ImagePlus, Loader2, MoreHorizontal, Plus, Trash2, X, Newspaper, Calendar, Vote, Video, BarChart3, Clock,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIntent } from "../context";
import { useArticles, useEvents, usePolls, jsonPost, compact } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  Btn, Field, NativeSelect, PageHeader, Pill, StatCard, StatusPill, TextArea, TextInput, useConfirm, useFormat, humanize,
} from "../primitives";

// ── Shared ───────────────────────────────────────────────────────────────────

function RowMenu({ onEdit, onDelete, extra }: { onEdit: () => void; onDelete: () => void; extra?: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Btn variant="ghost" size="icon-sm" aria-label={t("Actions", "إجراءات")}><MoreHorizontal /></Btn>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit}><Edit className="size-4 opacity-70" /> {t("Edit", "تعديل")}</DropdownMenuItem>
        {extra}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-rose-600 focus:text-rose-600"><Trash2 className="size-4" /> {t("Delete", "حذف")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useDelete(kind: string, url: (id: number) => string) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [confirm, dialog] = useConfirm();
  const run = async (item: any, label: string) => {
    if (!(await confirm({ title: t(`Delete "${label}"?`, `حذف "${label}"؟`), description: t("This cannot be undone.", "لا يمكن التراجع عن ذلك."), confirmLabel: t("Delete", "حذف"), destructive: true }))) return;
    try {
      await jsonPost(url(item.id), "DELETE");
      toast({ title: t(`${kind} deleted`, "تم الحذف") });
      qc.invalidateQueries();
    } catch (e: any) {
      toast({ title: t("Deletion failed", "فشل الحذف"), description: e?.message, variant: "destructive" });
    }
  };
  return [run, dialog] as const;
}

// datetime-local wants local time without a zone.
function toLocalInput(d?: string | Date | null) {
  if (!d) return "";
  const date = new Date(d);
  const off = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - off).toISOString().slice(0, 16);
}

// Uploads to Cloudinary (unsigned preset) and exposes the URL via a hidden input.
function ThumbnailUploader({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast({ title: t("Images only", "الصور فقط"), variant: "destructive" }); return; }
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || cloudName === "your_cloud_name" || !preset) {
      toast({ title: t("Cloudinary not configured", "Cloudinary غير مهيأ"), description: "VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET", variant: "destructive" });
      return;
    }
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload rejected");
      setUrl(data.secure_url);
    } catch (e: any) {
      toast({ title: t("Upload failed", "فشل الرفع"), description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {url ? (
        <div className="group relative h-40 overflow-hidden rounded-xl border border-border">
          <img src={url} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Btn size="sm" variant="gold" onClick={() => inputRef.current?.click()}><ImagePlus /> {t("Replace", "استبدال")}</Btn>
            <Btn size="sm" variant="outline" onClick={() => setUrl("")}><X /> {t("Remove", "إزالة")}</Btn>
          </div>
          {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Loader2 className="size-6 animate-spin text-white" /></div>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
          disabled={uploading}
          className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm transition-colors ${dragging ? "border-gold bg-gold/10" : "border-border text-muted-foreground hover:border-foreground/30 hover:bg-secondary/40"}`}
        >
          {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          <span className="font-medium">{uploading ? t("Uploading…", "جاري الرفع…") : t("Click or drop an image", "انقر أو أسقط صورة")}</span>
          <span className="text-xs opacity-70">PNG, JPG, WebP</span>
        </button>
      )}
    </div>
  );
}

// ── Press ────────────────────────────────────────────────────────────────────

export function PressPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { articles, isLoading } = useArticles();
  const [editing, setEditing] = useState<any | null>(null); // {} = new
  const [saving, setSaving] = useState(false);
  const [del, delDialog] = useDelete("Article", (id) => `/api/press/${id}`);

  useIntent("press", (i) => { if (i.kind === "create") setEditing({}); if (i.kind === "open") setEditing(articles.find((a) => a.id === Number(i.id)) || null); });

  const save = async (form: HTMLFormElement) => {
    const data = compact(Object.fromEntries(new FormData(form).entries()) as Record<string, string>);
    setSaving(true);
    try {
      if (editing?.id) await jsonPost(`/api/press/${editing.id}`, "PATCH", data);
      else await jsonPost(`/api/press`, "POST", data);
      toast({ title: editing?.id ? t("Article updated", "تم تحديث المقال") : t("Article published", "تم نشر المقال") });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["/api/press"] });
    } catch (e: any) {
      toast({ title: t("Save failed", "فشل الحفظ"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "title", accessorFn: (a) => t(a.title, a.titleAr || a.title), sortingFn: textSort, enableHiding: false, meta: { label: t("Title", "العنوان") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Article", "المقال")} />,
      cell: ({ row }) => (
        <div className="flex min-w-[260px] items-center gap-3">
          {row.original.thumbnailUrl
            ? <img src={row.original.thumbnailUrl} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
            : <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md bg-secondary"><Newspaper className="size-4 text-muted-foreground" /></div>}
          <div className="min-w-0">
            <div className="truncate font-medium">{t(row.original.title, row.original.titleAr || row.original.title)}</div>
            {row.original.slug && <div className="truncate font-mono text-[11px] text-muted-foreground">/press/{row.original.slug}</div>}
          </div>
        </div>
      ),
    },
    {
      id: "type", accessorKey: "type", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Type", "النوع") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Type", "النوع")} />,
      cell: ({ getValue }) => <Pill tone={getValue() === "platform" ? "violet" : "info"}>{getValue() === "platform" ? t("Announcement", "إعلان") : t("Simulation news", "أخبار المحاكاة")}</Pill>,
    },
    {
      id: "author", accessorFn: (a) => a.author?.fullName || "", sortingFn: textSort, filterFn: facetFilter, meta: { label: t("Author", "الكاتب") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Author", "الكاتب")} />,
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || "—"}</span>,
    },
    {
      id: "published", accessorFn: (a) => new Date(a.publishedAt || a.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Published", "تاريخ النشر") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Published", "نُشر")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{fmt.date(row.original.publishedAt || row.original.createdAt)}</span>,
    },
    {
      id: "actions", enableHiding: false, enableSorting: false, size: 44, header: () => null,
      cell: ({ row }) => (
        <RowMenu
          onEdit={() => setEditing(row.original)}
          onDelete={() => del(row.original, row.original.title)}
          extra={row.original.slug && (
            <DropdownMenuItem asChild>
              <a href={`/press/${row.original.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4 opacity-70" /> {t("View on site", "عرض في الموقع")}</a>
            </DropdownMenuItem>
          )}
        />
      ),
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <PageHeader
        title={t("Press Office", "مكتب الصحافة")}
        description={t("Publish simulation news and platform announcements.", "انشر أخبار المحاكاة وإعلانات المنصة.")}
        actions={<Btn onClick={() => setEditing({})}><Plus /> {t("New article", "مقال جديد")}</Btn>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label={t("Articles", "المقالات")} value={articles.length} icon={Newspaper} loading={isLoading} />
        <StatCard label={t("Simulation news", "أخبار المحاكاة")} value={articles.filter((a) => a.type === "simulation").length} loading={isLoading} />
        <StatCard label={t("Announcements", "الإعلانات")} value={articles.filter((a) => a.type === "platform").length} loading={isLoading} />
      </div>
      <DataTable
        data={articles}
        columns={columns}
        isLoading={isLoading}
        getRowId={(a) => String(a.id)}
        searchPlaceholder={t("Search title, slug, content…", "ابحث في العنوان والمحتوى…")}
        getSearchText={(a) => [a.title, a.titleAr, a.slug, a.content, a.contentAr, a.author?.fullName].filter(Boolean).join(" ")}
        initialSort={[{ id: "title", desc: false }]}
        initialHidden={["author"]}
        facets={[
          { column: "type", title: t("Type", "النوع"), options: [{ value: "simulation", label: t("Simulation news", "أخبار المحاكاة") }, { value: "platform", label: t("Announcement", "إعلان") }] },
          { column: "author", title: t("Author", "الكاتب") },
        ]}
        dateColumn={{ column: "published", title: t("Published", "تاريخ النشر") }}
        onRowClick={(a) => setEditing(a)}
        exportName="articles"
        exportRow={(a) => ({ id: a.id, title: a.title, titleAr: a.titleAr, slug: a.slug, type: a.type, author: a.author?.fullName, publishedAt: a.publishedAt })}
        empty={{ title: t("No articles yet", "لا توجد مقالات بعد"), action: <Btn size="sm" onClick={() => setEditing({})}><Plus /> {t("Write the first one", "اكتب الأول")}</Btn> }}
      />

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        width="xl"
        title={editing?.id ? t("Edit article", "تعديل المقال") : t("New article", "مقال جديد")}
        footer={
          <>
            {editing?.id && <Btn variant="ghost" className="me-auto text-rose-600" onClick={() => { del(editing, editing.title); setEditing(null); }}><Trash2 /> {t("Delete", "حذف")}</Btn>}
            <Btn variant="outline" onClick={() => setEditing(null)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn type="submit" form="article-form" loading={saving}>{editing?.id ? t("Save changes", "حفظ") : t("Publish", "نشر")}</Btn>
          </>
        }
      >
        {editing && (
          <form id="article-form" key={editing.id ?? "new"} onSubmit={(e) => { e.preventDefault(); save(e.currentTarget); }} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Title (English)", "العنوان (إنجليزي)")}><TextInput name="title" defaultValue={editing.title} required maxLength={200} /></Field>
              <Field label={t("Title (Arabic)", "العنوان (عربي)")}><TextInput name="titleAr" defaultValue={editing.titleAr} dir="rtl" maxLength={200} /></Field>
              <Field label={t("Type", "النوع")}>
                <NativeSelect name="type" defaultValue={editing.type || "simulation"}>
                  <option value="simulation">{t("Simulation news", "أخبار المحاكاة")}</option>
                  <option value="platform">{t("Platform announcement", "إعلان المنصة")}</option>
                </NativeSelect>
              </Field>
              <Field label={t("URL slug (optional)", "الرابط المختصر (اختياري)")} hint={t("Lowercase letters, numbers, hyphens. Auto-generated if blank.", "أحرف صغيرة وأرقام وشرطات. يُنشأ تلقائياً إن تُرك فارغاً.")}>
                <TextInput name="slug" defaultValue={editing.slug} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="font-mono" />
              </Field>
            </div>
            <Field label={t("Thumbnail", "الصورة المصغرة")}><ThumbnailUploader name="thumbnailUrl" defaultValue={editing.thumbnailUrl} /></Field>
            <Field label={t("Content (English)", "المحتوى (إنجليزي)")}><TextArea name="content" defaultValue={editing.content} required rows={10} /></Field>
            <Field label={t("Content (Arabic)", "المحتوى (عربي)")}><TextArea name="contentAr" defaultValue={editing.contentAr} dir="rtl" rows={10} /></Field>
          </form>
        )}
      </Drawer>
      {delDialog}
    </>
  );
}

// ── Events ───────────────────────────────────────────────────────────────────

// Must match EVENT_TYPES in backend/src/routes/events.ts
const EVENT_TYPES = ["live_session", "vote", "summit", "workshop"] as const;

function eventPhase(e: any): "upcoming" | "live" | "past" {
  const now = Date.now();
  const start = +new Date(e.startAt);
  const end = e.endAt ? +new Date(e.endAt) : start + 2 * 3600000;
  if (now < start) return "upcoming";
  if (now <= end) return "live";
  return "past";
}

export function EventsPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { events, isLoading } = useEvents();
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [del, delDialog] = useDelete("Event", (id) => `/api/events/${id}`);

  useIntent("events", (i) => { if (i.kind === "create") setEditing({}); });

  const typeLabel = (v: string) => ({
    live_session: t("Live session", "جلسة مباشرة"), vote: t("Vote", "تصويت"), summit: t("Summit", "قمة"), workshop: t("Workshop", "ورشة عمل"),
  } as Record<string, string>)[v] || humanize(v);

  const save = async (form: HTMLFormElement) => {
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const data = compact({
      ...raw,
      startAt: raw.startAt ? new Date(raw.startAt).toISOString() : "",
      endAt: raw.endAt ? new Date(raw.endAt).toISOString() : "",
    });
    setSaving(true);
    try {
      if (editing?.id) await jsonPost(`/api/events/${editing.id}`, "PATCH", data);
      else await jsonPost(`/api/events`, "POST", data);
      toast({ title: editing?.id ? t("Event updated", "تم تحديث الفعالية") : t("Event scheduled", "تمت جدولة الفعالية") });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["/api/events"] });
    } catch (e: any) {
      toast({ title: t("Save failed", "فشل الحفظ"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "title", accessorFn: (e) => t(e.title, e.titleAr || e.title), sortingFn: textSort, enableHiding: false, meta: { label: t("Title", "العنوان") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Event", "الفعالية")} />,
      cell: ({ row }) => {
        const d = new Date(row.original.startAt);
        return (
          <div className="flex min-w-[260px] items-center gap-3">
            <div className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-border bg-secondary/40 py-1 leading-none">
              <span className="text-[10px] font-semibold uppercase text-rose-600">{d.toLocaleString(undefined, { month: "short" })}</span>
              <span className="text-base font-semibold tabular-nums">{d.getDate()}</span>
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{t(row.original.title, row.original.titleAr || row.original.title)}</div>
              <div className="line-clamp-1 text-xs text-muted-foreground">{row.original.description}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "type", accessorKey: "type", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Type", "النوع") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Type", "النوع")} />,
      cell: ({ getValue }) => <Pill tone="info">{typeLabel(getValue())}</Pill>,
    },
    {
      id: "phase", accessorFn: (e) => eventPhase(e), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Status", "الحالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} label={{ upcoming: t("Upcoming", "قادمة"), live: t("Live now", "مباشر الآن"), past: t("Past", "منتهية") }[getValue() as string]} />,
    },
    {
      id: "startAt", accessorFn: (e) => new Date(e.startAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Date", "التاريخ") },
      header: ({ column }) => <ColumnHeader column={column} title={t("When", "الموعد")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground"><Clock className="me-1 inline size-3.5" />{fmt.dateTime(row.original.startAt)}</span>,
    },
    {
      id: "meeting", accessorFn: (e) => (e.meetingUrl ? "yes" : "no"), enableSorting: false, meta: { label: t("Meeting link", "رابط الاجتماع") },
      header: () => <span className="text-xs font-medium text-muted-foreground">{t("Link", "الرابط")}</span>,
      cell: ({ row }) => row.original.meetingUrl
        ? <a href={row.original.meetingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Video className="size-3.5" /> {t("Join", "انضم")}</a>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "actions", enableHiding: false, enableSorting: false, size: 44, header: () => null,
      cell: ({ row }) => <RowMenu onEdit={() => setEditing(row.original)} onDelete={() => del(row.original, row.original.title)} />,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const upcoming = events.filter((e) => eventPhase(e) === "upcoming");
  const next = [...upcoming].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))[0];

  return (
    <>
      <PageHeader
        title={t("Events", "الفعاليات")}
        description={t("Schedule live sessions, votes, summits and workshops.", "جدولة الجلسات المباشرة والتصويتات والقمم والورشات.")}
        actions={<Btn onClick={() => setEditing({})}><Plus /> {t("Schedule event", "جدولة فعالية")}</Btn>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Total events", "إجمالي الفعاليات")} value={events.length} icon={Calendar} loading={isLoading} />
        <StatCard label={t("Upcoming", "قادمة")} value={upcoming.length} loading={isLoading} />
        <StatCard label={t("Live now", "مباشر الآن")} value={events.filter((e) => eventPhase(e) === "live").length} loading={isLoading} />
        <StatCard label={t("Next event", "الفعالية التالية")} value={next ? fmt.relative(next.startAt) : "—"} hint={next ? t(next.title, next.titleAr || next.title) : undefined} loading={isLoading} />
      </div>
      <DataTable
        data={events}
        columns={columns}
        isLoading={isLoading}
        getRowId={(e) => String(e.id)}
        searchPlaceholder={t("Search events…", "ابحث في الفعاليات…")}
        getSearchText={(e) => [e.title, e.titleAr, e.description, e.descriptionAr].filter(Boolean).join(" ")}
        initialSort={[{ id: "title", desc: false }]}
        facets={[
          { column: "type", title: t("Type", "النوع"), options: EVENT_TYPES.map((v) => ({ value: v, label: typeLabel(v) })) },
          { column: "phase", title: t("Status", "الحالة"), options: [{ value: "upcoming", label: t("Upcoming", "قادمة") }, { value: "live", label: t("Live now", "مباشر") }, { value: "past", label: t("Past", "منتهية") }] },
        ]}
        dateColumn={{ column: "startAt", title: t("Date", "التاريخ") }}
        onRowClick={(e) => setEditing(e)}
        exportName="events"
        exportRow={(e) => ({ id: e.id, title: e.title, titleAr: e.titleAr, type: e.type, status: eventPhase(e), startAt: e.startAt, endAt: e.endAt, meetingUrl: e.meetingUrl })}
        empty={{ title: t("No events scheduled", "لا توجد فعاليات"), action: <Btn size="sm" onClick={() => setEditing({})}><Plus /> {t("Schedule one", "جدولة فعالية")}</Btn> }}
      />

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        width="lg"
        title={editing?.id ? t("Edit event", "تعديل الفعالية") : t("Schedule event", "جدولة فعالية")}
        footer={
          <>
            {editing?.id && <Btn variant="ghost" className="me-auto text-rose-600" onClick={() => { del(editing, editing.title); setEditing(null); }}><Trash2 /> {t("Delete", "حذف")}</Btn>}
            <Btn variant="outline" onClick={() => setEditing(null)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn type="submit" form="event-form" loading={saving}>{editing?.id ? t("Save changes", "حفظ") : t("Schedule", "جدولة")}</Btn>
          </>
        }
      >
        {editing && (
          <form id="event-form" key={editing.id ?? "new"} onSubmit={(e) => { e.preventDefault(); save(e.currentTarget); }} className="grid gap-4 sm:grid-cols-2">
            <Field label={t("Name (English)", "الاسم (إنجليزي)")}><TextInput name="title" defaultValue={editing.title} required maxLength={200} /></Field>
            <Field label={t("Name (Arabic)", "الاسم (عربي)")}><TextInput name="titleAr" defaultValue={editing.titleAr} dir="rtl" maxLength={200} /></Field>
            <Field label={t("Type", "النوع")}>
              <NativeSelect name="type" defaultValue={editing.type || "live_session"}>
                {EVENT_TYPES.map((v) => <option key={v} value={v}>{typeLabel(v)}</option>)}
              </NativeSelect>
            </Field>
            <Field label={t("Meeting URL (optional)", "رابط الاجتماع (اختياري)")}><TextInput name="meetingUrl" type="url" defaultValue={editing.meetingUrl} placeholder="https://zoom.us/…" /></Field>
            <Field label={t("Starts", "البداية")}><TextInput name="startAt" type="datetime-local" defaultValue={toLocalInput(editing.startAt)} required /></Field>
            <Field label={t("Ends (optional)", "النهاية (اختياري)")}><TextInput name="endAt" type="datetime-local" defaultValue={toLocalInput(editing.endAt)} /></Field>
            <Field label={t("Description (English)", "الوصف (إنجليزي)")} className="sm:col-span-2"><TextArea name="description" defaultValue={editing.description} rows={5} /></Field>
            <Field label={t("Description (Arabic)", "الوصف (عربي)")} className="sm:col-span-2"><TextArea name="descriptionAr" defaultValue={editing.descriptionAr} dir="rtl" rows={5} /></Field>
          </form>
        )}
      </Drawer>
      {delDialog}
    </>
  );
}

// ── Polls ────────────────────────────────────────────────────────────────────

export function PollsPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { polls, isLoading } = usePolls();
  const [editing, setEditing] = useState<any | null>(null);
  const [options, setOptions] = useState<{ label: string; labelAr: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [del, delDialog] = useDelete("Poll", (id) => `/api/polls/${id}`);

  const open = (poll: any) => {
    setEditing(poll);
    if (!poll.id) setOptions([{ label: "", labelAr: "" }, { label: "", labelAr: "" }]);
  };
  useIntent("polls", (i) => { if (i.kind === "create") open({}); });

  const save = async (form: HTMLFormElement) => {
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const base = compact({ title: raw.title, titleAr: raw.titleAr, description: raw.description, endsAt: raw.endsAt ? new Date(raw.endsAt).toISOString() : "" });
    setSaving(true);
    try {
      if (editing?.id) {
        await jsonPost(`/api/polls/${editing.id}`, "PATCH", base);
      } else {
        const opts = options.filter((o) => o.label.trim()).map((o) => compact({ label: o.label.trim(), labelAr: o.labelAr.trim() }));
        if (opts.length < 2) { toast({ title: t("Add at least two options", "أضف خيارين على الأقل"), variant: "destructive" }); setSaving(false); return; }
        await jsonPost(`/api/polls`, "POST", { ...base, options: opts });
      }
      toast({ title: editing?.id ? t("Poll updated", "تم تحديث الاستطلاع") : t("Poll created", "تم إنشاء الاستطلاع") });
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["/api/polls"] });
    } catch (e: any) {
      toast({ title: t("Save failed", "فشل الحفظ"), description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "title", accessorFn: (p) => t(p.title, p.titleAr || p.title), sortingFn: textSort, enableHiding: false, meta: { label: t("Question", "السؤال") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Question", "السؤال")} />,
      cell: ({ row }) => {
        const p = row.original;
        const lead = [...(p.options || [])].sort((a: any, b: any) => (b.votes || 0) - (a.votes || 0))[0];
        return (
          <div className="min-w-[260px]">
            <div className="font-medium">{t(p.title, p.titleAr || p.title)}</div>
            {lead && p.totalVotes > 0 && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {t("Leading:", "المتصدر:")} <span className="text-foreground/80">{t(lead.label, lead.labelAr || lead.label)}</span> · {lead.percentage ?? 0}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: "results", accessorFn: (p) => p.totalVotes || 0, enableSorting: false, meta: { label: t("Results", "النتائج") },
      header: () => <span className="text-xs font-medium text-muted-foreground">{t("Results", "النتائج")}</span>,
      cell: ({ row }) => (
        <div className="flex h-2 w-40 overflow-hidden rounded-full bg-secondary" title={(row.original.options || []).map((o: any) => `${o.label}: ${o.votes || 0}`).join(" · ")}>
          {(row.original.options || []).map((o: any, i: number) => (
            <div key={o.id} style={{ width: `${o.percentage || 0}%`, background: `var(--viz-${(i % 4) + 1})` }} className="h-full border-e-2 border-card last:border-0" />
          ))}
        </div>
      ),
    },
    {
      id: "votes", accessorFn: (p) => p.totalVotes || 0, meta: { label: t("Votes", "الأصوات") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Votes", "الأصوات")} />,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{fmt.number(getValue())}</span>,
    },
    {
      id: "status", accessorKey: "status", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Status", "الحالة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Status", "الحالة")} />,
      cell: ({ getValue }) => <StatusPill value={getValue()} />,
    },
    {
      id: "endsAt", accessorFn: (p) => (p.endsAt ? new Date(p.endsAt) : undefined), sortingFn: "datetime", sortUndefined: "last", filterFn: dateRangeFilter, meta: { label: t("Ends", "ينتهي") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Ends", "ينتهي")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{row.original.endsAt ? fmt.date(row.original.endsAt) : t("No end date", "بلا تاريخ")}</span>,
    },
    {
      id: "actions", enableHiding: false, enableSorting: false, size: 44, header: () => null,
      cell: ({ row }) => <RowMenu onEdit={() => open(row.original)} onDelete={() => del(row.original, row.original.title)} />,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalVotes = polls.reduce((s, p) => s + (p.totalVotes || 0), 0);

  return (
    <>
      <PageHeader
        title={t("Polls", "الاستطلاعات")}
        description={t("Create polls and follow the results live.", "أنشئ استطلاعات وتابع النتائج مباشرة.")}
        actions={<Btn onClick={() => open({})}><Plus /> {t("Create poll", "إنشاء استطلاع")}</Btn>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("Polls", "الاستطلاعات")} value={polls.length} icon={Vote} loading={isLoading} />
        <StatCard label={t("Active", "نشطة")} value={polls.filter((p) => p.status === "active").length} loading={isLoading} />
        <StatCard label={t("Total votes", "إجمالي الأصوات")} value={fmt.number(totalVotes)} icon={BarChart3} loading={isLoading} />
        <StatCard label={t("Avg. votes per poll", "متوسط الأصوات")} value={polls.length ? Math.round(totalVotes / polls.length) : "—"} loading={isLoading} />
      </div>
      <DataTable
        data={polls}
        columns={columns}
        isLoading={isLoading}
        getRowId={(p) => String(p.id)}
        searchPlaceholder={t("Search questions and options…", "ابحث في الأسئلة والخيارات…")}
        getSearchText={(p) => [p.title, p.titleAr, p.description, ...(p.options || []).map((o: any) => `${o.label} ${o.labelAr || ""}`)].filter(Boolean).join(" ")}
        initialSort={[{ id: "title", desc: false }]}
        facets={[{ column: "status", title: t("Status", "الحالة"), options: [{ value: "active", label: t("Active", "نشط") }, { value: "closed", label: t("Closed", "مغلق") }] }]}
        dateColumn={{ column: "endsAt", title: t("Ends", "ينتهي") }}
        onRowClick={(p) => open(p)}
        exportName="poll-results"
        exportRow={(p) => ({
          id: p.id, question: p.title, questionAr: p.titleAr, status: p.status, totalVotes: p.totalVotes, endsAt: p.endsAt,
          ...Object.fromEntries((p.options || []).map((o: any, i: number) => [`option${i + 1}`, `${o.label} (${o.votes || 0} · ${o.percentage || 0}%)`])),
        })}
        empty={{ title: t("No polls yet", "لا توجد استطلاعات"), action: <Btn size="sm" onClick={() => open({})}><Plus /> {t("Create one", "أنشئ استطلاعاً")}</Btn> }}
      />

      <Drawer
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        width="lg"
        title={editing?.id ? t("Edit poll", "تعديل الاستطلاع") : t("Create poll", "إنشاء استطلاع")}
        footer={
          <>
            {editing?.id && <Btn variant="ghost" className="me-auto text-rose-600" onClick={() => { del(editing, editing.title); setEditing(null); }}><Trash2 /> {t("Delete", "حذف")}</Btn>}
            <Btn variant="outline" onClick={() => setEditing(null)}>{t("Cancel", "إلغاء")}</Btn>
            <Btn type="submit" form="poll-form" loading={saving}>{editing?.id ? t("Save changes", "حفظ") : t("Create poll", "إنشاء")}</Btn>
          </>
        }
      >
        {editing && (
          <form id="poll-form" key={editing.id ?? "new"} onSubmit={(e) => { e.preventDefault(); save(e.currentTarget); }} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Question (English)", "السؤال (إنجليزي)")}><TextInput name="title" defaultValue={editing.title} required maxLength={200} /></Field>
              <Field label={t("Question (Arabic)", "السؤال (عربي)")}><TextInput name="titleAr" defaultValue={editing.titleAr} dir="rtl" maxLength={200} /></Field>
              <Field label={t("Description (optional)", "الوصف (اختياري)")} className="sm:col-span-2"><TextArea name="description" defaultValue={editing.description || ""} rows={3} /></Field>
              <Field label={t("Closes at (optional)", "ينتهي في (اختياري)")}><TextInput name="endsAt" type="datetime-local" defaultValue={toLocalInput(editing.endsAt)} /></Field>
            </div>

            {editing.id ? (
              <div className="rounded-xl border border-border p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Results", "النتائج")} · {fmt.number(editing.totalVotes || 0)} {t("votes", "صوت")}</p>
                <ul className="space-y-3">
                  {(editing.options || []).map((o: any, i: number) => (
                    <li key={o.id}>
                      <div className="mb-1 flex justify-between text-sm"><span>{t(o.label, o.labelAr || o.label)}</span><span className="tabular-nums text-muted-foreground">{o.votes || 0} · {o.percentage || 0}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${o.percentage || 0}%`, background: `var(--viz-${(i % 4) + 1})` }} /></div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">{t("Options can't be edited once a poll exists, since votes may already be cast.", "لا يمكن تعديل الخيارات بعد إنشاء الاستطلاع لأن الأصوات قد تكون سُجّلت.")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground/80">{t("Options", "الخيارات")} <span className="text-muted-foreground">({t("2 to 10", "من 2 إلى 10")})</span></p>
                  <Btn size="xs" variant="outline" disabled={options.length >= 10} onClick={() => setOptions((o) => [...o, { label: "", labelAr: "" }])}><Plus /> {t("Add option", "إضافة خيار")}</Btn>
                </div>
                {options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium tabular-nums">{i + 1}</span>
                    <TextInput value={o.label} required={i < 2} placeholder={t("Option (English)", "الخيار (إنجليزي)")} maxLength={200}
                      onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                    <TextInput value={o.labelAr} dir="rtl" placeholder={t("Option (Arabic)", "الخيار (عربي)")} maxLength={200}
                      onChange={(e) => setOptions((all) => all.map((x, j) => (j === i ? { ...x, labelAr: e.target.value } : x)))} />
                    <Btn size="icon-sm" variant="ghost" disabled={options.length <= 2} aria-label={t("Remove option", "إزالة الخيار")}
                      onClick={() => setOptions((all) => all.filter((_, j) => j !== i))}><X /></Btn>
                  </div>
                ))}
              </div>
            )}
          </form>
        )}
      </Drawer>
      {delDialog}
    </>
  );
}
