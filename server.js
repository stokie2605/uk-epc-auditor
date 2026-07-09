import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to generate deterministic mock data if live API credentials are not set
function generateMockEpc(address, postcode) {
  const ratings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const cleanedAddress = String(address || '').trim();
  const cleanedPostcode = String(postcode || '').trim().toUpperCase();
  const seed = (cleanedAddress + cleanedPostcode).length;
  
  const ratingIndex = seed % ratings.length;
  const currentRating = ratings[ratingIndex];
  
  // Detemine potential rating (always equal or better)
  const potentialRating = ratings[Math.max(0, ratingIndex - (seed % 3))];
  
  // Estimate certification dates (valid for 10 years in the UK)
  const inspectionYear = 2018 + (seed % 9); // between 2018 and 2026
  const expiryYear = inspectionYear + 10;
  
  const currentVal = 95 - (ratingIndex * 12) - (seed % 5);
  const potentialVal = Math.min(98, currentVal + 8 + (seed % 6));

  return {
    address: cleanedAddress || 'Sample Property',
    postcode: cleanedPostcode || 'ST5 1QA',
    currentEnergyRating: currentRating,
    potentialEnergyRating: potentialRating,
    currentEnergyEfficiency: currentVal,
    potentialEnergyEfficiency: potentialVal,
    inspectionDate: `${inspectionYear}-04-${(seed % 28) + 1}`,
    certificateExpiry: `${expiryYear}-04-${(seed % 28) + 1}`,
    propertyType: seed % 2 === 0 ? 'Mid-terrace House' : 'Self-contained Flat',
    localAuthority: 'Stafford Borough Council',
    constituency: 'Stafford',
    source: 'mocked'
  };
}

// POST endpoint for auditing a batch of properties
app.post('/api/check', async (req, res) => {
  const { properties } = req.body;
  if (!Array.isArray(properties) || properties.length === 0) {
    return res.status(400).json({ error: 'Provide a list of properties to check.' });
  }

  const key = process.env.EPC_API_KEY;
  const isMockMode = !key || key.includes('api-token') || key.includes('paste-your-received') || req.query.mock === 'true';

  console.log(`Checking batch of ${properties.length} properties (Mode: ${isMockMode ? 'MOCK' : 'LIVE'})`);

  const results = [];

  for (const prop of properties) {
    const address = String(prop.address || '').trim();
    const postcode = String(prop.postcode || '').trim().toUpperCase();

    if (!postcode) {
      results.push({ address, postcode, error: 'Missing postcode.' });
      continue;
    }

    if (isMockMode) {
      results.push(generateMockEpc(address, postcode));
      continue;
    }

    try {
      // Query the correct new MHCLG domain name and endpoint path
      const targetUrl = `https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?postcode=${encodeURIComponent(postcode)}&page_size=100`;

      const apiResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${key}`
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`Government registry responded with status: ${apiResponse.status}`);
      }

      const rawData = await apiResponse.json();
      const rows = rawData.data || [];

      // If no address is specified, expand the search to return ALL properties in this postcode
      if (!address) {
        if (rows.length === 0) {
          results.push({
            address: 'Postcode Area Search',
            postcode,
            error: 'No EPC records found in registry for this postcode.'
          });
        } else {
          for (const match of rows) {
            let certificateExpiry = 'N/A';
            if (match.registrationDate && match.registrationDate !== 'N/A') {
              try {
                const regDate = new Date(match.registrationDate);
                regDate.setFullYear(regDate.getFullYear() + 10);
                certificateExpiry = regDate.toISOString().split('T')[0];
              } catch (e) {}
            }

            results.push({
              address: match.addressLine1 ? `${match.addressLine1}${match.addressLine2 ? ', ' + match.addressLine2 : ''}` : 'Unknown Address',
              postcode: match.postcode || postcode,
              currentEnergyRating: match.currentEnergyEfficiencyBand || 'N/A',
              potentialEnergyRating: 'N/A',
              currentEnergyEfficiency: 'N/A',
              potentialEnergyEfficiency: 'N/A',
              inspectionDate: match.registrationDate || 'N/A',
              certificateExpiry,
              propertyType: 'Domestic Property',
              localAuthority: match.council || 'Unknown',
              constituency: match.constituency || 'Unknown',
              source: 'live_registry'
            });
          }
        }
        continue;
      }

      // If an address was specified, perform our strict matching
      let match = null;
      const numberMatch = address.match(/^\d+/);
      if (numberMatch) {
        const houseNum = numberMatch[0];
        const regexes = [
          new RegExp(`^${houseNum}\\b`, 'i'),
          new RegExp(`\\b(flat|apartment|unit|room|suite|no|no.)\\s+${houseNum}\\b`, 'i'),
          new RegExp(`^${houseNum},`, 'i')
        ];
        
        match = rows.find(r => {
          const addrStr = String(r.addressLine1 || '');
          return regexes.some(rx => rx.test(addrStr));
        });
      }

      // If no strict address match was found, fallback to the first row in the postcode
      if (!match && rows.length > 0) {
        match = rows[0];
      }

      if (!match) {
        results.push({
          address,
          postcode,
          error: 'No EPC records found in registry for this postcode.'
        });
        continue;
      }

      // Format Expiry Date (registrationDate + 10 years)
      let certificateExpiry = 'N/A';
      if (match.registrationDate && match.registrationDate !== 'N/A') {
        try {
          const regDate = new Date(match.registrationDate);
          regDate.setFullYear(regDate.getFullYear() + 10);
          certificateExpiry = regDate.toISOString().split('T')[0];
        } catch (e) {
          // ignore date error
        }
      }

      results.push({
        address: match.addressLine1 ? `${match.addressLine1}${match.addressLine2 ? ', ' + match.addressLine2 : ''}` : address,
        postcode: match.postcode || postcode,
        currentEnergyRating: match.currentEnergyEfficiencyBand || 'N/A',
        potentialEnergyRating: 'N/A',
        currentEnergyEfficiency: 'N/A',
        potentialEnergyEfficiency: 'N/A',
        inspectionDate: match.registrationDate || 'N/A',
        certificateExpiry,
        propertyType: 'Domestic Property',
        localAuthority: match.council || 'Unknown',
        constituency: match.constituency || 'Unknown',
        source: 'live_registry'
      });

    } catch (err) {
      console.error(`Failed live query for ${postcode}:`, err.message);
      results.push({
        address,
        postcode,
        error: `Registry connection failed: ${err.message}`
      });
    }
  }

  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`UK EPC Compliance Tracker running at http://localhost:${PORT}`);
  if (!process.env.EPC_API_KEY) {
    console.log('Running in MOCK mode. Set EPC_API_KEY in .env for live registry integration.');
  }
});
