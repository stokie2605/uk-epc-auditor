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
function generateMockEpc(address, postcode, category = 'domestic') {
  const ratings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const cleanedAddress = String(address || '').trim();
  const cleanedPostcode = String(postcode || '').trim().toUpperCase();
  const seed = (cleanedAddress + cleanedPostcode).length || 10;
  
  const ratingIndex = seed % ratings.length;
  const currentRating = ratings[ratingIndex];
  const potentialRating = ratings[Math.max(0, ratingIndex - (seed % 3))];
  
  // Estimate certification dates (valid for 10 years in the UK)
  const inspectionYear = 2018 + (seed % 9); // between 2018 and 2026
  const expiryYear = inspectionYear + 10;
  
  const currentVal = 95 - (ratingIndex * 12) - (seed % 5);
  const potentialVal = Math.min(98, currentVal + 8 + (seed % 6));

  const commercialTypes = ['Warehouse Depot', 'Retail Shop Unit', 'Office Suite', 'Light Industrial Workshop', 'Storage Facility'];
  const domesticTypes = ['Mid-terrace House', 'Self-contained Flat', 'Semi-detached House', 'Detached House', 'Studio Apartment'];

  return {
    address: cleanedAddress || 'Sample Property',
    postcode: cleanedPostcode || 'ST5 1QA',
    certificateNumber: `MOCK-${seed}-${1000 + (seed % 9000)}`,
    currentEnergyRating: currentRating,
    potentialEnergyRating: potentialRating,
    currentEnergyEfficiency: currentVal,
    potentialEnergyEfficiency: potentialVal,
    inspectionDate: `${inspectionYear}-04-${(seed % 28) + 1}`,
    certificateExpiry: `${expiryYear}-04-${(seed % 28) + 1}`,
    propertyType: category === 'commercial' 
      ? commercialTypes[seed % commercialTypes.length]
      : domesticTypes[seed % domesticTypes.length],
    localAuthority: 'Stafford Borough Council',
    constituency: 'Stafford',
    category: category,
    source: 'mocked'
  };
}

