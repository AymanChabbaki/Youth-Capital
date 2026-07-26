import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import { isMockMode, supabase } from "../lib/supabaseClient";

export function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { tr } = useLang();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isMockMode || !supabase) {
      // No backend configured — let the visitor straight into the demo board.
      navigate("/board/submitted");
      return;
    }
    await supabase.auth.signInWithOtp({ email });
    setSent(true);
  }

  return (
    <main className="auth-wrap">
      <form onSubmit={handleSubmit} className="card auth-card">
        <h2>{tr.login.title}</h2>
        {sent ? (
          <p className="hint">{tr.login.sent}</p>
        ) : (
          <>
            <p className="hint">{isMockMode ? tr.login.hintMock : tr.login.hintReal}</p>
            <input
              type="email"
              required
              placeholder={tr.login.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="primary" type="submit">
              {isMockMode ? tr.login.btnMock : tr.login.btnReal}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
