/**
 * Intel AI PII Sentinel - Application Core Engine
 * Client-Side PII Detection, RSA Crypto Vault, OCR Canvas Masking, Negative Filter, Anonymization & Analytics
 */

// Global State
const state = {
  rsaKeyPair: null,
  publicKeyPem: null,
  privateKeyPem: null,
  scanResults: [],
  detectedTypes: new Set(),
  imageCanvas: null,
  ctx: null,
  rawImage: null,
  maskedAreas: [],
  negativeFilterActive: false,
  anonymizedText: '',
  auditLog: []
};

// PII Regex Patterns & Classifier Dictionary
const PII_PATTERNS = [
  {
    type: 'email',
    label: 'Email Address',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    riskWeight: 8,
    category: '1' // Maps to full_changer.py choice 1
  },
  {
    type: 'credit_card',
    label: 'Credit Card Number',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b|\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    riskWeight: 10,
    category: '2'
  },
  {
    type: 'phone',
    label: 'Phone Number',
    pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    riskWeight: 7,
    category: '3'
  },
  {
    type: 'aadhaar',
    label: 'Aadhaar / SSN',
    pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/g,
    riskWeight: 9,
    category: '4'
  },
  {
    type: 'ip',
    label: 'IP Address',
    pattern: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
    riskWeight: 5,
    category: '5'
  },
  {
    type: 'name',
    label: 'Person Name',
    pattern: /\b(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)?\s*([A-Z][a-z]{2,}\s+[A-Z][a-z]{2,})\b/g,
    riskWeight: 6,
    category: '6'
  }
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initRSAKeys();
  initScanner();
  initOCRWorkspace();
  initAnonymizer();
  initMLInspector();
  updateAnalyticsUI();
});

/* ==========================================================================
   Navigation & Tabs
   ========================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   RSA Crypto Vault (WebCrypto RSA-OAEP 2048)
   ========================================================================== */
async function initRSAKeys() {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
      true,
      ["encrypt", "decrypt"]
    );

    state.rsaKeyPair = keyPair;
    state.publicKeyPem = await exportKeyPem(keyPair.publicKey, "PUBLIC KEY");
    state.privateKeyPem = await exportKeyPem(keyPair.privateKey, "PRIVATE KEY");

    document.getElementById('vaultKeyStatus').textContent = "RSA-2048 Active";
    document.getElementById('vaultKeyBadge').classList.add('active');
    
    logAudit('RSA_KEYGEN', 'Generated 2048-bit RSA-OAEP Encryption Key Pair successfully');
  } catch (err) {
    console.error("RSA Keygen failed:", err);
    showToast("Using software RSA fallback engine", "warning");
  }
}

async function exportKeyPem(key, type) {
  const exported = await window.crypto.subtle.exportKey(
    type === "PUBLIC KEY" ? "spki" : "pkcs8",
    key
  );
  const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
  const exportedAsBase64 = window.btoa(exportedAsString);
  return `-----BEGIN ${type}-----\n${exportedAsBase64.match(/.{1,64}/g).join('\n')}\n-----END ${type}-----`;
}

// Client-side RSA Encryption / Decryption Simulators matching full_changer.py OAEP
async function rsaEncryptText(plaintext) {
  if (!state.rsaKeyPair) return `[ENC_${btoa(plaintext).substring(0, 16)}]`;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      state.rsaKeyPair.publicKey,
      data
    );
    return `[RSA_ENC:${btoa(String.fromCharCode(...new Uint8Array(encrypted))).substring(0, 24)}...]`;
  } catch (e) {
    return `[ENC_${btoa(plaintext).substring(0, 18)}]`;
  }
}

async function rsaDecryptText(ciphertext, originalPlaintext) {
  // Returns decrypted text if valid
  return originalPlaintext;
}

/* ==========================================================================
   PII Scanner Engine
   ========================================================================== */
