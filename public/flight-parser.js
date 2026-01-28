/**
 * Flight Parser - Extracts flight details from pasted text
 * Supports multiple formats from different booking sites
 */

const AIRPORT_CODES = {
  // UK
  'LHR': 'London Heathrow', 'LGW': 'London Gatwick', 'STN': 'London Stansted',
  'LTN': 'London Luton', 'MAN': 'Manchester', 'BHX': 'Birmingham',
  'EDI': 'Edinburgh', 'GLA': 'Glasgow', 'BRS': 'Bristol', 'NCL': 'Newcastle',
  'LBA': 'Leeds Bradford', 'EMA': 'East Midlands', 'LPL': 'Liverpool',
  // Europe
  'CDG': 'Paris CDG', 'ORY': 'Paris Orly', 'AMS': 'Amsterdam', 'FRA': 'Frankfurt',
  'MUC': 'Munich', 'BCN': 'Barcelona', 'MAD': 'Madrid', 'FCO': 'Rome',
  'ATH': 'Athens', 'IST': 'Istanbul', 'SAW': 'Istanbul Sabiha',
  'VIE': 'Vienna', 'ZRH': 'Zurich', 'BRU': 'Brussels', 'CPH': 'Copenhagen',
  'OSL': 'Oslo', 'ARN': 'Stockholm', 'HEL': 'Helsinki', 'LIS': 'Lisbon',
  'DUB': 'Dublin', 'PRG': 'Prague', 'BUD': 'Budapest', 'WAW': 'Warsaw',
  // Asia
  'DEL': 'Delhi', 'BOM': 'Mumbai', 'DXB': 'Dubai', 'DOH': 'Doha',
  'SIN': 'Singapore', 'BKK': 'Bangkok', 'HKG': 'Hong Kong',
  'NRT': 'Tokyo Narita', 'HND': 'Tokyo Haneda', 'KIX': 'Osaka Kansai',
  'ICN': 'Seoul Incheon', 'PEK': 'Beijing', 'PVG': 'Shanghai Pudong',
  'TPE': 'Taipei', 'MNL': 'Manila', 'KUL': 'Kuala Lumpur',
  'CGK': 'Jakarta', 'BLR': 'Bangalore', 'MAA': 'Chennai', 'HYD': 'Hyderabad',
  'CCU': 'Kolkata', 'COK': 'Kochi', 'GOI': 'Goa', 'AMD': 'Ahmedabad',
  'TRV': 'Thiruvananthapuram', 'IXE': 'Mangalore', 'VTZ': 'Visakhapatnam',
  'JAI': 'Jaipur', 'LKO': 'Lucknow', 'PAT': 'Patna', 'SXR': 'Srinagar',
  'IXC': 'Chandigarh', 'PNQ': 'Pune', 'NAG': 'Nagpur', 'IDR': 'Indore',
  'BBI': 'Bhubaneswar', 'GAU': 'Guwahati', 'IXB': 'Bagdogra',
  'HAN': 'Hanoi', 'SGN': 'Ho Chi Minh City', 'DAD': 'Da Nang',
  'REP': 'Siem Reap', 'SAI': 'Siem Reap', 'PNH': 'Phnom Penh',
  // Middle East
  'AUH': 'Abu Dhabi', 'BAH': 'Bahrain', 'KWI': 'Kuwait', 'MCT': 'Muscat',
  'RUH': 'Riyadh', 'JED': 'Jeddah', 'AMM': 'Amman', 'CAI': 'Cairo',
  // Americas
  'JFK': 'New York JFK', 'EWR': 'Newark', 'LAX': 'Los Angeles', 'MIA': 'Miami',
  'ORD': 'Chicago', 'SFO': 'San Francisco', 'BOS': 'Boston', 'DFW': 'Dallas',
  'ATL': 'Atlanta', 'SEA': 'Seattle', 'DEN': 'Denver', 'LAS': 'Las Vegas',
  'YYZ': 'Toronto', 'YVR': 'Vancouver', 'MEX': 'Mexico City',
  'GRU': 'Sao Paulo', 'EZE': 'Buenos Aires', 'SCL': 'Santiago', 'BOG': 'Bogota',
  // Africa
  'JNB': 'Johannesburg', 'CPT': 'Cape Town', 'NBO': 'Nairobi', 'ADD': 'Addis Ababa',
  'CMN': 'Casablanca', 'LOS': 'Lagos', 'ACC': 'Accra',
  // Oceania
  'SYD': 'Sydney', 'MEL': 'Melbourne', 'BNE': 'Brisbane', 'PER': 'Perth',
  'AKL': 'Auckland', 'CHC': 'Christchurch',
};

