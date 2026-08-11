import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, SearchIcon } from "../icons";

// Rebuild of the reference invoice filter bar (customers/status/date-range/
// invoice#), retargeted at Projects instead of money. The two date pickers
// don't have an equivalent on a project (no billing period), so they're
// replaced with the two other confirmed project axes from README-IDEA-V2 §1:
// scope (global/department) and kind (intern/extern). Status options below
// are a placeholder guess (draft/submitted/in review/approved/rejected) —
// the exact lifecycle stages are still an open decision per that doc.
const DEPARTMENT_OPTIONS = [
  "Tech",
  "Media & Communication",
  "Political Training",
  "Social Work",
  "Culture & Arts",
  "Organization",
];

const STATUS_OPTIONS = ["Draft", "Submitted", "In Review", "Approved", "Rejected"];

const SCOPE_OPTIONS = ["Global", "Department"];

const KIND_OPTIONS = ["Intern", "Extern"];

// Custom listbox instead of a native <select> — a native dropdown's popup
// can't be styled (no controlling its own box, the 3px gap below the
// control, or a per-option selected background) consistently across
// browsers, so the option list is just a rendered, positioned div instead.
function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="project-filter-select-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`project-filter-select${value ? "" : " placeholder"}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || allLabel}
      </button>
      <ChevronDownIcon size={14} className="project-filter-chevron" />

      {open && (
        <div className="project-filter-dropdown" role="listbox">
          <div
            className={`project-filter-option${value === "" ? " selected" : ""}`}
            role="option"
            aria-selected={value === ""}
            onClick={() => choose("")}
          >
            {allLabel}
          </div>
          {options.map((option) => (
            <div
              key={option}
              className={`project-filter-option${value === option ? " selected" : ""}`}
              role="option"
              aria-selected={value === option}
              onClick={() => choose(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectFilterBar() {
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [scope, setScope] = useState("");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");

  const activeCount = useMemo(
    () => [department, status, scope, kind].filter(Boolean).length,
    [department, status, scope, kind]
  );

  return (
    <div className="project-filter-bar">
      <div className="project-filter-active">
        <span>Active filters</span>
        <span className="project-filter-active-count">{activeCount}</span>
      </div>
      <FilterSelect value={department} onChange={setDepartment} options={DEPARTMENT_OPTIONS} allLabel="All departments" />
      <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} allLabel="All statuses" />
      <FilterSelect value={scope} onChange={setScope} options={SCOPE_OPTIONS} allLabel="All scopes" />
      <FilterSelect value={kind} onChange={setKind} options={KIND_OPTIONS} allLabel="All types" />
      <div className="project-filter-search">
        <input
          type="text"
          placeholder="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SearchIcon size={16} />
      </div>
    </div>
  );
}
