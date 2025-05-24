import React, { useState } from "react";
import {
  FaHandshake,
  FaUserTie,
  FaMugHot,
  FaWifi,
  FaConciergeBell,
  FaPrint,
  FaBriefcase,
  FaTimes,
} from "react-icons/fa";

const CorporateSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    branch: "",
    checkIn: "",
    checkOut: "",
    numberOfDays: "",
    roomType: "",
    additionalRequests: "",
    isCorporateBooking: true,
  });

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Create a new style object for the corporate section
  const corporateStyles = {
    corporateSection: {
      marginTop: "3rem",
      padding: "2rem",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #fdf1e0 0%, #fdf1e0 100%)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      border: "1px solid #d0d9f0",
      textAlign: "center" as const,
      position: "relative" as const,
    },
    headingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1.5rem",
      gap: "0.75rem",
    },
    iconWrapper: {
      background: "#3E48A8",
      color: "white",
      borderRadius: "50%",
      padding: "0.6rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#3E48A8",
      margin: 0,
    },
    highlight: {
      color: "#e74c3c",
      fontWeight: "700",
      fontSize: "1.8rem",
    },
    description: {
      fontSize: "1rem",
      maxWidth: "800px",
      margin: "0 auto 1.5rem",
      color: "#555",
    },
    amenitiesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1.5rem",
      marginTop: "1.5rem",
    },
    amenityCard: {
      background: "white",
      padding: "1.25rem 1rem",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      cursor: "default",
    },
    amenityIcon: {
      fontSize: "2rem",
      color: "#3E48A8",
      marginBottom: "0.75rem",
    },
    amenityTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "0.5rem",
      color: "#333",
    },
    amenityDescription: {
      fontSize: "0.85rem",
      color: "#666",
      margin: 0,
    },
    ctaButton: {
      background: "#3E48A8",
      color: "white",
      border: "none",
      padding: "0.75rem 2rem",
      borderRadius: "50px",
      fontSize: "1rem",
      fontWeight: "600",
      marginTop: "2rem",
      cursor: "pointer",
      transition: "background 0.3s ease",
      boxShadow: "0 4px 10px rgba(62, 72, 168, 0.3)",
    },
    formOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      zIndex: 1000,
      padding: "1rem",
      overflowY: "auto" as const,
      backdropFilter: "blur(5px)",
    },
    formContainer: {
      background: "white",
      borderRadius: "16px",
      padding: "2rem",
      width: "100%",
      maxWidth: "900px",
      minHeight: "fit-content",
      maxHeight: "calc(100vh - 2rem)",
      overflowY: "auto" as const,
      position: "relative" as const,
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
      margin: "1rem 0",
      transform: "translateZ(0)",
      WebkitOverflowScrolling: "touch" as const,
    },
    closeButton: {
      position: "absolute" as const,
      top: "1rem",
      right: "1rem",
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#666",
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#3E48A8",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
    },
    corporateCheckbox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      marginBottom: "1.5rem",
      padding: "1rem",
      background: "#f0f4ff",
      borderRadius: "8px",
      border: "1px solid #3E48A8",
    },
    checkbox: {
      width: "20px",
      height: "20px",
      accentColor: "#3E48A8",
    },
    checkboxLabel: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#3E48A8",
      margin: 0,
    },
    formGroup: {
      marginBottom: "1.25rem",
      textAlign: "left" as const,
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontSize: "0.9rem",
      fontWeight: "600",
      color: "#444",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      boxSizing: "border-box" as const,
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      backgroundColor: "white",
      boxSizing: "border-box" as const,
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      minHeight: "100px",
      resize: "vertical" as const,
      boxSizing: "border-box" as const,
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      gap: "1rem",
      marginTop: "2rem",
      flexWrap: "wrap" as const,
    },
    cancelButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "50px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      background: "#f1f1f1",
      color: "#666",
      border: "none",
      transition: "background 0.3s ease",
      minWidth: "120px",
      flex: "1",
    },
    submitButton: {
      padding: "0.75rem 1.5rem",
      borderRadius: "50px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      background: "#3E48A8",
      color: "white",
      border: "none",
      transition: "background 0.3s ease",
      boxShadow: "0 4px 10px rgba(62, 72, 168, 0.3)",
      minWidth: "120px",
      flex: "1",
    },
    roomTypesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "1rem",
      marginTop: "0.5rem",
    },
    roomTypeCard: {
      border: "1px solid #ddd",
      borderRadius: "6px",
      padding: "1rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    roomTypeCardSelected: {
      border: "2px solid #3E48A8",
      borderRadius: "6px",
      padding: "1rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 10px rgba(62, 72, 168, 0.2)",
    },
    roomTitle: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
      color: "#333",
    },
    roomPrice: {
      fontSize: "1rem",
      fontWeight: "bold",
      color: "#e74c3c",
      marginBottom: "0.5rem",
    },
    totalAmount: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      color: "#3E48A8",
      textAlign: "center" as const,
      margin: "1rem 0",
      padding: "1rem",
      background: "#f0f4ff",
      borderRadius: "8px",
    },
    required: {
      color: "#e74c3c",
    },
  };

  // Add responsive styles and media queries
  const getResponsiveStyles = () => {
    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth <= 1024 && windowWidth > 768;

    return {
      formContainer: {
        ...corporateStyles.formContainer,
        padding: isMobile ? "1.5rem" : "2rem",
        margin: isMobile ? "0.5rem" : "1rem 0",
        maxWidth: isMobile ? "100%" : isTablet ? "700px" : "900px",
      },
      roomTypesGrid: {
        ...corporateStyles.roomTypesGrid,
        gridTemplateColumns: isMobile
          ? "1fr"
          : "repeat(auto-fit, minmax(280px, 1fr))",
      },
      buttonGroup: {
        ...corporateStyles.buttonGroup,
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
      },
      formTitle: {
        ...corporateStyles.formTitle,
        fontSize: isMobile ? "1.3rem" : "1.5rem",
      },
      corporateCheckbox: {
        ...corporateStyles.corporateCheckbox,
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
        textAlign: isMobile ? ("center" as const) : ("left" as const),
      },
    };
  };

  const corporateAmenities = [
    {
      title: "Dedicated Workspace",
      icon: <FaBriefcase />,
      description: "Spacious work areas in each room",
    },
    {
      title: "Meeting Facilities",
      icon: <FaHandshake />,
      description: "Conference rooms with modern equipment",
    },
    {
      title: "Premium Wi-Fi",
      icon: <FaWifi />,
      description: "High-speed internet for business needs",
    },
    {
      title: "Concierge Service",
      icon: <FaConciergeBell />,
      description: "Assistance with business arrangements",
    },
    {
      title: "Business Center",
      icon: <FaPrint />,
      description: "Printing, scanning, and other services",
    },
    {
      title: "Complimentary Breakfast",
      icon: <FaMugHot />,
      description: "Start your day with a fresh breakfast",
    },
  ];

  const roomTypes = [
    {
      name: "Deluxe",
      price: 799,
      displayPrice: "₹799 onwards",
      description:
        "Our cozy Deluxe room offers comfort and convenience for your stay.",
      features: ["1 Bed", "1 Bath", "Free WiFi"],
    },
    {
      name: "Deluxe Triple",
      price: 1500,
      displayPrice: "₹1,500 onwards",
      description:
        "Perfect for families or small groups, our Deluxe Triple offers spacious accommodation.",
      features: ["3 Beds", "1 Bath", "Free WiFi"],
    },
    {
      name: "Deluxe Quad",
      price: 2000,
      displayPrice: "₹2,000 onwards",
      description:
        "Our Deluxe Quad room provides ample space for four guests with additional amenities.",
      features: ["4 Beds", "1 Bath", "Free WiFi"],
    },
    {
      name: "King Suite",
      price: 2500,
      displayPrice: "₹2,500 onwards",
      description:
        "Experience luxury in our King Suite featuring elegant decor and premium bedding.",
      features: ["2 Beds", "1 Bath", "Free WiFi"],
      featured: true,
    },
    {
      name: "Residential Suite",
      price: 3000,
      displayPrice: "₹3,000 onwards",
      description:
        "Our most spacious and luxurious offering with all the comforts of home.",
      features: ["2 Beds", "1 Bath", "Free WiFi"],
      featured: true,
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRoomTypeSelect = (roomName: string) => {
    setFormData({
      ...formData,
      roomType: roomName,
    });
  };

  const calculateTotalAmount = () => {
    if (!formData.roomType || !formData.numberOfDays) return 0;

    const selectedRoom = roomTypes.find(
      (room) => room.name === formData.roomType
    );
    if (!selectedRoom) return 0;

    const baseAmount = selectedRoom.price * parseInt(formData.numberOfDays);
    // Apply 20% corporate discount
    const discount = formData.isCorporateBooking ? 0.2 : 0;
    const discountedAmount = baseAmount * (1 - discount);

    return discountedAmount;
  };

  const [isSubmitting,setIsSubmitting]=useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(formData);
    e.preventDefault();
  
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      const response = await fetch("/api/send-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.email,
          branch: formData.branch+" Branch",
          checkin: formData.checkIn,
          checkout: formData.checkOut,
          days: formData.numberOfDays,
          room_type: formData.roomType,
          query: formData.additionalRequests,
          isCorporateBooking: formData.isCorporateBooking, 
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("Thank you for your booking request! We will contact you shortly.");
        setShowForm(false);
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          branch: "",
          checkIn: "",
          checkOut: "",
          numberOfDays: "",
          roomType: "",
          additionalRequests: "",
          isCorporateBooking: true

        });
      } else {
        console.error("Booking API error:", result.error);
        alert("❌ Failed to send booking. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending booking:", error);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate number of days when check-in or check-out dates change
  React.useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData((prev) => ({
        ...prev,
        numberOfDays: diffDays.toString(),
      }));
    }
  }, [formData.checkIn, formData.checkOut]);

  return (
    <div style={corporateStyles.corporateSection}>
      <div style={corporateStyles.headingContainer}>
        <div style={corporateStyles.iconWrapper}>
          <FaUserTie size={24} />
        </div>
        <h2 style={corporateStyles.title}>Corporate Accommodations</h2>
      </div>

      <p style={corporateStyles.description}>
        We offer special rates and premium amenities for business travelers and
        corporate clients. Enjoy a comfortable stay with everything you need for
        a productive business trip.
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <span style={corporateStyles.highlight}>20% DISCOUNT</span>
        <span style={{ fontWeight: "600", color: "#444" }}>
          on corporate bookings
        </span>
      </div>

      <div style={corporateStyles.amenitiesGrid}>
        {corporateAmenities.map((amenity, index) => (
          <div key={index} style={corporateStyles.amenityCard}>
            <div style={corporateStyles.amenityIcon}>{amenity.icon}</div>
            <h3 style={corporateStyles.amenityTitle}>{amenity.title}</h3>
            <p style={corporateStyles.amenityDescription}>
              {amenity.description}
            </p>
          </div>
        ))}
      </div>

      <button
        style={corporateStyles.ctaButton}
        onClick={() => setShowForm(true)}
      >
        Contact for Corporate Bookings
      </button>

      {showForm && (
        <div style={corporateStyles.formOverlay}>
          <div style={getResponsiveStyles().formContainer}>
            <button
              style={corporateStyles.closeButton}
              onClick={() => setShowForm(false)}
            >
              <FaTimes />
            </button>
            <h3 style={getResponsiveStyles().formTitle}>
              Hotel Booking Request
            </h3>

            <div style={getResponsiveStyles().corporateCheckbox}>
              <input
                type="checkbox"
                id="corporateBooking"
                name="isCorporateBooking"
                checked={formData.isCorporateBooking}
                onChange={handleInputChange}
                style={corporateStyles.checkbox}
              />
              <label
                htmlFor="corporateBooking"
                style={corporateStyles.checkboxLabel}
              >
                Corporate Booking (20% Discount Applied)
              </label>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Full Name <span style={corporateStyles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  required
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Phone Number <span style={corporateStyles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  required
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Email Address <span style={corporateStyles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  required
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Select Branch <span style={corporateStyles.required}>*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  style={corporateStyles.select}
                  required
                >
                  <option value="">Select a Branch</option>
                  <option value="Triplicane">Triplicane Branch</option>
                  <option value="Parrys">Parrys Branch</option>
                  <option value="Bengaluru">Bengaluru Branch</option>
                  <option value="Other">Other Branch</option>
                </select>
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Check-in Date <span style={corporateStyles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  required
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Check-out Date <span style={corporateStyles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  required
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>Number of Days</label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  style={corporateStyles.input}
                  readOnly
                />
              </div>

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Select Room Type{" "}
                  <span style={corporateStyles.required}>*</span>
                </label>
                <div style={getResponsiveStyles().roomTypesGrid}>
                  {roomTypes.map((room, index) => (
                    <div
                      key={index}
                      style={
                        formData.roomType === room.name
                          ? corporateStyles.roomTypeCardSelected
                          : corporateStyles.roomTypeCard
                      }
                      onClick={() => handleRoomTypeSelect(room.name)}
                    >
                      <div style={corporateStyles.roomTitle}>
                        {room.name}
                        {room.featured && (
                          <span style={{ color: "#e74c3c", marginLeft: "8px" }}>
                            Featured
                          </span>
                        )}
                      </div>
                      <div style={corporateStyles.roomPrice}>
                        {room.displayPrice}
                      </div>
                      <div
                        style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}
                      >
                        {room.features.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.roomType && formData.numberOfDays && (
                <div style={corporateStyles.totalAmount}>
                  Total Amount: ₹{calculateTotalAmount().toLocaleString()}
                  {formData.isCorporateBooking && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#e74c3c",
                        marginTop: "0.5rem",
                      }}
                    >
                      (20% Corporate Discount Applied)
                    </div>
                  )}
                </div>
              )}

              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Additional Requests or Queries{" "}
                  {formData.branch === "Other" && "- Mention Branch Name"}
                </label>
                <textarea
                  name="additionalRequests"
                  value={formData.additionalRequests}
                  onChange={handleInputChange}
                  style={corporateStyles.textarea}
                  placeholder={
                    formData.branch === "Other"
                      ? "Please mention the branch name and any other requests..."
                      : "Any special requests or queries..."
                  }
                ></textarea>
              </div>

              <div style={getResponsiveStyles().buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={corporateStyles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" style={corporateStyles.submitButton} disabled={isSubmitting}>
                {isSubmitting?"Sending":"Submit Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateSection;
