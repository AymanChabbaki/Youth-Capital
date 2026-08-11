import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowIcon, BoardIcon, CoinsIcon, HandHeartIcon, PinIcon, UsersIcon, WalletIcon } from "../icons";
import { Globe } from "./Globe";
import memberAmine from "../../assets/images/member-amine.jpg";
import memberKarim from "../../assets/images/member-karim.jpg";
import memberNadia from "../../assets/images/member-nadia.jpg";

// Mock numbers — no backend wired yet, just to see the shape of the row.
const CARDS = [
  {
    key: "projects",
    Icon: BoardIcon,
    label: "Projects",
    value: "128",
    split: [
      { value: "42", label: "Intern" },
      { value: "86", label: "Extern" },
    ],
    stack: ["Youth Leadership Summit", "Digital Skills Academy"],
    locked: false,
  },
  {
    key: "sponsors",
    Icon: HandHeartIcon,
    label: "Sponsors",
    value: "37",
    topLabel: "Top",
    names: ["Youssef El Amrani", "Mehdi Bennis", "Salma Idrissi", "Khadija Ziani"],
    locked: false,
  },
  {
    key: "members",
    Icon: UsersIcon,
    label: "Members",
    value: "1,204",
    topLabel: "Top",
    people: [
      { name: "Amine Tazi", dept: "Tech", img: memberAmine },
      { name: "Nadia Chraibi", dept: "Marketing", img: memberNadia },
      { name: "Karim Ouazzani", dept: "Design", img: memberKarim },
    ],
    locked: false,
  },
  {
    key: "raised",
    Icon: WalletIcon,
    label: "Money raised",
    value: "2.4M MAD",
    topLabel: "Sponsors",
    sponsors: [
      { name: "Youssef", amount: "1M MAD" },
      { name: "Mehdi", amount: "800K MAD" },
      { name: "Salma", amount: "600K MAD" },
    ],
    sub: "Sign in for details",
    locked: true,
  },
  {
    key: "spent",
    Icon: CoinsIcon,
    label: "Money spent",
    value: "1.1M MAD",
    topLabel: "Project",
    stack: ["Youth Coding Bootcamp", "Green Campus Initiative"],
    sub: "Sign in for details",
    locked: true,
  },
] as const;

// Same figure as the Members stat card — this hub's member count.
const HUB_MEMBERS = CARDS.find((c) => c.key === "members")!.value;

export function GlobalStats() {
  const [markerFacing, setMarkerFacing] = useState(false);

  return (
    <div className="stats-grid">
      {CARDS.map((card) => (
        <Link key={card.key} to="/login" className={`stat-card${card.locked ? " stat-card-locked" : ""}`}>
          <div className="stat-card-top">
            <span className="stat-card-icon">
              <card.Icon size={20} />
            </span>
            <span className="stat-card-label">{card.label}</span>
          </div>
          <span className="stat-card-value">{card.value}</span>
          {"split" in card && (
            <div className="stat-card-split" style={{ marginTop: "-6.6px" }}>
              {card.split.map((part) => (
                <div key={part.label} className="stat-card-metric">
                  <span className="stat-card-metric-value">{part.value}</span>
                  <span className="stat-card-top-label">{part.label}</span>
                </div>
              ))}
            </div>
          )}
          {"people" in card && (
            <>
              {"topLabel" in card && (
                <span
                  className="stat-card-top-label stat-card-top-label-tight"
                  style={card.key === "members" ? undefined : { marginTop: "-5.6px" }}
                >
                  {card.topLabel}
                </span>
              )}
              <div className="stat-card-split">
                {card.people.slice(0, 2).map((person) => (
                  <div key={person.name} className="stat-card-pill stat-card-pill-lg">
                    <img className="stat-card-avatar" src={person.img} alt="" />
                    <span className="stat-card-pill-text">
                      <span className="stat-card-pill-label">{person.dept}</span>
                      <span className="stat-card-pill-subname">{person.name.split(" ")[0]}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="stat-card-split">
                {card.people.slice(2).map((person) => (
                  <div key={person.name} className="stat-card-pill stat-card-pill-lg">
                    <img className="stat-card-avatar" src={person.img} alt="" />
                    <span className="stat-card-pill-text">
                      <span className="stat-card-pill-label">{person.dept}</span>
                      <span className="stat-card-pill-subname">{person.name.split(" ")[0]}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          {"sponsors" in card && (
            <>
              {"topLabel" in card && (
                <span
                  className="stat-card-top-label stat-card-top-label-tight"
                  style={{ marginTop: "-5.6px" }}
                >
                  {card.topLabel}
                </span>
              )}
              <div className="stat-card-sponsor-list">
                {card.sponsors.map((sponsor, index) => (
                  <div key={sponsor.name} className="stat-card-sponsor-row">
                    <span className="stat-card-sponsor-rank">{index + 1}</span>
                    <span className="stat-card-sponsor-name">{sponsor.name}</span>
                    <span className="stat-card-sponsor-amount">{sponsor.amount}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {"stack" in card && (
            <>
              {"topLabel" in card && (
                <span
                  className="stat-card-top-label stat-card-top-label-tight"
                  style={{ marginTop: "-5.6px" }}
                >
                  {card.topLabel}
                </span>
              )}
              <div className="stat-card-stack">
                {card.stack.map((item) => (
                  <div key={item} className="stat-card-pill">
                    <span className="stat-card-pill-label">{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {"sub" in card && (
            <span className="stat-card-detail">
              {card.sub}
              <ArrowIcon size={12} />
            </span>
          )}
        </Link>
      ))}

      <div className="stat-card stat-card-map">
        <div className={`stat-card-map-stat${markerFacing ? " visible" : ""}`}>
          <div className="stat-card-map-stat-value">{HUB_MEMBERS}</div>
          <div className="stat-card-map-stat-label">Members</div>
        </div>
        <div className="stat-card-map-globe-wrap">
          <Globe onFacingChange={setMarkerFacing} />
        </div>
        <div className="stat-card-map-footer">
          <div className="stat-card-map-overlay">
            <PinIcon size={16} />
            <div>
              <div className="stat-card-map-title">Morocco</div>
              <div className="stat-card-map-value">Active hub</div>
            </div>
          </div>
          <span className="stat-card-detail">
            Sign in for details
            <ArrowIcon size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
