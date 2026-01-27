const cheerio = require('cheerio');

async function test() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('https://holidays.flightsandpackages.com/Holidays/france/a-cruise-in-aquitaine-the-great-wines-of-southern-france');
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Looking for JSON-LD scripts...');
  $('script[type="application/ld+json"]').each((i, script) => {
    try {
      const jsonData = JSON.parse($(script).html());
      console.log('Found type:', jsonData['@type']);

      if (jsonData['@type'] === 'FAQPage' && jsonData.mainEntity) {
        console.log('FAQPage has', jsonData.mainEntity.length, 'questions');
        jsonData.mainEntity.forEach(faq => {
          if (faq.name && faq.name.toLowerCase().includes('included')) {
            console.log('\nFAQ Name:', faq.name);
            const answer = faq.acceptedAnswer?.text || '';
            console.log('Answer:', answer);

            const includesMatch = answer.match(/includes?:?\s*(.+)/i);
            if (includesMatch) {
              const items = includesMatch[1].split(',');
              console.log('\nItems found:', items.length);
              items.forEach((item, idx) => {
                console.log(idx + 1, ':', item.trim());
              });
            }
          }
        });
      }
    } catch(e) {
      console.log('Error parsing JSON-LD:', e.message);
    }
  });
}

test().catch(console.error);
