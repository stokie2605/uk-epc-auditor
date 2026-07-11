// ─── App State ──────────────────────────────────────────────────────────────
let portfolio = [];
let activeCategory = 'residential';

const MEES_FINE_LIMIT_DOMESTIC   = 5000;
const MEES_FINE_LIMIT_COMMERCIAL = 150000;

// Varied sample portfolio — mixed ratings so the demo looks realistic
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

// Mock ratings pool — deliberately varied so demo shows all badge colours
const MOCK_RATING_POOL = ['A','B','C','D','E','F','G','A','C','D','E','F','B','C','D'];

// ─── UI Element Cache ────────────────────────────────────────────────────────
const elements = {
  singleForm:            document.getElementById('single-check-form'),
  inputAddress:          document.getElementById('input-address'),
  inputPostcode:         document.getElementById('input-postcode'),
  inputRating:           document.getElementById('input-rating'),
  dropZone:              document.getElementById('drop-zone'),
  fileInput:             document.getElementById('file-input'),
  btnSample:             document.getElementById('btn-load-sample'),
  btnClear:              document.getElementById('btn-clear-ledger'),
  btnExportPdf:          document.getElementById('btn-export-pdf'),
  mockToggle:            document.getElementById('mock-mode-toggle'),
  statTotal:             document.getElementById('stat-total'),
  statNonCompliant:      document.getElementById('stat-noncompliant'),
  statFine:              document.getElementById('stat-fine'),
  statFineSubtext:       document.getElementById('stat-fine-subtext'),
  statCompliant:         document.getElementById('stat-compliant'),
  ledgerBody:            document.getElementById('ledger-body'),
  statLedgerSubtext:     document.getElementById('stat-ledger-subtext'),
  apiBadge:              document.getElementById('api-status-badge'),
  apiBadgeText:          document.getElementById('api-status-text'),
  printTimestamp:        document.getElementById('print-timestamp'),
  categoryResidentialBtn:document.getElementById('category-residential-btn'),
  categoryCommercialBtn: document.getElementById('category-commercial-btn'),
  accessCodeWrapper:     document.getElementById('access-code-wrapper'),
  inputAccessCode:       document.getElementById('input-access-code'),
  expiryAlertBanner:     document.getElementById('expiry-alert-banner'),
  expiryAlertCount:      document.getElementById('expiry-alert-count'),
  expiryAlertSoonestText:document.getElementById('expiry-alert-soonest-text'),
  btnExportIcal:         document.getElementById('btn-export-ical'),
  drawer:                document.getElementById('recommendations-modal'),
  modalBackdrop:         document.getElementById('modal-backdrop'),
  modalAddress:          document.getElementById('modal-property-address'),
  modalMeta:             document.getElementById('modal-property-meta'),
  modalRatingCurrent:    document.getElementById('modal-rating-current'),
  modalRatingPotential:  document.getElementById('modal-rating-potential'),
  modalExposureCallout:  document.getElementById('modal-exposure-callout'),
  modalExposureAmount:   document.getElementById('modal-exposure-amount'),
  modalTotalCost:        document.getElementById('modal-total-cost'),
  modalAnnualSaving:     document.getElementById('modal-annual-saving'),
  modalRecommendationsList: document.getElementById('modal-recommendations-list'),
  btnCloseDrawer:        document.getElementById('btn-close-modal'),
  toastContainer:        document.getElementById('toast-container'),
};

// ─── Toast Notification System ───────────────────────────────────────────────
function showToast(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    info:    '💡',
    success: '✅',
    warning: '⚠️',
    error:   '❌',
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '💡'}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  elements.toastContainer.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// ─── Boot ────────────────────────────────────────────────────────────────────
init();

