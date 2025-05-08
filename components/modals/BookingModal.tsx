import React, { useState } from "react";
import { getTodayDate, getMinCheckoutDate } from "../utils/helpers";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingData) => void;
  roomType?: string;
  roomPrice?: number;
}

export interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  roomType: string;
  specialRequests: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roomType = "Standard Room",
  roomPrice = 50,
}) => {
  const todayDate = getTodayDate();
  const [formData, setFormData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    checkInDate: todayDate,
    checkOutDate: getMinCheckoutDate(todayDate),
    guests: 1,
    roomType: roomType,
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nights, setNights] = useState<number>(1);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is being modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckInDate = e.target.value;

    // Update check-in date
    setFormData((prev) => ({
      ...prev,
      checkInDate: newCheckInDate,
      // If check-out date becomes invalid, update it
      checkOutDate:
        new Date(newCheckInDate) >= new Date(prev.checkOutDate)
          ? getMinCheckoutDate(newCheckInDate)
          : prev.checkOutDate,
    }));

    // Recalculate nights
    updateNights(newCheckInDate, formData.checkOutDate);

    if (errors.checkInDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.checkInDate;
        return newErrors;
      });
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOutDate = e.target.value;
    setFormData((prev) => ({ ...prev, checkOutDate: newCheckOutDate }));

    // Recalculate nights
    updateNights(formData.checkInDate, newCheckOutDate);

    if (errors.checkOutDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.checkOutDate;
        return newErrors;
      });
    }
  };

  const updateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNights(diffDays > 0 ? diffDays : 1);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.checkInDate)
      newErrors.checkInDate = "Check-in date is required";
    if (!formData.checkOutDate)
      newErrors.checkOutDate = "Check-out date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalPrice = roomPrice * nights;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-amber-50">
          <h2 className="text-2xl font-semibold text-amber-800">
            Book Your Stay at Al Noor Hotel
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <span className="text-2xl font-bold">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Guest Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-amber-700 border-b pb-2">
                Guest Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name*
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name*
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone*
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+91 82000-60000"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Any special requests or requirements"
                />
              </div>
            </div>

            {/* Right Column - Booking Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg text-amber-700 border-b pb-2">
                Booking Details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <input
                  type="text"
                  value={formData.roomType}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-In Date*
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleCheckInChange}
                    min={todayDate}
                    className={`w-full p-2 border rounded-md ${
                      errors.checkInDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.checkInDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.checkInDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-Out Date*
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleCheckOutChange}
                    min={getMinCheckoutDate(formData.checkInDate)}
                    className={`w-full p-2 border rounded-md ${
                      errors.checkOutDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.checkOutDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.checkOutDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booking Summary */}
              <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-100">
                <h4 className="font-medium text-amber-800 mb-2">
                  Booking Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Room Type:</span>
                    <span className="font-medium">{formData.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span className="font-medium">{formData.checkInDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span className="font-medium">{formData.checkOutDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Nights:</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate per Night:</span>
                    <span className="font-medium">${roomPrice}</span>
                  </div>
                  <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span className="text-amber-800">${totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Complete Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
