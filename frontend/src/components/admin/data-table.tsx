import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues,
  getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
  type Column, type ColumnDef, type ColumnFiltersState, type FilterFn, type Row,
  type SortingState, type VisibilityState, type RowSelectionState, type Table as TableType,
} from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import {
  ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CirclePlus, Download, EyeOff, Search, Settings2, X, CalendarDays, ListFilter, Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Btn, EmptyState, downloadCsv, useFormat } from "./primitives";

// ── Filter functions ─────────────────────────────────────────────────────────

// Multi-select facet: row matches if its value is one of the selected values.
export const facetFilter: FilterFn<any> = (row, id, value: string[]) => {
  if (!value?.length) return true;
  return value.includes(String(row.getValue(id) ?? ""));
};
facetFilter.autoRemove = (v) => !v?.length;

export const dateRangeFilter: FilterFn<any> = (row, id, value: DateRange | undefined) => {
  if (!value?.from && !value?.to) return true;
  const raw = row.getValue(id) as string | Date | null;
  if (!raw) return false;
  const t = new Date(raw).getTime();
  if (value.from && t < new Date(value.from).setHours(0, 0, 0, 0)) return false;
  if (value.to && t > new Date(value.to).setHours(23, 59, 59, 999)) return false;
  return true;
};
dateRangeFilter.autoRemove = (v) => !v?.from && !v?.to;

// Locale-aware, case/accent-insensitive text sort with empties last.
export const textSort = (a: Row<any>, b: Row<any>, id: string) => {
  const x = String(a.getValue(id) ?? "").trim();
  const y = String(b.getValue(id) ?? "").trim();
  if (!x && y) return 1;
  if (x && !y) return -1;
  return x.localeCompare(y, undefined, { sensitivity: "base", numeric: true });
};

// ── Column header with sort menu ─────────────────────────────────────────────

export function ColumnHeader<T>({ column, title, className }: { column: Column<T, unknown>; title: string; className?: string }) {
  const { t } = useLanguage();
  if (!column.getCanSort() && !column.getCanHide()) return <span className={className}>{title}</span>;
  const sorted = column.getIsSorted();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "-mx-2 inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground data-[state=open]:bg-secondary",
            sorted && "text-foreground",
            className
          )}
        >
          {title}
          {column.getCanSort() && (sorted === "desc" ? <ArrowDown className="size-3.5" /> : sorted === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-50" />)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {column.getCanSort() && (
          <>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}><ArrowUp className="size-3.5 opacity-70" /> {t("Ascending", "تصاعدي")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}><ArrowDown className="size-3.5 opacity-70" /> {t("Descending", "تنازلي")}</DropdownMenuItem>
            {sorted && <DropdownMenuItem onClick={() => column.clearSorting()}><X className="size-3.5 opacity-70" /> {t("Clear sort", "إلغاء الترتيب")}</DropdownMenuItem>}
          </>
        )}
        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}><EyeOff className="size-3.5 opacity-70" /> {t("Hide column", "إخفاء العمود")}</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Toolbar controls ─────────────────────────────────────────────────────────

export type FacetDef = {
  column: string;
  title: string;
  // Fixed option order/labels; otherwise derived from the data, sorted A→Z.
  options?: { value: string; label?: string }[];
};