function init() {
  const saved = sessionStorage.getItem('epc-portfolio-ledger');
  if (saved) {
    try { portfolio = JSON.parse(saved); } catch { portfolio = []; }
  }

  if (elements.printTimestamp) {
    elements.printTimestamp.textContent = `Generated ${new Date().toLocaleString('en-GB')}`;
  }

  elements.singleForm.addEventListener('submit', handleSingleCheck);
  elements.btnSample.addEventListener('click', loadSampleMockData);
  elements.btnClear.addEventListener('click', clearLedger);
  elements.btnExportPdf.addEventListener('click', () => window.print());
  elements.btnExportIcal.addEventListener('click', downloadIcsCalendarEvents);
  elements.mockToggle.addEventListener('change', updateMockToggleView);
  elements.btnCloseDrawer.addEventListener('click', closeDrawer);
  elements.modalBackdrop.addEventListener('click', closeDrawer);
  elements.categoryResidentialBtn.addEventListener('click', () => switchCategory('residential'));
  elements.categoryCommercialBtn.addEventListener('click', () => switchCategory('commercial'));

  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileSelection);
  elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('glow-info');
  });
  elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('glow-info'));
  elements.dropZone.addEventListener('drop', handleFileDrop);

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  updateMockToggleView();
  updateDashboard();
}

// ─── Category Switch ──────────────────────────────────────────────────────────
function switchCategory(category) {
  activeCategory = category;

  const res = elements.categoryResidentialBtn;
  const com = elements.categoryCommercialBtn;

  if (category === 'residential') {
    res.classList.add('active');
    com.classList.remove('active');
    res.setAttribute('aria-pressed', 'true');
    com.setAttribute('aria-pressed', 'false');
  } else {
    com.classList.add('active');
    res.classList.remove('active');
    com.setAttribute('aria-pressed', 'true');
    res.setAttribute('aria-pressed', 'false');
  }

  updateDashboard();
}

// ─── Mock Toggle ──────────────────────────────────────────────────────────────
function updateMockToggleView() {
  const isMock = elements.mockToggle.checked;
  elements.accessCodeWrapper.style.display = isMock ? 'none' : 'block';

  const dot  = elements.apiBadge.querySelector('.badge-dot');
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

// ─── Single Check ─────────────────────────────────────────────────────────────
async function handleSingleCheck(e) {
  e.preventDefault();
  const address  = elements.inputAddress.value.trim();
  const postcode = elements.inputPostcode.value.trim();
  if (!postcode) return;

  const submitBtn = elements.singleForm.querySelector('button[type="submit"]');
  const originalHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Auditing…';

  try {
    await scanProperties([{ address, postcode }]);
    elements.inputAddress.value  = '';
    elements.inputPostcode.value = '';
  } catch (err) {
    showToast(`Scan failed: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
  }
}

// ─── CSV Handling ─────────────────────────────────────────────────────────────
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
    showToast('Please drop a valid .csv file.', 'error');
  }
}

function parseAndScanCsv(file) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    const text  = e.target.result;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { showToast('CSV file appears to be empty.', 'error'); return; }

    const headers     = lines[0].toLowerCase().split(',').map(h => h.replace(/["']/g, '').trim());
    const addressIdx  = headers.indexOf('address');
    const postcodeIdx = headers.indexOf('postcode');
    const ratingIdx   = headers.indexOf('rating');

    if (postcodeIdx === -1) {
      showToast('CSV must include a "postcode" column header.', 'error');
      return;
    }

    const parsedProperties = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.replace(/["']/g, '').trim());
      if (!row[postcodeIdx]) continue;
      parsedProperties.push({
        address: addressIdx !== -1 ? row[addressIdx] : 'Unknown Address',
        postcode: row[postcodeIdx],
        rating: ratingIdx !== -1 ? row[ratingIdx] : 'D',
      });
    }

    if (parsedProperties.length === 0) {
      showToast('No valid postcodes found in the CSV.', 'error');
      return;
    }

    showToast(`Auditing ${parsedProperties.length} properties from CSV…`, 'info');
    await scanProperties(parsedProperties);
  };
  reader.readAsText(file);
}

// ─── API Scan ─────────────────────────────────────────────────────────────────
async function scanProperties(propsList) {
  const isMock     = elements.mockToggle.checked;
  const accessCode = elements.inputAccessCode.value.trim();
  const url        = `/api/check${isMock ? '?mock=true' : ''}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: propsList, category: activeCategory, accessCode }),
    });

    if (!response.ok) throw new Error('API server returned an error.');

    const data       = await response.json();
    const newResults = data.results || [];

    newResults.forEach(newProp => {
      const idx = portfolio.findIndex(p =>
        p.postcode.toUpperCase() === newProp.postcode.toUpperCase() &&
        p.address.toLowerCase() === newProp.address.toLowerCase()
      );
      newProp.category = activeCategory;
      if (idx !== -1) portfolio[idx] = newProp;
      else portfolio.unshift(newProp);
    });

    sessionStorage.setItem('epc-portfolio-ledger', JSON.stringify(portfolio));
    updateDashboard();

    if (data.isMockedByAccessCode) {
      elements.apiBadgeText.textContent = 'Guest Preview (Live Locked)';
      elements.apiBadge.querySelector('.badge-dot').className = 'badge-dot';
      showToast('Guest preview active — results are simulated. Enter your admin access code to run live registry searches.', 'warning', 6000);
    } else {
      const added = newResults.length;
      showToast(`${added} propert${added === 1 ? 'y' : 'ies'} added to the ledger.`, 'success');
      updateMockToggleView();
    }
  } catch (err) {
    showToast(`Audit scan failure: ${err.message}`, 'error');
  }
}

