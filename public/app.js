// App State Manager
let portfolio = [];
const MEES_FINE_LIMIT_DOMESTIC = 5000;
const MEES_FINE_LIMIT_COMMERCIAL = 150000;

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
  btnExportPdf: document.getElementById('btn-export-pdf'),
  mockToggle: document.getElementById('mock-mode-toggle'),
  statTotal: document.getElementById('stat-total'),
  statNonCompliant: document.getElementById('stat-noncompliant'),
  statFine: document.getElementById('stat-fine'),
  statCompliant: document.getElementById('stat-compliant'),
  ledgerBody: document.getElementById('ledger-body'),
  apiBadge: document.getElementById('api-status-badge'),
  apiBadgeText: document.getElementById('api-status-text'),
  
  // Category Selectors
  categoryDomestic: document.getElementById('category-domestic'),
  categoryCommercial: document.getElementById('category-commercial'),
  
  // Alerts
  expiryAlertBanner: document.getElementById('expiry-alert-banner'),
  expiryAlertCount: document.getElementById('expiry-alert-count'),
  btnExportIcal: document.getElementById('btn-export-ical'),
  
  // Modal
  modal: document.getElementById('recommendations-modal'),
  modalAddress: document.getElementById('modal-property-address'),
  modalRatingCurrent: document.getElementById('modal-rating-current'),
  modalRatingPotential: document.getElementById('modal-rating-potential'),
  modalRecommendationsList: document.getElementById('modal-recommendations-list'),
  btnCloseModal: document.getElementById('btn-close-modal')
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
  elements.btnExportPdf.addEventListener('click', () => window.print());
  elements.btnExportIcal.addEventListener('click', downloadIcsCalendarEvents);
  elements.mockToggle.addEventListener('change', updateApiBadgeStatus);
  elements.btnCloseModal.addEventListener('click', closeModal);
  
  // Category change triggers stats update
  elements.categoryDomestic.addEventListener('change', updateDashboard);
  elements.categoryCommercial.addEventListener('change', updateDashboard);
  
  // Modal background click closing
  window.addEventListener('click', (e) => {
    if (e.target === elements.modal) closeModal();
  });

  // File Drag-and-Drop Handlers
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

