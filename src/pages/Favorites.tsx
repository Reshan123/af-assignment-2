import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { countryAPI } from "../api/country";

type Country = {
  name: {
    common: string;
    official: string;
  };
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  capital?: string[];
  region: string;
  population: number;
  cca3: string;
};

export default function FavoritesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [favoriteCountries, setFavoriteCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/auth/login", {
        state: { message: "Please log in to view your favorites" },
      });
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        // Get user's favorite country codes
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        const favoriteIds = userData?.favoriteCountries || [];

        if (favoriteIds.length === 0) {
          setFavoriteCountries([]);
          setLoading(false);
          return;
        }
        const allCountries = await countryAPI.getAllCountries();
        setCountries(allCountries);
        // Fetch details for each favorite country
        const countriesData = await countryAPI.getCountriesByCodes(favoriteIds);
        setFavoriteCountries(Array.isArray(countriesData) ? countriesData : []);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError(
          "Failed to load your favorite countries. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  const removeFromFavorites = async (countryCode: string) => {
    if (!user) return;

    try {
      // Get current favorites
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const currentFavorites = userData?.favoriteCountries || [];

      // Remove the country
      const updatedFavorites = currentFavorites.filter(
        (code: string) => code !== countryCode
      );

      // Update in Firestore
      await updateDoc(userRef, {
        favoriteCountries: updatedFavorites,
      });

      // Update local state
      setFavoriteCountries((prevCountries) =>
        prevCountries.filter((country) => country.cca3 !== countryCode)
      );
    } catch (error) {
      console.error("Error removing from favorites:", error);
      setError("Failed to remove country from favorites. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pt-20 flex items-center justify-center">
        <div className="animate-pulse flex items-center text-xl">
          <svg
            className="animate-spin h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading your favorites...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold">Your Favorite Countries</h1>
          <p className="mt-2 text-indigo-100">
            Countries you've marked as favorites will appear here for quick
            access.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Favorites State */}
        {!loading && favoriteCountries.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="inline-block p-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-indigo-600 dark:text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No favorite countries yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring countries and add them to your favorites!
            </p>
            <Link
              to="/countries"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Explore Countries
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {favoriteCountries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteCountries.map((country) => {
              const countryDetails =
                countries.find((c) => c.cca3 === country.cca3) || country;

              return (
                <div
                  key={countryDetails.cca3}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Flag */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={countryDetails.flags.svg || countryDetails.flags.png}
                      alt={
                        countryDetails.flags.alt ||
                        `Flag of ${countryDetails.name.common}`
                      }
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white">
                        {countryDetails.name.common}
                      </h3>
                      <p className="text-sm text-white/80">
                        {countryDetails.region}
                      </p>
                    </div>
                  </div>

                  {/* Country Info */}
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {countryDetails.capital?.[0] || "No capital"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {new Intl.NumberFormat().format(
                        countryDetails.population
                      )}
                    </div>

                    <div className="flex justify-between mt-4">
                      <Link
                        to={`/countries/${countryDetails.cca3}`}
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                      >
                        View details
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => removeFromFavorites(countryDetails.cca3)}
                        className="inline-flex items-center text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      >
                        Remove
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
