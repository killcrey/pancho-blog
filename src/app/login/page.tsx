"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="panel w-full max-w-sm rounded-lg p-8">
        <Link
          href="/"
          className="mb-6 block text-center text-xs uppercase tracking-[0.3em] text-muted hover:text-gold transition-colors"
        >
          ← Mission Log
        </Link>

        <h1 className="text-glow mb-1 text-center text-2xl font-semibold uppercase tracking-widest">
          Comms Access
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Authorized personnel only
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gold"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-semibold uppercase tracking-widest text-gold"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-border bg-panel-2 px-3 py-2 text-sm text-fg outline-none focus:border-gold"
            />
          </div>

          {error && (
            <p className="rounded border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border border-gold bg-gold/10 py-2 text-sm font-semibold uppercase tracking-widest text-gold transition-colors hover:bg-gold hover:text-black disabled:opacity-50"
          >
            {loading ? "Authenticating…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
