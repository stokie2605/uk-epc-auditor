// App State Manager
let portfolio = [];
let activeCategory = 'residential'; // Default category

const MEES_FINE_LIMIT_DOMESTIC = 5000;
const MEES_FINE_LIMIT_COMMERCIAL = 150000;

// Sample properties matching the exact v0 portfolio
const sampleMockPortfolio = [
  { address: "14 Kensington Court Gardens", postcode: "W8 5QF" },
  { address: "Unit 3, Meridian Business Park", postcode: "M17 1WA" },
  { address: "221B Baker Street", postcode: "NW1 6XE" },
  { address: "Riverside Chambers, Quay St", postcode: "M3 4EE" },
  { address: "8 Rodney Street", postcode: "L1 9EF" },
  { address: "Northgate House, Broad St", postcode: "B1 2HF" },
  { address: "47 Marchmont Road", postcode: "EH9 1HS" },
  { address: "The Old Print Works, Unit 12", postcode: "BS1 6QH" }
];

// Cache UI Elements
const elements = {
  singleForm: document.getElementById('single-check-form'),
  inputAddress: document.getElementById('input-address'),
  inputPostcode: document.getElementById('input-postcode'),
  inputRating: document.getElementById('input-rating'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  btnSample: document.getElementById('btn-load-sample'),
  btnClear: document.getElementById('btn-clear-ledger'),
  btnExportPdf: document.getElementById('btn-export-pdf'),
  mockToggle: document.getElementById('mock-mode-toggle'),
  statTotal: document.getElementById('stat-total'),
  statNonCompliant: document.getElementById('stat-noncompliant'),
  statFine: document.getElementById('stat-fine'),
  statFineSubtext: document.getElementById('stat-fine-subtext'),
  statCompliant: document.getElementById('stat-compliant'),
  ledgerBody: document.getElementById('ledger-body'),
  statLedgerSubtext: document.getElementById('stat-ledger-subtext'),
  apiBadge: document.getElementById('api-status-badge'),
  apiBadgeText: document.getElementById('api-status-text'),
  printTimestamp: document.getElementById('print-timestamp'),
  
  // Category Selector Buttons
  categoryResidentialBtn: document.getElementById('category-residential-btn'),
  categoryCommercialBtn: document.getElementById('category-commercial-btn'),

  // Access Code settings wrapper
  accessCodeWrapper: document.getElementById('access-code-wrapper'),
  inputAccessCode: document.getElementById('input-access-code'),
  
  // Expiry Banner Alerts
  expiryAlertBanner: document.getElementById('expiry-alert-banner'),
  expiryAlertCount: document.getElementById('expiry-alert-count'),
  expiryAlertSoonestText: document.getElementById('expiry-alert-soonest-text'),
  btnExportIcal: document.getElementById('btn-export-ical'),
  
  // Slide Drawer Elements
  drawer: document.getElementById('recommendations-modal'),
  modalBackdrop: document.getElementById('modal-backdrop'),
  modalAddress: document.getElementById('modal-property-address'),
  modalMeta: document.getElementById('modal-property-meta'),
  modalRatingCurrent: document.getElementById('modal-rating-current'),
  modalRatingPotential: document.getElementById('modal-rating-potential'),
  modalExposureCallout: document.getElementById('modal-exposure-callout'),
  modalExposureAmount: document.getElementById('modal-exposure-amount'),
  modalTotalCost: document.getElementById('modal-total-cost'),
  modalAnnualSaving: document.getElementById('modal-annual-saving'),
  modalRecommendationsList: document.getElementById('modal-recommendations-list'),
  btnCloseDrawer: document.getElementById('btn-close-modal')
};

// Start application
init();

function init() {
  // Restore ledger from sessionStorage
  const saved = sessionStorage.getItem('epc-portfolio-ledger');
  if (saved) {
    try {
      portfolio = JSON.parse(saved);
    } catch (e) {
      portfolio = [];
    }
  }

  // Set print timestamp dynamically
  if (elements.printTimestamp) {
    elements.printTimestamp.textContent = `Generated ${new Date().toLocaleString('en-GB')}`;
  }

  // Register Event Listeners
  elements.singleForm.addEventListener('submit', handleSingleCheck);
  elements.btnSample.addEventListener('click', loadSampleMockData);
  elements.btnClear.addEventListener('click', clearLedger);
  elements.btnExportPdf.addEventListener('click', () => window.print());
  elements.btnExportIcal.addEventListener('click', downloadIcsCalendarEvents);
  elements.mockToggle.addEventListener('change', updateMockToggleView);
  elements.btnCloseDrawer.addEventListener('click', closeDrawer);
  elements.modalBackdrop.addEventListener('click', closeDrawer);

  // Category Selector triggers switcher
  elements.categoryResidentialBtn.addEventListener('click', () => switchCategory('residential'));
  elements.categoryCommercialBtn.addEventListener('click', () => switchCategory('commercial'));

  // Drag and Drop CSV Handlers
  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileSelection);
  elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('glow-info');
  });
  elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('glow-info');
  });
  elements.dropZone.addEventListener('drop', handleFileDrop);

  updateMockToggleView();
  updateDashboard();
}

