// App State Manager
let portfolio = [];
const MEES_FINE_LIMIT = 5000;

// Sample properties for the mock portfolio demo
const sampleMockPortfolio = [
  { address: "12 Coronation Street", postcode: "ST5 1QA" },
  { address: "Flat 4, Priory Court", postcode: "ST4 1BU" },
  { address: "88 Newcastle Road", postcode: "ST5 0HA" },
  { address: "24 London Road", postcode: "ST4 7HL" },
  { address: "The Gables, High Street", postcode: "ST15 8AA" },
  { address: "Apartment 12, Waterside", postcode: "ST16 2BG" },
  { address: "7 Stafford Road", postcode: "ST17 9AD" }
];

// Cache UI Elements
const elements = {
  singleForm: document.getElementById('single-check-form'),
  inputAddress: document.getElementById('input-address'),
  inputPostcode: document.getElementById('input-postcode'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  btnSample: document.getElementById('btn-load-sample'),
  btnClear: document.getElementById('btn-clear-ledger'),
  mockToggle: document.getElementById('mock-mode-toggle'),
  statTotal: document.getElementById('stat-total'),
  statNonCompliant: document.getElementById('stat-noncompliant'),
  statFine: document.getElementById('stat-fine'),
  statCompliant: document.getElementById('stat-compliant'),
  ledgerBody: document.getElementById('ledger-body'),
  apiBadge: document.getElementById('api-status-badge'),
  apiBadgeText: document.getElementById('api-status-text')
};

// Start application
init();

function init() {
  // Restore ledger from sessionStorage if available
  const saved = sessionStorage.getItem('epc-portfolio-ledger');
  if (saved) {
    try {
      portfolio = JSON.parse(saved);
      updateDashboard();
    } catch (e) {
      portfolio = [];
    }
  }

  // Register Listeners
  elements.singleForm.addEventListener('submit', handleSingleCheck);
  elements.btnSample.addEventListener('click', loadSampleMockData);
  elements.btnClear.addEventListener('click', clearLedger);
  elements.mockToggle.addEventListener('change', updateApiBadgeStatus);
  
  // File Upload Handlers
  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileSelection);
  elements.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); elements.dropZone.classList.add('active'); });
  elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('active'));
  elements.dropZone.addEventListener('drop', handleFileDrop);

  updateApiBadgeStatus();
}

// Update the visual connection badge based on mock/live mode
function updateApiBadgeStatus() {
  const isMock = elements.mockToggle.checked;
  const dot = elements.apiBadge.querySelector('.badge-dot');
  
  if (isMock) {
    elements.apiBadgeText.textContent = 'Offline Demo Active';
    dot.classList.remove('active');
  } else {
    elements.apiBadgeText.textContent = 'Live UK Registry Target';
    dot.classList.add('active');
  }
}

// Form Handlers
async function handleSingleCheck(e) {
  e.preventDefault();
  const address = elements.inputAddress.value.trim();
  const postcode = elements.inputPostcode.value.trim();
  
  if (!postcode) return;

  // Visual button state loading
  const submitBtn = elements.singleForm.querySelector('button');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Scanning...';

  try {
    await scanProperties([{ address, postcode }]);
    elements.inputAddress.value = '';
    elements.inputPostcode.value = '';
  } catch (err) {
    console.error('Scan failed:', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// Bulk Upload Handlers
function handleFileSelection(e) {
  const file = e.target.files[0];
  if (file) parseAndScanCsv(file);
}

function handleFileDrop(e) {
  e.preventDefault();
  elements.dropZone.classList.remove('active');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    parseAndScanCsv(file);
  } else {
    alert('Please upload a valid CSV file.');
  }
}

function parseAndScanCsv(file) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      alert('CSV file is empty or missing data rows.');
      return;
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
    const addressIdx = headers.indexOf('address');
    const postcodeIdx = headers.indexOf('postcode');

    if (postcodeIdx === -1) {
      alert('CSV must contain a "postcode" column.');
      return;
    }

    const parsedProperties = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/["']/g, '').trim());
      if (row.length === 0 || !row[postcodeIdx]) continue;
      
      parsedProperties.push({
        address: addressIdx !== -1 ? row[addressIdx] : 'Address Not Listed',
        postcode: row[postcodeIdx]
      });
    }

    if (parsedProperties.length === 0) {
      alert('No valid postcode rows found in the CSV.');
      return;
    }

    alert(`Found ${parsedProperties.length} properties in CSV. Starting compliance audit...`);
    await scanProperties(parsedProperties);
  };
  reader.readAsText(file);
}

