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
  });

  // Create a new style object for the corporate section that inherits from the existing styles
  const corporateStyles = {
    corporateSection: {
      marginTop: "3rem",
      padding: "2rem",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)",
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
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    formContainer: {
      background: "white",
      borderRadius: "12px",
      padding: "2rem",
      width: "90%",
      maxWidth: "800px",
      maxHeight: "90vh",
      overflowY: "auto" as const,
      position: "relative" as const,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
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
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      backgroundColor: "white",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "1rem",
      minHeight: "100px",
      resize: "vertical" as const,
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "1.5rem",
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
    },
    roomTypesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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
    required: {
      color: "#e74c3c",
    },
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
      price: "₹2,500",
      description:
        "Our cozy Deluxe room offers comfort and convenience for your stay. Featuring modern amenities for a refreshing experience.",
      features: ["1 Bed", "1 Bath", "Free WiFi"],
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar",
        "Dental Kit/Soap/Shampoo/Shaving Kit/Comb",
      ],
    },
    {
      name: "Deluxe Triple",
      price: "₹3,500",
      description:
        "Perfect for families or small groups, our Deluxe Triple offers spacious accommodation with all essential amenities for a comfortable stay.",
      features: ["3 Beds", "1 Bath", "Free WiFi"],
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
    {
      name: "Deluxe Quad",
      price: "₹4,000",
      description:
        "Our Deluxe Quad room provides ample space for four guests with additional amenities. Enjoy premium bedding and modern facilities throughout your stay.",
      features: ["4 Beds", "1 Bath", "Free WiFi"],
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
    {
      name: "King Suite",
      price: "₹4,500",
      description:
        "Experience luxury in our King Suite featuring elegant decor, premium bedding, and spacious living area. Perfect for those seeking an elevated stay experience.",
      features: ["2 Beds", "1 Bath", "Free WiFi"],
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
      featured: true,
    },
    {
      name: "Residential Suite",
      price: "₹6,000",
      description:
        "Our most spacious and luxurious offering. The Residential Suite provides all the comforts of home with the luxury of a premium hotel stay.",
      features: ["2 Beds", "1 Bath", "Free WiFi"],
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
      featured: true,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoomTypeSelect = (roomName: string) => {
    setFormData({
      ...formData,
      roomType: roomName,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    alert("Thank you for your booking request! We will contact you shortly.");
    setShowForm(false);
    // Reset form data
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
    });
  };

  // Calculate number of days when check-in or check-out dates change
  React.useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setFormData({
        ...formData,
        numberOfDays: diffDays.toString(),
      });
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
          <div style={corporateStyles.formContainer}>
            <button
              style={corporateStyles.closeButton}
              onClick={() => setShowForm(false)}
            >
              <FaTimes />
            </button>
            <h3 style={corporateStyles.formTitle}>Corporate Booking Request</h3>
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
                <div style={corporateStyles.roomTypesGrid}>
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
                      <div style={corporateStyles.roomPrice}>{room.price}</div>
                      <div
                        style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}
                      >
                        {room.features.join(" • ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={corporateStyles.formGroup}>
                <label style={corporateStyles.label}>
                  Additional Requests or Queries
                </label>
                <textarea
                  name="additionalRequests"
                  value={formData.additionalRequests}
                  onChange={handleInputChange}
                  style={corporateStyles.textarea}
                ></textarea>
              </div>
              <div style={corporateStyles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={corporateStyles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" style={corporateStyles.submitButton}>
                  Submit Booking
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
