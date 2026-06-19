"use client";

import { useState } from "react";
import { useAccount } from "@/hooks/use-account";

/**
 * Lightweight mock registration form (name + optional email). Used inline
 * wherever we need to gate an action behind "having an account" — the place
 * comments composer and the profile screen.
 */
export function AuthForm({ onDone }: { onDone?: () => void }) {
  const { register } = useAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = name.trim().length >= 2;

  const field =
    "rounded-2xl bg-slate-50 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-slate-400";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        register(name, email);
        onDone?.();
      }}
      className="flex flex-col gap-2.5"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        autoComplete="name"
        className={field}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email (opcional)"
        autoComplete="email"
        className={field}
      />
      <button
        type="submit"
        disabled={!valid}
        className="rounded-2xl bg-slate-900 px-4 py-3 text-[14px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-40"
      >
        Crear cuenta
      </button>
    </form>
  );
}
