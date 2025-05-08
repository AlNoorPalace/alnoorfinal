import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "./index.module.css";

// Import components
import Header from "./components/layout/Header";
import Hero from "./components/home/Hero";
// import BookingForm from "./components/home/Bookingform";
import About from "./components/home/About";
import Stats from "./components/home/Stats";
import Rooms from "./components/home/Rooms";
import Services from "./components/home/Services";
import Reviews from "./components/home/Reviews";
// import CtaSection from "./components/home/CtaSection";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/shared/BacktoTop";
import CorporateSection from "./components/home/corporate";
import BookingModal from "./components/modals/BookingModal";

// Import types
import { RoomData, ServiceData, ReviewData } from "./components/types";

const LandingPage: NextPage = () => {
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for room booking modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

  // State for selected date range
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");

  // State for newsletter subscription
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const commonAmenities = [
    "Fridge",
    "Power Backup",
    "Free Parking",
    "Newspaper",
    "Wi-Fi",
    "Housekeeping",
    "Hair Conditioning",
    "Smoke Detector",
    "Laundry(PAID)",
    "24×7 Room Service",
    "Lift",
  ];
  // Room data array for better maintenance and scalability
  const rooms: RoomData[] = [
    {
      title: "Deluxe",
      image: "/Images/room-1 1.png",
      bathCount: 1,
      bedCount: 1,
      hasWifi: true,
      description:
        "Our cozy Deluxe room offers comfort and convenience for your stay. Featuring modern amenities for a refreshing experience.",
      pricePerNight: 2500,
      amenities: commonAmenities,
      inclusions: [
        "TV/Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar",
        "Dental Kit/Soap/Shampoo/Shaving Kit/Comb",
      ],
    },
    {
      title: "Deluxe Triple",
      image: "/Images/room-2 1.png",
      bathCount: 1,
      bedCount: 3,
      hasWifi: true,
      description:
        "Perfect for families or small groups, our Deluxe Triple offers spacious accommodation with all essential amenities for a comfortable stay.",
      pricePerNight: 3500,
      amenities: commonAmenities,
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
    {
      title: "Deluxe Quad",
      image: "/Images/room-3 1.png",
      bathCount: 1,
      bedCount: 4,
      hasWifi: true,
      description:
        "Our Deluxe Quad room provides ample space for four guests with additional amenities. Enjoy premium bedding and modern facilities throughout your stay.",
      pricePerNight: 4000,
      amenities: commonAmenities,
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
    {
      title: "King Suite",
      image: "/Images/room-4 1.png",
      bathCount: 1,
      bedCount: 2,
      hasWifi: true,
      description:
        "Experience luxury in our King Suite featuring elegant decor, premium bedding, and spacious living area. Perfect for those seeking an elevated stay experience.",
      pricePerNight: 4500,
      featured: true,
      amenities: commonAmenities,
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
    {
      title: "Residential Suite",
      image: "/Images/room-5 1.png",
      bathCount: 2,
      bedCount: 3,
      hasWifi: true,
      description:
        "Our premium Residential Suite offers an ultimate home-away-from-home experience with separate living and dining areas. Ideal for extended stays or family vacations.",
      pricePerNight: 6000,
      featured: true,
      amenities: commonAmenities,
      inclusions: [
        "TV",
        "Electric Kettle",
        "Toiletries",
        "Milk Powder/Tea Packet/Sugar Sachet",
      ],
    },
  ];

  // Services data array
  const services: ServiceData[] = [
    {
      title: "Rooms & Appartment",
      icon: "/Icons/building 1.svg",
      description:
        "Luxury accommodations with modern amenities and stunning views for a comfortable stay.",
    },
    {
      title: "Laundry Services",
      icon: "/Icons/laundry.svg", // Replace with actual icon path if different
      description:
        "Efficient and professional laundry services to keep your clothing fresh during your stay.",
    },
    {
      title: "Food & Restaurant",
      icon: "/Icons/restaurant 1.svg",
      description:
        "Exquisite dining experiences with diverse cuisines prepared by our master chefs.",
    },
    {
      title: "Parking",
      icon: "/Icons/parking.svg", // Replace with actual icon path
      description:
        "Secure and spacious parking facilities available 24/7 for all our guests.",
    },
    {
      title: "24 Hours Room Service",
      icon: "/Icons/bell-service.svg", // Replace with actual icon path
      description:
        "Round-the-clock room service to ensure your comfort and convenience at any hour.",
    },
    {
      title: "Power Backup",
      icon: "/Icons/power.svg", // Replace with actual icon path
      description:
        "Uninterrupted power supply with full backup systems for a hassle-free experience.",
    },
  ];

  // Reviews data array
  const reviews: ReviewData[] = [
    {
      quote:
        "The location of the hotel is excellent as it's near the beach. We stayed for 3 nights, and the suite was spacious and comfortable. The check-in was swift. The interior design felt like a luxurious welcome! The staff were very kind and warm. Overall, it was a pleasant stay ☺",
      name: "Prakash N",
      img: "/Images/man2.png",
    },
    {
      quote:
        "It's a very good place to stay. The hospitality is also very nice. Definitely a place to stay.",
      name: "Hyder Ali",
      img: "/Images/manavatar.png",
    },
    {
      quote:
        "Pleasant stay experience is good. Really nice hotel and service also good. Will definitely come again.",
      name: "Sonu Kumar",
      img: "/Images/man3.png",
    },
    {
      quote:
        "It was a pleasant stay. The room service and staff were very supportive and helpful. Easy access to the marina and cityside malls.",
      name: "Yasir Arafath",
      img: "/Images/man4.png",
    },
  ];

  // Function to handle booking
  const handleBookNow = (room: RoomData) => {
    setSelectedRoom(room);
    setBookingModalOpen(true);
  };

  // Function to submit booking
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send booking data to your backend
    alert(
      `Booking submitted for ${selectedRoom?.title} from ${checkInDate} to ${checkOutDate}`
    );
    setBookingModalOpen(false);
    setSelectedRoom(null);
    setCheckInDate("");
    setCheckOutDate("");
  };

  // Function to handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail("");
  };

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Set minimum check-in and check-out dates
  const today = new Date().toISOString().split("T")[0];
  const minCheckoutDate = checkInDate
    ? new Date(new Date(checkInDate).getTime() + 86400000)
        .toISOString()
        .split("T")[0]
    : today;

  // Effect for handling scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".fade-in-element");
      elements.forEach((element) => {
        const position = element.getBoundingClientRect();
        // If element is in viewport
        if (position.top < window.innerHeight) {
          element.classList.add(styles.visible);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Helper function to calculate total price based on check-in and check-out dates
  function calculateTotalPrice(
    pricePerNight: number,
    checkIn: string,
    checkOut: string
  ): number {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return pricePerNight * diffDays;
  }

  return (
    <>
      <Head>
        <title>Al Noor Group of Hotels - Luxury Accommodations</title>
        <meta
          name="description"
          content="Experience luxury accommodations and exceptional service at Al Noor Group of Hotels. Book your stay today!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/Images/Finlogo.png" />
      </Head>

      <div className={styles.landingPage}>
        {/* Hero Section with Header */}
        <div className={styles.homePage}>
          <Image
            className={styles.homeBgIcon}
            width={1920}
            height={1080}
            priority
            alt="Al Noor Hotel"
            src="/Images/Home-BG.png"
          />
          <div className={styles.homePageOverlay} />

          {/* Header Component */}
          <Header
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          {/* Hero Component */}
          <Hero />

          {/* Booking Form Component */}
          {/* <BookingForm
            today={today}
            checkInDate={checkInDate}
            setCheckInDate={setCheckInDate}
            checkOutDate={checkOutDate}
            setCheckOutDate={setCheckOutDate}
            minCheckoutDate={minCheckoutDate}
          /> */}
        </div>

        {/* About Section Component */}
        <About />

        {/* Stats Section Component */}
        <Stats />

        {/* Rooms Section Component */}
        <Rooms rooms={rooms} onBookNow={handleBookNow} />

        {/* Services Section Component */}
        <Services services={services} />

        {/* Reviews Section Component */}
        <Reviews reviews={reviews} />

        {/* CTA Section Component */}
        {/* <CtaSection onBookClick={scrollToTop} /> */}

        {/* Footer Component */}
        <Footer
          email={email}
          setEmail={setEmail}
          subscribed={subscribed}
          handleSubscribe={handleSubscribe}
        />
      </div>

      {/* Booking Modal Component */}
      {/* {bookingModalOpen && selectedRoom && (
  <BookingModal
    isOpen={true}
    onClose={() => {
      setBookingModalOpen(false);
      setSelectedRoom(null);
    }}
    roomType={selectedRoom.title}
    roomPrice={selectedRoom.pricePerNight}
    onSubmit={(bookingData) => {
      alert(
        `Booking submitted for ${bookingData.roomType} from ${bookingData.checkInDate} to ${bookingData.checkOutDate}`
      );
      setBookingModalOpen(false);
      setSelectedRoom(null);
    }}
  />
)} */}

      {/* Back to Top Button Component */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BackToTop scrollToTop={scrollToTop} />
      </div>
    </>
  );
};

export default LandingPage;
