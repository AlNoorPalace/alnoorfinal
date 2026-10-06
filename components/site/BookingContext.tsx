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
import { getHotel } from "../../data/hotels";

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
  const [search, setSearchState] = useState<SearchState>(DEFAULT);
  const [modalOpen, setModalOpen] = useState(false);
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
    if (typeof q === "string" && getHotel(q)) setSearch({ hotel: q });
  }, [router.isReady, router.query.hotel, setSearch]);

  const focusBar = useCallback(
    (hotel?: string) => {
      if (hotel) setSearch({ hotel });
      const el =
        typeof document !== "undefined"
          ? document.getElementById("booking-console")
          : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
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
      preferredRoom,
      openModal,
      closeModal,
      focusBar,
      reserve,
    }),
    [search, setSearch, modalOpen, preferredRoom, openModal, closeModal, focusBar, reserve]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