// ─── Load Sample Data ─────────────────────────────────────────────────────────
async function loadSampleMockData() {
  const originalText   = elements.btnSample.textContent;
  elements.btnSample.disabled    = true;
  elements.btnSample.textContent = 'Loading portfolio…';

  const prevToggle = elements.mockToggle.checked;
  elements.mockToggle.checked = true;
  updateMockToggleView();

  // Load residential sample first
  await scanProperties(sampleMockPortfolio.map(p => ({ ...p })));

  // Also load a commercial batch so the commercial tab is not empty
  const commercialSamples = [
    { address: "Unit 7, Cheshire Business Park", postcode: "CW9 7UA" },
    { address: "Suite 4, Quayside Tower", postcode: "B1 2JR" },
    { address: "Enterprise House, Forge Lane", postcode: "WS2 8TR" },
    { address: "Pavilion Court, Trafford Park", postcode: "M17 1SN" },
  ];

  // Temporarily switch to commercial to tag results correctly
  const prevCategory = activeCategory;
  activeCategory = 'commercial';
  await scanProperties(commercialSamples);
  activeCategory = prevCategory;
  // Re-render back in the original category view
  updateDashboard();

  elements.mockToggle.checked = prevToggle;
  updateMockToggleView();
  elements.btnSample.disabled    = false;
  elements.btnSample.textContent = originalText;
}

