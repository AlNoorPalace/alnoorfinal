import { useState } from "react";
import { getTodayDate, getMinCheckoutDate } from "../utils/helpers";

const BookingForm: React.FC = () => {
  const [checkInDate, setCheckInDate] = useState<string>(getTodayDate());
  const [checkOutDate, setCheckOutDate] = useState<string>(
    getMinCheckoutDate(getTodayDate())
  );
  const [guests, setGuests] = useState<number>(1);

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckInDate = e.target.value;
    setCheckInDate(newCheckInDate);

    // Ensure checkout date is always after checkin date
    if (new Date(newCheckInDate) >= new Date(checkOutDate)) {
      setCheckOutDate(getMinCheckoutDate(newCheckInDate));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (e.g., check availability, redirect to booking page)
    console.log({
      checkInDate,
      checkOutDate,
      guests,
    });

    // Here you would typically call an API or navigate to a booking page
    alert("Checking availability for your stay!");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="checkIn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Check In
          </label>
          <input
            type="date"
            id="checkIn"
            value={checkInDate}
            onChange={handleCheckInChange}
            min={getTodayDate()}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-amber-300"
            required
          />
        </div>

        <div>
          <label
            htmlFor="checkOut"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Check Out
          </label>
          <input
            type="date"
            id="checkOut"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            min={getMinCheckoutDate(checkInDate)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-amber-300"
            required
          />
        </div>

        <div>
          <label
            htmlFor="guests"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Guests
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-amber-300"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition duration-300 font-medium"
        >
          Check Availability
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
