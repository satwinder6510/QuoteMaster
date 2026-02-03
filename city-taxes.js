// City Tax Rules - Local taxes payable at destination
// Based on 2024/2025 known rates

const LOCAL_CITY_TAX_TABLE = {
  // ===== AUSTRIA =====
  "AT_VIENNA": {
    city: "Vienna",
    countryCode: "AT",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 5, appliesTo: "net_room_rate" },
    notes: "5% of room rate collected locally.",
  },

  // ===== ITALY =====
  "IT_VENICE": {
    city: "Venice",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 5, currency: "EUR" },
    notes: "€1-€5 per person/night depending on season and accommodation category.",
  },

  "IT_FLORENCE": {
    city: "Florence",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 3.5, max: 8, currency: "EUR" },
    capNights: 7,
    notes: "€3.50-€8 per person/night depending on hotel category. Max 7 nights.",
  },

  "IT_ROME": {
    city: "Rome",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 4, max: 10, currency: "EUR" },
    capNights: 10,
    notes: "€4-€10 per person/night depending on hotel category. Max 10 nights.",
  },

  "IT_SORRENTO": {
    city: "Sorrento",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 7,
    notes: "€2-€5 per person/night. Max 7 nights.",
  },

  "IT_PALERMO": {
    city: "Palermo",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1.5, max: 3, currency: "EUR" },
    capNights: 4,
    notes: "€1.50-€3 per person/night. Max 4 nights.",
  },

  "IT_CATANIA": {
    city: "Catania",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 4,
    notes: "€2-€5 per person/night. Max 4 nights.",
  },

  "IT_SYRACUSE": {
    city: "Syracuse",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 5, currency: "EUR" },
    capNights: 7,
    notes: "Up to €5 per person/night. Max 7 nights.",
  },

  "IT_VERONA": {
    city: "Verona",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 5,
    notes: "€2-€5 per person/night. Max 5 nights.",
  },

  "IT_LAKE_GARDA": {
    city: "Lake Garda",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 4.2, currency: "EUR" },
    capNights: 7,
    notes: "€1-€4.20 per person/night (varies by municipality). Max 7 nights.",
  },

  "IT_MILAN": {
    city: "Milan",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 14,
    notes: "€2-€5 per person/night. Max 14 nights.",
  },

  "IT_NAPLES": {
    city: "Naples",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 5, currency: "EUR" },
    capNights: 14,
    notes: "€1-€5 per person/night. Max 14 nights.",
  },

  "IT_AMALFI": {
    city: "Amalfi",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 7,
    notes: "€2-€5 per person/night. Max 7 nights.",
  },

  "IT_POSITANO": {
    city: "Positano",
    countryCode: "IT",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2, max: 5, currency: "EUR" },
    capNights: 7,
    notes: "€2-€5 per person/night. Max 7 nights.",
  },

  // ===== PORTUGAL =====
  "PT_LISBON": {
    city: "Lisbon",
    countryCode: "PT",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 4, currency: "EUR" },
    capNights: 7,
    exemptions: ["Children under 13"],
    notes: "€4 per person/night. Max 7 nights. Children under 13 exempt.",
  },

  "PT_PORTO": {
    city: "Porto",
    countryCode: "PT",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 3, currency: "EUR" },
    capNights: 7,
    notes: "€3 per person/night. Max 7 nights.",
  },

  // ===== NETHERLANDS =====
  "NL_AMSTERDAM": {
    city: "Amsterdam",
    countryCode: "NL",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 12.5, appliesTo: "net_room_rate" },
    notes: "12.5% of room rate collected locally.",
  },

  // ===== SPAIN =====
  "ES_BARCELONA": {
    city: "Barcelona",
    countryCode: "ES",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 2.75, max: 6.75, currency: "EUR" },
    notes: "€2.75-€6.75 per person/night depending on hotel category.",
  },

  "ES_MADRID": {
    city: "Madrid",
    countryCode: "ES",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 3, currency: "EUR" },
    notes: "€1-€3 per person/night depending on hotel category.",
  },

  // ===== FRANCE =====
  "FR_PARIS": {
    city: "Paris",
    countryCode: "FR",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 5, currency: "EUR" },
    notes: "€1-€5 per person/night depending on hotel category.",
  },

  "FR_NICE": {
    city: "Nice",
    countryCode: "FR",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 0.9, max: 4, currency: "EUR" },
    notes: "€0.90-€4 per person/night depending on hotel category.",
  },

  // ===== GERMANY =====
  "DE_BERLIN": {
    city: "Berlin",
    countryCode: "DE",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 5, appliesTo: "net_room_rate" },
    notes: "5% of room rate (City Tax) collected locally.",
  },

  "DE_MUNICH": {
    city: "Munich",
    countryCode: "DE",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 3.5, currency: "EUR" },
    notes: "€3.50 per person/night collected locally.",
  },

  // ===== CZECH REPUBLIC =====
  "CZ_PRAGUE": {
    city: "Prague",
    countryCode: "CZ",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 50, currency: "CZK" },
    capNights: 60,
    notes: "50 CZK (~€2) per person/night. Max 60 nights.",
  },

  // ===== SWITZERLAND =====
  "CH_ZURICH": {
    city: "Zurich",
    countryCode: "CH",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 2.5, currency: "CHF" },
    notes: "2.50 CHF per person/night collected locally.",
  },

  "CH_GENEVA": {
    city: "Geneva",
    countryCode: "CH",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 1, max: 3, currency: "CHF" },
    notes: "1-3 CHF per person/night depending on accommodation type.",
  },

  // ===== UAE =====
  "AE_DUBAI": {
    city: "Dubai",
    countryCode: "AE",
    payableLocally: true,
    basis: "per_room_per_night",
    range: { min: 7, max: 20, currency: "AED" },
    capNights: 30,
    notes: "7-20 AED per room/night depending on hotel category. Max 30 nights.",
  },

  "AE_ABU_DHABI": {
    city: "Abu Dhabi",
    countryCode: "AE",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 6, appliesTo: "room_rate" },
    notes: "6% tourism fee collected locally.",
  },

  // ===== USA =====
  "US_NEW_YORK": {
    city: "New York",
    countryCode: "US",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 14.75, appliesTo: "room_rate" },
    notes: "~14.75% in taxes and fees (varies). Usually included in quoted rate.",
  },

  // ===== JAPAN =====
  "JP_TOKYO": {
    city: "Tokyo",
    countryCode: "JP",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 100, max: 200, currency: "JPY" },
    notes: "100-200 JPY per person/night for rooms over 10,000 JPY.",
  },

  "JP_OSAKA": {
    city: "Osaka",
    countryCode: "JP",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 100, max: 300, currency: "JPY" },
    notes: "100-300 JPY per person/night depending on room rate.",
  },

  "JP_KYOTO": {
    city: "Kyoto",
    countryCode: "JP",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 200, max: 1000, currency: "JPY" },
    notes: "200-1000 JPY per person/night depending on room rate.",
  },

  // ===== CROATIA =====
  "HR_DUBROVNIK": {
    city: "Dubrovnik",
    countryCode: "HR",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 1.86, currency: "EUR" },
    notes: "€1.86 per person/night (seasonal variation possible).",
  },

  "HR_SPLIT": {
    city: "Split",
    countryCode: "HR",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 1.33, currency: "EUR" },
    notes: "€1.33 per person/night.",
  },

  // ===== GREECE =====
  "GR_ATHENS": {
    city: "Athens",
    countryCode: "GR",
    payableLocally: true,
    basis: "per_room_per_night",
    range: { min: 1.5, max: 4, currency: "EUR" },
    notes: "€1.50-€4 per room/night depending on hotel category.",
  },

  "GR_SANTORINI": {
    city: "Santorini",
    countryCode: "GR",
    payableLocally: true,
    basis: "per_room_per_night",
    range: { min: 1.5, max: 4, currency: "EUR" },
    notes: "€1.50-€4 per room/night depending on hotel category.",
  },

  // ===== HUNGARY =====
  "HU_BUDAPEST": {
    city: "Budapest",
    countryCode: "HU",
    payableLocally: true,
    basis: "percent_of_room_rate",
    percent: { rate: 4, appliesTo: "net_room_rate" },
    notes: "4% of room rate collected locally.",
  },

  // ===== BELGIUM =====
  "BE_BRUSSELS": {
    city: "Brussels",
    countryCode: "BE",
    payableLocally: true,
    basis: "per_person_per_night",
    range: { min: 4.24, max: 7.5, currency: "EUR" },
    notes: "€4.24-€7.50 per person/night depending on hotel category.",
  },

  "BE_BRUGES": {
    city: "Bruges",
    countryCode: "BE",
    payableLocally: true,
    basis: "per_person_per_night",
    fixed: { amount: 3.68, currency: "EUR" },
    notes: "€3.68 per person/night.",
  },
};

