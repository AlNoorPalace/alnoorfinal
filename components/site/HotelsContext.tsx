import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { HOTELS, Hotel } from "../../data/hotels";

const Ctx = createContext<Hotel[]>(HOTELS);

/**
 * Makes the current list of hotels available to every component. Pages load
 * the list from the database (getStaticProps) and pass it down via pageProps;
 * the built-in copy is the fallback.
 */
export function HotelsProvider({ hotels, children }: { hotels?: Hotel[]; children: ReactNode }) {
  const [list, setList] = useState<Hotel[]>(hotels ?? HOTELS);
  useEffect(() => {
    if (hotels) setList(hotels);
  }, [hotels]);
  return <Ctx.Provider value={hotels ?? list}>{children}</Ctx.Provider>;
}

export const useHotels = () => useContext(Ctx);
