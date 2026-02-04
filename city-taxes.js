// City Tax Rules - Local taxes payable at destination
// Based on 2024/2025 known rates

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'city-taxes.json');

// Load data from JSON file
let taxData = { taxes: {}, aliases: {} };

function loadTaxData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    taxData = JSON.parse(raw);
  } catch (err) {
    console.error('Error loading city-taxes.json:', err.message);
    // Data will remain as empty defaults
  }
}

function saveTaxData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(taxData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving city-taxes.json:', err.message);
    return false;
  }
}

// Load data on startup
loadTaxData();

// Accessor functions for the tax table and aliases
function getTaxTable() {
  return taxData.taxes;
}

function getAliases() {
  return taxData.aliases;
}

function setTaxEntry(id, entry) {
  taxData.taxes[id] = entry;
  return saveTaxData();
}

function deleteTaxEntry(id) {
  if (taxData.taxes[id]) {
    delete taxData.taxes[id];
    // Also remove any aliases pointing to this id
    for (const [alias, target] of Object.entries(taxData.aliases)) {
      if (target === id) {
        delete taxData.aliases[alias];
      }
    }
    return saveTaxData();
  }
  return false;
}

function setAlias(alias, targetId) {
  taxData.aliases[alias.toLowerCase()] = targetId;
  return saveTaxData();
}

/**
 * Find tax rule for a city
 * @param {string} cityName - City name to look up
 * @returns {object|null} - Tax rule or null if not found
 */
function findTaxRule(cityName) {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();
  const aliases = getAliases();
  const taxTable = getTaxTable();

  // Try alias lookup first
  if (aliases[normalized]) {
    const rule = taxTable[aliases[normalized]];
    if (rule) return { ...rule, key: aliases[normalized] };
  }

  // Try partial match in aliases
  for (const [alias, key] of Object.entries(aliases)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      const rule = taxTable[key];
      if (rule) return { ...rule, key };
    }
  }

  // Try direct table lookup by constructing possible keys
  for (const [key, rule] of Object.entries(taxTable)) {
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
  const taxTable = getTaxTable();
  const aliases = getAliases();

  for (const rule of Object.values(taxTable)) {
    cities.add(rule.city);
  }
  // Add common aliases
  for (const alias of Object.keys(aliases)) {
    cities.add(alias.charAt(0).toUpperCase() + alias.slice(1));
  }
  return Array.from(cities).sort();
}

/**
 * Get all tax entries (for admin)
 * @returns {object} - All tax entries with their IDs
 */
function getAllTaxEntries() {
  return getTaxTable();
}

module.exports = {
  findTaxRule,
  calculateTax,
  getAvailableCities,
  getAllTaxEntries,
  getTaxTable,
  getAliases,
  setTaxEntry,
  deleteTaxEntry,
  setAlias,
  loadTaxData,
  saveTaxData,
};
