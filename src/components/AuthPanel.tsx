"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserEmail(s?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setLoading(false);
    if (!error) setSent(true);
    else alert(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">Signed in as <b>{userEmail}</b></span>
        <button className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10" onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="min-w-[220px] rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
        type="email" placeholder="you@email.com"
        value={email} onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-2 text-sm hover:bg-emerald-500/30 disabled:opacity-60"
        onClick={signIn} disabled={loading || !email}
      >
        {loading ? "Sending..." : "Sign in via email"}
      </button>
      {sent && <span className="text-xs text-white/60">Check your email for a magic link.</span>}
    </div>
  );
}