// ─── Clear Ledger ─────────────────────────────────────────────────────────────
function clearLedger() {
  // Use custom confirm via toast instead of browser native confirm
  const confirmBar = document.createElement('div');
  confirmBar.className = 'toast toast-warning toast-visible toast-confirm';
  confirmBar.innerHTML = `
    <span class="toast-icon">🗑️</span>
    <span class="toast-msg">Clear all ledger entries?</span>
    <button class="toast-btn-confirm" id="confirm-clear-yes">Yes, clear</button>
    <button class="toast-close" id="confirm-clear-no">Cancel</button>
  `;
  elements.toastContainer.appendChild(confirmBar);

  document.getElementById('confirm-clear-yes').addEventListener('click', () => {
    portfolio = [];
    sessionStorage.removeItem('epc-portfolio-ledger');
    updateDashboard();
    confirmBar.remove();
    showToast('Ledger cleared.', 'info');
  });
  document.getElementById('confirm-clear-no').addEventListener('click', () => confirmBar.remove());
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysUntil(expiry) {
  return Math.round((new Date(expiry).getTime() - Date.now()) / 86400000);
}

function getFineExposure(rating, category) {
  const list     = ['A','B','C','D','E','F','G'];
  const idx      = list.indexOf(rating.toUpperCase());
  const minIdx   = list.indexOf('E');
  if (idx <= minIdx) return 0;
  const severity = rating.toUpperCase() === 'G' ? 1 : 0.6;
  return category === 'commercial'
    ? Math.round(150000 * severity)
    : Math.round(5000   * severity);
}

// ─── Upgrade Drawer ───────────────────────────────────────────────────────────
async function showUpgradeDrawer(certificateNumber, address, category, postcode, currentEnergyRating) {
  elements.modalAddress.textContent = address;
  elements.modalMeta.textContent    = `${postcode || 'N/A'} · ${category === 'commercial' ? 'Commercial' : 'Residential'}`;

  // Apply correct colour class to current rating badge in drawer
  elements.modalRatingCurrent.textContent = currentEnergyRating || '?';
  elements.modalRatingCurrent.className   = `rating-badge size-lg rating-${currentEnergyRating || 'N'}`;

  elements.modalRatingPotential.textContent = '…';
  elements.modalRatingPotential.className   = 'rating-badge size-lg rating-N';

  elements.modalExposureCallout.style.display = 'none';
  elements.modalTotalCost.textContent   = '£0';
  elements.modalAnnualSaving.textContent = '£0';
  elements.modalRecommendationsList.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--text-secondary)">Analysing upgrade options…</div>
  `;

  elements.drawer.style.display = 'block';
  document.body.style.overflow  = 'hidden'; // prevent page scroll while drawer is open

  try {
    const isMock     = elements.mockToggle.checked;
    const accessCode = elements.inputAccessCode.value.trim();
    const url = `/api/certificate-details?certificateNumber=${encodeURIComponent(certificateNumber || '')}&accessCode=${encodeURIComponent(accessCode)}${isMock ? '&mock=true' : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Query error.');
    const data = await response.json();

    const potential = data.potentialEnergyEfficiencyBand || 'C';
    elements.modalRatingPotential.textContent = potential;
    elements.modalRatingPotential.className   = `rating-badge size-lg rating-${potential}`;

    if (['F','G'].includes(currentEnergyRating)) {
      elements.modalExposureAmount.textContent    = `£${getFineExposure(currentEnergyRating, category).toLocaleString('en-GB')}`;
      elements.modalExposureCallout.style.display = 'flex';
    }

    const suggestions = data.suggested_improvements || [];
    if (suggestions.length === 0) {
      elements.modalRecommendationsList.innerHTML = `
        <div style="text-align:center;padding:20px;color:var(--text-secondary)">
          🎉 Optimal efficiency — no upgrades needed.
        </div>`;
      return;
    }

    let totalCost = 0, totalSaving = 0;

    elements.modalRecommendationsList.innerHTML = suggestions.map((imp, idx) => {
      const desc      = imp.improvement_description || 'General Improvement';
      const costStr   = imp.indicative_cost || 'N/A';
      const parsedCost = parseInt(costStr.replace(/[^0-9]/g, '')) || 0;
      totalCost   += parsedCost;
      const savingVal = imp.typical_saving?.value || 0;
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
        </li>`;
    }).join('');

    elements.modalTotalCost.textContent    = `£${totalCost.toLocaleString('en-GB')}`;
    elements.modalAnnualSaving.textContent = `£${totalSaving.toLocaleString('en-GB')}`;

  } catch (err) {
    elements.modalRecommendationsList.innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--color-fail)">
        Error fetching recommendations: ${err.message}
      </div>`;
  }
}

function closeDrawer() {
  elements.drawer.style.display = 'none';
  document.body.style.overflow  = '';
}

// ─── iCal Export ─────────────────────────────────────────────────────────────
function downloadIcsCalendarEvents() {
  const today    = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const expiring = portfolio.filter(p => {
    if (p.category !== activeCategory || !p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const exp = new Date(p.certificateExpiry);
    return exp > today && exp <= nextYear;
  });

  if (expiring.length === 0) {
    showToast('No certificates expiring within 12 months in this category.', 'info');
    return;
  }

  let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MEES Compliance Tracker//Calendar Reminders//EN\r\n";
  expiring.forEach((p, idx) => {
    const dateStr  = new Date(p.certificateExpiry).toISOString().split('T')[0].replace(/-/g, '');
    const stampStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    ics += `BEGIN:VEVENT\r\nUID:epc-renewal-${idx}-${Date.now()}@ukepcauditor.com\r\n`;
    ics += `DTSTAMP:${stampStr}T000000Z\r\nDTSTART;VALUE=DATE:${dateStr}\r\n`;
    ics += `SUMMARY:EPC Expiry — ${p.address.replace(/,/g,'\\,')}\r\n`;
    ics += `DESCRIPTION:EPC for ${p.address} expires. Renew to maintain MEES compliance.\r\nEND:VEVENT\r\n`;
  });
  ics += "END:VCALENDAR";

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'epc-renewal-reminders.ics' });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`${expiring.length} calendar reminder${expiring.length > 1 ? 's' : ''} downloaded.`, 'success');
}

