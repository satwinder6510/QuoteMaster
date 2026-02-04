const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const path = require('path');
const crypto = require('crypto');
const { findTaxRule, calculateTax, getAvailableCities, getAllTaxEntries, setTaxEntry, deleteTaxEntry } = require('./city-taxes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Admin authentication
const ADMIN_PASSWORD = 'admin123';
const adminSessions = new Map(); // token -> { created: Date }

// Clean up expired sessions (older than 24 hours)
function cleanupSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions) {
    if (now - session.created > 24 * 60 * 60 * 1000) {
      adminSessions.delete(token);
    }
  }
}

// Middleware to check admin auth
function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { created: Date.now() });
    cleanupSessions();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token) {
    adminSessions.delete(token);
  }
  res.json({ success: true });
});

// Get all tax entries (admin)
app.get('/api/admin/taxes', requireAdminAuth, (req, res) => {
  res.json(getAllTaxEntries());
});

// Add new tax entry (admin)
app.post('/api/admin/taxes', requireAdminAuth, (req, res) => {
  const { id, entry } = req.body;
  if (!id || !entry || !entry.city || !entry.countryCode || !entry.basis) {
    return res.status(400).json({ error: 'Missing required fields: id, entry.city, entry.countryCode, entry.basis' });
  }

  const success = setTaxEntry(id, entry);
  if (success) {
    res.json({ success: true, id, entry });
  } else {
    res.status(500).json({ error: 'Failed to save tax entry' });
  }
});

// Update existing tax entry (admin)
app.put('/api/admin/taxes/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { entry } = req.body;

  if (!entry || !entry.city || !entry.countryCode || !entry.basis) {
    return res.status(400).json({ error: 'Missing required fields: entry.city, entry.countryCode, entry.basis' });
  }

  const success = setTaxEntry(id, entry);
  if (success) {
    res.json({ success: true, id, entry });
  } else {
    res.status(500).json({ error: 'Failed to update tax entry' });
  }
});

// Delete tax entry (admin)
app.delete('/api/admin/taxes/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const success = deleteTaxEntry(id);
  if (success) {
    res.json({ success: true, id });
  } else {
    res.status(404).json({ error: 'Tax entry not found' });
  }
});

