import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../i18n/LanguageContext";
import {
  BellIcon,
  BoardIcon,
  BuildingIcon,
  GridIcon,
  InboxIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserIcon,
} from "../icons";
import youthCapitalMark from "../../assets/images/youth-capital-mark.svg";
import youthCapitalFull from "../../assets/images/youth-capital-full.svg";

// Member-tier sections only — a guest previews what opens up after sign-in.
// Coordinator/national-lead/leadership review sections are role-gated and
// stay out of the guest sidebar entirely (see PLATFORM-SECTIONS.md §4).
// Icon-only rail at rest: each item still needs a real aria-label/title for
// screen readers, and carries a label span that only becomes visible while
// the rail is hovered/expanded.
const ITEMS = [
  { key: "overview", to: "/", Icon: GridIcon },
  { key: "board", to: null, Icon: BoardIcon },
  { key: "newIdea", to: null, Icon: PlusCircleIcon },
  { key: "myRequests", to: null, Icon: InboxIcon },
  { key: "directory", to: null, Icon: BuildingIcon },
  { key: "notifications", to: null, Icon: BellIcon },
] as const;

// The second, smaller box — account-scoped actions, always in this order.
const ACCOUNT_ITEMS = [
  { key: "account", Icon: UserIcon },
  { key: "settings", Icon: SettingsIcon },
  { key: "logout", Icon: LogOutIcon },
] as const;

export function Sidebar() {
  const { tr } = useLang();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  // Not-yet-built stubs have no route to key an active state off, so a
  // click just selects one directly — same light-purple-box/dark-purple
  // treatment as a real route match, shared across both boxes (one
  // selection at a time for the whole rail).
  const [selectedStub, setSelectedStub] = useState<string | null>(null);

  return (
    <>
      <div
        className={`sidebar-col${expanded ? " expanded" : ""}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <aside className="sidebar">
          <Link to="/" className="sidebar-mark" title={tr.brand.name} aria-label={tr.brand.name}>
            {expanded ? (
              <img src={youthCapitalFull} alt={tr.brand.name} className="sidebar-mark-full" />
            ) : (
              <img src={youthCapitalMark} alt="" className="sidebar-mark-icon" />
            )}
          </Link>

          <nav className="sidebar-nav">
            {ITEMS.map(({ key, to, Icon }) => {
              const label = tr.sidebar.nav[key];
              return to ? (
                <Link
                  key={key}
                  to={to}
                  className={`sidebar-item${pathname === to ? " active" : ""}`}
                  title={label}
                  aria-label={label}
                >
                  <Icon size={19} />
                  <span className="sidebar-item-label">{label}</span>
                </Link>
              ) : (
                <div
                  key={key}
                  className={`sidebar-item${selectedStub === key ? " active" : ""}`}
                  title={`${label} — ${tr.sidebar.soon}`}
                  aria-label={label}
                  onClick={() => setSelectedStub(key)}
                >
                  <Icon size={19} />
                  <span className="sidebar-item-label">{label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <aside className="sidebar-account">
          {ACCOUNT_ITEMS.map(({ key, Icon }) => {
            const label = tr.sidebar.nav[key];
            return (
              <div
                key={key}
                className={`sidebar-item${selectedStub === key ? " active" : ""}`}
                title={`${label} — ${tr.sidebar.soon}`}
                aria-label={label}
                onClick={() => setSelectedStub(key)}
              >
                <Icon size={19} />
                <span className="sidebar-item-label">{label}</span>
              </div>
            );
          })}
        </aside>
      </div>

      <div className={`sidebar-backdrop${expanded ? " visible" : ""}`} />
    </>
  );
}
