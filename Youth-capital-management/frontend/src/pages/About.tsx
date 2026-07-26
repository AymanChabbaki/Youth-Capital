import { Link } from "react-router-dom";
import { CheckCircleIcon, HelpIcon, LockIcon, UnlockIcon } from "../components/icons";
import { useLang } from "../i18n/LanguageContext";

export function About() {
  const { tr, fmt } = useLang();

  return (
    <main>
      <section className="section patterned">
        <div className="container">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div className="eyebrow">{tr.about.eyebrow}</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>{tr.about.title}</h2>
            <p style={{ fontSize: "1.05rem" }}>{tr.about.lead}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.1rem" }}>
          <div className="card feature">
            <div className="icon"><HelpIcon /></div>
            <h3>{tr.about.problemTitle}</h3>
            <p>{tr.about.problemText}</p>
          </div>
          <div className="card feature gold">
            <div className="icon"><CheckCircleIcon /></div>
            <h3>{tr.about.solutionTitle}</h3>
            <p>{tr.about.solutionText}</p>
          </div>
        </div>
      </section>

      <section className="section tinted">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">{tr.about.rolesEyebrow}</div>
            <h2>{tr.about.rolesTitle}</h2>
            <p>{tr.about.rolesNote}</p>
          </div>
          <div className="grid-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
            {tr.about.roles.map((r, i) => (
              <div className="card feature" key={r.name}>
                <div className="icon" style={{ fontFamily: "var(--font-mono)" }}>{fmt(i + 1)}</div>
                <h3>{r.name}</h3>
                <p>
                  <strong style={{ color: "var(--color-signal-cyan)", fontWeight: 600 }}>{r.scope}</strong>
                  <br />
                  {r.how}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">{tr.about.privacyEyebrow}</div>
            <h2>{tr.about.privacyTitle}</h2>
            <p>{tr.about.privacyText}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.1rem" }}>
            <div className="card">
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", fontFamily: "var(--font-body)", color: "var(--color-signal-cyan)" }}>
                <UnlockIcon size={18} /> {tr.about.publicTitle}
              </h3>
              <ul style={{ margin: 0, paddingInlineStart: "1.2rem", color: "var(--color-text-muted)", fontSize: "0.92rem", lineHeight: 2 }}>
                {tr.about.publicFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{ borderColor: "var(--color-rose-deep)" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", fontFamily: "var(--font-body)", color: "var(--color-istiqlal-rose)" }}>
                <LockIcon size={18} /> {tr.about.lockedTitle}
              </h3>
              <ul style={{ margin: 0, paddingInlineStart: "1.2rem", color: "var(--color-text-muted)", fontSize: "0.92rem", lineHeight: 2 }}>
                {tr.about.lockedFields.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p style={{ fontSize: "0.8rem", margin: "0.8rem 0 0", color: "var(--color-text-muted)" }}>{tr.about.lockNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section tinted">
        <div className="container">
          <div className="cta-banner">
            <h2>{tr.about.ctaTitle}</h2>
            <p>{tr.about.ctaText}</p>
            <Link to="/board/submitted">
              <button className="primary">{tr.about.ctaBtn}</button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
