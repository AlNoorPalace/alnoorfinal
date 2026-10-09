/** The pictures on the website that the admin can change. Each falls back to its bundled picture. */
export const SITE_IMAGE_SLOTS = [
  { key: "hero", label: "Home page banner", where: "The big picture at the very top of the home page", fallback: "/img/hero-facade.webp" },
  { key: "about_main", label: "About: main picture", where: "Home page, About section (large picture)", fallback: "/img/lobby.webp" },
  { key: "about_entrance", label: "About: top-right picture", where: "Home page, About section (small picture, top right)", fallback: "/img/entrance.webp" },
  { key: "about_corridor", label: "About: bottom-left picture", where: "Home page, About section (small picture, bottom left)", fallback: "/img/corridor.webp" },
  { key: "corporate_bg", label: "Corporate section background", where: "Home page, Corporate section (faded background)", fallback: "/img/facade-close.webp" },
  { key: "final_cta_bg", label: "Bottom banner background", where: "Home page, 'Your stay awaits' section at the bottom", fallback: "/img/night-facade.webp" },
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_SLOTS)[number]["key"];
export type SiteImages = Record<SiteImageKey, string>;

export const SITE_IMAGE_KEYS = SITE_IMAGE_SLOTS.map((s) => s.key) as [SiteImageKey, ...SiteImageKey[]];

export const DEFAULT_SITE_IMAGES = Object.fromEntries(SITE_IMAGE_SLOTS.map((s) => [s.key, s.fallback])) as SiteImages;