// Alias map for common city name variations
const CITY_ALIASES = {
  // Italian variations
  "venezia": "IT_VENICE",
  "venice": "IT_VENICE",
  "firenze": "IT_FLORENCE",
  "florence": "IT_FLORENCE",
  "roma": "IT_ROME",
  "rome": "IT_ROME",
  "napoli": "IT_NAPLES",
  "naples": "IT_NAPLES",
  "milano": "IT_MILAN",
  "milan": "IT_MILAN",
  "siracusa": "IT_SYRACUSE",
  "syracuse": "IT_SYRACUSE",
  "lake garda": "IT_LAKE_GARDA",
  "garda": "IT_LAKE_GARDA",
  "sirmione": "IT_LAKE_GARDA",
  "riva del garda": "IT_LAKE_GARDA",
  "amalfi coast": "IT_AMALFI",
  "amalfi": "IT_AMALFI",
  "positano": "IT_POSITANO",
  "sorrento": "IT_SORRENTO",
  "palermo": "IT_PALERMO",
  "catania": "IT_CATANIA",
  "verona": "IT_VERONA",

  // Portuguese variations
  "lisbon": "PT_LISBON",
  "lisboa": "PT_LISBON",
  "porto": "PT_PORTO",
  "oporto": "PT_PORTO",

  // Dutch variations
  "amsterdam": "NL_AMSTERDAM",

  // Austrian variations
  "vienna": "AT_VIENNA",
  "wien": "AT_VIENNA",

  // Spanish variations
  "barcelona": "ES_BARCELONA",
  "madrid": "ES_MADRID",

  // French variations
  "paris": "FR_PARIS",
  "nice": "FR_NICE",

  // German variations
  "berlin": "DE_BERLIN",
  "munich": "DE_MUNICH",
  "münchen": "DE_MUNICH",
  "munchen": "DE_MUNICH",

  // Czech variations
  "prague": "CZ_PRAGUE",
  "praha": "CZ_PRAGUE",

  // Swiss variations
  "zurich": "CH_ZURICH",
  "zürich": "CH_ZURICH",
  "geneva": "CH_GENEVA",
  "genève": "CH_GENEVA",
  "geneve": "CH_GENEVA",

  // UAE variations
  "dubai": "AE_DUBAI",
  "abu dhabi": "AE_ABU_DHABI",

  // USA variations
  "new york": "US_NEW_YORK",
  "new york city": "US_NEW_YORK",
  "nyc": "US_NEW_YORK",

  // Japan variations
  "tokyo": "JP_TOKYO",
  "osaka": "JP_OSAKA",
  "kyoto": "JP_KYOTO",

  // Croatian variations
  "dubrovnik": "HR_DUBROVNIK",
  "split": "HR_SPLIT",

  // Greek variations
  "athens": "GR_ATHENS",
  "athina": "GR_ATHENS",
  "santorini": "GR_SANTORINI",
  "thira": "GR_SANTORINI",

  // Hungarian variations
  "budapest": "HU_BUDAPEST",

  // Belgian variations
  "brussels": "BE_BRUSSELS",
  "bruxelles": "BE_BRUSSELS",
  "bruges": "BE_BRUGES",
  "brugge": "BE_BRUGES",
};

