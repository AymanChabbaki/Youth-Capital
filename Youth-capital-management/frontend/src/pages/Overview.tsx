import { useState } from "react";
import { SectionNav } from "../components/layout/SectionNav";
import { GlobalStats } from "../components/overview/GlobalStats";
import { ProjectFilterBar } from "../components/overview/ProjectFilterBar";

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

      <div style={{ padding: "0.5rem", marginTop: "0.75rem" }}>
        <GlobalStats />
        <ProjectFilterBar />
      </div>
    </main>
  );
}
