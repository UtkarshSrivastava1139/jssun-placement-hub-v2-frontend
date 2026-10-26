import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getTalentMatchSupabaseClient } from "./talentMatchSupabaseClient";

type LoginState = "email" | "inbox" | "success";

export function TalentMatchLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState<LoginState>("email");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getTalentMatchSupabaseClient().auth.getSession().then(({ data }) => {
      if (data.session && !data.session.user.is_anonymous) {
        void navigate({ to: "/talent-match", replace: true });
      }
    });
  }, [navigate]);

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@jssuninoida.edu.in")) {
      setError("Please use your college email.");
      return;
    }

    setBusy(true);
    const { error: authError } = await getTalentMatchSupabaseClient().auth.signInWithOtp({
      email: normalizedEmail,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (authError) {
      setError("We could not send a sign-in code. Please try again.");
      return;
    }
    setEmail(normalizedEmail);
    setState("inbox");
  }

  async function submitCode(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const { error: authError } = await getTalentMatchSupabaseClient().auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (authError) {
      setError("That code is not valid or has expired. Request a new one and try again.");
      return;
    }
    setState("success");
    const redirectPath = new URLSearchParams(window.location.search).get("redirect");
    const destination = redirectPath?.startsWith("/talent-match") ? redirectPath : "/talent-match";
    setTimeout(() => void navigate({ to: destination as "/talent-match", replace: true }), 400);
  }

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-xl border border-atlas-divider bg-atlas-surface p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-atlas-terracotta">Talent Match</p>
        <h1 className="mt-2 font-heading text-2xl font-semibold text-atlas-ink">Sign in with your college email</h1>
        {state === "email" && (
          <form className="mt-6 space-y-4" onSubmit={submitEmail}>
            <label className="block text-sm font-medium" htmlFor="college-email">College email</label>
            <input id="college-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-atlas-divider bg-atlas-page px-3 py-2" placeholder="you@jssuninoida.edu.in" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-md bg-atlas-ink px-4 py-2 text-sm font-medium text-atlas-page">
              {busy ? "Sending…" : "Send sign-in code"}
            </button>
          </form>
        )}
        {state === "inbox" && (
          <form className="mt-6 space-y-4" onSubmit={submitCode}>
            <p className="text-sm text-atlas-text-secondary">Check your inbox for a one-time code sent to <strong>{email}</strong>.</p>
            <label className="block text-sm font-medium" htmlFor="email-code">One-time code</label>
            <input id="email-code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-md border border-atlas-divider bg-atlas-page px-3 py-2" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-md bg-atlas-ink px-4 py-2 text-sm font-medium text-atlas-page">
              {busy ? "Checking…" : "Verify code"}
            </button>
            <button type="button" className="w-full text-sm underline" onClick={() => { setError(null); setState("email"); }}>
              Use a different email
            </button>
          </form>
        )}
        {state === "success" && <p role="status" className="mt-6 text-sm text-green-700">Signed in successfully. Opening Talent Match…</p>}
      </section>
    </main>
  );
}