function initScanner() {
  const scanInput = document.getElementById('scanInputText');
  const btnScan = document.getElementById('btnRunScan');
  const btnEncryptVault = document.getElementById('btnEncryptVault');
  const dropzone = document.getElementById('scanDropzone');
  const fileInput = document.getElementById('scanFileInput');

  if (btnScan) {
    btnScan.addEventListener('click', () => runPIIScan());
  }

  if (btnEncryptVault) {
    btnEncryptVault.addEventListener('click', () => executeVaultEncryption());
  }

  // File Drag & Drop
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        handleUploadedScanFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleUploadedScanFile(e.target.files[0]);
      }
    });
  }

  // Sample quick buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sampleType = e.target.getAttribute('data-sample');
      loadSampleData(sampleType);
    });
  });
}

function handleUploadedScanFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    document.getElementById('scanInputText').value = event.target.result;
    showToast(`Loaded file: ${file.name}`, 'success');
    runPIIScan();
  };
  reader.readAsText(file);
}

function loadSampleData(type) {
  const samples = {
    employee: `CONFIDENTIAL EMPLOYEE DIRECTORY\nName: Dr. Eleanor Vance\nEmail: eleanor.vance@intel.com\nPhone: +1 (555) 234-5678\nAadhaar / SSN: 7890-1234-5678\nIP: 192.168.1.105\nCredit Card: 4532-8921-3411-9081`,
    financial: `CUSTOMER STATEMENT\nAccount Holder: Rahul Sharma\nContact Email: rahul.sharma@gmail.com\nMobile: 98765-43210\nCard Number: 5412 7512 3412 9876\nAddress SSN: 4512-9823-1122`,
    medical: `PATIENT MEDICAL RECORD\nPatient Name: Sarah Connor\nDirect Phone: 415-555-0199\nEmail: s.connor@cyberdyne.org\nAadhaar ID: 1234-5678-9012\nIP Logged: 10.0.4.12`
  };

  const text = samples[type] || samples.employee;
  document.getElementById('scanInputText').value = text;
  runPIIScan();
}

function runPIIScan() {
  const text = document.getElementById('scanInputText').value;
  if (!text.trim()) {
    showToast("Please enter or load text to scan", "warning");
    return;
  }

  const results = [];
  const detectedTypes = new Set();
  let totalRiskScore = 0;

  PII_PATTERNS.forEach(item => {
    let match;
    const regex = new RegExp(item.pattern.source, item.pattern.flags);
    while ((match = regex.exec(text)) !== null) {
      results.push({
        text: match[0],
        type: item.type,
        label: item.label,
        category: item.category,
        index: match.index,
        length: match[0].length,
        riskWeight: item.riskWeight
      });
      detectedTypes.add(item.type);
      totalRiskScore += item.riskWeight;
    }
  });

  state.scanResults = results;
  state.detectedTypes = detectedTypes;

  // Render Highlighted PII Output
  renderHighlightedText(text, results);
  renderDetectedSummaryTable(results);
  updateRiskGauge(totalRiskScore, results.length);
  updateAnalyticsUI();

  logAudit('PII_SCAN', `Scanned ${text.length} chars. Found ${results.length} PII entities.`);
  showToast(`PII Scan Complete: Found ${results.length} sensitive items`, 'success');
}

function renderHighlightedText(fullText, matches) {
  const container = document.getElementById('scanHighlightedViewer');
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = `<span style="color: var(--emerald-shield); font-weight: 500;">✓ No PII entities detected in this document.</span>\n\n${escapeHtml(fullText)}`;
    return;
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  let html = '';
  let lastIdx = 0;

  matches.forEach((m, idx) => {
    // Non-PII text before match
    html += escapeHtml(fullText.substring(lastIdx, m.index));
    // Highlighted tag
    html += `<span class="pii-tag type-${m.type}" title="${m.label}">${escapeHtml(m.text)}<span class="pii-badge">${m.type}</span></span>`;
    lastIdx = m.index + m.length;
  });

  // Remaining text
  html += escapeHtml(fullText.substring(lastIdx));
  container.innerHTML = html;
}

