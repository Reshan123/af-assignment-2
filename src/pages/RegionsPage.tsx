import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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

type RegionStats = {
  name: string;
  countryCount: number;
  totalPopulation: number;
  countries: Country[];
};

export default function RegionsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const regions = useMemo(
    () => ["Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"],
    []
  );

  // Fetch all countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const data = await countryAPI.getAllCountries();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Calculate region statistics
  const regionStats = useMemo(() => {
    const stats: RegionStats[] = [];

    regions.forEach((region) => {
      const regionCountries = countries.filter(
        (country) => country.region === region
      );
      const totalPopulation = regionCountries.reduce(
        (sum, country) => sum + country.population,
        0
      );

      stats.push({
        name: region,
        countryCount: regionCountries.length,
        totalPopulation,
        countries: regionCountries,
      });
    });

    return stats;
  }, [countries, regions]);

  // Get selected region data
  const selectedRegionData = useMemo(() => {
    if (!selectedRegion) return null;
    return regionStats.find((region) => region.name === selectedRegion) || null;
  }, [selectedRegion, regionStats]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Regions of the World
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover countries by region and learn about the diverse cultures,
            landscapes, and populations across our planet.
          </p>
        </div>

        {/* Region Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10">
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="region-select"
              className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3"
            >
              Select a Region
            </label>
            <select
              id="region-select"
              className="w-full py-3 px-4 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all text-gray-800 dark:text-gray-100"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">Choose a region</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          </div>
        )}

        {/* Region Overview Cards */}
        {!loading && !selectedRegion && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionStats.map((region) => (
              <div
                key={region.name}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedRegion(region.name)}
              >
                <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <h2 className="text-3xl font-bold text-white">
                    {region.name}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Countries
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {region.countryCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Population
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {region.totalPopulation > 0
                          ? new Intl.NumberFormat().format(
                              region.totalPopulation
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    onClick={() => setSelectedRegion(region.name)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Region Details */}
        {!loading && selectedRegion && selectedRegionData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Region Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-10 px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedRegionData.name}
                  </h2>
                  <div className="flex space-x-4">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-white">
                        {selectedRegionData.countryCount} Countries
                      </span>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-white">
                        {selectedRegionData.totalPopulation > 0
                          ? new Intl.NumberFormat().format(
                              selectedRegionData.totalPopulation
                            ) + " People"
                          : "Population N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRegion("")}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Back to All Regions
                </button>
              </div>
            </div>

            {/* Countries in Region */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Countries in {selectedRegionData.name}
              </h3>

              {selectedRegionData.countries.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">
                    No countries found in this region.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectedRegionData.countries.map((country) => (
                    <Link
                      key={country.cca3}
                      to={`/countries/${country.cca3}`}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex items-center p-3"
                    >
                      <div className="w-12 h-8 flex-shrink-0 mr-3 overflow-hidden">
                        <img
                          src={country.flags.png}
                          alt={
                            country.flags.alt ||
                            `Flag of ${country.name.common}`
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {country.name.common}
                        </h4>
                        {country.capital && country.capital.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {country.capital[0]}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
