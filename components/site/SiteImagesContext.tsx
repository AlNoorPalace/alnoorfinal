import { createContext, ReactNode, useContext } from "react";
import { DEFAULT_SITE_IMAGES, SiteImageKey, SiteImages } from "../../lib/siteImagesDefaults";

const Ctx = createContext<SiteImages>(DEFAULT_SITE_IMAGES);

/** The website's changeable pictures (set in the admin). Pages pass them in via pageProps; the bundled pictures are the fallback. */
export function SiteImagesProvider({ images, children }: { images?: Partial<SiteImages>; children: ReactNode }) {
  return <Ctx.Provider value={{ ...DEFAULT_SITE_IMAGES, ...images }}>{children}</Ctx.Provider>;
}

export const useSiteImage = (slot: SiteImageKey): string => useContext(Ctx)[slot];
