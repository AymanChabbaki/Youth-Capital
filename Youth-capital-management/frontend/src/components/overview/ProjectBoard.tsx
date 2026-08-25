import { useState } from "react";
import { NetworkIcon, PlusCircleIcon, BellIcon } from "../icons";

// Rebuild of the reference dashboard's "Unpaid Invoices" list-card, retargeted
// at this platform's two real domains — 2 tabs each, 4 total, no more:
//   Projects (per README-IDEA.md §6, "the two board sections"): Submitted,
//   Approved / in progress.
//   Money (per the GlobalStats cards): Raised, Spent — gated, needs login.
// Row/detail shape below matches the reference 1:1 (avatar, #code, due,
// status pill, amount / 3-col header, item cards, totals footer) — invented
// placeholder data, not the Arabic idea fixtures.

type Status = "unsent" | "viewed" | null;

interface ListEntry {
  id: string;
  code: string;
  due: string;
  status: Status;
  amount: string;
  company: string;
  customerName: string;
  customerRole: string;
  items: { amount: string; label: string }[];
  subtotal: string;
  total: string;
  balanceDue: string;
}

const AVATAR_COLORS = ["var(--color-istiqlal-rose)", "var(--color-maghreb-gold)", "var(--color-signal-cyan)"];

function initials(name: string) {
  const parts = name.split(" ");
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const SUBMITTED_ITEMS: ListEntry[] = [
  {
    id: "s1",
    code: "P-1001",
    due: "In 2 days",
    status: null,
    amount: "68,750 MAD",
    company: "Solstice Labs",
    customerName: "Amara Diallo",
    customerRole: "Program Lead",
    items: [
      { amount: "27,500 MAD", label: "Planning" },
      { amount: "24,000 MAD", label: "Execution" },
      { amount: "17,250 MAD", label: "Evaluation" },
    ],
    subtotal: "68,750 MAD",
    total: "68,750 MAD",
    balanceDue: "68,750 MAD",
  },
  {
    id: "s2",
    code: "P-1002",
    due: "In 4 days",
    status: "viewed",
    amount: "21,480 MAD",
    company: "Northshore Collective",
    customerName: "Yassine Fassi",
    customerRole: "Coordinator",
    items: [
      { amount: "9,000 MAD", label: "Planning" },
      { amount: "7,480 MAD", label: "Execution" },
      { amount: "5,000 MAD", label: "Evaluation" },
    ],
    subtotal: "21,480 MAD",
    total: "21,480 MAD",
    balanceDue: "21,480 MAD",
  },
  {
    id: "s3",
    code: "P-1003",
    due: "In 5 days",
    status: "unsent",
    amount: "47,980 MAD",
    company: "Atlas Bridge",
    customerName: "Ines Kaddouri",
    customerRole: "Marketing Director",
    items: [
      { amount: "15,990 MAD", label: "Planning" },
      { amount: "21,250 MAD", label: "Execution" },
      { amount: "10,740 MAD", label: "Evaluation" },
    ],
    subtotal: "47,980 MAD",
    total: "47,980 MAD",
    balanceDue: "47,980 MAD",
  },
  {
    id: "s4",
    code: "P-1004",
    due: "In 16 days",
    status: "viewed",
    amount: "55,230 MAD",
    company: "Cedar Point",
    customerName: "Omar Radi",
    customerRole: "Operations Lead",
    items: [
      { amount: "22,000 MAD", label: "Planning" },
      { amount: "19,230 MAD", label: "Execution" },
      { amount: "14,000 MAD", label: "Evaluation" },
    ],
    subtotal: "55,230 MAD",
    total: "55,230 MAD",
    balanceDue: "55,230 MAD",
  },
  {
    id: "s5",
    code: "P-1005",
    due: "In 19 days",
    status: "viewed",
    amount: "6,880 MAD",
    company: "Echo Circle",
    customerName: "Lina Amrani",
    customerRole: "Community Manager",
    items: [
      { amount: "3,000 MAD", label: "Planning" },
      { amount: "2,380 MAD", label: "Execution" },
      { amount: "1,500 MAD", label: "Evaluation" },
    ],
    subtotal: "6,880 MAD",
    total: "6,880 MAD",
    balanceDue: "6,880 MAD",
  },
];

const APPROVED_ITEMS: ListEntry[] = [
  {
    id: "a1",
    code: "P-2001",
    due: "In 3 days",
    status: "viewed",
    amount: "31,200 MAD",
    company: "Palma Works",
    customerName: "Sara Benali",
    customerRole: "Founder",
    items: [
      { amount: "14,000 MAD", label: "Planning" },
      { amount: "11,200 MAD", label: "Execution" },
      { amount: "6,000 MAD", label: "Evaluation" },
    ],
    subtotal: "31,200 MAD",
    total: "31,200 MAD",
    balanceDue: "31,200 MAD",
  },
  {
    id: "a2",
    code: "P-2002",
    due: "In 9 days",
    status: "unsent",
    amount: "18,400 MAD",
    company: "Dune Forward",
    customerName: "Hamza Idrissi",
    customerRole: "Founder",
    items: [
      { amount: "8,000 MAD", label: "Planning" },
      { amount: "6,400 MAD", label: "Execution" },
      { amount: "4,000 MAD", label: "Evaluation" },
    ],
    subtotal: "18,400 MAD",
    total: "18,400 MAD",
    balanceDue: "18,400 MAD",
  },
  {
    id: "a3",
    code: "P-2003",
    due: "In 12 days",
    status: "viewed",
    amount: "42,900 MAD",
    company: "Riverline Youth",
    customerName: "Nouhaila Saadi",
    customerRole: "Founder",
    items: [
      { amount: "18,900 MAD", label: "Planning" },
      { amount: "15,000 MAD", label: "Execution" },
      { amount: "9,000 MAD", label: "Evaluation" },
    ],
    subtotal: "42,900 MAD",
    total: "42,900 MAD",
    balanceDue: "42,900 MAD",
  },
];

const TABS = [
  { key: "submitted" as const, label: "Submitted", count: SUBMITTED_ITEMS.length },
  { key: "approved" as const, label: "Approved", count: APPROVED_ITEMS.length },
  { key: "raised" as const, label: "Raised", locked: true },
  { key: "spent" as const, label: "Spent", locked: true },
];

function IdeaList({
  entries,
  selectedId,
  onSelect,
}: {
  entries: ListEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="project-board-list">
      {entries.map((entry, index) => (
        <button
          key={entry.id}
          type="button"
          className={`project-board-row${entry.id === selectedId ? " active" : ""}`}
          onClick={() => onSelect(entry.id)}
        >
          <span
            className="project-board-row-avatar"
            style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          >
            {initials(entry.customerName)}
          </span>
          <span className="project-board-row-main">
            <span className="project-board-row-code"># {entry.code}</span>
            <span className="project-board-row-due">{entry.due}</span>
          </span>
          {entry.status && (
            <span className={`project-board-row-status project-board-row-status-${entry.status}`}>
              {entry.status === "unsent" ? "Unsent" : "Viewed"}
            </span>
          )}
          <span className="project-board-row-amount">{entry.amount}</span>
        </button>
      ))}
    </div>
  );
}

function IdeaDetailPane({ entry }: { entry: ListEntry }) {
  return (
    <div className="project-board-detail">
      <div className="project-board-detail-header-grid">
        <div className="project-board-detail-col">
          <span className="project-board-detail-label">Details</span>
          <span className="project-board-detail-code">
            # {entry.code}
            {entry.status && (
              <span className={`project-board-row-status project-board-row-status-${entry.status}`}>
                {entry.status === "unsent" ? "Unsent" : "Viewed"}
              </span>
            )}
          </span>
        </div>
        <div className="project-board-detail-col">
          <span className="project-board-detail-label">Company</span>
          <span className="project-board-detail-company">
            <span className="project-board-detail-logo">{entry.company[0]}</span>
            {entry.company}
          </span>
        </div>
        <div className="project-board-detail-col">
          <span className="project-board-detail-label">Customer</span>
          <span className="project-board-detail-customer">
            <span className="project-board-row-avatar">{initials(entry.customerName)}</span>
            <span>
              <span className="project-board-detail-customer-name">{entry.customerName}</span>
              <span className="project-board-detail-customer-role">{entry.customerRole}</span>
            </span>
          </span>
        </div>
      </div>

      <div className="project-board-detail-items">
        {entry.items.map((item) => (
          <div key={item.label} className="project-board-detail-item">
            <NetworkIcon size={13} className="project-board-detail-item-icon" />
            <span className="project-board-detail-item-amount">{item.amount}</span>
            <span className="project-board-detail-item-label">{item.label}</span>
          </div>
        ))}
        <div className="project-board-detail-item project-board-detail-item-add">
          <PlusCircleIcon size={18} />
          <span>Add Item</span>
        </div>
      </div>

      <div className="project-board-detail-footer">
        <div className="project-board-detail-totals">
          <div className="project-board-detail-total">
            <span className="project-board-detail-label">Sub Total</span>
            <span className="project-board-detail-total-value">{entry.subtotal}</span>
          </div>
          <div className="project-board-detail-total">
            <span className="project-board-detail-label">Total</span>
            <span className="project-board-detail-total-value">{entry.total}</span>
          </div>
          <div className="project-board-detail-total">
            <span className="project-board-detail-label">Balance Due</span>
            <span className="project-board-detail-total-value">{entry.balanceDue}</span>
          </div>
        </div>
        <div className="project-board-detail-actions">
          <button type="button" className="project-board-detail-icon-btn" aria-label="Link">
            <NetworkIcon size={16} />
          </button>
          <button type="button" className="project-board-detail-icon-btn" aria-label="Schedule">
            <BellIcon size={16} />
          </button>
          <button type="button" className="project-board-detail-payout">
            Payout now
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectBoard() {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("submitted");
  const list = active === "submitted" ? SUBMITTED_ITEMS : active === "approved" ? APPROVED_ITEMS : [];
  const [selectedId, setSelectedId] = useState(SUBMITTED_ITEMS[2]?.id ?? "");

  const activeTab = TABS.find((tab) => tab.key === active)!;
  const selected = list.find((i) => i.id === selectedId) ?? list[0];

  function selectTab(key: (typeof TABS)[number]["key"]) {
    setActive(key);
    const nextList = key === "submitted" ? SUBMITTED_ITEMS : key === "approved" ? APPROVED_ITEMS : [];
    setSelectedId(nextList[0]?.id ?? "");
  }

  return (
    <div className="project-board">
      <div className="project-board-tabs-dock">
        <span className="project-board-notch project-board-notch-left" />
        <div className="project-board-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`project-board-tab${active === tab.key ? " active" : ""}`}
              onClick={() => selectTab(tab.key)}
            >
              {tab.label}
              {"count" in tab && <span className="project-board-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
        <span className="project-board-notch project-board-notch-right" />
      </div>

      {"locked" in activeTab && activeTab.locked && (
        <div className="project-board-gate">
          <div className="project-board-gate-preview">
            <div className="project-board-gate-row" />
            <div className="project-board-gate-row" />
            <div className="project-board-gate-row" />
          </div>
          <div className="project-board-gate-overlay">
            <span>Sign in to view</span>
          </div>
        </div>
      )}

      {!("locked" in activeTab) && (
        <div className="project-board-body">
          <IdeaList entries={list} selectedId={selected?.id ?? ""} onSelect={setSelectedId} />
          {selected && <IdeaDetailPane entry={selected} />}
        </div>
      )}
    </div>
  );
}
