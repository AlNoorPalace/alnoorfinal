export const LIMITS = {
  maxNights: 365,
  maxRooms: 6,
  maxAdults: 10,
  maxChildren: 6,
  maxAdvanceDays: 365,
} as const;

/** Today's date (YYYY-MM-DD) in India, where the hotels are. */
export const todayIST = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

export const diffDays = (a: string, b: string) => {
  const t = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((t(b) - t(a)) / 86400000);
};