// Switch portfolio viewing category
function switchCategory(category) {
  activeCategory = category;
  
  if (category === 'residential') {
    elements.categoryResidentialBtn.className = 'category-btn active flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 bg-info/15 text-info glow-info';
    elements.categoryCommercialBtn.className = 'category-btn flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground';
    elements.categoryResidentialBtn.setAttribute('aria-pressed', 'true');
    elements.categoryCommercialBtn.setAttribute('aria-pressed', 'false');
  } else {
    elements.categoryCommercialBtn.className = 'category-btn active flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 bg-info/15 text-info glow-info';
    elements.categoryResidentialBtn.className = 'category-btn flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground';
    elements.categoryCommercialBtn.setAttribute('aria-pressed', 'true');
    elements.categoryResidentialBtn.setAttribute('aria-pressed', 'false');
  }
  
  updateDashboard();
}

// Mock View Settings panel layout
function updateMockToggleView() {
  const isMock = elements.mockToggle.checked;
  elements.accessCodeWrapper.style.display = isMock ? 'none' : 'block';
  
  const dot = elements.apiBadge.querySelector('.badge-dot');
  const icon = document.getElementById('data-source-icon');
  const text = document.getElementById('data-source-text');
  
  if (isMock) {
    elements.apiBadgeText.textContent = 'Offline Demo Active';
    dot.className = 'badge-dot';
    if (icon) icon.textContent = '🧪';
    if (text) text.textContent = 'Mock / offline';
  } else {
    elements.apiBadgeText.textContent = 'Live UK Registry Target';
    dot.className = 'badge-dot active';
    if (icon) icon.textContent = '📡';
    if (text) text.textContent = 'Live registry API';
  }
}

// Single check postcode search auditor
async function handleSingleCheck(e) {
  e.preventDefault();
  const address = elements.inputAddress.value.trim();
  const postcode = elements.inputPostcode.value.trim();
  const rating = elements.inputRating.value;
  
  if (!postcode) return;

  const submitBtn = elements.singleForm.querySelector('button');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Auditing...';

  try {
    // Send single property as a check list
    await scanProperties([{ address, postcode, rating }]);
    elements.inputAddress.value = '';
    elements.inputPostcode.value = '';
  } catch (err) {
    console.error('Scan failed:', err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// CSV selection triggers scanning
function handleFileSelection(e) {
  const file = e.target.files[0];
  if (file) parseAndScanCsv(file);
}

function handleFileDrop(e) {
  e.preventDefault();
  elements.dropZone.classList.remove('glow-info');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.csv')) {
    parseAndScanCsv(file);
  } else {
    alert('Please drop a valid CSV file.');
  }
}

function parseAndScanCsv(file) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      alert('CSV file is empty.');
      return;
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
    const addressIdx = headers.indexOf('address');
    const postcodeIdx = headers.indexOf('postcode');
    const ratingIdx = headers.indexOf('rating');

    if (postcodeIdx === -1) {
      alert('CSV must contain a "postcode" column header.');
      return;
    }

    const parsedProperties = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/["']/g, '').trim());
      if (row.length === 0 || !row[postcodeIdx]) continue;
      
      parsedProperties.push({
        address: addressIdx !== -1 ? row[addressIdx] : 'Unknown Address',
        postcode: row[postcodeIdx],
        rating: ratingIdx !== -1 ? row[ratingIdx] : 'D'
      });
    }

    if (parsedProperties.length === 0) {
      alert('No valid property postcodes found.');
      return;
    }

    alert(`Auditing ${parsedProperties.length} portfolio properties from CSV...`);
    await scanProperties(parsedProperties);
  };
  reader.readAsText(file);
}

