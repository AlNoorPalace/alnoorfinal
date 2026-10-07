import { ReactNode } from "react";

export const field =
  "border border-white/15 bg-[#1c1b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#C9A24B] disabled:opacity-50 placeholder:text-white/30";
export const btn =
  "border border-[#C9A24B]/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#EBC166] hover:bg-[#C9A24B]/10 disabled:opacity-50";
export const btnSolid =
  "bg-[#C9A24B] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:bg-[#EBC166] disabled:opacity-50";
export const btnDanger =
  "border border-[#ffb4ab]/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50";

export const inr = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);

export function Notice({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "red" | "green" }) {
  const cls =
    tone === "red"
      ? "border-[#ffb4ab]/40 bg-[#ffb4ab]/10 text-[#ffb4ab]"
      : tone === "green"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : "border-[#C9A24B]/40 bg-[#C9A24B]/10 text-[#EBC166]";
  return (
    <p role="status" className={`mb-5 border p-4 text-sm ${cls}`}>
      {children}
    </p>
  );
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/60">
      {children}
      {hint && <span className="ml-2 font-normal normal-case tracking-normal text-white/35">{hint}</span>}
    </label>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-[#ffb4ab]">{msg}</p> : null;
}
