import { useState } from "react";
import { SectionNav } from "../components/layout/SectionNav";
import { GlobalStats } from "../components/overview/GlobalStats";

const PREVIEW_ITEMS = [
  { key: "overview", label: "Overview", plus: true },
  { key: "projects", label: "Projects" },
  { key: "invoices", label: "Invoices", plus: true },
  { key: "payments", label: "Payments" },
  { key: "recurring", label: "Recurring" },
];

// TEMPORARY — a twin pair of marker squares beside the L's connect point.
export function Overview() {
  const [active, setActive] = useState("invoices");
  return (
    <main className="wireframe">
      <div className="debug-square-2" />
      <div className="debug-square-3" />
      <div className="debug-square" />
      {/* TEMPORARY — SectionNav style preview */}
      <SectionNav items={PREVIEW_ITEMS} activeKey={active} onSelect={setActive} />

      <div style={{ padding: "1.5rem" }}>
        <GlobalStats />
      </div>
    </main>
  );
}