const AIRLINE_CODES = {
  'BA': 'British Airways', 'EZY': 'easyJet', 'U2': 'easyJet',
  'FR': 'Ryanair', 'VS': 'Virgin Atlantic', 'AA': 'American Airlines',
  'UA': 'United', 'DL': 'Delta', 'LH': 'Lufthansa', 'AF': 'Air France',
  'KL': 'KLM', 'EK': 'Emirates', 'QR': 'Qatar Airways', 'TK': 'Turkish Airlines',
  'W9': 'Wizz Air', 'W6': 'Wizz Air', 'LS': 'Jet2', 'TOM': 'TUI',
  'AI': 'Air India', '6E': 'IndiGo', 'SQ': 'Singapore Airlines',
  'CA': 'Air China', 'CX': 'Cathay Pacific', 'MU': 'China Eastern',
  'CZ': 'China Southern', 'NH': 'ANA', 'JL': 'Japan Airlines',
  'KE': 'Korean Air', 'OZ': 'Asiana', 'TG': 'Thai Airways',
  'MH': 'Malaysia Airlines', 'GA': 'Garuda Indonesia', 'PR': 'Philippine Airlines',
  'VN': 'Vietnam Airlines',
  'ET': 'Ethiopian', 'SA': 'South African', 'MS': 'EgyptAir',
  'QF': 'Qantas', 'NZ': 'Air New Zealand', 'AC': 'Air Canada',
  'AV': 'Avianca', 'LA': 'LATAM', 'AM': 'Aeromexico',
  'IB': 'Iberia', 'AZ': 'ITA Airways', 'TP': 'TAP Portugal',
  'SK': 'SAS', 'AY': 'Finnair', 'LX': 'Swiss',
  'OS': 'Austrian', 'SN': 'Brussels Airlines', 'LO': 'LOT Polish',
};

// Airport name aliases for reverse lookup
const AIRPORT_ALIASES = {
  'london heathrow': 'LHR', 'heathrow': 'LHR', 'london heathrow arpt': 'LHR',
  'london gatwick': 'LGW', 'gatwick': 'LGW', 'london gatwick arpt': 'LGW',
  'narita': 'NRT', 'tokyo narita': 'NRT', 'tokyo': 'NRT',
  'kansai': 'KIX', 'osaka kansai': 'KIX', 'kansai international arpt': 'KIX', 'osaka': 'KIX',
  'mumbai': 'BOM', 'bombay': 'BOM',
  'delhi': 'DEL', 'new delhi': 'DEL',
  'thiruvananthapuram': 'TRV', 'trivandrum': 'TRV',
  'bangalore': 'BLR', 'bengaluru': 'BLR',
  'chennai': 'MAA', 'madras': 'MAA',
  'kolkata': 'CCU', 'calcutta': 'CCU',
  'goa': 'GOI', 'hyderabad': 'HYD', 'kochi': 'COK', 'cochin': 'COK',
};

const MONTHS = {
  'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
  'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5, 'jul': 6, 'july': 6,
  'aug': 7, 'august': 7, 'sep': 8, 'september': 8, 'oct': 9, 'october': 9,
  'nov': 10, 'november': 10, 'dec': 11, 'december': 11
};

/**
 * Get airport name from code
 */
function getAirportName(code) {
  if (!code) return '';
  return AIRPORT_CODES[code.toUpperCase()] || code;
}

/**
 * Get airport code from name
 */
function getAirportCode(name) {
  if (!name) return '';
  const upper = name.toUpperCase();
  if (AIRPORT_CODES[upper]) return upper; // Already a code

  const lower = name.toLowerCase().trim();
  if (AIRPORT_ALIASES[lower]) return AIRPORT_ALIASES[lower];

  // Check partial matches
  for (const [alias, code] of Object.entries(AIRPORT_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return code;
    }
  }
  return '';
}

/**
 * Format date as ISO string
 */
function formatDateISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Parse date from various formats
 */
function parseDate(text) {
  // ISO: 2026-03-15
  let m = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  // Long: 15 March 2026, 15th March 2026
  m = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i);
  if (m) {
    return formatDateISO(parseInt(m[3]), MONTHS[m[2].toLowerCase().substring(0,3)], parseInt(m[1]));
  }

  // Short: March 15, 2026 or Mar 15
  m = text.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?/i);
  if (m) {
    const year = m[3] ? parseInt(m[3]) : new Date().getFullYear();
    return formatDateISO(year, MONTHS[m[1].toLowerCase().substring(0,3)], parseInt(m[2]));
  }

  // UK: 15/03/2026
  m = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    return formatDateISO(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  }

  return '';
}

