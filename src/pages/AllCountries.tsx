import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "population" | "region">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const regions = [
    "Africa",
    "Americas",
    "Asia",
    "Europe",
    "Oceania",
    "Antarctic",
  ];

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch countries with pagination
  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      if (countries.length === 0) {
        const data = await countryAPI.getAllCountries();
        setCountries(data);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, [countries.length]);

  // Memoized filtered countries
  const filteredCountries = useMemo(() => {
    let filtered = countries;

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((country) =>
        country.name.common.toLowerCase().includes(searchLower)
      );
    }

    if (regionFilter) {
      filtered = filtered.filter((country) => country.region === regionFilter);
    }

    return filtered;
  }, [countries, debouncedSearch, regionFilter]);

  // Memoized sorted countries with virtual rendering preparation
  const sortedCountries = useMemo(() => {
    const sorted = [...filteredCountries].sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.common.localeCompare(b.name.common)
          : b.name.common.localeCompare(a.name.common);
      } else if (sortBy === "population") {
        return sortOrder === "asc"
          ? a.population - b.population
          : b.population - a.population;
      } else {
        return sortOrder === "asc"
          ? a.region.localeCompare(b.region)
          : b.region.localeCompare(a.region);
      }
    });

    return sorted;
  }, [filteredCountries, sortBy, sortOrder]);

  // Calculate pagination values
  const totalPages = Math.ceil(sortedCountries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCountries.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    const query = searchParams.get("search");
    const region = searchParams.get("region");
    const page = searchParams.get("page");

    if (query) setSearchQuery(query);
    if (region) setRegionFilter(region);
    if (page) setCurrentPage(parseInt(page, 10));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (regionFilter) params.set("region", regionFilter);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  }, [searchQuery, regionFilter, currentPage, setSearchParams]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, regionFilter]);

  // Rest of the component remains the same...
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-15 pb-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search and Filter Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-8">
              {/* Search and Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search countries..."
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all text-gray-800 dark:text-gray-100"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg
                        className="w-5 h-5 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Region Filter */}
                <div className="w-full lg:w-64">
                  <select
                    id="region"
                    className="w-full py-3 px-4 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all text-gray-800 dark:text-gray-100"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      viewMode === "grid"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                    </svg>
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      viewMode === "list"
                        ? "bg-indigo-500 text-white shadow-md"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                    </svg>
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>

                {/* Sort Controls */}
                <div className="relative w-full sm:w-auto">
                  <select
                    className="w-full sm:w-64 py-3 px-4 bg-white dark:bg-gray-700 border-2 border-indigo-100 dark:border-gray-600 rounded-xl focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all text-gray-800 dark:text-gray-100 appearance-none"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split(
                        "-"
                      ) as ["name" | "population" | "region", "asc" | "desc"];
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="population-asc">
                      Population (Low-High)
                    </option>
                    <option value="population-desc">
                      Population (High-Low)
                    </option>
                    <option value="region-asc">Region (A-Z)</option>
                    <option value="region-desc">Region (Z-A)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-gray-600 dark:text-gray-300">
            Found {sortedCountries.length} countries
            {regionFilter && ` in ${regionFilter}`}
            {searchQuery && ` matching "${searchQuery}"`}
            {sortedCountries.length > 0 &&
              ` (showing ${indexOfFirstItem + 1}-${Math.min(
                indexOfLastItem,
                sortedCountries.length
              )} of ${sortedCountries.length})`}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Loading countries...
                </p>
              </div>
            </div>
          ) : null}

          {/* No Results State */}
          {!loading && sortedCountries.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                No countries found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRegionFilter("");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Countries Grid/List View */}
          {!loading && sortedCountries.length > 0 && (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {currentItems.map((country) => (
                  <div
                    key={country.cca3}
                    className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
                      viewMode === "list" ? "flex" : "flex flex-col"
                    }`}
                  >
                    {/* Flag Image */}
                    <div
                      className={
                        viewMode === "list"
                          ? "w-32 h-24 flex-shrink-0"
                          : "h-48 overflow-hidden"
                      }
                    >
                      <img
                        src={country.flags.png}
                        alt={
                          country.flags.alt || `Flag of ${country.name.common}`
                        }
                        className={
                          viewMode === "list"
                            ? "w-full h-full object-cover"
                            : "w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        }
                      />
                    </div>

                    {/* Country Info */}
                    <div className="p-4 flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {country.name.common}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                          <span className="font-medium">Region:</span>{" "}
                          {country.region}
                        </p>
                        {country.capital && country.capital.length > 0 && (
                          <p>
                            <span className="font-medium">Capital:</span>{" "}
                            {country.capital.join(", ")}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Population:</span>{" "}
                          {new Intl.NumberFormat().format(country.population)}
                        </p>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/countries/${country.cca3}`}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    {/* Previous Page Button */}
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                          : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === pageNum
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Page Button */}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                          : "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Items Per Page Selector */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <span>Show per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