/**
 * Find tax rule for a city
 * @param {string} cityName - City name to look up
 * @returns {object|null} - Tax rule or null if not found
 */
function findTaxRule(cityName) {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();

  // Try alias lookup first
  if (CITY_ALIASES[normalized]) {
    const rule = LOCAL_CITY_TAX_TABLE[CITY_ALIASES[normalized]];
    if (rule) return { ...rule, key: CITY_ALIASES[normalized] };
  }

  // Try partial match in aliases
  for (const [alias, key] of Object.entries(CITY_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      const rule = LOCAL_CITY_TAX_TABLE[key];
      if (rule) return { ...rule, key };
    }
  }

  // Try direct table lookup by constructing possible keys
  for (const [key, rule] of Object.entries(LOCAL_CITY_TAX_TABLE)) {
    if (rule.city.toLowerCase() === normalized) {
      return { ...rule, key };
    }
  }

  return null;
}

/**
 * Calculate estimated city tax
 * @param {object} rule - Tax rule from findTaxRule
 * @param {number} nights - Number of nights
 * @param {number} persons - Number of persons
 * @returns {object} - { min, max, currency, basis, notes }
 */
function calculateTax(rule, nights, persons) {
  if (!rule) return null;

  // Apply night cap if exists
  const effectiveNights = rule.capNights ? Math.min(nights, rule.capNights) : nights;

  let min = 0;
  let max = 0;
  let currency = "EUR";
  let isPercentage = false;

  if (rule.fixed) {
    // Fixed amount per person/night or per room/night
    currency = rule.fixed.currency;
    if (rule.basis === "per_room_per_night") {
      min = max = rule.fixed.amount * effectiveNights;
    } else {
      // per_person_per_night
      min = max = rule.fixed.amount * effectiveNights * persons;
    }
  } else if (rule.range) {
    // Range amount
    currency = rule.range.currency;
    if (rule.basis === "per_room_per_night") {
      min = rule.range.min * effectiveNights;
      max = rule.range.max * effectiveNights;
    } else {
      // per_person_per_night
      min = rule.range.min * effectiveNights * persons;
      max = rule.range.max * effectiveNights * persons;
    }
  } else if (rule.percent) {
    // Percentage - can't calculate exact amount without room rate
    isPercentage = true;
    min = max = rule.percent.rate;
  }

  return {
    city: rule.city,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    currency,
    isPercentage,
    percentRate: isPercentage ? rule.percent.rate : null,
    basis: rule.basis,
    notes: rule.notes,
    effectiveNights,
    cappedAt: rule.capNights && nights > rule.capNights ? rule.capNights : null,
  };
}

/**
 * Get list of all available cities
 * @returns {string[]} - Array of city names
 */
function getAvailableCities() {
  const cities = new Set();
  for (const rule of Object.values(LOCAL_CITY_TAX_TABLE)) {
    cities.add(rule.city);
  }
  // Add common aliases
  for (const alias of Object.keys(CITY_ALIASES)) {
    cities.add(alias.charAt(0).toUpperCase() + alias.slice(1));
  }
  return Array.from(cities).sort();
}

module.exports = {
  LOCAL_CITY_TAX_TABLE,
  CITY_ALIASES,
  findTaxRule,
  calculateTax,
  getAvailableCities,
};