// CSV Drag and Drop
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
  const category = elements.categoryCommercial.checked ? 'commercial' : 'domestic';
  const url = `/api/check${isMock ? '?mock=true' : ''}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: propsList, category })
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
      
      // Keep category tagged on each property
      newProp.category = category;

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

// Detailed upgrade instructions modal loader
async function showUpgradeDetails(certificateNumber, address) {
  if (!certificateNumber || certificateNumber === 'N/A' || certificateNumber.includes('Error')) return;

  elements.modalAddress.textContent = address;
  elements.modalRatingCurrent.textContent = '...';
  elements.modalRatingPotential.textContent = '...';
  elements.modalRecommendationsList.innerHTML = '<div style="text-align:center; padding: 30px;">Loading EPC upgrade recommendations...</div>';
  elements.modal.style.display = 'flex';

  try {
    const isMock = elements.mockToggle.checked;
    const url = `/api/certificate-details?certificateNumber=${encodeURIComponent(certificateNumber)}${isMock ? '&mock=true' : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to query certificate details.');

    const data = await response.json();

    // Render Stats
    elements.modalRatingCurrent.textContent = data.currentEnergyEfficiencyBand || '?';
    elements.modalRatingCurrent.className = `m-value rating-badge rating-${data.currentEnergyEfficiencyBand || 'N'}`;
    elements.modalRatingPotential.textContent = data.potentialEnergyEfficiencyBand || '?';
    elements.modalRatingPotential.className = `m-value rating-badge rating-${data.potentialEnergyEfficiencyBand || 'N'}`;

    // Render upgrade list
    const imps = data.suggested_improvements || [];
    if (imps.length === 0) {
      elements.modalRecommendationsList.innerHTML = `
        <div style="text-align:center; padding: 20px; color: var(--text-secondary);">
          🎉 No upgrades required! This building already meets optimum energy efficiency levels.
        </div>
      `;
    } else {
      elements.modalRecommendationsList.innerHTML = imps.map((imp, index) => {
        const cost = imp.indicative_cost || imp.indicativeCost || 'N/A';
        const saving = imp.typical_saving && imp.typical_saving.value 
          ? `£${imp.typical_saving.value.toLocaleString('en-GB')}/year` 
          : 'N/A';

        return `
          <div class="recommendation-item">
            <span class="rec-number">${index + 1}</span>
            <div class="rec-details">
              <h4 class="rec-title">${imp.improvement_description}</h4>
              <div class="rec-info-grid">
                <span class="rec-info-item">Est. Cost: <strong>${cost}</strong></span>
                <span class="rec-info-item">Est. Saving: <strong>${saving}</strong></span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

  } catch (err) {
    elements.modalRecommendationsList.innerHTML = `
      <div style="text-align:center; padding: 20px; color: var(--color-red-text);">
        Could not retrieve upgrade recommendations: ${err.message}
      </div>
    `;
  }
}

function closeModal() {
  elements.modal.style.display = 'none';
}

// Generate calendar event renewal notifications
function downloadIcsCalendarEvents() {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  // Find expiring soon
  const expiring = portfolio.filter(p => {
    if (!p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const exp = new Date(p.certificateExpiry);
    return exp > today && exp <= nextYear;
  });

  if (expiring.length === 0) return;

  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//UK EPC Auditor//Renewal Alerts//EN\r\n";

  expiring.forEach((p, idx) => {
    const expDate = new Date(p.certificateExpiry);
    const dateStr = expDate.toISOString().replace(/-|:|\.\d+/g, "").split("T")[0]; // YYYYMMDD
    const stampStr = new Date().toISOString().replace(/-|:|\.\d+/g, "").split("T")[0];

    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += `UID:epc-renewal-${idx}-${Date.now()}@ukepcauditor.com\r\n`;
    icsContent += `DTSTAMP:${stampStr}T000000Z\r\n`;
    icsContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
    icsContent += `SUMMARY:EPC Expiry: ${p.address.replace(/,/g, '\\,')}\r\n`;
    icsContent += `DESCRIPTION:The Energy Performance Certificate (EPC) for ${p.address} is expiring today. A renewal is required under UK compliance laws.\r\n`;
    icsContent += "END:VEVENT\r\n";
  });

  icsContent += "END:VCALENDAR";

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'epc-renewal-reminders.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Render metrics widgets & table body rows
function updateDashboard() {
  const activeCategory = elements.categoryCommercial.checked ? 'commercial' : 'domestic';
  
  // Filter portfolio based on the active category toggle selection
  const filteredPortfolio = portfolio.filter(p => {
    const cat = p.category || 'domestic';
    return cat === activeCategory;
  });

  const total = filteredPortfolio.length;
  
  elements.btnClear.style.display = portfolio.length > 0 ? 'inline-block' : 'none';
  elements.btnExportPdf.style.display = total > 0 ? 'inline-block' : 'none';

  if (total === 0) {
    elements.statTotal.textContent = '0';
    elements.statNonCompliant.textContent = '0';
    elements.statFine.textContent = '£0';
    elements.statCompliant.textContent = '0';
    elements.expiryAlertBanner.style.display = 'none';
    elements.ledgerBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div class="table-empty-message">
            <span class="empty-icon">🏢</span>
            <h4>No ${activeCategory === 'commercial' ? 'commercial' : 'residential'} properties audited yet</h4>
            <p>Select the correct category or run an audit search to populate the ledger.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Calculate statistics
  let compliant = 0;
  let noncompliant = 0;
  let projectedFine = 0;

  filteredPortfolio.forEach(p => {
    if (p.error) return;
    
    const rating = String(p.currentEnergyRating || '').toUpperCase();
    const isCommercial = activeCategory === 'commercial';
    const limit = isCommercial ? MEES_FINE_LIMIT_COMMERCIAL : MEES_FINE_LIMIT_DOMESTIC;

    if (rating === 'F' || rating === 'G') {
      noncompliant++;
      projectedFine += limit;
    } else if (['A', 'B', 'C', 'D', 'E'].includes(rating)) {
      compliant++;
    }
  });

  // Check Expiry Date limits (expiring within 12 months)
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const expiringCount = filteredPortfolio.filter(p => {
    if (!p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const expDate = new Date(p.certificateExpiry);
    return expDate > today && expDate <= nextYear;
  }).length;

  if (expiringCount > 0) {
    elements.expiryAlertCount.textContent = expiringCount;
    elements.expiryAlertBanner.style.display = 'flex';
  } else {
    elements.expiryAlertBanner.style.display = 'none';
  }

  // Render main metrics
  elements.statTotal.textContent = total;
  elements.statNonCompliant.textContent = noncompliant;
  elements.statCompliant.textContent = compliant;
  elements.statFine.textContent = `£${projectedFine.toLocaleString('en-GB')}`;

  // Highlight cards dynamically
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
  elements.ledgerBody.innerHTML = filteredPortfolio.map(p => {
    if (p.error) {
      return `
        <tr class="error-row">
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

    // Verify if this specific row is expiring soon (adds custom CSS class)
    let isExpiringSoon = false;
    if (p.certificateExpiry && p.certificateExpiry !== 'N/A') {
      const expDate = new Date(p.certificateExpiry);
      isExpiringSoon = expDate > today && expDate <= nextYear;
    }
    const expiringClass = isExpiringSoon ? 'row-expiring-soon' : '';

    return `
      <tr class="clickable-row ${expiringClass}" onclick="showUpgradeDetails('${p.certificateNumber}', '${p.address.replace(/'/g, "\\'")}')">
        <td><strong>${p.address}</strong></td>
        <td><code>${p.postcode}</code></td>
        <td><span class="rating-badge rating-${rating}">${rating}</span></td>
        <td>
          <strong>${p.currentEnergyEfficiency || 'N/A'}</strong> / 
          <span style="color: var(--text-secondary);">${p.potentialEnergyEfficiency || 'N/A'}</span>
        </td>
        <td>${p.certificateExpiry}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');
}
