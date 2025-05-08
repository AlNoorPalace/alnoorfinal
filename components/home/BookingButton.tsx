import React, { useState } from "react";
import BookingModal, { BookingData } from "../modals/BookingModal";

interface BookingButtonProps {
  roomType?: string;
  roomPrice?: number;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  children?: React.ReactNode;
}

const BookingButton: React.FC<BookingButtonProps> = ({
  roomType = "Standard Room",
  roomPrice = 50,
  className = "",
  variant = "primary",
  children = "Book Now",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookingSubmit = (bookingData: BookingData) => {
    // Here you would typically send the booking data to your API
    console.log("Booking submitted:", bookingData);

    // For now, just show a confirmation alert
    alert(`Thank you for booking with Al Noor Hotel! 
      Your booking for ${bookingData.roomType} has been received.
      A confirmation email will be sent to ${bookingData.email}.`);
  };

  // Define button styles based on variant
  let buttonStyles = "";

  switch (variant) {
    case "primary":
      buttonStyles = "bg-amber-600 hover:bg-amber-700 text-white";
      break;
    case "secondary":
      buttonStyles = "bg-blue-600 hover:bg-blue-700 text-white";
      break;
    case "outline":
      buttonStyles =
        "bg-transparent border border-amber-600 text-amber-600 hover:bg-amber-50";
      break;
    default:
      buttonStyles = "bg-amber-600 hover:bg-amber-700 text-white";
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-4 py-2 rounded-md transition duration-300 font-medium ${buttonStyles} ${className}`}
      >
        {children}
      </button>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
        roomType={roomType}
        roomPrice={roomPrice}
      />
    </>
  );
};

export default BookingButton;
