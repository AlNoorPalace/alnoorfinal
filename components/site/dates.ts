export const pad = (n: number) => String(n).padStart(2, "0");

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISO(new Date());

export const nightsBetween = (a: string | null, b: string | null) => {
  if (!a || !b) return 0;
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86400000);
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "12 Oct" */
export const fmtShort = (s: string | null) => {
  if (!s) return "";
  const d = fromISO(s);
  return `${d.getDate()} ${SHORT[d.getMonth()]}`;
};

/** "12 Oct 2026" */
export const fmtLong = (s: string | null) => {
  if (!s) return "";
  const d = fromISO(s);
  return `${d.getDate()} ${SHORT[d.getMonth()]} ${d.getFullYear()}`;
};