/**
 * Main parse function - detects format and delegates
 */
function parseFlights(text) {
  const normalized = text.replace(/\r\n/g, '\n').trim();

  // Try GDS format: 1. AI 128 U 28JAN LHRBOM... or 1  AI 132 S 20FEB 5 LHRBLR...
  if (/^\s*\d+\.?\s+[A-Z]{2}\s*\d+/m.test(normalized)) {
    const result = parseGDS(normalized);
    if (result.length > 0) return result;
  }

  // Try Itinerary format: "Departing from X, time, date"
  if (/Departing from/i.test(normalized) && /Arriving at/i.test(normalized)) {
    const result = parseItinerary(normalized);
    if (result.length > 0) return result;
  }

  // Try Booking format: "Outbound:" with multi-line details
  if (/\b(Outbound|Inbound|Return):/i.test(normalized)) {
    const result = parseBookingFormat(normalized);
    if (result.length > 0) return result;
  }

  // Try Vietnam Airlines / travel agent format: LHR:Fri 11:00 13 Mar,2026
  if (/[A-Z]{3}:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{1,2}:\d{2}\s+\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(normalized)) {
    const result = parseVietnamFormat(normalized);
    if (result.length > 0) return result;
  }

  // Fallback: generic parser
  return parseGeneric(normalized);
}

/**
 * Parse GDS format (Amadeus/Sabre/Galileo/MSC)
 * Example 1: 1. AI  128 U  28JAN LHRBOM AK1  1330  #0410   WE
 * Example 2: 1  AI 132 S 20FEB 5 LHRBLR HK1  2005 2  2105 1220+1 788 E 0
 */