// Core API query function
async function scanProperties(propsList) {
  const isMock = elements.mockToggle.checked;
  const url = `/api/check${isMock ? '?mock=true' : ''}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: propsList })
    });

    if (!response.ok) throw new Error('API server returned an error.');

    const data = await response.json();
    const newResults = data.results || [];

    // Filter out duplicates (overwrite properties with matching address/postcode keys)
    newResults.forEach(newProp => {
      const idx = portfolio.findIndex(p => 
        p.postcode.toUpperCase() === newProp.postcode.toUpperCase() && 
        p.address.toLowerCase() === newProp.address.toLowerCase()
      );
      if (idx !== -1) {
        portfolio[idx] = newProp;
      } else {
        portfolio.unshift(newProp);
      }
    });

    // Save and update
    sessionStorage.setItem('epc-portfolio-ledger', JSON.stringify(portfolio));
    updateDashboard();

  } catch (err) {
    alert(`Audit run failed: ${err.message}`);
  }
}

// Interactive Mock Portfolio seed
async function loadSampleMockData() {
  const originalText = elements.btnSample.textContent;
  elements.btnSample.disabled = true;
  elements.btnSample.textContent = 'Loading mock data...';
  
  // Temporarily force mock toggle on
  const prevToggle = elements.mockToggle.checked;
  elements.mockToggle.checked = true;
  updateApiBadgeStatus();

  await scanProperties(sampleMockPortfolio);

  elements.mockToggle.checked = prevToggle;
  updateApiBadgeStatus();
  
  elements.btnSample.disabled = false;
  elements.btnSample.textContent = originalText;
}

function clearLedger() {
  if (confirm('Are you sure you want to clear the ledger?')) {
    portfolio = [];
    sessionStorage.removeItem('epc-portfolio-ledger');
    updateDashboard();
  }
}

// Render metrics widgets & table body rows
function updateDashboard() {
  const total = portfolio.length;
  elements.btnClear.style.display = total > 0 ? 'inline-block' : 'none';

  if (total === 0) {
    elements.statTotal.textContent = '0';
    elements.statNonCompliant.textContent = '0';
    elements.statFine.textContent = '£0';
    elements.statCompliant.textContent = '0';
    elements.ledgerBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="table-empty-message">
            <span class="empty-icon">🏢</span>
            <h4>No properties audited yet</h4>
            <p>Use the inputs panel on the left to scan a postcode or upload your property CSV database.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Calculate statistics
  let compliant = 0;
  let noncompliant = 0;
  let errorCount = 0;

  portfolio.forEach(p => {
    if (p.error) {
      errorCount++;
      return;
    }
    const rating = String(p.currentEnergyRating || '').toUpperCase();
    if (rating === 'F' || rating === 'G') {
      noncompliant++;
    } else if (['A', 'B', 'C', 'D', 'E'].includes(rating)) {
      compliant++;
    }
  });

  const totalAudit = compliant + noncompliant;
  const projectedFine = noncompliant * MEES_FINE_LIMIT;

  // Render stats
  elements.statTotal.textContent = total;
  elements.statNonCompliant.textContent = noncompliant;
  elements.statCompliant.textContent = compliant;
  elements.statFine.textContent = `£${projectedFine.toLocaleString('en-GB')}`;

  // Highlight fine card if fines exist
  const fineCard = document.getElementById('metric-fine-card');
  const failedCard = document.getElementById('metric-failed-card');
  if (projectedFine > 0) {
    fineCard.style.borderColor = 'var(--color-amber)';
    failedCard.style.borderColor = 'var(--color-red)';
  } else {
    fineCard.style.borderColor = 'var(--border-color)';
    failedCard.style.borderColor = 'var(--border-color)';
  }

  // Render table rows
  elements.ledgerBody.innerHTML = portfolio.map(p => {
    if (p.error) {
      return `
        <tr>
          <td><strong style="color: var(--color-red-text);">${p.address || 'Error'}</strong></td>
          <td><code style="font-weight:bold;">${p.postcode}</code></td>
          <td><span class="rating-badge rating-N">?</span></td>
          <td>N/A</td>
          <td>N/A</td>
          <td><span class="status-badge status-fail" title="${p.error}">Error</span></td>
        </tr>
      `;
    }

    const rating = String(p.currentEnergyRating || '').toUpperCase();
    const isNonCompliant = ['F', 'G'].includes(rating);
    const statusClass = isNonCompliant ? 'status-fail' : 'status-pass';
    const statusText = isNonCompliant ? 'Non-Compliant' : 'Pass';

    return `
      <tr>
        <td><strong>${p.address}</strong></td>
        <td><code>${p.postcode}</code></td>
        <td><span class="rating-badge rating-${rating}">${rating}</span></td>
        <td>
          <strong>${p.currentEnergyEfficiency}</strong> / 
          <span style="color: var(--text-secondary);">${p.potentialEnergyEfficiency}</span>
        </td>
        <td>${p.certificateExpiry}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');
}
