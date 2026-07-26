// The second (in-section) header — a pill-style sub-nav, not rendered on
// the pen. Presentational only: it doesn't know if its items are routes or
// filters, that's up to whoever wires it into a section.
export type SectionNavItem = {
  key: string;
  label: string;
  plus?: boolean; // show a "+" before the label
};

export function SectionNav({
  items,
  activeKey,
  onSelect,
}: {
  items: SectionNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <>
      <nav className="section-nav">
        {items.map(({ key, label, plus }) => (
          <button
            key={key}
            type="button"
            className={`section-nav-item${key === activeKey ? " active" : ""}`}
            onClick={() => onSelect(key)}
          >
            {plus && <span className="section-nav-plus">+</span>}
            {label}
          </button>
        ))}
      </nav>
      <div className="section-nav-divider" />
    </>
  );
}