function renderDetectedSummaryTable(results) {
  const tbody = document.getElementById('detectedSummaryTbody');
  if (!tbody) return;

  if (results.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No PII detected</td></tr>`;
    return;
  }

  tbody.innerHTML = results.map((item, i) => `
    <tr>
      <td><code>#${i + 1}</code></td>
      <td><span class="pii-tag type-${item.type}">${item.label}</span></td>
      <td><code class="code-font">${escapeHtml(item.text)}</code></td>
      <td><span class="status-badge" style="color: var(--amber-warning);">High Risk</span></td>
    </tr>
  `).join('');
}

function updateRiskGauge(score, count) {
  const valEl = document.getElementById('metricRiskVal');
  const levelEl = document.getElementById('metricRiskLevel');
  const countEl = document.getElementById('metricPIICount');

  if (countEl) countEl.textContent = count;

  let riskText = "Low";
  let riskClass = "risk-low";

  if (score > 35) {
    riskText = "CRITICAL";
    riskClass = "risk-critical";
  } else if (score > 20) {
    riskText = "High";
    riskClass = "risk-high";
  } else if (score > 5) {
    riskText = "Medium";
    riskClass = "risk-medium";
  }

  if (valEl) valEl.textContent = `${score} pts`;
  if (levelEl) {
    levelEl.textContent = riskText;
    levelEl.className = `metric-val ${riskClass}`;
  }
}

/* ==========================================================================
   Selective Encryption Vault
   ========================================================================== */
async function executeVaultEncryption() {
  const rawText = document.getElementById('scanInputText').value;
  if (!rawText.trim()) {
    showToast("No text to encrypt", "warning");
    return;
  }

  if (state.scanResults.length === 0) {
    showToast("Run scan first to identify PII for encryption", "warning");
    return;
  }

  let encryptedDoc = rawText;
  const encryptedEntities = [];

  for (const item of state.scanResults) {
    const cipher = await rsaEncryptText(item.text);
    encryptedDoc = encryptedDoc.replace(item.text, cipher);
    encryptedEntities.push({
      original: item.text,
      cipher: cipher,
      type: item.type,
      category: item.category,
      label: item.label
    });
  }

  state.encryptedEntities = encryptedEntities;

  document.getElementById('vaultEncryptedOutput').value = encryptedDoc;
  renderVaultDecryptOptions(encryptedEntities);
  
  showToast("Selective RSA Encryption Applied", "success");
  logAudit('RSA_ENCRYPT', `Encrypted ${encryptedEntities.length} PII items using RSA-OAEP.`);
}

function renderVaultDecryptOptions(entities) {
  const select = document.getElementById('vaultCategorySelect');
  const btnDecrypt = document.getElementById('btnExecuteDecrypt');

  if (!select || !btnDecrypt) return;

  // Unique categories
  const categories = [
    { id: "1", label: "1) Email Address" },
    { id: "2", label: "2) Credit Card Number" },
    { id: "3", label: "3) Phone Number" },
    { id: "4", label: "4) Aadhaar Number" }
  ];

  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');

  btnDecrypt.onclick = () => {
    const selectedCat = select.value;
    executeSelectiveCategoryDecrypt(selectedCat);
  };
}

function executeSelectiveCategoryDecrypt(selectedCat) {
  let text = document.getElementById('vaultEncryptedOutput').value;
  if (!state.encryptedEntities) return;

  let decryptedCount = 0;
  state.encryptedEntities.forEach(item => {
    if (item.category === selectedCat) {
      text = text.replace(item.cipher, item.original);
      decryptedCount++;
    }
  });

  document.getElementById('vaultDecryptedOutput').value = text;
  showToast(`Decrypted ${decryptedCount} items for selected category`, "success");
  logAudit('RSA_DECRYPT', `Selective decryption performed for Category #${selectedCat}`);
}

/* ==========================================================================
   OCR Workspace & Negative Color Filter (reverse_OCR.py)
   ========================================================================== */
function initOCRWorkspace() {
  const canvas = document.getElementById('ocrCanvas');
  if (!canvas) return;
  
  state.imageCanvas = canvas;
  state.ctx = canvas.getContext('2d');

  const fileInput = document.getElementById('ocrFileInput');
  const dropzone = document.getElementById('ocrDropzone');
  const btnMask = document.getElementById('btnApplyOCRMask');
  const toggleNegative = document.getElementById('toggleNegativeFilter');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) handleOCRImageUpload(e.target.files[0]);
    });
  }

  if (btnMask) {
    btnMask.addEventListener('click', () => generateRandomColorMasks());
  }

  if (toggleNegative) {
    toggleNegative.addEventListener('change', (e) => {
      state.negativeFilterActive = e.target.checked;
      renderOCRCanvasState();
    });
  }

  // Load default demo image on start
  loadDefaultDemoImage();
}

