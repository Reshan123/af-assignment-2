import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { countryAPI } from "../api/country";

type Country = {
  name: {
    common: string;
    official?: string;
  };
  flags: {
    svg?: string;
    png?: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  population: number;
  cca3: string;
  languages?: {
    [key: string]: string;
  };
};

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [featuredCountries, setFeaturedCountries] = useState<Country[]>([]);
  const [favoriteCountries, setFavoriteCountries] = useState<Country[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const { user } = useAuth();

  // Fetch countries for the featured section
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get featured countries
        const featuredData = await countryAPI.getFeaturedCountries(6);
        setFeaturedCountries(featuredData);

        // Get popular destinations (different from featured)
        const allCountries = await countryAPI.getAllCountries();
        setCountries(allCountries);
        const popular = allCountries
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        setPopularDestinations(popular);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch favorite countries if user is logged in
  useEffect(() => {
    const fetchFavoriteCountries = async () => {
      if (!user) {
        setFavoriteCountries([]);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();

        if (userData?.favoriteCountries?.length) {
          const favoritesData = await countryAPI.getCountriesByCodes(
            userData.favoriteCountries
          );
          setFavoriteCountries(
            Array.isArray(favoritesData) ? favoritesData : []
          );
        }
      } catch (error) {
        console.error("Error fetching favorite countries:", error);
      }
    };

    fetchFavoriteCountries();
  }, [user]);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Testimonial auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      id: 1,
      text: "GlobeGuide helped me plan my entire trip to Southeast Asia. The country information was incredibly detailed and accurate!",
      author: "Sarah Johnson",
      location: "Travel Blogger",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    },
    {
      id: 2,
      text: "As a geography teacher, I use GlobeGuide daily with my students. It's an invaluable resource for our classroom activities.",
      author: "Michael Chen",
      location: "High School Teacher",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
      id: 3,
      text: "The ability to save favorite countries and access detailed information has made my travel research so much easier!",
      author: "Elena Rodriguez",
      location: "Digital Nomad",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 py-20 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <svg
            className="h-full w-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,0 L1440,0 L1440,800 L0,800 Z"
              className="text-white"
            ></path>
            <path
              fill="currentColor"
              d="M0,400 C240,500 480,650 720,600 C960,550 1200,450 1440,500 L1440,800 L0,800 Z"
              className="text-blue-500 opacity-20"
            ></path>
            <path
              fill="currentColor"
              d="M0,600 C240,500 480,400 720,450 C960,500 1200,650 1440,600 L1440,800 L0,800 Z"
              className="text-purple-500 opacity-20"
            ></path>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Explore Our <span className="text-amber-400">World</span>
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mb-10 leading-relaxed">
            Discover fascinating details about countries, cultures, and people
            from every corner of the globe
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/countries"
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Explore Countries
            </Link>
            {!user && (
              <Link
                to="/auth/register"
                className="px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-gray-900 font-bold rounded-full transition-all transform hover:scale-105 backdrop-blur-sm"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose GlobeGuide
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Your comprehensive resource for global exploration and discovery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: "Accurate Data",
                description:
                  "All our country information is regularly updated and verified for accuracy from trusted international sources.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                ),
                title: "Comprehensive Details",
                description:
                  "From languages and currencies to flags and population data, we provide in-depth information about every country.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                ),
                title: "Personalized Experience",
                description:
                  "Create an account to save your favorite countries, track your explorations, and customize your global journey.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-5">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Favorite Countries Section - Only show if user is logged in and has favorites */}
      {user && favoriteCountries.length > 0 && (
        <section className="py-20 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Your Favorite Countries
                </h2>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                  Quick access to your bookmarked destinations
                </p>
              </div>
              <Link
                to="/countries"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center"
              >
                View all countries
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteCountries.map((favCountry) => {
                // Find full country details from countries array
                const countryDetails = countries.find(c => c.cca3 === favCountry.cca3) || favCountry;
                
                return (
                  <Link
                    to={`/countries/${countryDetails.cca3}`}
                    key={countryDetails.cca3}
                    className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={
                          countryDetails.flags?.svg ||
                          countryDetails.flags?.png ||
                          "/fallback-image.png"
                        }
                        alt={
                          countryDetails.flags?.alt ||
                          `Flag of ${countryDetails.name.common}`
                        }
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="font-medium">
                          Click to explore details
                        </p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                        {countryDetails.name.common}
                      </h3>
                      <div className="text-gray-600 dark:text-gray-300 space-y-1">
                        <p className="flex items-center">
                          <span className="mr-2">🏙️</span>
                          <span>
                            <strong>Capital:</strong>{" "}
                            {countryDetails.capital?.[0] || "N/A"}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">🌍</span>
                          <span>
                            <strong>Region:</strong> {countryDetails.region}
                          </span>
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2">👥</span>
                          <span>
                            <strong>Population:</strong>{" "}
                            {formatNumber(countryDetails.population)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Countries Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Countries
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore these fascinating destinations from around the world
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCountries.map((country) => (
                <Link
                  to={`/countries/${country.cca3}`}
                  key={country.cca3}
                  className="group bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={
                        country.flags?.svg ||
                        country.flags?.png ||
                        "/fallback-image.png"
                      }
                      alt={
                        country.flags?.alt || `Flag of ${country.name.common}`
                      }
                      className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="font-medium">Click to explore details</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                      {country.name.common}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 space-y-1">
                      <p className="flex items-center">
                        <span className="mr-2">🏙️</span>
                        <span>
                          <strong>Capital:</strong>{" "}
                          {country.capital?.[0] || "N/A"}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">🌍</span>
                        <span>
                          <strong>Region:</strong> {country.region}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">👥</span>
                        <span>
                          <strong>Population:</strong>{" "}
                          {formatNumber(country.population)}
                        </span>
                      </p>
                      {country.languages && (
                        <p className="flex items-center">
                          <span className="mr-2">🗣️</span>
                          <span>
                            <strong>Languages:</strong>{" "}
                            {Object.values(country.languages)
                              .slice(0, 2)
                              .join(", ")}
                            {Object.values(country.languages).length > 2
                              ? "..."
                              : ""}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Popular Destinations
            </h2>
            <p className="text-indigo-200 text-lg max-w-3xl mx-auto">
              Discover these trending destinations loved by travelers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularDestinations.map((country) => (
              <Link
                to={`/countries/${country.cca3}`}
                key={country.cca3}
                className="relative group h-96 rounded-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 z-10"></div>
                <img
                  src={
                    country.flags?.svg ||
                    country.flags?.png ||
                    "/fallback-image.png"
                  }
                  alt={`Flag of ${country.name.common}`}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <h3 className="text-2xl font-bold mb-2 group-hover:translate-y-0 translate-y-2 transition-transform duration-300">
                    {country.name.common}
                  </h3>
                  <p className="text-indigo-200 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {country.region} • {country.capital?.[0] || "N/A"}
                  </p>
                  <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    Explore Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
              Join thousands of satisfied users exploring the world with
              GlobeGuide
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                      <div className="flex items-center mb-6">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="w-14 h-14 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {testimonial.author}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {testimonial.location}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-lg italic">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeTestimonial === index
                      ? "bg-indigo-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "200+", label: "Countries", icon: "🌎" },
              { value: "7", label: "Continents", icon: "🗺️" },
              { value: "6,500+", label: "Languages", icon: "🗣️" },
              { value: "8B+", label: "People", icon: "👥" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center transform transition-all duration-700 ease-out"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
