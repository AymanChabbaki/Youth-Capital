import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useGetUsers, useGetRoleApplications, useGetPolls, customFetch,
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, LabelList,
} from "recharts";
import {
  Download, Table2, BarChart3, Users, UserCheck, Ban, FileCheck, Scale, Vote,
  MapPin, Filter, Loader2, CalendarRange, MessageSquare, LifeBuoy, Newspaper,
  Calendar, Siren, Activity, Heart,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button, Select, Label, Input } from "@/components/ui-custom";
import { AGE_RANGES, GENDERS, ageRangeOf, uniqueSorted } from "@/components/admin-table";

// Must match AXES in backend/src/routes/sahara.ts
const SAHARA_AXES = [
  "Constitutional & Legal Framework",
  "Distribution of Powers & Institutions",
  "Financial & Natural Resources",
  "General / Other",
];

const NOT_SAID = "Prefer not to say";
const UNKNOWN = "Unknown";

// Categorical slots 1–3 of the validated dataviz palette, stepped per theme
// (validated all-pairs against the white card and the dark navy card).
// Slot order is fixed per entity: Male → 1, Female → 2, Prefer not to say → 3.
const VIZ_STYLE = `
.viz-root { --viz-1: #2a78d6; --viz-2: #eb6834; --viz-3: #1baf7a; --viz-4: #eda100; }
.dark .viz-root { --viz-1: #3987e5; --viz-2: #d95926; --viz-3: #199e70; --viz-4: #c98500; }
`;
const GENDER_COLORS: Record<string, string> = {
  Male: "var(--viz-1)",
  Female: "var(--viz-2)",
  [NOT_SAID]: "var(--viz-3)",
};

const TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  color: "var(--card-foreground)",
  fontSize: 12,
};
const TICK = { fontSize: 11, fill: "var(--muted-foreground)" };

type Datum = { name: string; value: number };
type Filters = { from: string; to: string; ageRange: string; gender: string; region: string; axis: string };
const EMPTY_FILTERS: Filters = { from: "", to: "", ageRange: "", gender: "", region: "", axis: "" };

// ── data helpers ────────────────────────────────────────────────────────────

