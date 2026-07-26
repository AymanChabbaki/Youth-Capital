import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowIcon, BoardIcon, CoinsIcon, HandHeartIcon, PinIcon, UsersIcon, WalletIcon } from "../icons";
import { Globe } from "./Globe";
import memberAmine from "../../assets/images/member-amine.jpg";
import memberKarim from "../../assets/images/member-karim.jpg";
import memberNadia from "../../assets/images/member-nadia.jpg";
import sponsorMehdi from "../../assets/images/sponsor-mehdi.jpg";
import sponsorSalma from "../../assets/images/sponsor-salma.jpg";
import sponsorYoussef from "../../assets/images/sponsor-youssef.jpg";

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
    sub: "Sign in for details",
    locked: false,
  },
  {
    key: "sponsors",
    Icon: HandHeartIcon,
    label: "Sponsors",
    value: "37",
    note: "on the platform",
    sub: "Sign in for details",
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
    sub: "Sign in for details",
    locked: false,
  },
  {
    key: "raised",
    Icon: WalletIcon,
    label: "Money raised",
    value: "2.4M MAD",
    topLabel: "Sponsors",
    people: [
      { name: "Youssef El Amrani", img: sponsorYoussef },
      { name: "Mehdi Bennis", img: sponsorMehdi },
      { name: "Salma Idrissi", img: sponsorSalma },
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

// Moroccan cities the gold callout cycles through, one per rotation.
const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fes",
  "Tangier",
  "Agadir",
  "Meknes",
  "Oujda",
  "Kenitra",
  "Tetouan",
];

export function GlobalStats() {
  const [markerFacing, setMarkerFacing] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);

  // One city per rotation: it appears while the marker faces forward,
  // vanishes as the globe keeps turning, and only THEN — once it's gone —
  // does the next rotation's city get picked, so it's always a fresh one.
  const handleFacingChange = (facing: boolean) => {
    setMarkerFacing((prev) => {
      if (prev && !facing) {
        setCityIndex((i) => (i + 1) % MOROCCAN_CITIES.length);
      }
      return facing;
    });
  };

  const currentCity = MOROCCAN_CITIES[cityIndex];

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
          {"note" in card && (
            <span className="stat-card-top-label" style={{ marginTop: "-4.2px" }}>
              {card.note}
            </span>
          )}
          {"chips" in card && (
            <>
              {"topLabel" in card && <span className="stat-card-top-label">{card.topLabel}</span>}
              <div className="stat-card-split">
                {card.chips.map((chip) => (
                  <div key={chip} className="stat-card-pill">
                    <span className="stat-card-pill-label">{chip}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {"people" in card && (
            <>
              {"topLabel" in card && !("chips" in card) && (
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
                    {"dept" in person ? (
                      <span className="stat-card-pill-text">
                        <span className="stat-card-pill-label">{person.dept}</span>
                        <span className="stat-card-pill-subname">{person.name.split(" ")[0]}</span>
                      </span>
                    ) : (
                      <span className="stat-card-pill-label">{person.name.split(" ")[0]}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="stat-card-split">
                {card.people.slice(2).map((person) => (
                  <div key={person.name} className="stat-card-pill stat-card-pill-lg">
                    <img className="stat-card-avatar" src={person.img} alt="" />
                    {"dept" in person ? (
                      <span className="stat-card-pill-text">
                        <span className="stat-card-pill-label">{person.dept}</span>
                        <span className="stat-card-pill-subname">{person.name.split(" ")[0]}</span>
                      </span>
                    ) : (
                      <span className="stat-card-pill-label">{person.name.split(" ")[0]}</span>
                    )}
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
          <div className="stat-card-map-stat-value">{currentCity}</div>
        </div>
        <div className="stat-card-map-globe-wrap">
          <Globe onFacingChange={handleFacingChange} />
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
