// Typed interface for room data

export interface RoomData {
  title: string;
  image: string;
  bathCount: number;
  bedCount: number;
  hasWifi: boolean;
  description: string;
  pricePerNight: number;
  inclusions: string[];        // ✅ Add this
  amenities: string[];         // ✅ Add this
  featured?: boolean;          // ✅ Optional field for featured rooms
}

// Typed interface for service data
export interface ServiceData {
  title: string;
  icon: string;
  description: string;
}

// Typed interface for review data
export type ReviewData = {
  quote: string;
  name: string;
  img: string;
};

// Stats interface
export interface StatData {
  label: string;
  value: number;
}
