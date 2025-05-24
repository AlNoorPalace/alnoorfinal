import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, ChevronRight, X } from "lucide-react";
import styles from "../../index.module.css";

// Import needed types and data from rooms component
interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  branch: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfDays: number;
  additionalQuery: string;
  customLocation?: string;
  roomType: string; // Added room type selection
}

interface BranchData {
  name: string;
  phone: string;
  email: string;
  price: number;
}

// Room type data
interface RoomType {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}

const BookNowDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState("below");
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Form states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    phone: "",
    email: "",
    branch: "Triplicane Branch",
    checkInDate: "",
    checkOutDate: "",
    numberOfDays: 1,
    additionalQuery: "",
    customLocation: "",
    roomType: "", // Default empty room type
  });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});

  // Room types data
  const roomTypes: RoomType[] = [
    {
      name: "Deluxe Room",
      price: "₹3,499/night",
      features: ["1 King Bed", "Free WiFi", "Air Conditioning"],
    },
    {
      name: "Premium Suite",
      price: "₹4,299/night",
      features: ["1 King Bed", "City View", "Free Breakfast"],
      featured: true,
    },
    {
      name: "Executive Room",
      price: "₹3,799/night",
      features: ["Twin Beds", "Work Desk", "Mini Bar"],
    },
    {
      name: "Family Suite",
      price: "₹5,299/night",
      features: ["2 Beds", "Living Area", "Kitchenette"],
    },
  ];

  // Branch data - only these locations are available
  const branches: BranchData[] = [
    {
      name: "Triplicane Branch",
      phone: "7338944222",
      email: "booking@alnoorpalace.in",
      price: 3499,
    },
    {
      name: "Parrys Branch",
      phone: "7338955111",
      email: "booking@alnoorresidency.in",
      price: 3799,
    },
    {
      name: "Bengaluru Branch",
      phone: "8951777883",
      email: "booking.blr@alnoorpalace.in",
      price: 4299,
    },
    {
      name: "Other", // Add "Other" option
      phone: "",
      email: "",
      price: 3999, // Default price
    },
  ];

  // Filter branches based on search term (excluding "Other" from search results)
  const filteredBranches = branches.filter(
    (branch) =>
      branch.name !== "Other" &&
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Calculate number of days between check-in and check-out dates
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (daysDiff > 0) {
        setFormData((prev) => ({ ...prev, numberOfDays: daysDiff }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Check if dropdown would be cut off at bottom of screen and reposition if needed
  useEffect(() => {
    const positionDropdown = () => {
      if (buttonRef.current && dropdownRef.current && isOpen) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight;
        const windowHeight = window.innerHeight;

        // Calculate if dropdown would go off screen
        const spaceBelow = windowHeight - buttonRect.bottom;
        const wouldOverflow = spaceBelow < dropdownHeight + 10; // Add a small buffer

        // Set position based on available space
        setDropdownPosition(wouldOverflow ? "above" : "below");
      }
    };

    // Position dropdown immediately when opened
    if (isOpen) {
      positionDropdown();
      // Also set a small timeout to make sure everything is rendered
      setTimeout(positionDropdown, 10);
    }

    // Add resize listener to reposition if window changes
    window.addEventListener("resize", positionDropdown);
    return () => window.removeEventListener("resize", positionDropdown);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when closing dropdown
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Format price with commas
  const formatPrice = (price) => {
    return price ? price.toLocaleString() : "";
  };

  const handleBranchSelect = (branch) => {
    console.log(`Selected branch: ${branch.name}`);
    setIsOpen(false);

    // Set the selected branch and open the booking form
    setSelectedBranch(branch);

    // Initialize form with selected branch and default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    setFormData({
      name: "",
      phone: "",
      email: "",
      branch: branch.name,
      checkInDate: formatDateForInput(tomorrow),
      checkOutDate: formatDateForInput(dayAfterTomorrow),
      numberOfDays: 1,
      additionalQuery: "",
      customLocation: "",
      roomType: "", // No room selected by default
    });

    setFormSubmitted(false);
    setShowBookingForm(true);
  };

  const handleCantFindLocation = () => {
    // Open booking form with "Other" branch selected by default
    console.log(
      "User can't find location, showing form with Other branch option"
    );
    setIsOpen(false);

    // Find the "Other" branch option
    const otherBranch = branches.find((branch) => branch.name === "Other");

    // Set the selected branch to "Other"
    setSelectedBranch(otherBranch);

    // Initialize form with default dates and "Other" branch selected
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    setFormData({
      name: "",
      phone: "",
      email: "",
      branch: "Other",
      checkInDate: formatDateForInput(tomorrow),
      checkOutDate: formatDateForInput(dayAfterTomorrow),
      numberOfDays: 1,
      additionalQuery: "",
      customLocation: searchTerm || "", // Pre-fill with current search if any
      roomType: "", // No room selected by default
    });

    setFormSubmitted(false);
    setShowBookingForm(true);
  };

  // Handle room type selection
  const handleRoomTypeSelect = (roomName) => {
    setFormData((prev) => ({
      ...prev,
      roomType: roomName,
    }));
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (formErrors[name as keyof BookingFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Partial<BookingFormData> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Validate custom location if "Other" branch is selected
    if (formData.branch === "Other" && !formData.customLocation?.trim()) {
      errors.customLocation = "Please specify your desired location";
    }

    if (!formData.checkInDate) {
      errors.checkInDate = "Check-in date is required";
    }

    if (!formData.checkOutDate) {
      errors.checkOutDate = "Check-out date is required";
    } else if (
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      errors.checkOutDate = "Check-out date must be after check-in date";
    }

    // Validate room type selection
    if (!formData.roomType) {
      errors.roomType = "Please select a room type";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log("Form submitted:", formData);
      console.log("Selected branch:", selectedBranch);

      // Show success message
      setFormSubmitted(true);

      // In a real implementation, you would send this data to your backend
      const emailBody = `
        Booking Details:
        ----------------
        Branch: ${formData.branch}
        ${
          formData.branch === "Other"
            ? `Desired Location: ${formData.customLocation}`
            : ""
        }
        Guest Name: ${formData.name}
        Phone: ${formData.phone}
        Email: ${formData.email}
        Check-in Date: ${formData.checkInDate}
        Check-out Date: ${formData.checkOutDate}
        Number of Days: ${formData.numberOfDays}
        Room Type: ${formData.roomType}
        Additional Query: ${formData.additionalQuery || "None"}
      `;

      console.log("Email body:", emailBody);

      // Close the form after 3 seconds
      setTimeout(() => {
        setShowBookingForm(false);
      }, 3000);
    }
  };

  // Find the selected room type object
  const selectedRoomType = formData.roomType
    ? roomTypes.find((room) => room.name === formData.roomType)
    : null;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.bookNowBtn} bg-green-800 text-white py-3 px-6 w-48 rounded hover:bg-green-700 transition-all duration-300 flex items-center justify-center`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        BOOK NOW
        {isOpen ? (
          <ChevronUp className="ml-2 h-5 w-5" />
        ) : (
          <ChevronDown className="ml-2 h-5 w-5" />
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`${styles.dropdownMenu} absolute ${
            dropdownPosition === "above" ? "bottom-full mb-1" : "top-full mt-1"
          } right-0 z-50 w-64 bg-white rounded-md shadow-lg border border-gray-200 transition-all duration-200 animate-fadeIn`}
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h4 className="font-medium text-gray-700">Select Branch</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close dropdown"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className={`${styles.searchBox} p-3 border-b border-gray-200`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Branch List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredBranches.length > 0 ? (
              <ul className="w-full">
                {filteredBranches.map((branch, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleBranchSelect(branch)}
                      className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors duration-150 border-b border-gray-100 text-sm"
                    >
                      <span className="font-medium text-gray-800">
                        {branch.name}
                      </span>
                      <ChevronRight className="h-3 w-3 ml-1 text-green-700" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 px-4 text-center">
                <p className="text-gray-600 mb-3 text-sm">
                  No branches match your search.
                </p>
                <button
                  onClick={() => handleCantFindLocation()}
                  className="bg-green-800 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors duration-200 w-full"
                >
                  Let us find the hotel for you
                </button>
              </div>
            )}
          </div>

          {/* Can't find location option - always at bottom */}
          {filteredBranches.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleCantFindLocation()}
                className="text-green-700 font-medium text-xs w-full text-center py-1 px-1 hover:text-green-800 hover:underline transition-colors duration-150"
              >
                Didn't find your location? Let us find you the hotel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Side Panel */}
      {showBookingForm && selectedBranch && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => !formSubmitted && setShowBookingForm(false)}
          />
          <div
            className={`${styles.sidePanel} ${
              showBookingForm ? styles.sidePanelOpen : ""
            }`}
          >
            {/* Close button for the side panel */}
            {!formSubmitted && (
              <button
                onClick={() => setShowBookingForm(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {formSubmitted ? (
              <div className={styles.successMessage}>
                <h3>Thank You!</h3>
                <p>
                  Your booking request for{" "}
                  {formData.branch === "Other"
                    ? formData.customLocation
                    : selectedBranch.name}{" "}
                  has been submitted successfully.
                </p>
                <p>We will contact you shortly to confirm your reservation.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.formTitle}>Book {selectedBranch.name}</h3>

                <form
                  onSubmit={handleSubmitForm}
                  className={styles.bookingForm}
                >
                  <div className={styles.formGroup}>
                    <label htmlFor="name">
                      Full Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? styles.inputError : ""}
                      required
                    />
                    {formErrors.name && (
                      <span className={styles.errorText}>
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone">
                      Phone Number <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? styles.inputError : ""}
                      required
                    />
                    {formErrors.phone && (
                      <span className={styles.errorText}>
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      Email Address <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? styles.inputError : ""}
                      required
                    />
                    {formErrors.email && (
                      <span className={styles.errorText}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="branch">
                      Select Branch <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      className={formErrors.branch ? styles.inputError : ""}
                      required
                    >
                      <option value="Triplicane Branch">
                        Triplicane Branch
                      </option>
                      <option value="Parrys Branch">Parrys Branch</option>
                      <option value="Bengaluru Branch">Bengaluru Branch</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Location field - shown only when "Other" is selected */}
                  {formData.branch === "Other" && (
                    <div className={styles.formGroup}>
                      <label htmlFor="customLocation">
                        Preferred Location{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="customLocation"
                        name="customLocation"
                        value={formData.customLocation}
                        onChange={handleInputChange}
                        className={
                          formErrors.customLocation ? styles.inputError : ""
                        }
                        placeholder="Enter your preferred location"
                        required
                      />
                      {formErrors.customLocation && (
                        <span className={styles.errorText}>
                          {formErrors.customLocation}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="checkInDate">
                        Check-in Date <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="date"
                        id="checkInDate"
                        name="checkInDate"
                        value={formData.checkInDate}
                        onChange={handleInputChange}
                        className={
                          formErrors.checkInDate ? styles.inputError : ""
                        }
                        required
                        min={formatDateForInput(new Date())}
                      />
                      {formErrors.checkInDate && (
                        <span className={styles.errorText}>
                          {formErrors.checkInDate}
                        </span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="checkOutDate">
                        Check-out Date{" "}
                        <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="date"
                        id="checkOutDate"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        onChange={handleInputChange}
                        className={
                          formErrors.checkOutDate ? styles.inputError : ""
                        }
                        required
                        min={formData.checkInDate}
                      />
                      {formErrors.checkOutDate && (
                        <span className={styles.errorText}>
                          {formErrors.checkOutDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="numberOfDays">Number of Days</label>
                    <input
                      type="number"
                      id="numberOfDays"
                      name="numberOfDays"
                      value={formData.numberOfDays}
                      onChange={handleInputChange}
                      min="1"
                      readOnly
                    />
                  </div>

                  {/* Room Type Selection */}
                  <div className={styles.formGroup}>
                    <label>
                      Select Room Type{" "}
                      <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.roomTypesGrid}>
                      {roomTypes.map((room, index) => (
                        <div
                          key={index}
                          className={
                            formData.roomType === room.name
                              ? styles.roomTypeCardSelected
                              : styles.roomTypeCard
                          }
                          onClick={() => handleRoomTypeSelect(room.name)}
                        >
                          <div className={styles.roomTitle}>
                            {room.name}
                            {room.featured && (
                              <span className={styles.featuredRoom}>
                                Featured
                              </span>
                            )}
                          </div>
                          <div className={styles.roomPrice}>{room.price}</div>
                          <div className={styles.roomFeatures}>
                            {room.features.join(" • ")}
                          </div>
                        </div>
                      ))}
                    </div>
                    {formErrors.roomType && (
                      <span className={styles.errorText}>
                        {formErrors.roomType}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="additionalQuery">
                      Additional Requests or Queries
                    </label>
                    <textarea
                      id="additionalQuery"
                      name="additionalQuery"
                      value={formData.additionalQuery}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  {selectedRoomType && (
                    <div className={styles.formTotal}>
                      <span>Total Amount:</span>
                      <span>
                        {selectedRoomType.price.split("/")[0]} x{" "}
                        {formData.numberOfDays} = ₹
                        {(
                          parseInt(
                            selectedRoomType.price.replace(/[^\d]/g, "")
                          ) * formData.numberOfDays
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className={styles.formButtons}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowBookingForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={styles.submitButton}>
                      Submit Booking
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookNowDropdown;
