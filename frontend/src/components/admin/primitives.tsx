import * as React from "react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { ar as arLocale } from "date-fns/locale";
import { Loader2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import {
  AlertDialog, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Buttons ──────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "success";
type BtnSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-foreground hover:bg-secondary/70",
  outline: "border border-border bg-card text-foreground hover:bg-secondary shadow-xs",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
  danger: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
  gold: "bg-gold text-navy-dark hover:bg-gold/90 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-600/90 shadow-sm",
};
const BTN_SIZES: Record<BtnSize, string> = {
  xs: "h-7 px-2 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
  "icon-sm": "h-8 w-8 rounded-lg",
};

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
}

export const Btn = React.forwardRef<HTMLButtonElement, BtnProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  )
);
Btn.displayName = "Btn";

// ── Badges ───────────────────────────────────────────────────────────────────

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "gold" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground ring-border",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/25",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/25",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400 ring-sky-500/25",
  gold: "bg-gold/15 text-[color:var(--gold)] ring-gold/30",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-400 ring-violet-500/25",
};
const DOTS: Record<Tone, string> = {
  neutral: "bg-muted-foreground/60",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  gold: "bg-gold",
  violet: "bg-violet-500",
};

export function Pill({ tone = "neutral", dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", TONES[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", DOTS[tone])} />}
      {children}
    </span>
  );
}

// Status → tone + label, shared by every table so the same state always looks the same.
export const STATUS_TONES: Record<string, Tone> = {
  active: "success", approved: "success", resolved: "success", upcoming: "info", live: "success",
  pending: "warning", open: "warning", in_progress: "info", medium: "warning",
  banned: "danger", rejected: "danger", critical: "danger", high: "danger", error: "danger",
  closed: "neutral", past: "neutral", none: "neutral", low: "neutral", warn: "warning", warning: "warning",
  admin: "gold", user: "neutral",
};

