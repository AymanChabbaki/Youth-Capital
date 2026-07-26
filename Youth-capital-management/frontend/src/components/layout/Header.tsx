import { Link } from "react-router-dom";
import { ScaleIcon } from "../icons";
import { useLang } from "../../i18n/LanguageContext";
import { Lang } from "../../i18n/translations";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export function Header() {
  const { lang, setLang, tr } = useLang();

  return (
    <header className="site-header">
      <div className="inner">
        <Link to="/" className="brand">
          <span className="mark">
            <ScaleIcon size={22} />
          </span>
          <span>
            <span className="name">{tr.brand.name}</span>
            <span className="sub">{tr.brand.sub}</span>
          </span>
        </Link>
        <div className="lang-switch" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? "on" : ""} onClick={() => setLang(l.code)} lang={l.code}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
