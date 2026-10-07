import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/router";
import { findHotel } from "../../data/hotels";
import { useHotels } from "./HotelsContext";

export interface SearchState {
  hotel: string; // hotel slug, "" when unset
  checkIn: string | null; // YYYY-MM-DD
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
}

interface BookingCtx {
  search: SearchState;
  setSearch: (patch: Partial<SearchState>) => void;
  modalOpen: boolean;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  preferredRoom: string | null;
  openModal: (opts?: { hotel?: string; room?: string }) => void;
  closeModal: () => void;
  /** Scrolls to the booking bar (navigating home first when needed). */
  focusBar: (hotel?: string) => void;
  /** Opens the room picker when dates are set, otherwise guides to the bar. */
  reserve: (hotel?: string, room?: string) => void;
}

const DEFAULT: SearchState = {
  hotel: "",
  checkIn: null,
  checkOut: null,
  adults: 2,
  children: 0,
  rooms: 1,
};

const Ctx = createContext<BookingCtx | null>(null);

export const useBooking = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking must be used inside BookingProvider");
  return c;
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hotels = useHotels();
  const [search, setSearchState] = useState<SearchState>(DEFAULT);
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preferredRoom, setPreferredRoom] = useState<string | null>(null);

  const setSearch = useCallback(
    (patch: Partial<SearchState>) =>
      setSearchState((s) => ({ ...s, ...patch })),
    []
  );

  // Preselect a hotel from /?hotel=slug (used by links on other pages).
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.hotel;
    if (typeof q === "string" && findHotel(hotels, q)) setSearch({ hotel: q });
  }, [router.isReady, router.query.hotel, setSearch, hotels]);

  const focusBar = useCallback(
    (hotel?: string) => {
      if (hotel) setSearch({ hotel });
      const panel =
        typeof document !== "undefined"
          ? document.getElementById("hotel-booking")
          : null;
      if (panel) {
        // Hotel detail pages have their own booking panel.
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const el =
        typeof document !== "undefined"
          ? document.getElementById("booking-console")
          : null;
      if (el) {
        // On phones the search lives in a bottom sheet.
        if (window.matchMedia("(max-width: 1023px)").matches) {
          setSheetOpen(true);
        } else {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        router.push(
          hotel ? `/?hotel=${hotel}#booking-console` : "/#booking-console"
        );
      }
    },
    [router, setSearch]
  );

  const openModal = useCallback(
    (opts?: { hotel?: string; room?: string }) => {
      if (opts?.hotel) setSearch({ hotel: opts.hotel });
      setPreferredRoom(opts?.room ?? null);
      setModalOpen(true);
    },
    [setSearch]
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  const reserve = useCallback(
    (hotel?: string, room?: string) => {
      const slug = hotel ?? search.hotel;
      if (slug && search.checkIn && search.checkOut) {
        openModal({ hotel: slug, room });
      } else {
        focusBar(slug || undefined);
      }
    },
    [search.hotel, search.checkIn, search.checkOut, openModal, focusBar]
  );

  const value = useMemo(
    () => ({
      search,
      setSearch,
      modalOpen,
      sheetOpen,
      setSheetOpen,
      preferredRoom,
      openModal,
      closeModal,
      focusBar,
      reserve,
    }),
    [search, setSearch, modalOpen, sheetOpen, preferredRoom, openModal, closeModal, focusBar, reserve]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