// ─── Dashboard Renderer ───────────────────────────────────────────────────────
function updateDashboard() {
  const filteredPortfolio = portfolio.filter(p => (p.category || 'residential') === activeCategory);
  const total = filteredPortfolio.length;

  elements.btnClear.style.display    = portfolio.length > 0 ? 'inline-flex' : 'none';
  elements.btnExportPdf.style.display = total > 0 ? 'inline-flex' : 'none';
  elements.statLedgerSubtext.textContent = `${total} propert${total === 1 ? 'y' : 'ies'} audited`;

  if (elements.printTimestamp) {
    elements.printTimestamp.textContent = `Generated ${new Date().toLocaleString('en-GB')}`;
  }

  const fineCard    = document.getElementById('metric-fine-card');
  const failedCard  = document.getElementById('metric-failed-card');
  const successCard = document.getElementById('metric-success-card');

  if (total === 0) {
    elements.statTotal.textContent        = '0';
    elements.statNonCompliant.textContent = '0';
    elements.statFine.textContent         = '£0';
    elements.statFineSubtext.textContent  = 'No penalty exposure';
    elements.statCompliant.textContent    = '0';
    elements.expiryAlertBanner.style.display = 'none';

    failedCard.className  = 'metric-card card-alert';
    fineCard.className    = 'metric-card card-fine';
    successCard.className = 'metric-card card-success';
    failedCard.querySelector('.metric-value').className  = 'metric-value font-mono';
    fineCard.querySelector('.metric-value').className    = 'metric-value font-mono';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono';

    elements.ledgerBody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state-box">
          <span>🗂️</span>
          <p>Ledger is empty</p>
          <small>Add a ${activeCategory} property or load the sample portfolio to begin.</small>
        </div>
      </td></tr>`;
    return;
  }

  let compliantCount = 0, noncompliantCount = 0, projectedFine = 0;
  filteredPortfolio.forEach(p => {
    if (p.error) return;
    const rating = String(p.currentEnergyRating || p.rating || '').toUpperCase();
    if (['F','G'].includes(rating)) {
      noncompliantCount++;
      projectedFine += getFineExposure(rating, activeCategory);
    } else if (['A','B','C','D','E'].includes(rating)) {
      compliantCount++;
    }
  });

  const today    = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);

  const expiringList = filteredPortfolio.filter(p => {
    if (!p.certificateExpiry || p.certificateExpiry === 'N/A' || p.error) return false;
    const exp = new Date(p.certificateExpiry);
    return exp > today && exp <= nextYear;
  });

  if (expiringList.length > 0) {
    const soonest  = [...expiringList].sort((a,b) => new Date(a.certificateExpiry) - new Date(b.certificateExpiry))[0];
    const daysLeft = getDaysUntil(soonest.certificateExpiry);
    elements.expiryAlertCount.textContent = expiringList.length;
    elements.expiryAlertSoonestText.innerHTML =
      `Soonest: <strong>${soonest.address}</strong> — ${daysLeft} days remaining. Renew early to avoid a compliance breach.`;
    elements.expiryAlertBanner.style.display = 'flex';
  } else {
    elements.expiryAlertBanner.style.display = 'none';
  }

  elements.statTotal.textContent        = total;
  elements.statNonCompliant.textContent = noncompliantCount;
  elements.statCompliant.textContent    = compliantCount;
  elements.statFine.textContent         = `£${projectedFine.toLocaleString('en-GB')}`;

  // Card glow logic
  if (noncompliantCount > 0) {
    failedCard.className = 'metric-card card-alert glow-fail';
    failedCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-fail';
  } else {
    failedCard.className = 'metric-card card-alert';
    failedCard.querySelector('.metric-value').className = 'metric-value font-mono';
  }

  if (projectedFine > 0) {
    fineCard.className = 'metric-card card-fine glow-warn';
    fineCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-warn';
    elements.statFineSubtext.textContent = 'Max civil penalty at risk';
    elements.statFineSubtext.style.color = 'var(--color-warn)';
  } else {
    fineCard.className = 'metric-card card-fine';
    fineCard.querySelector('.metric-value').className = 'metric-value font-mono';
    elements.statFineSubtext.textContent = 'No penalty exposure';
    elements.statFineSubtext.style.color = '';
  }

  if (compliantCount > 0) {
    successCard.className = 'metric-card card-success glow-pass';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono text-glow-pass';
  } else {
    successCard.className = 'metric-card card-success';
    successCard.querySelector('.metric-value').className = 'metric-value font-mono';
  }

  // ── Table rows ──
  elements.ledgerBody.innerHTML = filteredPortfolio.map(p => {
    if (p.error) {
      return `
        <tr class="ledger-row">
          <td class="td-main"><div class="cell-address text-fail">${p.address || 'Audit Error'}</div></td>
          <td><span class="postcode-pill">${p.postcode}</span></td>
          <td><span class="type-label">${activeCategory}</span></td>
          <td class="td-center"><span class="rating-badge size-sm rating-N">?</span></td>
          <td><div class="expiry-date">N/A</div></td>
          <td><span class="status-badge non-compliant"><span class="status-badge-dot"></span>Error</span></td>
          <td class="no-print"></td>
        </tr>`;
    }

    const rating       = String(p.currentEnergyRating || p.rating || '').toUpperCase();
    const isNonCompliant = ['F','G'].includes(rating);

    let isExpiring = false, isExpired = false, daysLeftText = '';
    if (p.certificateExpiry && p.certificateExpiry !== 'N/A') {
      const expDate = new Date(p.certificateExpiry);
      isExpiring    = expDate > today && expDate <= nextYear;
      isExpired     = expDate <= today;
      daysLeftText  = isExpired ? 'Expired' : `${getDaysUntil(p.certificateExpiry)} days`;
    }

    const expFormatted = p.certificateExpiry && p.certificateExpiry !== 'N/A'
      ? new Date(p.certificateExpiry).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', timeZone:'UTC' })
      : 'N/A';

    const safeAddr = p.address.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <tr class="ledger-row clickable" onclick="showUpgradeDrawer('${p.certificateNumber}','${safeAddr}','${activeCategory}','${p.postcode}','${rating}')">
        <td class="td-main"><div class="cell-address">${p.address}</div></td>
        <td><span class="postcode-pill">${p.postcode}</span></td>
        <td><span class="type-label">${activeCategory}</span></td>
        <td class="td-center">
          <span class="rating-badge size-sm rating-${rating}">${rating}</span>
        </td>
        <td>
          <div class="expiry-date">${expFormatted}</div>
          <div class="expiry-days ${isExpired ? 'text-fail' : isExpiring ? 'text-warn' : 'text-muted'}">${daysLeftText}</div>
        </td>
        <td>
          <span class="status-badge ${isNonCompliant ? 'non-compliant' : 'compliant'}">
            <span class="status-badge-dot"></span>
            ${isNonCompliant ? 'Non-Compliant' : 'Pass'}
          </span>
        </td>
        <td class="td-chevron no-print">
          <svg class="chevron-action" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </td>
      </tr>`;
  }).join('');
}
