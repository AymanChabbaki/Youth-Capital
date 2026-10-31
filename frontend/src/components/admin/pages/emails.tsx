import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import {
  AlertTriangle, Check, CircleCheck, CircleX, Copy, History, Info, Mail, PenLine, Send, UserPlus, X, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useIntent } from "../context";
import { useMembers, jsonPost } from "../data";
import { ColumnHeader, DataTable, facetFilter, dateRangeFilter, textSort } from "../data-table";
import { Drawer } from "../drawer";
import {
  Avatar, Btn, DetailGrid, Field, NativeSelect, PageHeader, Panel, Pill, Segmented, StatCard, StatusPill, TextArea, TextInput,
  useConfirm, useFormat,
} from "../primitives";

// Must match SEGMENTS in backend/src/routes/email.ts
const SEGMENTS = [
  "active_users", "all_users", "pending_applicants", "approved_applicants", "rejected_applicants", "banned_users", "selected", "custom",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailsPage() {
  const { t } = useLanguage();
  const fmt = useFormat();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { members } = useMembers();
  const [confirm, confirmDialog] = useConfirm();
  const [view, setView] = useState<"compose" | "history">("compose");
  const [segment, setSegment] = useState<string>("active_users");
  const [picked, setPicked] = useState<string[]>([]); // emails of specific members
  const [customList, setCustomList] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [viewing, setViewing] = useState<any>(null);

  const memberByEmail = useMemo(() => new Map(members.map((m) => [String(m.email).toLowerCase(), m])), [members]);

  // From Members/Applications/Support: known members go into the picker,
  // anything else (e.g. a deleted account) falls back to the custom list.
  useIntent("emails", (i) => {
    if (i.kind !== "compose") return;
    const emails = Array.from(new Set(i.emails.filter(Boolean)));
    const known = emails.filter((e) => memberByEmail.has(e.toLowerCase()) || !members.length);
    if (known.length === emails.length) {
      setSegment("selected");
      setPicked(known);
    } else {
      setSegment("custom");
      setCustomList(emails.join("\n"));
    }
    setView("compose");
    setResult(null);
  });

  const { data: mailer } = useQuery({ queryKey: ["/api/admin/email/status"], queryFn: () => customFetch<any>("/api/admin/email/status") });
  const { data: preview } = useQuery({
    queryKey: ["/api/admin/email/recipients", segment],
    queryFn: () => customFetch<any>(`/api/admin/email/recipients?segment=${segment}`),
    enabled: segment !== "custom" && segment !== "selected",
  });
  const history = useQuery({ queryKey: ["/api/admin/email/history"], queryFn: () => customFetch<any>("/api/admin/email/history") });
  const campaigns: any[] = history.data?.campaigns || [];

  const customEmails = customList.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
  const invalid = customEmails.filter((e) => !EMAIL_RE.test(e));
  const count = segment === "custom" ? customEmails.length : segment === "selected" ? picked.length : preview?.count ?? null;

  const segLabel = (s: string) => ({
    active_users: t("Active members", "الأعضاء النشطون"), all_users: t("All members", "جميع الأعضاء"), banned_users: t("Banned members", "المحظورون"),
    pending_applicants: t("Pending applicants", "المتقدمون المعلّقون"), approved_applicants: t("Approved applicants", "المتقدمون المقبولون"),
    rejected_applicants: t("Rejected applicants", "المتقدمون المرفوضون"), selected: t("Specific members", "أعضاء محددون"), custom: t("Custom list", "قائمة مخصصة"),
  } as Record<string, string>)[s] || s;

  const send = async () => {
    if (!subject.trim() || !message.trim()) { toast({ title: t("Subject and message are required", "العنوان والرسالة مطلوبان"), variant: "destructive" }); return; }
    if (segment === "selected" && !picked.length) { toast({ title: t("Pick at least one member", "اختر عضواً واحداً على الأقل"), variant: "destructive" }); return; }
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
        segment, subject, message, lang,
        customEmails: segment === "custom" ? customEmails : segment === "selected" ? picked : undefined,
      });
      setResult(r);
      toast({ title: t(`Sent to ${r.sent} recipient(s)`, `تم الإرسال إلى ${r.sent} مستلم`), variant: r.failed > 0 ? "destructive" : "default" });
      if (r.failed === 0) { setSubject(""); setMessage(""); }
      qc.invalidateQueries({ queryKey: ["/api/admin/email/history"] });
    } catch (e: any) {
      toast({ title: t("Send failed", "فشل الإرسال"), description: e?.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // Load a past email back into the composer (to resend or adapt it).
  const reuse = (c: any, sameAudience: boolean) => {
    setSubject(c.subject || "");
    setMessage(c.message || "");
    if (c.lang) setLang(c.lang);
    if (sameAudience && c.recipients?.length && (c.segment === "selected" || c.segment === "custom")) {
      setSegment(c.segment);
      if (c.segment === "selected") setPicked(c.recipients); else setCustomList(c.recipients.join("\n"));
    } else if (sameAudience && SEGMENTS.includes(c.segment)) {
      setSegment(c.segment);
    }
    setViewing(null);
    setView("compose");
    setResult(null);
  };

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: "subject", accessorFn: (c) => c.subject || "", sortingFn: textSort, enableHiding: false, meta: { label: t("Subject", "العنوان") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Email", "البريد")} />,
      cell: ({ row }) => (
        <div className="min-w-[260px]">
          <div className="flex items-center gap-2 font-medium">
            <span className="truncate">{row.original.subject || "—"}</span>
            {row.original.legacy && <Pill className="text-[10px]">{t("Summary only", "ملخص فقط")}</Pill>}
          </div>
          {row.original.message && <div className="line-clamp-1 text-xs text-muted-foreground">{row.original.message}</div>}
        </div>
      ),
    },
    {
      id: "segment", accessorFn: (c) => segLabel(c.segment), filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Audience", "الجمهور") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Audience", "الجمهور")} />,
      cell: ({ getValue }) => <Pill tone="info">{getValue()}</Pill>,
    },
    {
      id: "recipients", accessorFn: (c) => c.recipients?.length ?? c.recipientCount ?? c.sentCount + c.failedCount, meta: { label: t("Recipients", "المستلمون") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Recipients", "المستلمون")} />,
      cell: ({ getValue }) => <span className="tabular-nums">{fmt.number(getValue())}</span>,
    },
    {
      id: "delivery", accessorFn: (c) => (c.failedCount > 0 ? (c.sentCount > 0 ? "partial" : "failed") : "delivered"), filterFn: facetFilter, sortingFn: textSort,
      meta: { label: t("Delivery", "التسليم") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Delivery", "التسليم")} />,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2 whitespace-nowrap text-xs">
            <Pill tone={c.failedCount ? (c.sentCount ? "warning" : "danger") : "success"} dot>
              {c.failedCount ? (c.sentCount ? t("Partial", "جزئي") : t("Failed", "فشل")) : t("Delivered", "أُرسل")}
            </Pill>
            <span className="tabular-nums text-muted-foreground">{c.sentCount} ✓{c.failedCount ? ` · ${c.failedCount} ✗` : ""}</span>
          </div>
        );
      },
    },
    {
      id: "lang", accessorFn: (c) => (c.lang === "ar" ? "العربية" : c.lang === "en" ? "English" : "—"), filterFn: facetFilter, meta: { label: t("Language", "اللغة") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Language", "اللغة")} />,
    },
    {
      id: "sender", accessorFn: (c) => c.sender?.fullName || "—", filterFn: facetFilter, sortingFn: textSort, meta: { label: t("Sent by", "أرسله") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Sent by", "أرسله")} />,
      cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{getValue()}</span>,
    },
    {
      id: "sentAt", accessorFn: (c) => new Date(c.createdAt), sortingFn: "datetime", filterFn: dateRangeFilter, meta: { label: t("Sent", "التاريخ") },
      header: ({ column }) => <ColumnHeader column={column} title={t("Sent", "التاريخ")} />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground" title={fmt.dateTime(row.original.createdAt)}>{fmt.relative(row.original.createdAt)}</span>,
    },
  ], [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const paragraphs = message.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const totalSent = campaigns.reduce((s, c) => s + (c.sentCount || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failedCount || 0), 0);

  return (
    <>
      <PageHeader
        title={t("Emails", "البريد الإلكتروني")}
        description={t("Send branded emails to a segment, specific members, or a custom list, and review everything that was sent.", "أرسل رسائل إلى فئة أو أعضاء محددين أو قائمة مخصصة، وراجع كل ما أُرسل.")}
        eyebrow={mailer && (mailer.configured
          ? <Pill tone="success" dot>{t("SMTP connected", "SMTP متصل")}</Pill>
          : <Pill tone="danger" dot>{t("SMTP not configured", "SMTP غير مهيأ")}</Pill>)}
      />

      <Segmented
        value={view}
        onChange={setView}
        size="md"
        options={[
          { value: "compose", label: <span className="inline-flex items-center gap-1.5"><PenLine className="size-3.5" /> {t("Compose", "كتابة")}</span> },
          { value: "history", label: <span className="inline-flex items-center gap-1.5"><History className="size-3.5" /> {t("History", "السجل")}</span>, count: campaigns.length },
        ]}
      />

      {view === "history" ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label={t("Emails sent", "رسائل مرسلة")} value={fmt.number(campaigns.length)} icon={Mail} loading={history.isLoading} />
            <StatCard label={t("Deliveries", "عمليات التسليم")} value={fmt.number(totalSent)} icon={CircleCheck} loading={history.isLoading} />
            <StatCard label={t("Failed deliveries", "تسليمات فاشلة")} value={fmt.number(totalFailed)} icon={CircleX} loading={history.isLoading} tone={totalFailed ? "danger" : "neutral"} />
            <StatCard label={t("Last sent", "آخر إرسال")} value={campaigns[0] ? fmt.relative(campaigns[0].createdAt) : "—"} hint={campaigns[0]?.subject} loading={history.isLoading} />
          </div>
          <DataTable
            data={campaigns}
            columns={columns}
            isLoading={history.isLoading}
            getRowId={(c) => String(c.id)}
            searchPlaceholder={t("Search subject, message, recipient…", "ابحث في العنوان، الرسالة، المستلم…")}
            getSearchText={(c) => [c.subject, c.message, c.sender?.fullName, ...(c.recipients || [])].filter(Boolean).join(" ")}
            initialSort={[{ id: "sentAt", desc: true }]}
            initialHidden={["lang"]}
            facets={[
              { column: "segment", title: t("Audience", "الجمهور") },
              { column: "delivery", title: t("Delivery", "التسليم"), options: [{ value: "delivered", label: t("Delivered", "أُرسل") }, { value: "partial", label: t("Partial", "جزئي") }, { value: "failed", label: t("Failed", "فشل") }] },
              { column: "sender", title: t("Sent by", "أرسله") },
              { column: "lang", title: t("Language", "اللغة") },
            ]}
            dateColumn={{ column: "sentAt", title: t("Sent", "التاريخ") }}
            onRowClick={setViewing}
            exportName="email-history"
            exportRow={(c) => ({
              id: c.id, subject: c.subject, audience: segLabel(c.segment), recipients: c.recipients?.length ?? c.recipientCount,
              sent: c.sentCount, failed: c.failedCount, sentBy: c.sender?.fullName, language: c.lang, sentAt: c.createdAt,
              recipientList: c.recipients?.join("; "),
            })}
            empty={{ title: t("No emails sent yet", "لم تُرسل أي رسالة بعد"), action: <Btn size="sm" onClick={() => setView("compose")}><PenLine /> {t("Write one", "اكتب رسالة")}</Btn> }}
          />
        </>
      ) : (
        <>
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
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {SEGMENTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSegment(s)}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all rtl:text-right",
                        segment === s ? "border-primary bg-primary/[0.05] ring-1 ring-primary" : "border-border hover:border-foreground/25 hover:bg-secondary/40"
                      )}
                    >
                      <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border", segment === s ? "border-primary" : "border-border")}>
                        {segment === s && <span className="size-2 rounded-full bg-primary" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{segLabel(s)}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">
                          {s === "custom" ? t("Paste addresses", "الصق العناوين")
                            : s === "selected" ? (picked.length ? `${picked.length} ${t("picked", "مختار")}` : t("Pick from members", "اختر من الأعضاء"))
                            : segment === s ? (preview ? `${preview.count} ${t("recipients", "مستلم")}` : "…") : " "}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {segment === "selected" && (
                  <div className="mt-4">
                    <MemberPicker members={members} value={picked} onChange={setPicked} />
                  </div>
                )}

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
                    <div className={cn("flex flex-wrap items-center gap-2 rounded-lg p-3 text-sm", result.failed ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")}>
                      {result.failed ? <CircleX className="size-4" /> : <CircleCheck className="size-4" />}
                      {t(`Sent: ${result.sent} · Failed: ${result.failed}`, `أُرسل: ${result.sent} · فشل: ${result.failed}`)}
                      <button type="button" onClick={() => setView("history")} className="ms-auto text-xs font-medium underline-offset-2 hover:underline">{t("View in history", "عرض في السجل")}</button>
                    </div>
                  )}
                </div>
              </Panel>
            </div>

            {/* Live preview */}
            <div className="xl:sticky xl:top-20 xl:self-start">
              <Panel title={t("Preview", "معاينة")} description={t("Approximate rendering of the email", "عرض تقريبي للبريد")} bodyClassName="p-0 px-0 pb-0">
                <EmailPreview subject={subject} paragraphs={paragraphs} lang={lang} />
                <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {segLabel(segment)}</span>
                  <span className="tabular-nums">{count ?? "…"} {t("recipients", "مستلم")}</span>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {/* History detail */}
      <Drawer
        open={!!viewing}
        onOpenChange={(o) => !o && setViewing(null)}
        width="lg"
        title={viewing?.subject || t("Email", "البريد")}
        description={viewing && `${fmt.dateTime(viewing.createdAt)} · ${viewing.sender?.fullName || "—"}`}
        footer={viewing && !viewing.legacy && (
          <>
            <Btn variant="outline" onClick={() => reuse(viewing, false)}><Copy /> {t("Use as template", "استخدام كقالب")}</Btn>
            <Btn onClick={() => reuse(viewing, true)}><Send /> {t("Send again…", "إرسال مجدداً…")}</Btn>
          </>
        )}
      >
        {viewing && (
          <div className="space-y-6">
            <DetailGrid items={[
              { label: t("Audience", "الجمهور"), value: <Pill tone="info">{segLabel(viewing.segment)}</Pill> },
              { label: t("Language", "اللغة"), value: viewing.lang === "ar" ? "العربية" : viewing.lang === "en" ? "English" : "—" },
              { label: t("Delivered", "أُرسل"), value: <span className="tabular-nums text-emerald-600">{viewing.sentCount}</span> },
              { label: t("Failed", "فشل"), value: <span className={cn("tabular-nums", viewing.failedCount && "text-rose-600")}>{viewing.failedCount}</span> },
            ]} />

            {viewing.legacy ? (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {t("Sent before history tracking existed — only the subject, audience and counts were recorded.", "أُرسل قبل تفعيل السجل — تم حفظ العنوان والجمهور والأعداد فقط.")}
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-border">
                  <EmailPreview subject={viewing.subject} paragraphs={String(viewing.message || "").split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean)} lang={viewing.lang} />
                </div>

                {viewing.failures?.length > 0 && (
                  <section>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-600">{t("Failed deliveries", "تسليمات فاشلة")}</h4>
                    <ul className="divide-y divide-border rounded-lg border border-rose-500/30">
                      {viewing.failures.map((f: any) => (
                        <li key={f.email} className="px-3 py-2 text-xs">
                          <span className="font-mono">{f.email}</span>
                          {f.error && <span className="block text-muted-foreground">{f.error}</span>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <RecipientList emails={viewing.recipients || []} failed={new Set((viewing.failures || []).map((f: any) => f.email))} memberByEmail={memberByEmail} />
              </>
            )}
          </div>
        )}
      </Drawer>
      {confirmDialog}
    </>
  );
}

function EmailPreview({ subject, paragraphs, lang }: { subject: string; paragraphs: string[]; lang: string }) {
  const { t } = useLanguage();
  return (
    <div className="bg-secondary/50 p-4">
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
    </div>
  );
}

// Searchable multi-select over members, with chips for the current picks.
function MemberPicker({ members, value, onChange }: { members: any[]; value: string[]; onChange: (emails: string[]) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("active");
  const selected = new Set(value.map((e) => e.toLowerCase()));
  const byEmail = new Map(members.map((m) => [String(m.email).toLowerCase(), m]));
  const regions = Array.from(new Set(members.map((m) => m.region?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const pool = members
    .filter((m) => (!region || m.region?.trim() === region) && (!status || m.status === status))
    .sort((a, b) => String(a.fullName).localeCompare(String(b.fullName), undefined, { sensitivity: "base" }));

  const toggle = (email: string) => {
    const key = email.toLowerCase();
    onChange(selected.has(key) ? value.filter((e) => e.toLowerCase() !== key) : [...value, email]);
  };
  const addAll = () => onChange(Array.from(new Set([...value, ...pool.map((m) => m.email)])));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Btn variant="outline"><UserPlus /> {t("Add members", "إضافة أعضاء")}</Btn>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(420px,calc(100vw-2rem))] p-0">
            <div className="flex gap-2 border-b border-border p-2">
              <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 text-xs">
                <option value="">{t("Any status", "كل الحالات")}</option>
                <option value="active">{t("Active", "نشط")}</option>
                <option value="banned">{t("Banned", "محظور")}</option>
              </NativeSelect>
              <NativeSelect value={region} onChange={(e) => setRegion(e.target.value)} className="h-8 text-xs">
                <option value="">{t("All regions", "جميع الجهات")}</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </NativeSelect>
            </div>
            <Command>
              <CommandInput placeholder={t("Search name or email…", "ابحث بالاسم أو البريد…")} className="h-9 text-sm" />
              <CommandList className="max-h-72">
                <CommandEmpty>{t("No members found.", "لا يوجد أعضاء.")}</CommandEmpty>
                <CommandGroup>
                  {pool.map((m) => {
                    const isSel = selected.has(String(m.email).toLowerCase());
                    return (
                      <CommandItem key={m.id} value={`${m.fullName} ${m.email} ${m.id}`} onSelect={() => toggle(m.email)} className="gap-2.5">
                        <span className={cn("flex size-4 shrink-0 items-center justify-center rounded border border-border", isSel && "border-primary bg-primary text-primary-foreground")}>
                          {isSel && <Check className="size-3" />}
                        </span>
                        <Avatar name={m.fullName} src={m.avatarUrl} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{m.fullName}</span>
                          <span className="block truncate text-xs text-muted-foreground">{m.email}</span>
                        </span>
                        {m.region && <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{m.region}</span>}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="flex items-center justify-between border-t border-border p-2">
              <Btn size="xs" variant="ghost" onClick={addAll}><Users /> {t(`Add all ${pool.length} shown`, `إضافة الكل (${pool.length})`)}</Btn>
              <Btn size="xs" onClick={() => setOpen(false)}>{t("Done", "تم")}</Btn>
            </div>
          </PopoverContent>
        </Popover>
        {value.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground tabular-nums">{value.length} {t("selected", "محدد")}</span>
            <Btn size="xs" variant="ghost" onClick={() => onChange([])}>{t("Clear all", "مسح الكل")}</Btn>
          </>
        )}
      </div>

      {value.length > 0 ? (
        <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-2">
          {value.map((email) => {
            const m = byEmail.get(email.toLowerCase());
            return (
              <span key={email} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-0.5 pe-1 ps-0.5 text-xs">
                <Avatar name={m?.fullName || email} src={m?.avatarUrl} size="sm" className="size-5 text-[9px]" />
                <span className="max-w-40 truncate" title={email}>{m?.fullName || email}</span>
                <button type="button" onClick={() => toggle(email)} className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={t("Remove", "إزالة")}>
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          {t("No members picked yet. Use “Add members”, or select rows on the Members page and choose “Email selected”.", "لم يتم اختيار أي عضو بعد. استخدم «إضافة أعضاء» أو حدد صفوفاً في صفحة الأعضاء.")}
        </p>
      )}
    </div>
  );
}

function RecipientList({ emails, failed, memberByEmail }: { emails: string[]; failed: Set<string>; memberByEmail: Map<string, any> }) {
  const { t } = useLanguage();
  const [q, setQ] = useState("");
  const shown = emails.filter((e) => {
    const m = memberByEmail.get(e.toLowerCase());
    return !q || `${e} ${m?.fullName || ""}`.toLowerCase().includes(q.toLowerCase());
  });
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Recipients", "المستلمون")} · {emails.length}</h4>
        <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Filter…", "تصفية…")} className="h-7 w-40 text-xs" />
      </div>
      <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border">
        {shown.map((e) => {
          const m = memberByEmail.get(e.toLowerCase());
          return (
            <li key={e} className="flex items-center gap-2.5 px-3 py-2">
              <Avatar name={m?.fullName || e} src={m?.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1">
                {m && <span className="block truncate text-sm">{m.fullName}</span>}
                <span className="block truncate font-mono text-[11px] text-muted-foreground">{e}</span>
              </span>
              {failed.has(e) ? <StatusPill value="error" label={t("Failed", "فشل")} /> : <Check className="size-3.5 text-emerald-600" />}
            </li>
          );
        })}
        {!shown.length && <li className="px-3 py-6 text-center text-xs text-muted-foreground">—</li>}
      </ul>
    </section>
  );
}