// Query backend auditor API
async function scanProperties(propsList) {
  const isMock = elements.mockToggle.checked;
  const accessCode = elements.inputAccessCode.value.trim();
  const url = `/api/check${isMock ? '?mock=true' : ''}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: propsList, category: activeCategory, accessCode })
    });

    if (!response.ok) throw new Error('API server returned an error.');

    const data = await response.json();
    const newResults = data.results || [];

    // Process results into state (prevent duplicates)
    newResults.forEach(newProp => {
      const idx = portfolio.findIndex(p => 
        p.postcode.toUpperCase() === newProp.postcode.toUpperCase() && 
        p.address.toLowerCase() === newProp.address.toLowerCase()
      );
      
      // Keep category tagged for listing
      newProp.category = activeCategory;

      if (idx !== -1) {
        portfolio[idx] = newProp;
      } else {
        portfolio.unshift(newProp);
      }
    });

    sessionStorage.setItem('epc-portfolio-ledger', JSON.stringify(portfolio));
    updateDashboard();

    if (data.isMockedByAccessCode) {
      elements.apiBadgeText.textContent = 'Guest Preview (Live Locked)';
      elements.apiBadge.querySelector('.badge-dot').className = 'badge-dot';
      alert('Guest Preview: Database access locked. Queries are simulated with Mock Data. Input the admin password code in the settings panel to run live government searches.');
    } else {
      updateMockToggleView();
    }

  } catch (err) {
    alert(`Audit scan failure: ${err.message}`);
  }
}

// Load sample mock properties
async function loadSampleMockData() {
  const originalText = elements.btnSample.textContent;
  elements.btnSample.disabled = true;
  elements.btnSample.textContent = 'Loading mock portfolio...';
  
  const prevToggle = elements.mockToggle.checked;
  elements.mockToggle.checked = true; // force mock toggle
  updateMockToggleView();

  await scanProperties(sampleMockPortfolio);

  elements.mockToggle.checked = prevToggle;
  updateMockToggleView();
  
  elements.btnSample.disabled = false;
  elements.btnSample.textContent = originalText;
}

function clearLedger() {
  if (confirm('Clear the compliance audit ledger? This removes all properties in the active session.')) {
    portfolio = [];
    sessionStorage.removeItem('epc-portfolio-ledger');
    updateDashboard();
  }
}

// Expiry Days calculation
function getDaysUntil(expiry) {
  const then = new Date(expiry).getTime();
  const now = new Date().getTime();
  return Math.round((then - now) / (1000 * 60 * 60 * 24));
}

// Estimate fine exposure (matching new server.js rules)
function getFineExposure(rating, category) {
  const list = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const currentIdx = list.indexOf(rating.toUpperCase());
  const minIdx = list.indexOf('E');
  
  if (currentIdx <= minIdx) return 0; // compliant
  
  const severity = rating.toUpperCase() === 'G' ? 1 : 0.6;
  return category === 'commercial'
    ? Math.round(150000 * severity)
    : Math.round(5000 * severity);
}

// Detailed upgrade drawer populator
async function showUpgradeDrawer(certificateNumber, address, category, postcode, currentEnergyRating) {
  elements.modalAddress.textContent = address;
  elements.modalMeta.textContent = `${postcode || 'Unknown Postcode'} · ${category === 'commercial' ? 'Commercial' : 'Residential'}`;
  
  elements.modalRatingCurrent.textContent = currentEnergyRating || '?';
  elements.modalRatingCurrent.className = `rating-badge size-lg rating-${currentEnergyRating || 'N'}`;
  
  elements.modalRatingPotential.textContent = '...';
  elements.modalRatingPotential.className = 'rating-badge size-lg rating-N';
  
  elements.modalExposureCallout.style.display = 'none';
  elements.modalTotalCost.textContent = '£0';
  elements.modalAnnualSaving.textContent = '£0';
  elements.modalRecommendationsList.innerHTML = '<div style="text-align:center; padding: 40px; color: var(--text-secondary);">Analyzing upgrade options...</div>';
  
  elements.drawer.style.display = 'block';

  try {
    const isMock = elements.mockToggle.checked;
    const accessCode = elements.inputAccessCode.value.trim();
    // Fetch detailed suggestions from API
    const url = `/api/certificate-details?certificateNumber=${encodeURIComponent(certificateNumber || '')}&accessCode=${encodeURIComponent(accessCode)}${isMock ? '&mock=true' : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Query error.');

    const data = await response.json();
    
    const potential = data.potentialEnergyEfficiencyBand || 'C';
    elements.modalRatingPotential.textContent = potential;
    elements.modalRatingPotential.className = `rating-badge size-lg rating-${potential}`;

    const isNonCompliant = ['F', 'G'].includes(currentEnergyRating);
    if (isNonCompliant) {
      const fineVal = getFineExposure(currentEnergyRating, category);
      elements.modalExposureAmount.textContent = `£${fineVal.toLocaleString('en-GB')}`;
      elements.modalExposureCallout.style.display = 'flex';
    } else {
      elements.modalExposureCallout.style.display = 'none';
    }

    const suggestions = data.suggested_improvements || [];
    if (suggestions.length === 0) {
      elements.modalRecommendationsList.innerHTML = `
        <div style="text-align:center; padding: 20px; color: var(--text-secondary);">
          🎉 Optimal efficiency achieved! No suggestions required.
        </div>
      `;
      elements.modalTotalCost.textContent = '£0';
      elements.modalAnnualSaving.textContent = '£0';
    } else {
      let totalCost = 0;
      let totalSaving = 0;

      elements.modalRecommendationsList.innerHTML = suggestions.map((imp, idx) => {
        const desc = imp.improvement_description || 'General Improvement';
        
        // Parse indicative cost to display
        const costStr = imp.indicative_cost || 'N/A';
        // Parse numbers to calculate summary cost
        const parsedCost = parseInt(costStr.replace(/[^0-9]/g, '')) || 0;
        totalCost += parsedCost;

        const savingVal = imp.typical_saving && imp.typical_saving.value ? imp.typical_saving.value : 0;
        totalSaving += savingVal;

        return `
          <li class="recommendation-item">
            <span class="rec-number">${idx + 1}</span>
            <div class="rec-details">
              <div class="rec-title">${desc}</div>
              <div class="rec-metrics">
                <span>Cost <strong class="rec-metric-val">${costStr}</strong></span>
                <span>Saves <strong class="rec-metric-saving">£${savingVal}/yr</strong></span>
              </div>
            </div>
          </li>
        `;
      }).join('');

      elements.modalTotalCost.textContent = `£${totalCost.toLocaleString('en-GB')}`;
      elements.modalAnnualSaving.textContent = `£${totalSaving.toLocaleString('en-GB')}`;
    }

  } catch (err) {
    elements.modalRecommendationsList.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--color-fail);">Error fetching recommendations: ${err.message}</div>`;
  }
}

