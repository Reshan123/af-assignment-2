const BASE_URL = "https://restcountries.com/v3.1";

// Fields we commonly request
const COMMON_FIELDS =
  "fields=name,cca2,cca3,capital,region,subregion,population,area,languages,currencies,borders,flags,coatOfArms,maps";

export const countryAPI = {
  // Get all countries
  getAllCountries: async () => {
    const response = await fetch(`${BASE_URL}/all`);
    if (!response.ok) throw new Error("Failed to fetch countries");
    return response.json();
  },

  // Get countries by region
  getCountriesByRegion: async (region: any) => {
    const response = await fetch(`${BASE_URL}/region/${region}`);
    if (!response.ok)
      throw new Error(`Failed to fetch countries from ${region}`);
    return response.json();
  },

  // Search countries by name
  searchCountries: async (name: any) => {
    const response = await fetch(`${BASE_URL}/name/${name}`);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error("Failed to search countries");
    return response.json();
  },

  // Get country by code
  getCountryByCode: async (code: any) => {
    const response = await fetch(`${BASE_URL}/alpha/${code}?${COMMON_FIELDS}`);
    if (!response.ok)
      throw new Error(`Failed to fetch country with code: ${code}`);
    return response.json();
  },

  // Get multiple countries by codes (for border countries)
  getCountriesByCodes: async (codes: any[]) => {
    if (!codes || codes.length === 0) return [];
    const response = await fetch(
      `${BASE_URL}/alpha?codes=${codes.join(",")}&fields=name,cca3`
    );
    if (!response.ok) throw new Error("Failed to fetch border countries");
    return response.json();
  },

  // Get featured countries (random selection)
  getFeaturedCountries: async (count = 6) => {
    const response = await fetch(`${BASE_URL}/all`);
    if (!response.ok) throw new Error("Failed to fetch featured countries");
    const data = await response.json();
    return data.sort(() => 0.5 - Math.random()).slice(0, count);
  },
};