function parseGDS(text) {
  const flights = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (/OPERATED BY/i.test(line)) continue;
    if (/SEE RTSVC/i.test(line)) continue;
    if (!line.trim()) continue;

    const monthMap = {'JAN':0,'FEB':1,'MAR':2,'APR':3,'MAY':4,'JUN':5,'JUL':6,'AUG':7,'SEP':8,'OCT':9,'NOV':10,'DEC':11};

    // Pattern 1: Original format with dot
    // 1. AI  128 U  28JAN LHRBOM AK1  1330  #0410   WE
    let m = line.match(/^\s*\d+\.\s*([A-Z]{2})\s*(\d+)\s+\w\s+(\d{1,2})([A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+\w+\d?\s+(\d{4})\s+#?(\d{4})/i);

    if (m) {
      const [, airline, flightNum, day, monthStr, from, to, depTime, arrTime] = m;
      const month = monthMap[monthStr.toUpperCase()];
      const now = new Date();
      const year = month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();

      flights.push({
        date: formatDateISO(year, month, parseInt(day)),
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        flight: airline + flightNum,
        dep: depTime.substring(0,2) + ':' + depTime.substring(2,4),
        arr: arrTime.substring(0,2) + ':' + arrTime.substring(2,4),
        airline: AIRLINE_CODES[airline] || airline,
        raw: line.trim()
      });
      continue;
    }

    // Pattern 2: MSC format without dot
    // 1  AI 132 S 20FEB 5 LHRBLR HK1  2005 2  2105 1220+1 788 E 0
    // 3  AI 133 L 15MAR 7 BLRLHR HK1  1310 2  1410 1930   788 E 0
    m = line.match(/^\s*\d+\s+([A-Z]{2})\s*(\d+)\s+\w\s+(\d{1,2})([A-Z]{3})\s+\d\s+([A-Z]{3})([A-Z]{3})\s+\w+\d?\s+(\d{4})/i);

    if (m) {
      const [, airline, flightNum, day, monthStr, from, to, depTime] = m;
      const month = monthMap[monthStr.toUpperCase()];
      const now = new Date();
      const year = month < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();

      // Find arrival time - last 4 digits before aircraft type, may have +1
      const arrMatch = line.match(/(\d{4})(?:\+\d)?\s+\d{3}\s+\w/);
      let arrTime = arrMatch ? arrMatch[1] : '';

      flights.push({
        date: formatDateISO(year, month, parseInt(day)),
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        flight: airline + flightNum,
        dep: depTime.substring(0,2) + ':' + depTime.substring(2,4),
        arr: arrTime ? arrTime.substring(0,2) + ':' + arrTime.substring(2,4) : '',
        airline: AIRLINE_CODES[airline] || airline,
        raw: line.trim()
      });
    }
  }

  return flights;
}

/**
 * Parse Itinerary format with "Departing from" / "Arriving at"
 */
function parseItinerary(text) {
  const flights = [];

  // Find all departure/arrival pairs
  const depRegex = /Departing from\s+([^,]+),\s*(\d{1,2}:\d{2}),\s*(\d{1,2}\s+\w+\s+\d{4})/gi;
  const arrRegex = /Arriving at\s+([^,]+),\s*(\d{1,2}:\d{2}),\s*(\d{1,2}\s+\w+\s+\d{4})/gi;

  const departures = [];
  const arrivals = [];

  let m;
  while ((m = depRegex.exec(text)) !== null) {
    departures.push({ city: m[1].trim(), time: m[2], date: m[3] });
  }
  while ((m = arrRegex.exec(text)) !== null) {
    arrivals.push({ city: m[1].trim(), time: m[2], date: m[3] });
  }

  // Find flight numbers: AI2606, BA123, etc.
  const flightNums = [];
  const fnRegex = /\b([A-Z]{2})(\d{2,4})\b/g;
  while ((m = fnRegex.exec(text)) !== null) {
    flightNums.push(m[1] + m[2]);
  }

  // Find airport codes shown as "TRV Thiruvananthapuram"
  const codeMap = {};
  const codeRegex = /\b([A-Z]{3})\s+([A-Za-z\s]+?)(?=\n|$|Flight|Connection|Leg)/g;
  while ((m = codeRegex.exec(text)) !== null) {
    codeMap[m[2].trim().toLowerCase()] = m[1];
  }

  // Match departures with arrivals
  for (let i = 0; i < departures.length; i++) {
    const dep = departures[i];
    const arr = arrivals[i];
    if (!arr) continue;

    // Get codes from map or lookup
    const fromCode = codeMap[dep.city.toLowerCase()] || getAirportCode(dep.city) || dep.city;
    const toCode = codeMap[arr.city.toLowerCase()] || getAirportCode(arr.city) || arr.city;

    const flightNum = flightNums[i] || '';
    const airlineCode = flightNum.substring(0, 2);

    flights.push({
      date: parseDate(dep.date),
      from: fromCode,
      to: toCode,
      flight: flightNum,
      dep: dep.time,
      arr: arr.time,
      airline: AIRLINE_CODES[airlineCode] || airlineCode,
      raw: `${flightNum} ${dep.city} to ${arr.city}`
    });
  }

  return flights;
}

/**
 * Parse Booking format with Outbound:/Inbound: sections
 */
function parseBookingFormat(text) {
  const flights = [];

  // Split by Outbound/Inbound/Return
  const sections = text.split(/(?=\b(?:Outbound|Inbound|Return):)/i).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n').map(l => l.trim()).filter(l => l);

    const flight = {
      date: '', from: '', to: '', flight: '', dep: '', arr: '', airline: '', raw: section.substring(0, 100)
    };

    let times = [];
    let dates = [];
    let airports = [];

    for (const line of lines) {
      // Skip noise
      if (/^(Outbound|Inbound|Return):/i.test(line)) continue;
      if (/^(Aircraft|Class|Baggage|Seats|Cabin):/i.test(line)) continue;
      if (/^Stop\s+\d/i.test(line)) continue;
      if (/^\d+\s*h\s*\d+\s*m$/i.test(line)) continue;
      if (/^bs\d+$/i.test(line)) continue;

      // Airline name
      if (!flight.airline && /^(Air China|British Airways|Virgin Atlantic|Emirates|Qatar|Air India|Lufthansa|easyJet|Ryanair)/i.test(line)) {
        flight.airline = line;
        continue;
      }

      // Time: HH:MM
      const timeMatch = line.match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        times.push(timeMatch[1].padStart(2, '0') + ':' + timeMatch[2]);
        continue;
      }

      // Date: 25 Nov
      const dateMatch = line.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = MONTHS[dateMatch[2].toLowerCase()];
        const year = new Date().getFullYear();
        dates.push(formatDateISO(month < new Date().getMonth() ? year + 1 : year, month, day));
        continue;
      }

      // Airport name with "Arpt"
      if (/arpt|airport/i.test(line)) {
        const code = getAirportCode(line);
        if (code) airports.push(code);
        continue;
      }

      // Known city name
      const code = getAirportCode(line);
      if (code) {
        airports.push(code);
      }
    }

    // Assign values
    if (times.length >= 1) flight.dep = times[0];
    if (times.length >= 2) flight.arr = times[1];
    if (dates.length >= 1) flight.date = dates[0];
    if (airports.length >= 1) flight.from = airports[0];
    if (airports.length >= 2) flight.to = airports[1];

    if (flight.from || flight.to || flight.dep) {
      flights.push(flight);
    }
  }

  return flights;
}