// Scrape package details from URL
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.includes('holidays.flightsandpackages.com')) {
      return res.status(400).json({ error: 'Invalid URL. Must be from holidays.flightsandpackages.com' });
    }

    // Dynamic import for node-fetch (ESM)
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract package details
    const packageData = {
      title: '',
      price: '',
      duration: '',
      included: [],
      itinerary: [],
      highlights: [],
      accommodation: []
    };

    // First, try to extract from JSON-LD structured data (most complete)
    console.log('Looking for JSON-LD scripts...');
    $('script[type="application/ld+json"]').each((i, script) => {
      try {
        const jsonData = JSON.parse($(script).html());
        console.log('Found JSON-LD type:', jsonData['@type']);

        // Check for FAQPage with "What is included" question
        if (jsonData['@type'] === 'FAQPage' && jsonData.mainEntity) {
          console.log('Found FAQPage with', jsonData.mainEntity.length, 'questions');
          jsonData.mainEntity.forEach(faq => {
            if (faq.name && faq.name.toLowerCase().includes('included') &&
                !faq.name.toLowerCase().includes('not included')) {
              console.log('Found included FAQ:', faq.name);
              // Normalize newlines to spaces and decode HTML entities
              let answer = (faq.acceptedAnswer?.text || '')
                .replace(/\r?\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/&#61;/g, '=')
                .replace(/&#39;/g, "'");
              console.log('Answer:', answer.substring(0, 100));

              // Parse "The package includes: item1, item2, item3"
              const includesMatch = answer.match(/includes?:?\s*(.+)/i);
              if (includesMatch) {
                let content = includesMatch[1];
                console.log('Matched includes text...');

                // Check if this is section-header format (TOUR GUIDE:, ACCOMMODATION:, MEALS:, etc.)
                const sectionHeaders = ['TOUR GUIDE:', 'ACCOMMODATION:', 'MEALS:', 'TRANSPORT:', 'ENTRANCE FEES', 'TRANSFERS:'];
                const hasSectionHeaders = sectionHeaders.some(h => content.includes(h));

                let items = [];
                if (hasSectionHeaders) {
                  console.log('Detected section-header format');
                  // Split by section headers and extract summaries
                  const sections = content.split(/(?=(?:TOUR GUIDE:|ACCOMMODATION:|MEALS:|TRANSPORT:|ENTRANCE FEES|TRANSFERS:))/i);
                  sections.forEach(section => {
                    section = section.trim();
                    if (!section) return;

                    // For section headers, extract just the key info
                    if (section.match(/^TOUR GUIDE:/i)) {
                      const match = section.match(/^TOUR GUIDE:\s*(.+?)(?=ACCOMMODATION|MEALS|TRANSPORT|ENTRANCE|$)/i);
                      if (match) items.push('Tour Guide: ' + match[1].trim().split(/(?=[A-Z]{2})/)[0].trim());
                    } else if (section.match(/^ACCOMMODATION:/i)) {
                      const match = section.match(/(\d+)\s*nights?/i);
                      if (match) items.push(match[0] + ' accommodation');
                    } else if (section.match(/^MEALS:/i)) {
                      const match = section.match(/^MEALS:\s*(.+?)(?=TRANSPORT|ENTRANCE|ACCOMMODATION|$)/i);
                      if (match) {
                        let meals = match[1].trim();
                        // Clean up: "7 Breakfasts3 Dinners" -> "7 Breakfasts, 3 Dinners"
                        meals = meals.replace(/(\d+)\s*(Breakfasts?|Lunches?|Dinners?)/gi, '$1 $2,');
                        meals = meals.replace(/,\s*$/, '').replace(/,+/g, ', ');
                        items.push('Meals: ' + meals);
                      }
                    } else if (section.match(/^TRANSPORT:/i)) {
                      items.push('Airport transfers and transportation throughout');
                    } else if (section.match(/^ENTRANCE FEES/i)) {
                      items.push('All entrance fees and activities as per itinerary');
                    } else if (!section.match(/^[A-Z\s]+:/)) {
                      // Plain items before section headers (like "Flights Included")
                      section.split(',').forEach(item => {
                        const cleaned = item.trim();
                        if (cleaned && cleaned.length > 2 && !cleaned.match(/^[A-Z\s]+$/)) {
                          items.push(cleaned);
                        }
                      });
                    }
                  });
                } else {
                  // Standard comma-separated format
                  console.log('Using comma-separated format');
                  items = content.split(',');
                }

                console.log('Found', items.length, 'items');
                items.forEach(item => {
                  const cleaned = item.trim().replace(/\.$/, '').replace(/^\s+|\s+$/g, '');
                  if (cleaned && cleaned.length > 2) {
                    // Avoid duplicates
                    if (!packageData.included.some(existing =>
                      existing.toLowerCase() === cleaned.toLowerCase())) {
                      packageData.included.push(cleaned);
                    }
                  }
                });
                console.log('After JSON-LD, included has', packageData.included.length, 'items');
              }
            }
          });
        }

        // Check for TouristTrip schema
        if (jsonData['@type'] === 'TouristTrip') {
          if (jsonData.name && !packageData.title) {
            packageData.title = jsonData.name;
          }
          if (jsonData.duration) {
            packageData.duration = jsonData.duration.replace('P', '').replace('D', ' Days');
          }
          if (jsonData.offers?.price) {
            packageData.price = '£' + jsonData.offers.price;
          }
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    });

    // Title - try multiple selectors (fallback if not from JSON-LD)
    if (!packageData.title) {
      packageData.title = $('h1').first().text().trim() ||
                          $('[class*="title"]').first().text().trim() ||
                          $('title').text().split('|')[0].trim();
    }

    // Price - look for price patterns
    const priceText = $('body').text();
    const priceMatch = priceText.match(/(?:from\s*)?£(\d{1,},?\d*)/i);
    if (priceMatch) {
      packageData.price = '£' + priceMatch[1];
    }

    // Duration
    const durationMatch = priceText.match(/(\d+)\s*(?:days?|nights?)/i);
    if (durationMatch) {
      packageData.duration = durationMatch[0];
    }

    // What's Included - only scrape HTML if JSON-LD didn't give us data
    // Be precise: only grab lists that are direct children of "What's Included" sections
    if (packageData.included.length === 0) {
      // Find headings that specifically say "What's Included" (not just "includes")
      $('h1, h2, h3, h4, h5, h6').each((i, heading) => {
        const headingText = $(heading).text().toLowerCase().trim();
        if (headingText.includes("what's included") || headingText.includes('whats included')) {
          // Get the next sibling elements until we hit another heading
          let next = $(heading).next();
          let maxElements = 5; // Don't go too far

          while (next.length && maxElements > 0) {
            const tagName = next.prop('tagName')?.toLowerCase();

            // Stop if we hit another heading (new section)
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) break;

            // Extract from ul/ol lists
            if (tagName === 'ul' || tagName === 'ol') {
              next.find('li').each((j, li) => {
                const text = $(li).text().trim().replace(/\s+/g, ' ');
                if (text && text.length > 3 && !packageData.included.includes(text)) {
                  packageData.included.push(text);
                }
              });
            }

            // Also check if this element contains lists (for wrapper divs)
            if (tagName === 'div' || tagName === 'section') {
              next.find('> ul li, > ol li, > div > ul li, > div > ol li').each((j, li) => {
                const text = $(li).text().trim().replace(/\s+/g, ' ');
                if (text && text.length > 3 && !packageData.included.includes(text)) {
                  packageData.included.push(text);
                }
              });
            }

            next = next.next();
            maxElements--;
          }
        }
      });
    }

    // Itinerary - look for day patterns
    const dayRegex = /day\s*(\d+)[:\s-]*(.+?)(?=day\s*\d+|$)/gi;
    const bodyText = $('body').text();
    let match;
    while ((match = dayRegex.exec(bodyText)) !== null) {
      const dayNum = match[1];
      let description = match[2].trim().substring(0, 300);
      // Clean up the description
      description = description.replace(/\s+/g, ' ').trim();
      if (description.length > 10) {
        packageData.itinerary.push({
          day: parseInt(dayNum),
          description: description
        });
      }
    }

    // Deduplicate itinerary
    const seen = new Set();
    packageData.itinerary = packageData.itinerary.filter(item => {
      const key = item.day;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.day - b.day);

    // Clean up included items - remove junk
    const junkPatterns = [
      /^home$/i,
      /^packages?$/i,
      /^thailand\s*holidays?$/i,
      /^about(\s+us)?$/i,
      /^contact(\s+us)?$/i,
      /^faq$/i,
      /holidays?$/i,
      /^from\s*£/i,
      /- from £/i,
      /^\d+\s*nights?.*(?:from\s*£|holiday|package|trip)/i,  // "7 Nights Thailand from £999" (other packages)
      /^\d+\s*night\s+trip/i,
      /solo\s+trip/i,
      /^we strongly recommend/i,
      /travel insurance/i,
      /nature lovers?$/i,
      /photography enthusiasts?$/i,
      /beach lovers?$/i,
      /relaxation seekers?$/i,
      /^\.\.\.and \d+ more/i,
    ];

    packageData.included = packageData.included.filter(item => {
      // Skip items that match junk patterns
      for (const pattern of junkPatterns) {
        if (pattern.test(item)) return false;
      }
      // Skip items that are just the package title
      if (item.toLowerCase() === packageData.title.toLowerCase()) return false;
      // Skip very short items
      if (item.length < 10) return false;
      // Skip items that look like other package recommendations
      if (item.includes('£') && item.includes('Night')) return false;
      return true;
    });

    // Deduplicate included (case-insensitive)
    const seenIncluded = new Set();
    packageData.included = packageData.included.filter(item => {
      const lower = item.toLowerCase();
      if (seenIncluded.has(lower)) return false;
      seenIncluded.add(lower);
      return true;
    });

    res.json(packageData);

  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get city tax for given cities
app.post('/api/city-tax', (req, res) => {
  try {
    const { cities, nights, persons } = req.body;

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ error: 'Cities array is required' });
    }

    const nightsNum = parseInt(nights) || 1;
    const personsNum = parseInt(persons) || 1;

    const results = [];
    let totalMin = 0;
    let totalMax = 0;
    let hasPercentage = false;
    const currencies = new Set();

    for (const cityName of cities) {
      const rule = findTaxRule(cityName);
      if (rule) {
        const tax = calculateTax(rule, nightsNum, personsNum);
        if (tax) {
          results.push(tax);
          if (tax.isPercentage) {
            hasPercentage = true;
          } else {
            totalMin += tax.min;
            totalMax += tax.max;
            currencies.add(tax.currency);
          }
        }
      } else {
        results.push({
          city: cityName,
          notFound: true,
          notes: 'City tax information not available - please check locally.',
        });
      }
    }

    res.json({
      cities: results,
      totals: {
        min: Math.round(totalMin * 100) / 100,
        max: Math.round(totalMax * 100) / 100,
        currencies: Array.from(currencies),
        hasPercentage,
        note: hasPercentage ? 'Some cities charge a percentage of room rate - exact amount depends on accommodation cost.' : null,
      },
    });
  } catch (error) {
    console.error('City tax error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get list of available cities for autocomplete
app.get('/api/cities', (req, res) => {
  res.json(getAvailableCities());
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`QuoteMaster running at http://localhost:${PORT}`);
});
