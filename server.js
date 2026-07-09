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

  const email = process.env.EPC_API_EMAIL;
  const key = process.env.EPC_API_KEY;
  const isMockMode = !email || !key || key.includes('api-token') || req.query.mock === 'true';

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
      const authString = Buffer.from(`${email}:${key}`).toString('base64');
      const targetUrl = `https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=${encodeURIComponent(postcode)}&size=30`;

      const apiResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`Government registry responded with status: ${apiResponse.status}`);
      }

      const rawData = await apiResponse.json();
      const rows = rawData.rows || [];

      // Attempt to find the best match for the specific address number/name
      let match = rows[0]; // fallback to first property in postcode if no specific match
      if (address) {
        const numberMatch = address.match(/^\d+/);
        if (numberMatch) {
          const houseNum = numberMatch[0];
          const found = rows.find(r => String(r.address || '').includes(houseNum));
          if (found) match = found;
        }
      }

      if (!match) {
        results.push({
          address,
          postcode,
          error: 'No EPC records found in registry for this postcode.'
        });
        continue;
      }

      results.push({
        address: match.address || address,
        postcode: match.postcode || postcode,
        currentEnergyRating: match['current-energy-rating'] || 'N/A',
        potentialEnergyRating: match['potential-energy-rating'] || 'N/A',
        currentEnergyEfficiency: Number(match['current-energy-efficiency'] || 0),
        potentialEnergyEfficiency: Number(match['potential-energy-efficiency'] || 0),
        inspectionDate: match['inspection-date'] || 'N/A',
        certificateExpiry: match['lodgement-datetime'] 
          ? new Date(new Date(match['lodgement-datetime']).setFullYear(new Date(match['lodgement-datetime']).getFullYear() + 10)).toISOString().split('T')[0]
          : 'N/A',
        propertyType: match['property-type'] || 'Unknown',
        localAuthority: match['local-authority-label'] || 'Unknown',
        constituency: match['constituency-label'] || 'Unknown',
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
    console.log('Running in MOCK mode. Set EPC_API_EMAIL & EPC_API_KEY in .env for live registry integration.');
  }
});
