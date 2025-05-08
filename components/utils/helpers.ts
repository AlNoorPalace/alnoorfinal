// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Get minimum checkout date based on check-in date
export const getMinCheckoutDate = (checkInDate: string): string => {
  const today = getTodayDate();
  return checkInDate
    ? new Date(new Date(checkInDate).getTime() + 86400000)
        .toISOString()
        .split("T")[0]
    : today;
};

// Calculate total price based on check-in and check-out dates
export const calculateTotalPrice = (
  pricePerNight: number,
  checkIn: string,
  checkOut: string
): number => {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return pricePerNight * diffDays;
};

// Set up scroll animation handler
export const setupScrollAnimations = (): (() => void) => {
  const handleScroll = () => {
    const elements = document.querySelectorAll(".fade-in-element");
    elements.forEach((element) => {
      const position = element.getBoundingClientRect();
      // If element is in viewport
      if (position.top < window.innerHeight) {
        element.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  // Initial check
  handleScroll();

  // Return cleanup function
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
};