export function StatusPill({ value, label }: { value?: string | null; label?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <Pill tone={STATUS_TONES[value] || "neutral"} dot>{label || humanize(value)}</Pill>;
}

export function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Layout pieces ────────────────────────────────────────────────────────────

export function PageHeader({ title, description, actions, eyebrow }: {
  title: string; description?: string; actions?: ReactNode; eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, actions, children, className, bodyClassName }: {
  title?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-xs", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cn(title || actions ? "px-5 pb-5" : "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

// Tiny inline trend line — no axes, just shape. Uses currentColor.
export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2) return null;
  const w = 100, h = 28;
  const max = Math.max(...points, 1);
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - 2 - (p / max) * (h - 4)] as const);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-8 w-full overflow-visible", className)} aria-hidden>
      <path d={area} fill="currentColor" opacity={0.12} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={1.75} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatCard({ label, value, icon: Icon, delta, deltaLabel, spark, hint, onClick, loading, tone = "neutral" }: {
  label: string; value: ReactNode; icon?: any; delta?: number | null; deltaLabel?: string; spark?: number[];
  hint?: ReactNode; onClick?: () => void; loading?: boolean; tone?: "neutral" | "warning" | "danger";
}) {
  const DeltaIcon = delta == null ? null : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left shadow-xs transition-all",
        onClick && "hover:border-foreground/20 hover:shadow-md cursor-pointer",
        tone === "warning" && "border-amber-500/40",
        tone === "danger" && "border-rose-500/40",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && <Icon className={cn("size-4 text-muted-foreground/70", tone === "warning" && "text-amber-500", tone === "danger" && "text-rose-500")} />}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {loading ? (
            <div className="h-8 w-16 rounded-md bg-secondary animate-pulse" />
          ) : (
            <div className="text-[1.65rem] leading-none font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
          )}
          {(delta != null || hint) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {DeltaIcon && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 font-medium tabular-nums",
                  delta! > 0 ? "text-emerald-600 dark:text-emerald-400" : delta! < 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                )}>
                  <DeltaIcon className="size-3.5" />{Math.abs(delta!)}%
                </span>
              )}
              {(deltaLabel || hint) && <span className="text-muted-foreground truncate">{deltaLabel || hint}</span>}
            </div>
          )}
        </div>
        {spark && spark.length > 1 && (
          <div className="w-24 shrink-0 text-[color:var(--viz-1,#2a78d6)]"><Sparkline points={spark} /></div>
        )}
      </div>
    </Comp>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon?: any; title: string; description?: string; action?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
      {Icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-border bg-secondary/60">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Horizontal bar list — the "top regions / top roles" pattern from analytics dashboards.
export function BarList({ data, total, onSelect, max = 8 }: {
  data: { name: string; value: number }[]; total?: number; onSelect?: (name: string) => void; max?: number;
}) {
  const shown = data.slice(0, max);
  const peak = Math.max(1, ...shown.map((d) => d.value));
  const sum = total ?? data.reduce((s, d) => s + d.value, 0);
  if (!shown.length) return <p className="py-6 text-center text-xs text-muted-foreground">—</p>;
  return (
    <ul className="space-y-1.5">
      {shown.map((d) => (
        <li key={d.name}>
          <button
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(d.name)}
            className="group relative flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm disabled:cursor-default enabled:hover:bg-secondary/60"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-md bg-[color:var(--viz-1,#2a78d6)]/12 rtl:left-auto rtl:right-0"
              style={{ width: `${(d.value / peak) * 100}%` }}
            />
            <span className="relative truncate text-foreground">{d.name}</span>
            <span className="relative flex items-baseline gap-2 tabular-nums">
              <span className="font-medium text-foreground">{d.value}</span>
              <span className="w-9 text-right text-xs text-muted-foreground">{sum ? Math.round((d.value / sum) * 100) : 0}%</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function Avatar({ name, src, size = "md", className }: { name?: string | null; src?: string | null; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizes = { sm: "size-7 text-[11px]", md: "size-8 text-xs", lg: "size-11 text-sm", xl: "size-16 text-xl" };
  const palette = ["bg-sky-600", "bg-violet-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-indigo-600", "bg-teal-600"];
  const hash = [...(name || "?")].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white", sizes[size], palette[hash % palette.length], className)}>
      {src ? <img src={src} alt="" className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

export function initials(name?: string | null) {
  const parts = (name || "?").trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function DetailGrid({ items }: { items: { label: string; value: ReactNode; full?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
      {items.map((it) => (
        <div key={it.label} className={cn("min-w-0", it.full && "col-span-2")}>
          <dt className="text-xs text-muted-foreground">{it.label}</dt>
          <dd className="mt-0.5 text-sm text-foreground break-words">{it.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── Form controls ────────────────────────────────────────────────────────────

const CONTROL = "w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring disabled:opacity-50";

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(CONTROL, "h-9", className)} {...props} />
);
TextInput.displayName = "TextInput";

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(CONTROL, "py-2 min-h-24 leading-relaxed", className)} {...props} />
);
TextArea.displayName = "TextArea";

export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(CONTROL, "h-9 pr-8 appearance-none bg-[length:16px] bg-no-repeat bg-[position:right_0.6rem_center] rtl:bg-[position:left_0.6rem_center] rtl:pl-8 rtl:pr-3", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
      {...props}
    >
      {children}
    </select>
  )
);
NativeSelect.displayName = "NativeSelect";

export function Field({ label, hint, children, className, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-foreground/80">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Segmented control (e.g. 30d / 90d / 12m)
export function Segmented<T extends string>({ value, onChange, options, size = "sm" }: {
  value: T; onChange: (v: NoInfer<T>) => void; options: { value: NoInfer<T>; label: ReactNode; count?: number }[]; size?: "sm" | "md";
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-secondary/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md font-medium transition-all",
            size === "sm" ? "h-7 px-2.5 text-xs" : "h-8 px-3 text-sm",
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
          {o.count != null && (
            <span className={cn("rounded px-1.5 text-[10px] tabular-nums", value === o.value ? "bg-secondary" : "bg-transparent")}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Confirm dialog (replaces window.confirm) ─────────────────────────────────

type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; destructive?: boolean };

export function useConfirm(): [(opts: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const { t } = useLanguage();
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>(undefined);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = undefined;
    setOpts(null);
  };

  const dialog = (
    <AlertDialog open={!!opts} onOpenChange={(open) => { if (!open) close(false); }}>
      <AlertDialogContent className="max-w-md rounded-xl border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">{opts?.title}</AlertDialogTitle>
          {opts?.description && <AlertDialogDescription className="text-sm text-muted-foreground">{opts.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Btn variant="outline" onClick={() => close(false)}>{t("Cancel", "إلغاء")}</Btn>
          <Btn variant={opts?.destructive ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
            {opts?.confirmLabel || t("Confirm", "تأكيد")}
          </Btn>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [confirm, dialog];
}

// ── Formatting & export helpers ──────────────────────────────────────────────

export function useFormat() {
  const { lang } = useLanguage();
  const locale = lang === "ar" ? arLocale : undefined;
  return {
    date: (d?: string | Date | null) => (d ? format(new Date(d), "d MMM yyyy", { locale }) : "—"),
    dateTime: (d?: string | Date | null) => (d ? format(new Date(d), "d MMM yyyy, HH:mm", { locale }) : "—"),
    relative: (d?: string | Date | null) => (d ? formatDistanceToNowStrict(new Date(d), { addSuffix: true, locale }) : "—"),
    number: (n?: number | null) => (n == null ? "—" : new Intl.NumberFormat(lang === "ar" ? "ar-MA" : "en-US").format(n)),
  };
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]) {
  const cols = columns || Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const cell = (v: unknown) => {
    if (v == null) return "";
    const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n");
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[], columns?: string[]) {
  // BOM so Excel opens Arabic and accented names correctly.
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

// Percent change between two counts, null when there's no baseline.
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Counts per bucket for the last `buckets` periods of `days` length (oldest first).
export function bucketCounts(dates: (string | Date | null | undefined)[], buckets: number, days: number): number[] {
  const now = Date.now();
  const size = days * 86400000;
  const out = new Array(buckets).fill(0);
  for (const d of dates) {
    if (!d) continue;
    const age = now - new Date(d).getTime();
    if (age < 0) continue;
    const idx = buckets - 1 - Math.floor(age / size);
    if (idx >= 0) out[idx]++;
  }
  return out;
}

export function countWithin(dates: (string | Date | null | undefined)[], fromDaysAgo: number, toDaysAgo = 0) {
  const now = Date.now();
  return dates.filter((d) => {
    if (!d) return false;
    const age = (now - new Date(d).getTime()) / 86400000;
    return age >= toDaysAgo && age < fromDaysAgo;
  }).length;
}