function FacetFilter<T>({ column, title, options }: { column?: Column<T, unknown>; title: string; options?: FacetDef["options"] }) {
  const { t } = useLanguage();
  if (!column) return null;
  const counts = column.getFacetedUniqueValues();
  const selected = new Set((column.getFilterValue() as string[]) || []);
  const opts = options || [...counts.keys()]
    .map((k) => String(k ?? ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }))
    .map((value) => ({ value, label: value }));

  const toggle = (value: string) => {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    column.setFilterValue(next.size ? [...next] : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary",
            selected.size > 0 && "border-solid bg-secondary/60"
          )}
        >
          <CirclePlus className="size-3.5 text-muted-foreground" />
          {title}
          {selected.size > 0 && (
            <>
              <span className="mx-0.5 h-4 w-px bg-border" />
              {selected.size > 2 ? (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">{selected.size} {t("selected", "محدد")}</span>
              ) : (
                [...selected].map((v) => (
                  <span key={v} className="max-w-28 truncate rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
                    {opts.find((o) => o.value === v)?.label || v}
                  </span>
                ))
              )}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} className="h-9 text-sm" />
          <CommandList className="max-h-72">
            <CommandEmpty>{t("No results.", "لا نتائج.")}</CommandEmpty>
            <CommandGroup>
              {opts.map((o) => {
                const isSel = selected.has(o.value);
                return (
                  <CommandItem key={o.value} value={`${o.label || o.value}`} onSelect={() => toggle(o.value)} className="gap-2 text-sm">
                    <span className={cn("flex size-4 items-center justify-center rounded border border-border", isSel && "border-primary bg-primary text-primary-foreground")}>
                      {isSel && <Check className="size-3" />}
                    </span>
                    <span className="flex-1 truncate">{o.label || o.value}</span>
                    <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{counts.get(o.value) ?? 0}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => column.setFilterValue(undefined)} className="justify-center text-xs">
                    {t("Clear filter", "مسح الفلتر")}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DateFilter<T>({ column, title }: { column?: Column<T, unknown>; title: string }) {
  const { t } = useLanguage();
  const fmt = useFormat();
  if (!column) return null;
  const value = column.getFilterValue() as DateRange | undefined;
  const label = value?.from
    ? value.to ? `${fmt.date(value.from)} – ${fmt.date(value.to)}` : `${t("From", "من")} ${fmt.date(value.from)}`
    : null;
  const presets: [string, number][] = [[t("Last 7 days", "آخر 7 أيام"), 7], [t("Last 30 days", "آخر 30 يوماً"), 30], [t("Last 90 days", "آخر 90 يوماً"), 90], [t("Last 12 months", "آخر 12 شهراً"), 365]];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 text-xs font-medium text-foreground/80 hover:bg-secondary",
            label && "border-solid bg-secondary/60"
          )}
        >
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {title}
          {label && (
            <>
              <span className="mx-0.5 h-4 w-px bg-border" />
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">{label}</span>
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row flex-wrap gap-1 border-b border-border p-2 sm:w-36 sm:flex-col sm:border-b-0 sm:border-e">
            {presets.map(([l, days]) => (
              <button
                key={days}
                type="button"
                onClick={() => column.setFilterValue({ from: new Date(Date.now() - days * 86400000), to: new Date() })}
                className="rounded-md px-2 py-1.5 text-left text-xs hover:bg-secondary"
              >
                {l}
              </button>
            ))}
            {label && (
              <button type="button" onClick={() => column.setFilterValue(undefined)} className="rounded-md px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-secondary">
                {t("Clear", "مسح")}
              </button>
            )}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={(range) => column.setFilterValue(range)}
            defaultMonth={value?.from || new Date(Date.now() - 30 * 86400000)}
            className="bg-transparent"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SortMenu<T>({ table, options }: { table: TableType<T>; options: { id: string; label: string }[] }) {
  const { t } = useLanguage();
  const current = table.getState().sorting[0];
  const currentLabel = options.find((o) => o.id === current?.id)?.label;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground/80 shadow-xs hover:bg-secondary">
          <ListFilter className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{t("Sort by", "ترتيب حسب")}</span>
          <span className="max-w-32 truncate">{currentLabel || t("Default", "افتراضي")}</span>
          {current && (current.desc ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("Sort by", "ترتيب حسب")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current?.id || ""}
          onValueChange={(id) => table.setSorting([{ id, desc: current?.id === id ? current.desc : false }])}
        >
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.id} value={o.id} className="text-sm">{o.label}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("Direction", "الاتجاه")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={current ? (current.desc ? "desc" : "asc") : ""}
          onValueChange={(dir) => current && table.setSorting([{ id: current.id, desc: dir === "desc" }])}
        >
          <DropdownMenuRadioItem value="asc" disabled={!current} className="text-sm">{t("Ascending (A → Z, 1 → 9)", "تصاعدي (أ ← ي)")}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="desc" disabled={!current} className="text-sm">{t("Descending (Z → A, 9 → 1)", "تنازلي (ي ← أ)")}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ViewOptions<T>({ table }: { table: TableType<T> }) {
  const { t } = useLanguage();
  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide());
  if (!hideable.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground/80 shadow-xs hover:bg-secondary">
          <Settings2 className="size-3.5 text-muted-foreground" /> {t("Columns", "الأعمدة")}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("Toggle columns", "إظهار/إخفاء الأعمدة")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((c) => (
          <DropdownMenuCheckboxItem
            key={c.id}
            checked={c.getIsVisible()}
            onCheckedChange={(v) => c.toggleVisibility(!!v)}
            onSelect={(e) => e.preventDefault()}
            className="text-sm"
          >
            {(c.columnDef.meta as any)?.label || c.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── The table ────────────────────────────────────────────────────────────────

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  getRowId?: (row: T) => string;
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  facets?: FacetDef[];
  dateColumn?: { column: string; title: string };
  initialSort?: SortingState;
  initialHidden?: string[];
  onRowClick?: (row: T) => void;
  exportName?: string;
  exportRow?: (row: T) => Record<string, unknown>;
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  toolbarRight?: ReactNode;
  isLoading?: boolean;
  empty?: { title: string; description?: string; action?: ReactNode };
  pageSize?: number;
  rowClassName?: (row: T) => string | undefined;
  // Change this to reset filters from outside (e.g. switching a status tab).
  resetKey?: string;
};

export function DataTable<T>({
  data, columns, getRowId, searchPlaceholder, getSearchText, facets = [], dateColumn,
  initialSort = [], initialHidden = [], onRowClick, exportName, exportRow, bulkActions,
  toolbarRight, isLoading, empty, pageSize = 20, rowClassName, resetKey,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState<SortingState>(initialSort);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => Object.fromEntries(initialHidden.map((id) => [id, false])));
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    setColumnFilters([]);
    setGlobalFilter("");
    setRowSelection({});
  }, [resetKey]);

  const selectable = !!(bulkActions || exportName);
  const allColumns = useMemo<ColumnDef<T, any>[]>(() => {
    if (!selectable) return columns;
    return [
      {
        id: "__select",
        enableSorting: false,
        enableHiding: false,
        size: 36,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
            onChange={(v) => table.toggleAllPageRowsSelected(v)}
            label={t("Select page", "تحديد الصفحة")}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onChange={(v) => row.toggleSelected(v)} label={t("Select row", "تحديد الصف")} />
        ),
      },
      ...columns,
    ];
  }, [columns, selectable, t]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId: getRowId ? (r) => getRowId(r) : undefined,
    state: { sorting, columnFilters, globalFilter, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _id, value: string) => {
      if (!value) return true;
      const hay = (getSearchText ? getSearchText(row.original) : Object.values(row.original as any).join(" ")).toLowerCase();
      return value.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
    },
    filterFns: { facet: facetFilter, dateRange: dateRangeFilter },
    sortingFns: { text: textSort },
    enableRowSelection: selectable,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize, pageIndex: 0 } },
  });

  const filteredRows = table.getFilteredRowModel().rows;
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const isFiltered = columnFilters.length > 0 || !!globalFilter;
  const sortOptions = table.getAllLeafColumns()
    .filter((c) => c.getCanSort() && (c.columnDef.meta as any)?.label)
    .map((c) => ({ id: c.id, label: (c.columnDef.meta as any).label as string }));

  const doExport = (rows: T[], suffix: string) => {
    if (!exportName) return;
    const mapped = rows.map((r) => (exportRow ? exportRow(r) : (r as any)));
    downloadCsv(`${exportName}${suffix}`, mapped);
  };

  const visibleCols = table.getVisibleLeafColumns().length;

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-2.5" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder || t("Search…", "بحث…")}
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-7 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 rtl:pl-7 rtl:pr-8"
            />
            {globalFilter && (
              <button type="button" onClick={() => setGlobalFilter("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground rtl:right-auto rtl:left-2" aria-label={t("Clear search", "مسح البحث")}>
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {facets.map((f) => (
            <FacetFilter key={f.column} column={table.getColumn(f.column)} title={f.title} options={f.options} />
          ))}
          {dateColumn && <DateFilter column={table.getColumn(dateColumn.column)} title={dateColumn.title} />}
          {isFiltered && (
            <button
              type="button"
              onClick={() => { table.resetColumnFilters(); setGlobalFilter(""); }}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {t("Reset", "إعادة ضبط")} <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sortOptions.length > 0 && <SortMenu table={table} options={sortOptions} />}
          <ViewOptions table={table} />
          {exportName && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground/80 shadow-xs hover:bg-secondary">
                  <Download className="size-3.5 text-muted-foreground" /> {t("Export", "تصدير")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">{t("CSV — opens in Excel", "CSV — يفتح في Excel")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => doExport(filteredRows.map((r) => r.original), isFiltered ? "-filtered" : "")}>
                  {isFiltered ? t("Filtered rows", "الصفوف المفلترة") : t("All rows", "كل الصفوف")}
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">{filteredRows.length}</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!selectedRows.length} onClick={() => doExport(selectedRows, "-selected")}>
                  {t("Selected rows", "الصفوف المحددة")}
                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">{selectedRows.length}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {toolbarRight}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary/[0.04] px-3 py-2">
          <span className="text-xs font-medium text-foreground">
            {selectedRows.length} {t("selected", "محدد")}
          </span>
          {table.getIsAllPageRowsSelected() && selectedRows.length < filteredRows.length && (
            <button type="button" onClick={() => table.toggleAllRowsSelected(true)} className="text-xs font-medium text-primary hover:underline">
              {t(`Select all ${filteredRows.length}`, `تحديد الكل (${filteredRows.length})`)}
            </button>
          )}
          <span className="mx-1 h-4 w-px bg-border" />
          {exportName && (
            <Btn size="xs" variant="outline" onClick={() => doExport(selectedRows, "-selected")}>
              <Download /> {t("Export", "تصدير")}
            </Btn>
          )}
          {bulkActions?.(selectedRows, () => setRowSelection({}))}
          <button type="button" onClick={() => setRowSelection({})} className="ml-auto text-xs text-muted-foreground hover:text-foreground rtl:ml-0 rtl:mr-auto">
            {t("Clear selection", "إلغاء التحديد")}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 z-[1] bg-card">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{ width: h.column.columnDef.size !== 150 ? h.column.columnDef.size : undefined }}
                    className="h-10 whitespace-nowrap px-3 text-left align-middle text-xs font-medium text-muted-foreground rtl:text-right"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  {Array.from({ length: visibleCols }).map((__, j) => (
                    <td key={j} className="px-3 py-3"><div className="h-4 rounded bg-secondary animate-pulse" style={{ width: `${40 + ((i * 7 + j * 13) % 50)}%` }} /></td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={(e) => {
                    if (!onRowClick) return;
                    // Don't open the row when clicking an interactive control inside it.
                    if ((e.target as HTMLElement).closest("button, a, input, label, [role=menuitem], [data-no-row-click]")) return;
                    onRowClick(row.original);
                  }}
                  className={cn(
                    "border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/50 data-[state=selected]:bg-primary/[0.05]",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row.original)
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleCols}>
                  <EmptyState
                    icon={isFiltered ? Search : Inbox}
                    title={isFiltered ? t("No results match your filters", "لا توجد نتائج مطابقة") : empty?.title || t("Nothing here yet", "لا يوجد شيء بعد")}
                    description={isFiltered ? t("Try removing a filter or changing your search.", "جرّب إزالة فلتر أو تغيير البحث.") : empty?.description}
                    action={isFiltered
                      ? <Btn variant="outline" size="sm" onClick={() => { table.resetColumnFilters(); setGlobalFilter(""); }}>{t("Reset filters", "إعادة ضبط الفلاتر")}</Btn>
                      : empty?.action}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col-reverse gap-3 border-t border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground tabular-nums">
          {isFiltered
            ? t(`${filteredRows.length} of ${data.length} rows`, `${filteredRows.length} من ${data.length} صف`)
            : t(`${data.length} rows`, `${data.length} صف`)}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("Rows per page", "صفوف لكل صفحة")}
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 rounded-md border border-input bg-background px-1.5 text-xs text-foreground"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <span className="text-xs font-medium text-foreground tabular-nums">
            {t("Page", "صفحة")} {table.getPageCount() ? table.getState().pagination.pageIndex + 1 : 0} / {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} label={t("First page", "الصفحة الأولى")}><ChevronsLeft /></PageBtn>
            <PageBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} label={t("Previous page", "الصفحة السابقة")}><ChevronLeft /></PageBtn>
            <PageBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} label={t("Next page", "الصفحة التالية")}><ChevronRight /></PageBtn>
            <PageBtn onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} label={t("Last page", "الصفحة الأخيرة")}><ChevronsRight /></PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, label }: { children: ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-card text-foreground/80 hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none [&_svg]:size-3.5 rtl:[&_svg]:rotate-180"
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean | "indeterminate"; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === "indeterminate" ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => { e.stopPropagation(); onChange(checked !== true); }}
      className={cn(
        "flex size-4 items-center justify-center rounded border border-border bg-background transition-colors",
        checked && "border-primary bg-primary text-primary-foreground"
      )}
    >
      {checked === true && <Check className="size-3" strokeWidth={3} />}
      {checked === "indeterminate" && <span className="h-0.5 w-2 rounded bg-current" />}
    </button>
  );
}