function countBy<T>(items: T[], key: (item: T) => string | null | undefined, order?: readonly string[]): Datum[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const k = key(item)?.toString().trim() || UNKNOWN;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  if (order) {
    const ordered = order.map((name) => ({ name, value: counts.get(name) || 0 }));
    const extra = [...counts.entries()].filter(([k]) => !order.includes(k)).map(([name, value]) => ({ name, value }));
    return [...ordered, ...extra];
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

// Long categorical lists fold the tail into "Other" instead of an unreadable chart.
function topN(data: Datum[], n: number): Datum[] {
  if (data.length <= n) return data;
  const rest = data.slice(n - 1).reduce((sum, d) => sum + d.value, 0);
  return [...data.slice(0, n - 1), { name: "Other", value: rest }];
}

function monthKey(date: string | Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// One point per month from the first to the last record, so empty months show as 0.
function monthly<T>(items: T[], date: (item: T) => string | Date | null | undefined): Datum[] {
  const keys = items.map(date).filter(Boolean).map((d) => monthKey(d!));
  if (!keys.length) return [];
  const counts = new Map<string, number>();
  keys.forEach((k) => counts.set(k, (counts.get(k) || 0) + 1));
  const sorted = [...counts.keys()].sort();
  const [startY, startM] = sorted[0].split("-").map(Number);
  const [endY, endM] = sorted[sorted.length - 1].split("-").map(Number);
  const out: Datum[] = [];
  for (let y = startY, m = startM; y < endY || (y === endY && m <= endM); m === 12 ? (y++, m = 1) : m++) {
    const k = `${y}-${String(m).padStart(2, "0")}`;
    out.push({ name: k, value: counts.get(k) || 0 });
  }
  return out;
}

// Several monthly series merged onto one shared month axis.
function monthlyMulti(series: Record<string, (string | Date | null | undefined)[]>) {
  const all = Object.values(series).flat().filter(Boolean) as (string | Date)[];
  const months = monthly(all, (d) => d).map((d) => d.name);
  const counts = Object.fromEntries(
    Object.entries(series).map(([k, dates]) => {
      const m = new Map<string, number>();
      dates.filter(Boolean).forEach((d) => { const key = monthKey(d!); m.set(key, (m.get(key) || 0) + 1); });
      return [k, m];
    })
  );
  return months.map((name) => {
    const row: Record<string, string | number> = { name };
    for (const k of Object.keys(series)) row[k] = counts[k].get(name) || 0;
    return row;
  });
}

// Rows of {name, <series>: count} for a stacked bar of `group` split by `series`.
function crossCount<T>(items: T[], group: (i: T) => string, series: (i: T) => string, groups: readonly string[], seriesNames: readonly string[]) {
  return groups.map((g) => {
    const row: Record<string, string | number> = { name: g };
    for (const s of seriesNames) row[s] = 0;
    for (const item of items) {
      if (group(item) !== g) continue;
      const s = series(item);
      row[s] = ((row[s] as number) || 0) + 1;
    }
    return row;
  });
}

function inDateRange(value: string | Date | null | undefined, from: string, to: string) {
  if (!from && !to) return true;
  if (!value) return false;
  const d = new Date(value).getTime();
  if (from && d < new Date(`${from}T00:00:00`).getTime()) return false;
  if (to && d > new Date(`${to}T23:59:59.999`).getTime()) return false;
  return true;
}

const genderOf = (g: string | null | undefined) => g?.trim() || NOT_SAID;

// ── CSV export ──────────────────────────────────────────────────────────────

function toCsv(rows: Record<string, unknown>[], columns?: string[]) {
  const cols = columns || Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v: unknown) => {
    if (v == null) return "";
    const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}

function downloadCsv(filename: string, rows: Record<string, unknown>[], columns?: string[]) {
  // BOM so Excel opens Arabic and accented region names correctly.
  const blob = new Blob(["﻿" + toCsv(rows, columns)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── presentational pieces ───────────────────────────────────────────────────

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: ReactNode; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-display font-bold text-foreground tabular-nums">{value}</div>
        <div className="text-sm font-semibold text-foreground/80">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children, count }: { icon: any; children: ReactNode; count?: number }) {
  return (
    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 pt-2">
      <Icon className="w-5 h-5 text-primary" /> {children}
      {count != null && <span className="text-sm font-normal text-muted-foreground">({count})</span>}
    </h2>
  );
}

// Card with a chart/table toggle and a per-chart CSV download of exactly what's plotted.
function ChartCard({ title, rows, csvName, children, className = "" }: {
  title: string; rows: Record<string, unknown>[]; csvName: string; children: ReactNode; className?: string;
}) {
  const { t } = useLanguage();
  const [showTable, setShowTable] = useState(false);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const isEmpty = rows.length === 0 || rows.every((r) => Object.entries(r).every(([k, v]) => k === "name" || !v));
  return (
    <div className={`bg-card border border-border rounded-2xl p-5 flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="font-bold text-foreground text-sm leading-snug">{title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            title={showTable ? t("Show chart", "عرض الرسم") : t("Show table", "عرض الجدول")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {showTable ? <BarChart3 className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => downloadCsv(csvName, rows)}
            disabled={!rows.length}
            title={t("Download CSV", "تنزيل CSV")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center py-10 text-sm text-muted-foreground">
          {t("No data for these filters.", "لا توجد بيانات لهذه الفلترة.")}
        </div>
      ) : showTable ? (
        <div className="overflow-auto max-h-80 rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/40 sticky top-0">
              <tr>{columns.map((c) => <th key={c} className="px-3 py-2 text-left font-semibold text-muted-foreground">{c === "name" ? "" : c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c} className={`px-3 py-1.5 ${c === "name" ? "text-foreground" : "text-right tabular-nums text-foreground/80"}`}>{String(r[c] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Single-series bars: one hue, values labelled at the bar end.
function Bars({ data, horizontal = true, color = "var(--viz-1)" }: { data: Datum[]; horizontal?: boolean; color?: string }) {
  if (horizontal) {
    const height = Math.max(140, data.length * 30 + 30);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis type="number" allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={150} tick={TICK} axisLine={false} tickLine={false} interval={0} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
          <Bar dataKey="value" name="Count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: "var(--card-foreground)" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: -16, right: 8, top: 18, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
        <Bar dataKey="value" name="Count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={44}>
          <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: "var(--card-foreground)" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Trend({ data, label }: { data: Datum[]; label: string }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ left: -16, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} minTickGap={16} />
        <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
        <Line type="monotone" dataKey="value" name={label} stroke="var(--viz-1)" strokeWidth={2}
          dot={{ r: 3, fill: "var(--viz-1)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Up to four lines, fixed slot per series, legend always shown.
function MultiTrend({ data, series }: { data: Record<string, string | number>[]; series: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: -16, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} minTickGap={16} />
        <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--card-foreground)" }} iconType="circle" iconSize={8} />
        {series.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} stroke={`var(--viz-${i + 1})`} strokeWidth={2}
            dot={{ r: 3, fill: `var(--viz-${i + 1})`, stroke: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stacked by gender: fixed slot per gender, 2px card-colored gap between segments.
function GenderStack({ data, horizontal = false }: { data: Record<string, string | number>[]; horizontal?: boolean }) {
  const series = GENDERS as readonly string[];
  const height = horizontal ? Math.max(160, data.length * 34 + 60) : 260;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 8 : -16, right: 12, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={!horizontal} vertical={horizontal} stroke="var(--border)" />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={170} tick={TICK} axisLine={false} tickLine={false} interval={0} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={TICK} axisLine={false} tickLine={false} interval={0} />
            <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--card-foreground)" }} iconType="circle" iconSize={8} />
        {series.map((s) => (
          <Bar key={s} dataKey={s} stackId="g" fill={GENDER_COLORS[s]} stroke="var(--card)" strokeWidth={2} maxBarSize={horizontal ? 22 : 44} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Region × section matrix; cell tint is a single-hue sequential scale.
function Heatmap({ rows, columns }: { rows: Record<string, string | number>[]; columns: string[] }) {
  const max = Math.max(1, ...rows.flatMap((r) => columns.map((c) => Number(r[c]) || 0)));
  return (
    <div className="overflow-auto rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead className="bg-secondary/40">
          <tr>
            <th className="px-3 py-2" />
            {columns.map((c) => <th key={c} className="px-3 py-2 font-semibold text-muted-foreground text-center min-w-[90px]">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={String(r.name)}>
              <td className="px-3 py-1.5 font-medium text-foreground whitespace-nowrap">{r.name}</td>
              {columns.map((c) => {
                const v = Number(r[c]) || 0;
                const pct = Math.round((v / max) * 85);
                return (
                  <td
                    key={c}
                    title={`${r.name} · ${c}: ${v}`}
                    className="px-3 py-1.5 text-center tabular-nums text-foreground"
                    style={{ background: v ? `color-mix(in oklab, var(--viz-1) ${pct}%, transparent)` : undefined }}
                  >
                    {v || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function AdminStats() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const { data: usersData, isLoading: usersLoading } = useGetUsers({ limit: 5000 });
  const { data: appsData, isLoading: appsLoading } = useGetRoleApplications();
  const { data: pollsData } = useGetPolls();
  const { data: saharaData, isLoading: saharaLoading } = useQuery({
    queryKey: ["/api/sahara-feedback/export"],
    queryFn: () => customFetch<any>("/api/sahara-feedback/export"),
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/admin/site-activity"],
    queryFn: () => customFetch<any>("/api/admin/site-activity"),
  });

  const users: any[] = (usersData as any)?.users || [];
  const apps: any[] = (appsData as any)?.applications || [];
  const sahara: any[] = saharaData?.entries || [];
  const polls: any[] = (pollsData as any)?.polls || [];

  const regions = useMemo(
    () => uniqueSorted([...users.map((u) => u.region), ...apps.map((a) => a.region), ...sahara.map((e) => e.region)]),
    [users, apps, sahara]
  );

  const f = filters;
  const matchRegion = (r: string | null | undefined) => !f.region || r?.trim() === f.region;
  const matchGender = (g: string | null | undefined) => !f.gender || genderOf(g) === f.gender;

  const fUsers = users.filter((u) =>
    inDateRange(u.createdAt, f.from, f.to) &&
    (!f.ageRange || ageRangeOf(u.age) === f.ageRange) && matchGender(u.gender) && matchRegion(u.region));
  const fApps = apps.filter((a) =>
    inDateRange(a.createdAt, f.from, f.to) &&
    (!f.ageRange || ageRangeOf(a.age) === f.ageRange) && matchGender(a.gender) && matchRegion(a.region));
  const fSahara = sahara.filter((e) =>
    inDateRange(e.createdAt, f.from, f.to) &&
    (!f.ageRange || (e.ageRange || NOT_SAID) === f.ageRange) && matchGender(e.gender) && matchRegion(e.region) &&
    (!f.axis || e.axis === f.axis));

  // Members
  const memberAge = countBy(fUsers, (u) => ageRangeOf(u.age), AGE_RANGES);
  const memberGender = countBy(fUsers, (u) => genderOf(u.gender), GENDERS);
  const memberRegion = topN(countBy(fUsers, (u) => u.region), 15);
  const memberRole = topN(countBy(fUsers, (u) => u.simulationRole || t("Unassigned", "غير معيّن")), 12);
  const memberSignups = monthly(fUsers, (u) => u.createdAt);
  const memberAgeGender = crossCount(fUsers, (u) => ageRangeOf(u.age), (u) => genderOf(u.gender), AGE_RANGES, GENDERS);
  const memberStatus = countBy(fUsers, (u) => u.status);
  const ages = fUsers.map((u) => Number(u.age)).filter((a) => a > 0);
  const avgAge = ages.length ? (ages.reduce((s, a) => s + a, 0) / ages.length).toFixed(1) : "—";

  // Applications
  const appStatus = countBy(fApps, (a) => a.status, ["pending", "approved", "rejected"]);
  const appRole = countBy(fApps, (a) => a.preferredRole);
  const appEducation = topN(countBy(fApps, (a) => a.educationLevel), 10);
  const appOccupation = topN(countBy(fApps, (a) => a.occupationStatus), 10);
  const appCountry = topN(countBy(fApps, (a) => a.country), 10);
  const appMonthly = monthly(fApps, (a) => a.createdAt);

  // Sahara
  const sRegion = countBy(fSahara, (e) => e.region);
  const sAxis = countBy(fSahara, (e) => e.axis, SAHARA_AXES);
  const sAge = countBy(fSahara, (e) => e.ageRange || NOT_SAID, AGE_RANGES);
  const sGender = countBy(fSahara, (e) => genderOf(e.gender), GENDERS);
  const sMonthly = monthly(fSahara, (e) => e.createdAt);
  const sAxisGender = crossCount(fSahara, (e) => e.axis || UNKNOWN, (e) => genderOf(e.gender), SAHARA_AXES, GENDERS);
  const sAgeGender = crossCount(fSahara, (e) => e.ageRange || NOT_SAID, (e) => genderOf(e.gender), AGE_RANGES, GENDERS);
  const sHeatRegions = uniqueSorted(fSahara.map((e) => e.region));
  const sHeat = crossCount(fSahara, (e) => e.region, (e) => e.axis || UNKNOWN, sHeatRegions, SAHARA_AXES);
  const withDemographics = fSahara.filter((e) => (e.ageRange && e.ageRange !== NOT_SAID) || (e.gender && e.gender !== NOT_SAID)).length;

  // Site activity — every row carries a user id, so member demographics apply.
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const hasDemoFilter = !!(f.ageRange || f.gender || f.region);
  const matchUser = (id: number) => {
    const u = userById.get(id);
    if (!u) return !hasDemoFilter; // deleted/unknown users only count when no demographic filter is set
    return (!f.ageRange || ageRangeOf(u.age) === f.ageRange) && matchGender(u.gender) && matchRegion(u.region);
  };
  const userAttr = (id: number, attr: (u: any) => string) => {
    const u = userById.get(id);
    return u ? attr(u) : UNKNOWN;
  };

  const forums: any[] = activity?.forums || [];
  const forumById = new Map(forums.map((fo) => [fo.id, fo]));
  const fPosts = (activity?.posts || []).filter((x: any) => inDateRange(x.createdAt, f.from, f.to) && matchUser(x.authorId));
  const fLikes = (activity?.likes || []).filter((x: any) => inDateRange(x.createdAt, f.from, f.to) && matchUser(x.userId));
  const fVotes = (activity?.pollVotes || []).filter((x: any) => inDateRange(x.createdAt, f.from, f.to) && matchUser(x.userId));
  const fTickets = (activity?.tickets || []).filter((x: any) => inDateRange(x.createdAt, f.from, f.to) && matchUser(x.userId));
  // Content isn't tied to a member's demographics, so only the date filter applies.
  const fEvents = (activity?.events || []).filter((x: any) => inDateRange(x.startAt, f.from, f.to));
  const fArticles = (activity?.articles || []).filter((x: any) => inDateRange(x.publishedAt, f.from, f.to));
  const fCrises = (activity?.crises || []).filter((x: any) => inDateRange(x.createdAt, f.from, f.to));

  // Overview
  const SERIES = {
    signups: t("Sign-ups", "التسجيلات"),
    posts: t("Forum posts", "منشورات المنتدى"),
    votes: t("Poll votes", "أصوات الاستطلاعات"),
    sahara: t("Sahara responses", "ردود الصحراء"),
  };
  const siteMonthly = monthlyMulti({
    [SERIES.signups]: fUsers.map((u) => u.createdAt),
    [SERIES.posts]: fPosts.map((x: any) => x.createdAt),
    [SERIES.votes]: fVotes.map((x: any) => x.createdAt),
    [SERIES.sahara]: fSahara.map((e) => e.createdAt),
  });

  // Community
  const postsByForum = topN(countBy(fPosts, (x: any) => {
    const fo = forumById.get(x.forumId);
    return fo ? t(fo.name, fo.nameAr || fo.name) : UNKNOWN;
  }), 12);
  const postsByCategory = countBy(fPosts, (x: any) => forumById.get(x.forumId)?.category);
  const postsKind = countBy(fPosts, (x: any) => (x.parentId ? t("Replies", "ردود") : t("New topics", "مواضيع جديدة")));
  const postsMonthly = monthly(fPosts, (x: any) => x.createdAt);
  const postsBySex = countBy(fPosts, (x: any) => userAttr(x.authorId, (u) => genderOf(u.gender)), GENDERS);
  const postsByAge = countBy(fPosts, (x: any) => userAttr(x.authorId, (u) => ageRangeOf(u.age)), AGE_RANGES);
  const postsByRegion = topN(countBy(fPosts, (x: any) => userAttr(x.authorId, (u) => u.region)), 12);
  const topAuthors = topN(countBy(fPosts, (x: any) => userAttr(x.authorId, (u) => u.fullName)), 10).filter((d) => d.name !== "Other");
  const activeAuthors = new Set(fPosts.map((x: any) => x.authorId)).size;

  // Polls — counted from individual votes so voter demographics apply
  const pollById = new Map(polls.map((p) => [p.id, p]));
  const pollVotes = countBy(fVotes, (v: any) => {
    const p = pollById.get(v.pollId);
    return p ? t(p.title, p.titleAr || p.title) : UNKNOWN;
  });
  const fPolls = polls.filter((p) => fVotes.some((v: any) => v.pollId === p.id) || (!hasDemoFilter && inDateRange(p.createdAt, f.from, f.to)));
  const votesBySex = countBy(fVotes, (v: any) => userAttr(v.userId, (u) => genderOf(u.gender)), GENDERS);
  const votesByAge = countBy(fVotes, (v: any) => userAttr(v.userId, (u) => ageRangeOf(u.age)), AGE_RANGES);
  const votesMonthly = monthly(fVotes, (v: any) => v.createdAt);
  const optionLabel = (v: any) => {
    const opt = pollById.get(v.pollId)?.options?.find((o: any) => o.optionKey === v.optionKey || String(o.id) === v.optionKey);
    return opt ? t(opt.label, opt.labelAr || opt.label) : v.optionKey;
  };

  // Support & content
  const ticketsByCategory = countBy(fTickets, (x: any) => x.category, ["technical", "rules", "account", "other"]);
  const ticketsByStatus = countBy(fTickets, (x: any) => x.status, ["open", "in_progress", "resolved", "closed"]);
  const ticketsMonthly = monthly(fTickets, (x: any) => x.createdAt);
  const eventsByType = countBy(fEvents, (x: any) => x.type);
  const eventsMonthly = monthly(fEvents, (x: any) => x.startAt);
  const articlesByType = countBy(fArticles, (x: any) => x.type);
  const articlesMonthly = monthly(fArticles, (x: any) => x.publishedAt);
  const crisesBySeverity = countBy(fCrises, (x: any) => x.severity, ["low", "medium", "high", "critical"]);

  const activeFilters = Object.entries(f).filter(([, v]) => v);
  const filterTag = activeFilters.length ? "-filtered" : "";
  const loading = usersLoading || appsLoading || saharaLoading || activityLoading;

  const exportSummary = () => {
    const section = (name: string, data: Datum[]) => data.map((d) => ({ section: name, category: d.name, count: d.value }));
    downloadCsv(`youth-capital-summary${filterTag}`, [
      ...activeFilters.map(([k, v]) => ({ section: "Filter", category: k, count: v })),
      ...section("Members by age range", memberAge),
      ...section("Members by sex", memberGender),
      ...section("Members by region", countBy(fUsers, (u) => u.region)),
      ...section("Members by simulation role", countBy(fUsers, (u) => u.simulationRole || "Unassigned")),
      ...section("Members by status", memberStatus),
      ...section("Member sign-ups by month", memberSignups),
      ...section("Applications by status", appStatus),
      ...section("Applications by preferred role", appRole),
      ...section("Applications by education", countBy(fApps, (a) => a.educationLevel)),
      ...section("Applications by occupation", countBy(fApps, (a) => a.occupationStatus)),
      ...section("Sahara responses by region", sRegion),
      ...section("Sahara responses by section", sAxis),
      ...section("Sahara responses by age range", sAge),
      ...section("Sahara responses by sex", sGender),
      ...section("Sahara responses by month", sMonthly),
      ...section("Poll votes by poll", pollVotes),
      ...section("Poll votes by voter sex", votesBySex),
      ...section("Poll votes by voter age range", votesByAge),
      ...section("Poll votes by month", votesMonthly),
      ...section("Forum posts by forum", countBy(fPosts, (x: any) => forumById.get(x.forumId)?.name)),
      ...section("Forum posts by forum category", postsByCategory),
      ...section("Forum posts by author sex", postsBySex),
      ...section("Forum posts by author age range", postsByAge),
      ...section("Forum posts by author region", countBy(fPosts, (x: any) => userAttr(x.authorId, (u) => u.region))),
      ...section("Forum posts by month", postsMonthly),
      ...section("Post likes", [{ name: "Total", value: fLikes.length }]),
      ...section("Support tickets by category", ticketsByCategory),
      ...section("Support tickets by status", ticketsByStatus),
      ...section("Support tickets by month", ticketsMonthly),
      ...section("Events by type", eventsByType),
      ...section("Articles by type", articlesByType),
      ...section("Crises by severity", crisesBySeverity),
    ], ["section", "category", "count"]);
  };

  const exportButtons = [
    {
      label: t("Members", "الأعضاء"), count: fUsers.length,
      run: () => downloadCsv(`members${filterTag}`, fUsers.map((u) => ({
        id: u.id, fullName: u.fullName, fullNameAr: u.fullNameAr, email: u.email, phone: u.phone,
        age: u.age, ageRange: ageRangeOf(u.age), gender: genderOf(u.gender), region: u.region,
        role: u.role, simulationRole: u.simulationRole, status: u.status, applicationStatus: u.applicationStatus,
        linkedinUrl: u.linkedinUrl, joined: u.createdAt,
      }))),
    },
    {
      label: t("Applications", "الطلبات"), count: fApps.length,
      run: () => downloadCsv(`applications${filterTag}`, fApps.map((a) => ({
        id: a.id, fullName: a.user?.fullName, email: a.user?.email, phone: a.user?.phone,
        status: a.status, preferredRole: a.preferredRole, assignedRole: a.assignedRole,
        age: a.age, ageRange: ageRangeOf(a.age), gender: genderOf(a.gender), region: a.region, country: a.country,
        occupationStatus: a.occupationStatus, educationLevel: a.educationLevel, fieldOfStudy: a.fieldOfStudy,
        interests: a.interests, motivation: a.motivation, submitted: a.createdAt,
      }))),
    },
    {
      label: t("Sahara Responses", "ردود الصحراء"), count: fSahara.length,
      run: () => downloadCsv(`sahara-responses${filterTag}`, fSahara.map((e) => ({
        id: e.id, region: e.region, section: e.axis, ageRange: e.ageRange || NOT_SAID, gender: genderOf(e.gender),
        opinion: e.opinion, ipAddress: e.ipAddress, userAgent: e.userAgent, submitted: e.createdAt,
      }))),
    },
    {
      label: t("Forum Activity", "نشاط المنتدى"), count: fPosts.length,
      run: () => downloadCsv(`forum-posts${filterTag}`, fPosts.map((x: any) => {
        const u = userById.get(x.authorId);
        const fo = forumById.get(x.forumId);
        return {
          postId: x.id, kind: x.parentId ? "reply" : "topic", forum: fo?.name, forumCategory: fo?.category,
          author: u?.fullName, authorAgeRange: u ? ageRangeOf(u.age) : "", authorGender: u ? genderOf(u.gender) : "",
          authorRegion: u?.region, postedAt: x.createdAt,
        };
      })),
    },
    {
      label: t("Poll Votes", "أصوات الاستطلاعات"), count: fVotes.length,
      run: () => downloadCsv(`poll-votes${filterTag}`, fVotes.map((v: any) => {
        const u = userById.get(v.userId);
        return {
          poll: pollById.get(v.pollId)?.title, option: optionLabel(v),
          voterAgeRange: u ? ageRangeOf(u.age) : "", voterGender: u ? genderOf(u.gender) : "", voterRegion: u?.region,
          votedAt: v.createdAt,
        };
      })),
    },
    {
      label: t("Support Tickets", "تذاكر الدعم"), count: fTickets.length,
      run: () => downloadCsv(`support-tickets${filterTag}`, fTickets.map((x: any) => {
        const u = userById.get(x.userId);
        return { ticketId: x.id, category: x.category, status: x.status, member: u?.fullName, email: u?.email, createdAt: x.createdAt };
      })),
    },
    {
      label: t("Poll Results", "نتائج الاستطلاعات"), count: fPolls.length,
      run: () => downloadCsv(`poll-results${filterTag}`, fPolls.flatMap((p) => (p.options || []).map((o: any) => ({
        poll: p.title, pollAr: p.titleAr, status: p.status, option: o.label, optionAr: o.labelAr,
        votes: o.votes || 0, percentage: o.percentage || 0, pollTotalVotes: p.totalVotes || 0, endsAt: p.endsAt,
      })))),
    },
  ];

  const genderRows = (rows: Record<string, string | number>[]) => rows.filter((r) => GENDERS.some((g) => Number(r[g]) > 0));

  return (
    <div className="viz-root space-y-8">
      <style>{VIZ_STYLE}</style>

      {/* Filters — apply to every chart and export below */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 sticky top-[73px] z-10 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter className="w-4 h-4 text-primary" /> {t("Filters", "الفلترة")}
          <span className="text-xs font-normal text-muted-foreground">
            {t("Apply to every chart and export on this page", "تُطبَّق على جميع الرسوم والتصديرات في هذه الصفحة")}
          </span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 items-end">
          <div>
            <Label>{t("From", "من")}</Label>
            <Input type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} />
          </div>
          <div>
            <Label>{t("To", "إلى")}</Label>
            <Input type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} />
          </div>
          <div>
            <Label>{t("Age", "العمر")}</Label>
            <Select value={f.ageRange} onChange={(e) => set({ ageRange: e.target.value })}>
              <option value="">{t("All Ages", "جميع الأعمار")}</option>
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("Sex", "الجنس")}</Label>
            <Select value={f.gender} onChange={(e) => set({ gender: e.target.value })}>
              <option value="">{t("All", "الكل")}</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("Region", "الجهة")}</Label>
            <Select value={f.region} onChange={(e) => set({ region: e.target.value })}>
              <option value="">{t("All Regions", "جميع الجهات")}</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <div>
            <Label>{t("Sahara Section", "محور الصحراء")}</Label>
            <Select value={f.axis} onChange={(e) => set({ axis: e.target.value })}>
              <option value="">{t("All Sections", "جميع المحاور")}</option>
              {SAHARA_AXES.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
          <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={!activeFilters.length} onClick={() => setFilters(EMPTY_FILTERS)}>
            {t("Clear Filters", "مسح الفلترة")}
          </Button>
        </div>
      </div>

      {/* Exports */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">{t("Export (CSV, opens in Excel)", "تصدير (CSV، يفتح في Excel)")}</h3>
          {activeFilters.length > 0 && (
            <span className="text-xs text-muted-foreground">· {t("filtered", "مع الفلترة")}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" className="rounded-xl" onClick={exportSummary}>
            <Download className="w-4 h-4 mr-2" /> {t("Summary Statistics", "ملخص الإحصائيات")}
          </Button>
          {exportButtons.map((b) => (
            <Button key={b.label} type="button" variant="outline" className="rounded-xl" onClick={b.run} disabled={!b.count}>
              <Download className="w-4 h-4 mr-2" /> {b.label}
              <span className="ml-2 text-xs text-muted-foreground tabular-nums">{b.count}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {t(
            "Exports contain personal data (names, emails, phones, IP addresses). Store and share them accordingly.",
            "تحتوي التصديرات على بيانات شخصية (الأسماء، البريد، الهاتف، عناوين IP). احفظها وشاركها بحذر."
          )}
        </p>
      </div>

      {/* ── Website overview ── */}
      <SectionTitle icon={Activity}>{t("Website Overview", "نظرة عامة على الموقع")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label={t("Members", "الأعضاء")} value={fUsers.length} />
        <Stat icon={FileCheck} label={t("Applications", "الطلبات")} value={fApps.length} />
        <Stat icon={MessageSquare} label={t("Forum posts", "منشورات المنتدى")} value={fPosts.length} sub={`${fLikes.length} ${t("likes", "إعجاب")}`} />
        <Stat icon={Vote} label={t("Poll votes", "أصوات الاستطلاعات")} value={fVotes.length} />
        <Stat icon={Scale} label={t("Sahara responses", "ردود الصحراء")} value={fSahara.length} />
        <Stat icon={LifeBuoy} label={t("Support tickets", "تذاكر الدعم")} value={fTickets.length}
          sub={`${fTickets.filter((x: any) => x.status === "open").length} ${t("open", "مفتوحة")}`} />
        <Stat icon={Calendar} label={t("Events", "الفعاليات")} value={fEvents.length} />
        <Stat icon={Newspaper} label={t("Articles", "المقالات")} value={fArticles.length} />
      </div>
      <ChartCard title={t("Activity per month across the website", "النشاط الشهري عبر الموقع")} rows={siteMonthly} csvName={`site-activity-monthly${filterTag}`}>
        <MultiTrend data={siteMonthly} series={Object.values(SERIES)} />
      </ChartCard>

      {/* ── Members ── */}
      <SectionTitle icon={Users} count={fUsers.length}>{t("Members", "الأعضاء")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Users} label={t("Members", "الأعضاء")} value={fUsers.length} sub={fUsers.length !== users.length ? `${t("of", "من")} ${users.length}` : undefined} />
        <Stat icon={UserCheck} label={t("Active", "نشط")} value={fUsers.filter((u) => u.status === "active").length} />
        <Stat icon={Ban} label={t("Banned", "محظور")} value={fUsers.filter((u) => u.status === "banned").length} />
        <Stat icon={CalendarRange} label={t("Average Age", "متوسط العمر")} value={avgAge} sub={`${ages.length} ${t("with age on file", "لديهم عمر مسجل")}`} />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard className="md:col-span-2" title={t("Sign-ups per month", "التسجيلات شهرياً")} rows={memberSignups} csvName={`members-signups-monthly${filterTag}`}>
          <Trend data={memberSignups} label={t("Sign-ups", "تسجيلات")} />
        </ChartCard>
        <ChartCard title={t("Members by sex", "الأعضاء حسب الجنس")} rows={memberGender} csvName={`members-by-sex${filterTag}`}>
          <Bars data={memberGender} />
        </ChartCard>
        <ChartCard title={t("Members by age range", "الأعضاء حسب الفئة العمرية")} rows={memberAge} csvName={`members-by-age${filterTag}`}>
          <Bars data={memberAge} horizontal={false} />
        </ChartCard>
        <ChartCard className="md:col-span-2" title={t("Age range × sex", "الفئة العمرية × الجنس")} rows={genderRows(memberAgeGender)} csvName={`members-age-by-sex${filterTag}`}>
          <GenderStack data={memberAgeGender} />
        </ChartCard>
        <ChartCard title={t("Members by region", "الأعضاء حسب الجهة")} rows={memberRegion} csvName={`members-by-region${filterTag}`}>
          <Bars data={memberRegion} />
        </ChartCard>
        <ChartCard title={t("Members by simulation role", "الأعضاء حسب دور المحاكاة")} rows={memberRole} csvName={`members-by-role${filterTag}`}>
          <Bars data={memberRole} />
        </ChartCard>
        <ChartCard title={t("Members by status", "الأعضاء حسب الحالة")} rows={memberStatus} csvName={`members-by-status${filterTag}`}>
          <Bars data={memberStatus} />
        </ChartCard>
      </div>

      {/* ── Applications ── */}
      <SectionTitle icon={FileCheck} count={fApps.length}>{t("Applications", "الطلبات")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {appStatus.slice(0, 3).map((s) => (
          <Stat key={s.name} icon={FileCheck} label={s.name} value={s.value}
            sub={fApps.length ? `${Math.round((s.value / fApps.length) * 100)}%` : undefined} />
        ))}
        <Stat icon={FileCheck} label={t("Total", "الإجمالي")} value={fApps.length} />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard className="md:col-span-2" title={t("Applications per month", "الطلبات شهرياً")} rows={appMonthly} csvName={`applications-monthly${filterTag}`}>
          <Trend data={appMonthly} label={t("Applications", "الطلبات")} />
        </ChartCard>
        <ChartCard title={t("Applications by status", "الطلبات حسب الحالة")} rows={appStatus} csvName={`applications-by-status${filterTag}`}>
          <Bars data={appStatus} />
        </ChartCard>
        <ChartCard title={t("Preferred role", "الدور المفضل")} rows={appRole} csvName={`applications-by-role${filterTag}`}>
          <Bars data={appRole} />
        </ChartCard>
        <ChartCard title={t("Education level", "المستوى الدراسي")} rows={appEducation} csvName={`applications-by-education${filterTag}`}>
          <Bars data={appEducation} />
        </ChartCard>
        <ChartCard title={t("Occupation", "الوضعية المهنية")} rows={appOccupation} csvName={`applications-by-occupation${filterTag}`}>
          <Bars data={appOccupation} />
        </ChartCard>
        <ChartCard title={t("Country", "البلد")} rows={appCountry} csvName={`applications-by-country${filterTag}`}>
          <Bars data={appCountry} />
        </ChartCard>
      </div>

      {/* ── Sahara consultation ── */}
      <SectionTitle icon={Scale} count={fSahara.length}>{t("Sahara Consultation", "استشارة الصحراء")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={Scale} label={t("Responses", "الردود")} value={fSahara.length} sub={fSahara.length !== sahara.length ? `${t("of", "من")} ${sahara.length}` : undefined} />
        <Stat icon={MapPin} label={t("Regions represented", "الجهات الممثلة")} value={sRegion.length} />
        <Stat icon={Scale} label={t("Most discussed section", "المحور الأكثر نقاشاً")} value={[...sAxis].sort((a, b) => b.value - a.value)[0]?.value ?? 0}
          sub={[...sAxis].sort((a, b) => b.value - a.value)[0]?.name} />
        <Stat icon={Users} label={t("Shared age or sex", "شاركوا العمر أو الجنس")} value={withDemographics}
          sub={fSahara.length ? `${Math.round((withDemographics / fSahara.length) * 100)}%` : undefined} />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard className="md:col-span-2" title={t("Responses per month", "الردود شهرياً")} rows={sMonthly} csvName={`sahara-monthly${filterTag}`}>
          <Trend data={sMonthly} label={t("Responses", "الردود")} />
        </ChartCard>
        <ChartCard title={t("Responses by sex", "الردود حسب الجنس")} rows={sGender} csvName={`sahara-by-sex${filterTag}`}>
          <Bars data={sGender} />
        </ChartCard>
        <ChartCard title={t("Responses by region", "الردود حسب الجهة")} rows={sRegion} csvName={`sahara-by-region${filterTag}`}>
          <Bars data={sRegion} />
        </ChartCard>
        <ChartCard title={t("Responses by section", "الردود حسب المحور")} rows={sAxis} csvName={`sahara-by-section${filterTag}`}>
          <Bars data={sAxis} />
        </ChartCard>
        <ChartCard title={t("Responses by age range", "الردود حسب الفئة العمرية")} rows={sAge} csvName={`sahara-by-age${filterTag}`}>
          <Bars data={sAge} horizontal={false} />
        </ChartCard>
        <ChartCard className="md:col-span-2" title={t("Section × sex", "المحور × الجنس")} rows={genderRows(sAxisGender)} csvName={`sahara-section-by-sex${filterTag}`}>
          <GenderStack data={sAxisGender} horizontal />
        </ChartCard>
        <ChartCard title={t("Age range × sex", "الفئة العمرية × الجنس")} rows={genderRows(sAgeGender)} csvName={`sahara-age-by-sex${filterTag}`}>
          <GenderStack data={sAgeGender} />
        </ChartCard>
        <ChartCard className="md:col-span-2 xl:col-span-3" title={t("Region × section", "الجهة × المحور")} rows={sHeat} csvName={`sahara-region-by-section${filterTag}`}>
          <Heatmap rows={sHeat} columns={SAHARA_AXES} />
        </ChartCard>
      </div>

      {/* ── Community ── */}
      <SectionTitle icon={MessageSquare} count={fPosts.length}>{t("Community Forum", "منتدى المجتمع")}</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={MessageSquare} label={t("Posts", "المنشورات")} value={fPosts.length} />
        <Stat icon={Users} label={t("Active authors", "كتّاب نشطون")} value={activeAuthors}
          sub={fUsers.length ? `${Math.round((activeAuthors / Math.max(1, fUsers.length)) * 100)}% ${t("of members", "من الأعضاء")}` : undefined} />
        <Stat icon={Heart} label={t("Likes", "الإعجابات")} value={fLikes.length} />
        <Stat icon={MessageSquare} label={t("Posts per author", "منشورات لكل كاتب")} value={activeAuthors ? (fPosts.length / activeAuthors).toFixed(1) : "—"} />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard className="md:col-span-2" title={t("Posts per month", "المنشورات شهرياً")} rows={postsMonthly} csvName={`forum-posts-monthly${filterTag}`}>
          <Trend data={postsMonthly} label={t("Posts", "المنشورات")} />
        </ChartCard>
        <ChartCard title={t("Topics vs replies", "المواضيع مقابل الردود")} rows={postsKind} csvName={`forum-topics-vs-replies${filterTag}`}>
          <Bars data={postsKind} />
        </ChartCard>
        <ChartCard title={t("Posts by forum", "المنشورات حسب المنتدى")} rows={postsByForum} csvName={`forum-posts-by-forum${filterTag}`}>
          <Bars data={postsByForum} />
        </ChartCard>
        <ChartCard title={t("Posts by forum category", "المنشورات حسب الفئة")} rows={postsByCategory} csvName={`forum-posts-by-category${filterTag}`}>
          <Bars data={postsByCategory} />
        </ChartCard>
        <ChartCard title={t("Most active authors", "الكتّاب الأكثر نشاطاً")} rows={topAuthors} csvName={`forum-top-authors${filterTag}`}>
          <Bars data={topAuthors} />
        </ChartCard>
        <ChartCard title={t("Posts by author sex", "المنشورات حسب جنس الكاتب")} rows={postsBySex} csvName={`forum-posts-by-sex${filterTag}`}>
          <Bars data={postsBySex} />
        </ChartCard>
        <ChartCard title={t("Posts by author age range", "المنشورات حسب عمر الكاتب")} rows={postsByAge} csvName={`forum-posts-by-age${filterTag}`}>
          <Bars data={postsByAge} horizontal={false} />
        </ChartCard>
        <ChartCard title={t("Posts by author region", "المنشورات حسب جهة الكاتب")} rows={postsByRegion} csvName={`forum-posts-by-region${filterTag}`}>
          <Bars data={postsByRegion} />
        </ChartCard>
      </div>

      {/* ── Polls ── */}
      <SectionTitle icon={Vote} count={fVotes.length}>{t("Polls", "الاستطلاعات")}</SectionTitle>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard className="md:col-span-2" title={t("Votes per month", "الأصوات شهرياً")} rows={votesMonthly} csvName={`poll-votes-monthly${filterTag}`}>
          <Trend data={votesMonthly} label={t("Votes", "الأصوات")} />
        </ChartCard>
        <ChartCard title={t("Votes by voter sex", "الأصوات حسب جنس المصوّت")} rows={votesBySex} csvName={`poll-votes-by-sex${filterTag}`}>
          <Bars data={votesBySex} />
        </ChartCard>
        <ChartCard className="md:col-span-2" title={t("Votes per poll", "الأصوات لكل استطلاع")} rows={pollVotes} csvName={`poll-votes-by-poll${filterTag}`}>
          <Bars data={pollVotes} />
        </ChartCard>
        <ChartCard title={t("Votes by voter age range", "الأصوات حسب عمر المصوّت")} rows={votesByAge} csvName={`poll-votes-by-age${filterTag}`}>
          <Bars data={votesByAge} horizontal={false} />
        </ChartCard>
      </div>

      {/* ── Support ── */}
      <SectionTitle icon={LifeBuoy} count={fTickets.length}>{t("Support", "الدعم")}</SectionTitle>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title={t("Tickets per month", "التذاكر شهرياً")} rows={ticketsMonthly} csvName={`support-tickets-monthly${filterTag}`}>
          <Trend data={ticketsMonthly} label={t("Tickets", "التذاكر")} />
        </ChartCard>
        <ChartCard title={t("Tickets by category", "التذاكر حسب الفئة")} rows={ticketsByCategory} csvName={`support-tickets-by-category${filterTag}`}>
          <Bars data={ticketsByCategory} />
        </ChartCard>
        <ChartCard title={t("Tickets by status", "التذاكر حسب الحالة")} rows={ticketsByStatus} csvName={`support-tickets-by-status${filterTag}`}>
          <Bars data={ticketsByStatus} />
        </ChartCard>
      </div>

      {/* ── Content ── */}
      <SectionTitle icon={Newspaper}>{t("Content: Events, Press & Crises", "المحتوى: الفعاليات والصحافة والأزمات")}</SectionTitle>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ChartCard title={t("Events per month", "الفعاليات شهرياً")} rows={eventsMonthly} csvName={`events-monthly${filterTag}`}>
          <Trend data={eventsMonthly} label={t("Events", "الفعاليات")} />
        </ChartCard>
        <ChartCard title={t("Events by type", "الفعاليات حسب النوع")} rows={eventsByType} csvName={`events-by-type${filterTag}`}>
          <Bars data={eventsByType} />
        </ChartCard>
        <ChartCard title={t("Articles per month", "المقالات شهرياً")} rows={articlesMonthly} csvName={`articles-monthly${filterTag}`}>
          <Trend data={articlesMonthly} label={t("Articles", "المقالات")} />
        </ChartCard>
        <ChartCard title={t("Articles by type", "المقالات حسب النوع")} rows={articlesByType} csvName={`articles-by-type${filterTag}`}>
          <Bars data={articlesByType} />
        </ChartCard>
        <ChartCard title={t("Crises by severity", "الأزمات حسب الخطورة")} rows={crisesBySeverity} csvName={`crises-by-severity${filterTag}`}>
          <Bars data={crisesBySeverity} />
        </ChartCard>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          "Age, sex and region filters apply to members, applications, Sahara responses, and to forum posts, likes, poll votes and support tickets through the member who made them. Events, articles and crises only follow the date filter.",
          "تُطبَّق فلاتر العمر والجنس والجهة على الأعضاء والطلبات وردود الصحراء، وعلى المنشورات والإعجابات والأصوات وتذاكر الدعم عبر العضو صاحبها. أما الفعاليات والمقالات والأزمات فتتبع فلتر التاريخ فقط."
        )}
      </p>
    </div>
  );
}
