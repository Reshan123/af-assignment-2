import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth" // Use "auto" for instant scrolling without animation
    });
  }, [pathname]);

  return null; // This component doesn't render anything
}