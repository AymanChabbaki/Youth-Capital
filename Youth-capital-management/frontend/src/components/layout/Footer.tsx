import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LanguageContext";

export function Footer() {
  const { tr } = useLang();

  return (
    <footer className="site-footer">
      <div className="inner">
        <div>
          <h4>{tr.footer.title}</h4>
          <p>{tr.footer.text}</p>
        </div>
        <div>
          <h4>{tr.footer.platform}</h4>
          <Link to="/about">{tr.nav.about}</Link>
          <Link to="/board/submitted">{tr.board.submittedTitle}</Link>
          <Link to="/board/approved">{tr.board.approvedTitle}</Link>
        </div>
        <div>
          <h4>{tr.footer.contact}</h4>
          <a href="https://www.istiqlal.info" target="_blank" rel="noreferrer">
            istiqlal.info
          </a>
          <a href="https://www.instagram.com/parti.istiqlal" target="_blank" rel="noreferrer">
            {tr.footer.instagram}
          </a>
          <Link to="/login">{tr.footer.join}</Link>
        </div>
      </div>
      <div className="legal">
        {tr.footer.legal} · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
