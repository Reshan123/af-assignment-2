import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { countryAPI } from "../api/country";
import { useAuth } from "../context/AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
type Country = {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  languages?: {
    [key: string]: string;
  };
  currencies?: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
  borders?: string[];
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  coatOfArms?: {
    png: string;
    svg: string;
  };
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
};

const CapitalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
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
);

const RegionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PopulationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
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
);

const AreaIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

const LanguageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
    />
  </svg>
);

const CurrencyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BorderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const CoatOfArmsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
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
);

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

export default function CountryDetail() {
  const { code } = useParams<{ code: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [borderCountries, setBorderCountries] = useState<
    { name: string; code: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );
  const { user } = useAuth();

  useEffect(() => {
    // Check if country is in favorites when component mounts
    const checkFavorite = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsFavorite(userData?.favoriteCountries?.includes(code) || false);
      } catch (error) {
        console.error("Error checking favorites:", error);
      }
    };

    checkFavorite();
  }, [code, user]);

  const toggleFavorite = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      let favoriteCountries = userData?.favoriteCountries || [];

      if (isFavorite) {
        favoriteCountries = favoriteCountries.filter((c: string) => c !== code);
      } else {
        favoriteCountries = [...favoriteCountries, code];
      }

      await updateDoc(userRef, {
        favoriteCountries: favoriteCountries,
      });

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  useEffect(() => {
    const fetchCountry = async () => {
      if (!code) {
        setError("No country code provided");
        setLoading(false);
        return;
      }

      try {
        const countryData = await countryAPI.getCountryByCode(code);

        if (!countryData || !countryData.name) {
          throw new Error("Invalid country data received");
        }

        setCountry(countryData);

        if (countryData.borders && countryData.borders.length > 0) {
          const bordersData = await countryAPI.getCountriesByCodes(
            countryData.borders
          );
          if (Array.isArray(bordersData)) {
            setBorderCountries(
              bordersData.map((c: any) => ({
                name: c.name.common,
                code: c.cca3,
              }))
            );
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching country:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchCountry();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="animate-spin h-12 w-12 text-white"
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
          </div>
          <p className="mt-4 text-xl font-medium text-indigo-600 dark:text-indigo-400">
            Loading country information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 text-6xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          Country not found
        </p>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Link
          to="/countries"
          className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <BackIcon /> Back to all countries
        </Link>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation and Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Link
            to="/countries"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Countries
          </Link>

          <button
            onClick={toggleFavorite}
            className={`inline-flex items-center px-4 py-2 rounded-full shadow-sm transition-all ${
              isFavorite
                ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 hover:from-amber-500 hover:to-amber-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                isFavorite
                  ? "text-gray-900"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              viewBox="0 0 20 20"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-2 font-medium">
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </span>
          </button>
        </div>

        {/* Hero Section with Flag */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 z-10"></div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 z-0">
            {country.flags && (
              <img
                src={country.flags.svg || country.flags.png}
                alt=""
                className="w-full h-full object-cover blur-sm"
              />
            )}
          </div>

          <div className="relative z-20 py-12 px-8 md:px-12 flex flex-col md:flex-row items-center">
            {/* Country Info */}
            <div className="flex-1 text-white mb-8 md:mb-0 md:mr-8">
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                {country.region} {country.subregion && `• ${country.subregion}`}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {country.name.common}
              </h1>
              <p className="text-xl text-white/80 mb-4">
                {country.name.official}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-sm text-white/70">Population</div>
                  <div className="text-xl font-semibold">
                    {formatNumber(country.population)}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-sm text-white/70">Capital</div>
                  <div className="text-xl font-semibold">
                    {country.capital?.[0] || "N/A"}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-sm text-white/70">Area</div>
                  <div className="text-xl font-semibold">
                    {formatNumber(country.area)} km²
                  </div>
                </div>
              </div>
            </div>

            {/* Flag */}
            <div className="w-full md:w-auto flex-shrink-0">
              {country.flags && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <img
                    src={country.flags.svg || country.flags.png}
                    alt={country.flags.alt || `Flag of ${country.name.common}`}
                    className="relative w-full md:w-64 h-auto rounded-lg shadow-2xl border-2 border-white/20"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-md p-1 flex mb-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              activeTab === "details"
                ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-md p-6 mb-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Key Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Key Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <CapitalIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Capital
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {country.capital?.[0] ||
                          "No capital information available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <RegionIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Region
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {country.region}{" "}
                        {country.subregion && `(${country.subregion})`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <PopulationIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Population
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatNumber(country.population)} people
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <AreaIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Area
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatNumber(country.area)} square kilometers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Languages and Currencies */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Languages & Currencies
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <LanguageIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Languages
                      </h4>
                      {country.languages ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.values(country.languages).map(
                            (language, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                              >
                                {language}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          No language information available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                      <CurrencyIcon />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Currencies
                      </h4>
                      {country.currencies ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(country.currencies).map(
                            ([code, currency], index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                              >
                                {currency.name} ({currency.symbol || code})
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                          No currency information available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coat of Arms */}
                  {country.coatOfArms &&
                    (country.coatOfArms.svg || country.coatOfArms.png) && (
                      <div className="flex items-start">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-4">
                          <CoatOfArmsIcon />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Coat of Arms
                          </h4>
                          <div className="mt-2 flex justify-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <img
                              src={
                                country.coatOfArms.svg || country.coatOfArms.png
                              }
                              alt={`Coat of arms of ${country.name.common}`}
                              className="h-32 w-auto"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div>
              {/* Border Countries */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                  <BorderIcon />
                  <span className="ml-2">Bordering Countries</span>
                </h3>

                {borderCountries.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {borderCountries.map((border) => (
                      <Link
                        key={border.code}
                        to={`/countries/${border.code}`}
                        className="bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg p-3 transition-colors flex items-center"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-full mr-2 text-indigo-600 dark:text-indigo-400 font-bold">
                          {border.name.charAt(0)}
                        </span>
                        <span className="text-gray-900 dark:text-white truncate">
                          {border.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      {country.name.common} has no bordering countries.
                    </p>
                  </div>
                )}
              </div>

              {/* Country Codes */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Country Codes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ISO 3166-1 alpha-2
                    </div>
                    <div className="text-xl font-mono font-semibold text-gray-900 dark:text-white">
                      {country.cca2}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ISO 3166-1 alpha-3
                    </div>
                    <div className="text-xl font-mono font-semibold text-gray-900 dark:text-white">
                      {country.cca3}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