// GET endpoint to proxy detailed certificate metrics & upgrade recommendations
app.get('/api/certificate-details', async (req, res) => {
  const { certificateNumber } = req.query;
  if (!certificateNumber) {
    return res.status(400).json({ error: 'Missing certificateNumber parameter.' });
  }

  const key = process.env.EPC_API_KEY;
  const isMockMode = !key || key.includes('api-token') || key.includes('paste-your-received') || req.query.mock === 'true';

  if (isMockMode || certificateNumber.startsWith('MOCK-')) {
    // Generate deterministic mock improvements
    const seed = certificateNumber.split('-')[1] ? parseInt(certificateNumber.split('-')[1]) : 15;
    const ratings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const currentRating = ratings[seed % ratings.length];
    const potentialRating = ratings[Math.max(0, (seed % ratings.length) - 2)];

    const mockImprovements = [
      {
        sequence: 1,
        typical_saving: { value: 140 + (seed % 50), currency: 'GBP' },
        indicative_cost: '£500 - £1,500',
        improvement_details: { improvement_number: 1 },
        improvement_description: 'Cavity wall insulation',
        improvement_type: 'Cavity wall insulation'
      },
      {
        sequence: 2,
        typical_saving: { value: 30 + (seed % 15), currency: 'GBP' },
        indicative_cost: '£80 - £300',
        improvement_details: { improvement_number: 2 },
        improvement_description: 'Low energy lighting upgrade',
        improvement_type: 'Lighting upgrade'
      },
      {
        sequence: 3,
        typical_saving: { value: 280 + (seed % 100), currency: 'GBP' },
        indicative_cost: '£4,000 - £6,000',
        improvement_details: { improvement_number: 3 },
        improvement_description: 'Solar photovoltaic panels, 2.5 kWp',
        improvement_type: 'Solar PV installation'
      }
    ];

    return res.json({
      certificateNumber,
      energyRatingCurrent: 50 + (seed % 20),
      energyRatingPotential: 75 + (seed % 15),
      currentEnergyEfficiencyBand: currentRating,
      potentialEnergyEfficiencyBand: potentialRating,
      suggested_improvements: mockImprovements
    });
  }

  try {
    const targetUrl = `https://api.get-energy-performance-data.communities.gov.uk/api/certificate?certificate_number=${encodeURIComponent(certificateNumber)}`;
    const apiResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${key}`
      }
    });

    if (!apiResponse.ok) {
      throw new Error(`Government registry details endpoint responded with status: ${apiResponse.status}`);
    }

    const rawData = await apiResponse.json();
    const cert = rawData.data || {};

    // Standardize recommendations
    const improvements = cert.suggested_improvements || cert.alternative_improvements || [];
    const formattedImprovements = improvements.map(imp => ({
      sequence: imp.sequence || 1,
      typical_saving: imp.typical_saving || { value: imp.typicalSaving || 0, currency: 'GBP' },
      indicative_cost: imp.indicative_cost || imp.indicativeCost || 'N/A',
      improvement_description: imp.improvement_description || imp.description || 'Improvement details',
      improvement_type: imp.improvement_type || imp.improvementType || 'General upgrade'
    }));

    res.json({
      certificateNumber,
      energyRatingCurrent: cert.energy_rating_current || cert.energyRatingCurrent || 'N/A',
      energyRatingPotential: cert.energy_rating_potential || cert.energyRatingPotential || 'N/A',
      currentEnergyEfficiencyBand: cert.current_energy_efficiency_band || cert.currentEnergyEfficiencyBand || 'N/A',
      potentialEnergyEfficiencyBand: cert.potential_energy_efficiency_band || cert.potentialEnergyEfficiencyBand || 'N/A',
      suggested_improvements: formattedImprovements
    });

  } catch (err) {
    console.error(`Failed live detailed query for ${certificateNumber}:`, err.message);
    res.status(500).json({ error: `Registry detailed query failed: ${err.message}` });
  }
});

// POST endpoint for auditing a batch of properties
app.post('/api/check', async (req, res) => {
  const { properties, category = 'domestic' } = req.body;
  if (!Array.isArray(properties) || properties.length === 0) {
    return res.status(400).json({ error: 'Provide a list of properties to check.' });
  }

  const key = process.env.EPC_API_KEY;
  const isMockMode = !key || key.includes('api-token') || key.includes('paste-your-received') || req.query.mock === 'true';

  console.log(`Checking batch of ${properties.length} properties (Mode: ${isMockMode ? 'MOCK' : 'LIVE'}, Category: ${category.toUpperCase()})`);

  const results = [];

  for (const prop of properties) {
    const address = String(prop.address || '').trim();
    const postcode = String(prop.postcode || '').trim().toUpperCase();

    if (!postcode) {
      results.push({ address, postcode, error: 'Missing postcode.' });
      continue;
    }

    if (isMockMode) {
      results.push(generateMockEpc(address, postcode, category));
      continue;
    }

    try {
      // Map API path to non-domestic or domestic depending on toggle category
      const apiPath = category === 'commercial' ? 'non-domestic' : 'domestic';
      const targetUrl = `https://api.get-energy-performance-data.communities.gov.uk/api/${apiPath}/search?postcode=${encodeURIComponent(postcode)}&page_size=100`;

      const apiResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${key}`
        }
      });

      if (apiResponse.status === 404) {
        results.push({
          address: address || 'Postcode Area Search',
          postcode,
          error: `No domestic/commercial EPC records found in registry for this postcode.`
        });
        continue;
      }

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
              certificateNumber: match.certificateNumber || 'N/A',
              currentEnergyRating: match.currentEnergyEfficiencyBand || 'N/A',
              potentialEnergyRating: 'N/A',
              currentEnergyEfficiency: 'N/A',
              potentialEnergyEfficiency: 'N/A',
              inspectionDate: match.registrationDate || 'N/A',
              certificateExpiry,
              propertyType: category === 'commercial' ? 'Commercial Building' : 'Domestic Property',
              localAuthority: match.council || 'Unknown',
              constituency: match.constituency || 'Unknown',
              category: category,
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
        certificateNumber: match.certificateNumber || 'N/A',
        currentEnergyRating: match.currentEnergyEfficiencyBand || 'N/A',
        potentialEnergyRating: 'N/A',
        currentEnergyEfficiency: 'N/A',
        potentialEnergyEfficiency: 'N/A',
        inspectionDate: match.registrationDate || 'N/A',
        certificateExpiry,
        propertyType: category === 'commercial' ? 'Commercial Building' : 'Domestic Property',
        localAuthority: match.council || 'Unknown',
        constituency: match.constituency || 'Unknown',
        category: category,
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