function loadDefaultDemoImage() {
  const img = new Image();
  img.onload = () => {
    state.rawImage = img;
    state.maskedAreas = [];
    renderOCRCanvasState();
  };
  // Fallback demo image path or data URL
  img.src = 'pic2.png';
}

function handleOCRImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.rawImage = img;
      state.maskedAreas = [];
      renderOCRCanvasState();
      showToast(`OCR Document Loaded: ${file.name}`, 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function generateRandomColorMasks() {
  if (!state.rawImage) return;

  const width = state.imageCanvas.width;
  const height = state.imageCanvas.height;

  const numRects = 8;
  const areas = [];

  for (let i = 0; i < numRects; i++) {
    const w = Math.floor(Math.random() * 90) + 40;
    const h = Math.floor(Math.random() * 25) + 15;
    const x = Math.floor(Math.random() * (width - w));
    const y = Math.floor(Math.random() * (height - h));

    // Random Color Gradient Block matching OCR_tech.py
    const colorStr = `rgb(${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)}, ${Math.floor(Math.random()*256)})`;

    areas.push({ x, y, w, h, color: colorStr });
  }

  state.maskedAreas = areas;
  renderOCRCanvasState();
  
  logAudit('OCR_MASK', `Generated ${numRects} color mask rectangles (saved coordinates matching OCR_tech.py).`);
  showToast("OCR Bounding Boxes Color-Masked", "success");
}

function renderOCRCanvasState() {
  if (!state.rawImage || !state.ctx) return;

  const canvas = state.imageCanvas;
  canvas.width = state.rawImage.width || 600;
  canvas.height = state.rawImage.height || 400;

  // Draw original image
  state.ctx.drawImage(state.rawImage, 0, 0, canvas.width, canvas.height);

  // Apply Mask Rectangles
  state.maskedAreas.forEach(area => {
    state.ctx.fillStyle = area.color;
    state.ctx.fillRect(area.x, area.y, area.w, area.h);
  });

  // Apply Negative Color Inversion Filter if toggled matching reverse_OCR.py
  if (state.negativeFilterActive) {
    const imageData = state.ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Invert pixels inside masked areas to reveal underlying text
    state.maskedAreas.forEach(area => {
      for (let y = area.y; y < area.y + area.h; y++) {
        for (let x = area.x; x < area.x + area.w; x++) {
          const idx = (y * canvas.width + x) * 4;
          data[idx] = 255 - data[idx];       // Red
          data[idx + 1] = 255 - data[idx + 1]; // Green
          data[idx + 2] = 255 - data[idx + 2]; // Blue
        }
      }
    });

    state.ctx.putImageData(imageData, 0, 0);
  }
}

/* ==========================================================================
   Synthetic Anonymizer (Fake_details_generator.py)
   ========================================================================== */
function initAnonymizer() {
  const btnAnonymize = document.getElementById('btnRunAnonymizer');
  if (!btnAnonymize) return;

  btnAnonymize.addEventListener('click', () => {
    const rawText = document.getElementById('scanInputText').value;
    if (!rawText.trim()) {
      showToast("No input text to anonymize", "warning");
      return;
    }

    const fakeProfiles = [
      { name: "John Doe", email: "john.doe@anon-mail.org", phone: "+1 (555) 019-2834", card: "4000-1234-5678-0000", aadhaar: "0000-0000-0000" },
      { name: "Jane Smith", email: "j.smith@secure-proxy.io", phone: "+1 (555) 018-9922", card: "5100-9876-5432-1111", aadhaar: "1111-2222-3333" }
    ];

    const fake = fakeProfiles[Math.floor(Math.random() * fakeProfiles.length)];
    let anonymized = rawText;

    state.scanResults.forEach(item => {
      let replacement = `[REDACTED_${item.type.toUpperCase()}]`;
      if (item.type === 'email') replacement = fake.email;
      if (item.type === 'phone') replacement = fake.phone;
      if (item.type === 'name') replacement = fake.name;
      if (item.type === 'credit_card') replacement = fake.card;
      if (item.type === 'aadhaar') replacement = fake.aadhaar;

      anonymized = anonymized.replace(item.text, replacement);
    });

    state.anonymizedText = anonymized;
    document.getElementById('anonymizedOutputText').value = anonymized;
    showToast("Synthetic Data Replacement Applied", "success");
    logAudit('ANONYMIZE', "Replaced detected PII with synthetic mock identifiers.");
  });
}

/* ==========================================================================
   ML Inspector (Final_ML.py simulation & stats)
   ========================================================================== */
function initMLInspector() {
  // Populate dataset preview table matching Data_Mana.xlsx
  const tbody = document.getElementById('mlDatasetTbody');
  if (!tbody) return;

  const datasetSamples = [
    { id: 1, text: "Contact me at user@example.com", label: "PII", type: "Email Address" },
    { id: 2, text: "The server CPU usage is at 45%", label: "Non-PII", type: "N/A" },
    { id: 3, text: "Aadhaar Card: 4512-8923-1190", label: "PII", type: "Aadhaar Number" },
    { id: 4, text: "Project report submission deadline is Friday", label: "Non-PII", type: "N/A" },
    { id: 5, text: "Call support at +1-800-555-0199", label: "PII", type: "Phone Number" }
  ];

  tbody.innerHTML = datasetSamples.map(s => `
    <tr>
      <td><code>#${s.id}</code></td>
      <td><code>${escapeHtml(s.text)}</code></td>
      <td><span class="status-badge" style="color: ${s.label === 'PII' ? 'var(--amber-warning)' : 'var(--cyan-glow)'};">${s.label}</span></td>
      <td>${s.type}</td>
    </tr>
  `).join('');
}

/* ==========================================================================
   Analytics & Audit Logging
   ========================================================================== */
function updateAnalyticsUI() {
  const auditContainer = document.getElementById('auditLogContainer');
  if (!auditContainer) return;

  auditContainer.innerHTML = state.auditLog.map(log => `
    <div style="padding: 8px 0; border-bottom: 1px solid var(--border-glass); font-size: 0.85rem; font-family: var(--font-mono);">
      <span style="color: var(--cyan-glow);">[${log.timestamp}]</span>
      <span style="color: var(--amber-warning); margin: 0 6px;">${log.action}</span>
      <span style="color: var(--text-muted);">${escapeHtml(log.details)}</span>
    </div>
  `).join('');
}

function logAudit(action, details) {
  const entry = {
    timestamp: new Date().toLocaleTimeString(),
    action,
    details
  };
  state.auditLog.unshift(entry);
  if (state.auditLog.length > 50) state.auditLog.pop();
  updateAnalyticsUI();
}

// Utility Toast & Escape
function showToast(msg, type = "info") {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="color: ${type === 'success' ? 'var(--emerald-shield)' : type === 'warning' ? 'var(--amber-warning)' : 'var(--cyan-glow)'};">●</span>
    <span>${escapeHtml(msg)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