function closeDrawer() {
  elements.drawer.style.display = 'none';
}

// Download calendar renewal indicators
function downloadIcsCalendarEvents() {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const expiring = portfolio.filter(p => {
    if (p.category !== activeCategory || !p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const exp = new Date(p.certificateExpiry);
    return exp > today && exp <= nextYear;
  });

  if (expiring.length === 0) return;

  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MEES Compliance Tracker//Calendar Reminders//EN\r\n";

  expiring.forEach((p, idx) => {
    const expDate = new Date(p.certificateExpiry);
    const dateStr = expDate.toISOString().replace(/-|:|\.\d+/g, "").split("T")[0]; // YYYYMMDD
    const stampStr = new Date().toISOString().replace(/-|:|\.\d+/g, "").split("T")[0];

    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += `UID:epc-renewal-${idx}-${Date.now()}@ukepcauditor.com\r\n`;
    icsContent += `DTSTAMP:${stampStr}T000000Z\r\n`;
    icsContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
    icsContent += `SUMMARY:EPC Expiry: ${p.address.replace(/,/g, '\\,')}\r\n`;
    icsContent += `DESCRIPTION:Energy Performance Certificate (EPC) for ${p.address} is expiring today. A renewal is required under UK compliance laws.\r\n`;
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

// Main rendering engine
function updateDashboard() {
  // Filter portfolio list by activeCategory toggle
  const filteredPortfolio = portfolio.filter(p => {
    const cat = p.category || 'residential';
    return cat === activeCategory;
  });

  const total = filteredPortfolio.length;
  
  elements.btnClear.style.display = portfolio.length > 0 ? 'inline-block' : 'none';
  elements.btnExportPdf.style.display = total > 0 ? 'inline-block' : 'none';
  elements.statLedgerSubtext.textContent = `${total} propert${total === 1 ? 'y' : 'ies'} audited`;

  const totalCard = document.querySelector('.card-total');
  const fineCard = document.getElementById('metric-fine-card');
  const failedCard = document.getElementById('metric-failed-card');
  const successCard = document.getElementById('metric-success-card');

  if (total === 0) {
    elements.statTotal.textContent = '0';
    elements.statNonCompliant.textContent = '0';
    elements.statFine.textContent = '£0';
    elements.statFineSubtext.textContent = 'No penalty exposure';
    elements.statCompliant.textContent = '0';
    elements.expiryAlertBanner.style.display = 'none';

    // Clear active card glows
    failedCard.className = 'metric-card card-alert';
    failedCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
    fineCard.className = 'metric-card card-fine';
    fineCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
    successCard.className = 'metric-card card-success';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
    elements.statFineSubtext.className = 'metric-subtext';

    elements.ledgerBody.innerHTML = `
      <tr class="empty-state">
        <td colspan="7">
          <div class="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <span class="text-4xl text-muted-foreground">🗂️</span>
            <p class="text-sm font-medium text-foreground">Ledger is empty</p>
            <p class="max-w-xs text-xs text-muted-foreground">
              Add a ${activeCategory} property manually or drop a CSV database to scan for compliance.
            </p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Calculate statistics
  let compliantCount = 0;
  let noncompliantCount = 0;
  let projectedFine = 0;

  filteredPortfolio.forEach(p => {
    if (p.error) return;
    
    const rating = String(p.currentEnergyRating || p.rating || '').toUpperCase();
    const isCommercial = activeCategory === 'commercial';

    if (['F', 'G'].includes(rating)) {
      noncompliantCount++;
      projectedFine += getFineExposure(rating, activeCategory);
    } else if (['A', 'B', 'C', 'D', 'E'].includes(rating)) {
      compliantCount++;
    }
  });

  // Calculate Expiry Date limits (expiring within 12 months)
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const expiringList = filteredPortfolio.filter(p => {
    if (!p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const expDate = new Date(p.certificateExpiry);
    return expDate > today && expDate <= nextYear;
  });

  if (expiringList.length > 0) {
    // Find soonest expiry
    const soonest = [...expiringList].sort((a, b) => {
      return new Date(a.certificateExpiry) - new Date(b.certificateExpiry);
    })[0];

    const daysLeft = getDaysUntil(soonest.certificateExpiry);

    elements.expiryAlertCount.textContent = expiringList.length;
    elements.expiryAlertSoonestText.innerHTML = `Soonest: <strong>${soonest.address}</strong> — ${daysLeft} days remaining. Renew early to avoid compliance breach.`;
    elements.expiryAlertBanner.style.display = 'flex';
  } else {
    elements.expiryAlertBanner.style.display = 'none';
  }

  // Render main metrics
  elements.statTotal.textContent = total;
  elements.statNonCompliant.textContent = noncompliantCount;
  elements.statCompliant.textContent = compliantCount;
  elements.statFine.textContent = `£${projectedFine.toLocaleString('en-GB')}`;

  // Dynamically update card glow borders and text highlights
  if (noncompliantCount > 0) {
    failedCard.className = 'metric-card card-alert glow-fail';
    failedCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-fail';
  } else {
    failedCard.className = 'metric-card card-alert';
    failedCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
  }

  if (projectedFine > 0) {
    fineCard.className = 'metric-card card-fine glow-warn';
    fineCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-warn';
    elements.statFineSubtext.textContent = 'Max civil penalty at risk';
    elements.statFineSubtext.className = 'metric-subtext text-warn/80';
  } else {
    fineCard.className = 'metric-card card-fine';
    fineCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
    elements.statFineSubtext.textContent = 'No penalty exposure';
    elements.statFineSubtext.className = 'metric-subtext';
  }

  if (compliantCount > 0) {
    successCard.className = 'metric-card card-success glow-pass';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-pass';
  } else {
    successCard.className = 'metric-card card-success';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono text-muted-foreground';
  }

  // Render table rows
  elements.ledgerBody.innerHTML = filteredPortfolio.map(p => {
    if (p.error) {
      return `
        <tr class="group">
          <td class="px-4 py-3"><div class="text-sm font-semibold text-fail">${p.address || 'Audit Error'}</div></td>
          <td class="px-4 py-3"><span class="inline-block rounded-md border border-border bg-secondary/60 px-2 py-0.5 font-mono text-xs text-secondary-foreground">${p.postcode}</span></td>
          <td class="px-4 py-3"><span class="text-xs capitalize text-muted-foreground">${activeCategory}</span></td>
          <td class="px-4 py-3 text-center"><div class="flex justify-center"><span class="rating-badge size-sm rating-N">?</span></div></td>
          <td class="px-4 py-3"><div class="text-xs text-foreground">N/A</div></td>
          <td class="px-4 py-3"><span class="status-badge non-compliant"><span class="status-badge-dot"></span>Error</span></td>
          <td class="px-4 py-3 no-print"></td>
        </tr>
      `;
    }

    const rating = String(p.currentEnergyRating || p.rating || '').toUpperCase();
    const isNonCompliant = ['F', 'G'].includes(rating);
    
    // Check if certificate is expiring soon
    let isExpiring = false;
    let isExpired = false;
    let daysLeftText = '';
    
    if (p.certificateExpiry && p.certificateExpiry !== 'N/A') {
      const expDate = new Date(p.certificateExpiry);
      isExpiring = expDate > today && expDate <= nextYear;
      isExpired = expDate <= today;
      daysLeftText = isExpired ? 'Expired' : `${getDaysUntil(p.certificateExpiry)} days`;
    }

    // Format Expiry Month/Year
    const expFormatted = p.certificateExpiry && p.certificateExpiry !== 'N/A' 
      ? new Date(p.certificateExpiry).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }) 
      : 'N/A';

    return `
      <tr class="group" onclick="showUpgradeDrawer('${p.certificateNumber}', '${p.address.replace(/'/g, "\\'")}', '${activeCategory}', '${p.postcode}', '${rating}')">
        <td class="px-4 py-3">
          <div class="text-sm font-medium text-foreground">${p.address}</div>
        </td>
        <td class="px-4 py-3">
          <span class="inline-block rounded-md border border-border bg-secondary/60 px-2 py-0.5 font-mono text-xs text-secondary-foreground">
            ${p.postcode}
          </span>
        </td>
        <td class="px-4 py-3">
          <span class="text-xs capitalize text-muted-foreground">${activeCategory}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <div class="flex justify-center">
            <span class="rating-badge size-sm rating-${rating}">${rating}</span>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="text-xs text-foreground">${expFormatted}</div>
          <div class="text-xxs ${isExpired ? 'text-fail' : isExpiring ? 'text-warn font-semibold' : 'text-muted-foreground'}">
            ${daysLeftText}
          </div>
        </td>
        <td class="px-4 py-3">
          <span class="status-badge ${isNonCompliant ? 'non-compliant' : 'compliant'}">
            <span class="status-badge-dot"></span>
            ${isNonCompliant ? 'Non-Compliant' : 'Pass'}
          </span>
        </td>
        <td class="px-4 py-3 no-print">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 chevron-action"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </td>
      </tr>
    `;
  }).join('');
}