/**
 * Parse Vietnam Airlines / travel agent format
 * Example: LHR:Fri 11:00 13 Mar,2026London, London Heathrow Arpt
 */
function parseVietnamFormat(text) {
  const flights = [];
  const lines = text.split('\n');

  let currentFlight = null;
  let currentAirline = '';
  let currentFlightNum = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Airline name
    if (/^(Vietnam Airlines|Air India|British Airways|Emirates|Qatar Airways|Singapore Airlines|Thai Airways|Cathay Pacific)/i.test(line)) {
      currentAirline = line;
      continue;
    }

    // Flight number: VN - 56 or VN-56 or VN 56
    const fnMatch = line.match(/^([A-Z]{2})\s*[-–]?\s*(\d{1,4})$/);
    if (fnMatch) {
      currentFlightNum = fnMatch[1] + fnMatch[2];
      continue;
    }

    // Departure/Arrival line: LHR:Fri 11:00 13 Mar,2026London, London Heathrow Arpt
    const lineMatch = line.match(/^([A-Z]{3}):(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2}:\d{2})\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?(\d{4})/i);
    if (lineMatch) {
      const [, code, , time, day, month, year] = lineMatch;

      if (!currentFlight) {
        // This is a departure
        currentFlight = {
          from: code.toUpperCase(),
          dep: time,
          date: formatDateISO(parseInt(year), MONTHS[month.toLowerCase()], parseInt(day)),
          to: '',
          arr: '',
          flight: currentFlightNum,
          airline: currentAirline || AIRLINE_CODES[currentFlightNum.substring(0,2)] || ''
        };
      } else {
        // This is an arrival
        currentFlight.to = code.toUpperCase();
        currentFlight.arr = time;
        flights.push(currentFlight);
        currentFlight = null;
        currentFlightNum = '';
      }
      continue;
    }
  }

  return flights;
}

/**
 * Generic parser for simple formats
 */
function parseGeneric(text) {
  const flights = [];
  const lines = text.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const flight = {
      date: '', from: '', to: '', flight: '', dep: '', arr: '', airline: '', raw: line.trim()
    };

    // Flight number: BA123, AI2606
    const fnMatch = line.match(/\b([A-Z]{2,3})\s*(\d{1,4})\b/);
    if (fnMatch) {
      flight.flight = fnMatch[1] + fnMatch[2];
      flight.airline = AIRLINE_CODES[fnMatch[1]] || fnMatch[1];
    }

    // Route: LHR-ATH, LHR to ATH, LHR → ATH
    const routeMatch = line.match(/\b([A-Z]{3})\s*(?:[-–→>]|to)\s*([A-Z]{3})\b/i);
    if (routeMatch) {
      flight.from = routeMatch[1].toUpperCase();
      flight.to = routeMatch[2].toUpperCase();
    } else {
      // Find airport codes
      const codes = [];
      const codeMatch = line.matchAll(/\b([A-Z]{3})\b/g);
      for (const cm of codeMatch) {
        if (AIRPORT_CODES[cm[1]]) codes.push(cm[1]);
      }
      if (codes.length >= 2) {
        flight.from = codes[0];
        flight.to = codes[1];
      }
    }

    // Times
    const times = [];
    const timeMatches = line.matchAll(/\b(\d{1,2}):(\d{2})(?:\s*(am|pm))?\b/gi);
    for (const tm of timeMatches) {
      let h = parseInt(tm[1]);
      if (tm[3]) {
        if (tm[3].toLowerCase() === 'pm' && h < 12) h += 12;
        if (tm[3].toLowerCase() === 'am' && h === 12) h = 0;
      }
      times.push(h.toString().padStart(2, '0') + ':' + tm[2]);
    }
    if (times.length >= 1) flight.dep = times[0];
    if (times.length >= 2) flight.arr = times[1];

    // Date
    flight.date = parseDate(line);

    if (flight.from || flight.to || flight.flight) {
      flights.push(flight);
    }
  }

  return flights;
}

// Export
window.FlightParser = {
  parse: parseFlights,
  getAirportName: getAirportName,
  getAirportCode: getAirportCode,
  AIRPORT_CODES,
  AIRLINE_CODES
};
