# 🔐 PII Detection and Protection System (Intel AI PII Sentinel)

## 📝 Overview

**PII Sentinel** is an enterprise-grade AI security solution for detecting, encrypting, masking, anonymizing, and protecting **Personally Identifiable Information (PII)** across documents, plain text, and scanned image formats.

It features a high-performance **Web User Interface (Web UI)** with interactive PII entity highlighting, an **RSA 2048-bit Cryptographic Vault**, an **OCR Canvas Workspace** with **Negative Color Decryption Filtering**, **Synthetic Data Anonymization**, **Security Compliance Analytics**, and an **XGBoost ML Classifier Inspector**.

---

## ✨ Web UI Key Features

- 🖥️ **Interactive Web Dashboard (`index.html`)**  
  Zero-dependency, standalone dark glassmorphism Web UI built with modern HTML5, CSS3, and JavaScript.

- 🔍 **Real-Time PII Entity Scanner**  
  Detects Emails, Credit Cards, Phone Numbers, Aadhaar / SSN numbers, Names, IP Addresses, and Passwords. Highlights entities with color-coded risk badges.

- 🔒 **Selective RSA Encryption Vault**  
  Generates 2048-bit RSA-OAEP key pairs. Encrypts sensitive fields and selectively decrypts specific PII categories (e.g. Email only, Credit Card only) matching `full_changer.py`.

- 📷 **OCR Canvas Masking & Negative Color Filter**  
  Upload scanned image documents (`pic1.jpg`, `pic2.png`), apply random color block bounding masks (matching `OCR_tech.py`), and toggle a live **Negative Color Filter** to visually invert and reveal masked content (matching `reverse_OCR.py`).

- 🎭 **Synthetic Data Replacer (Anonymizer)**  
  Replaces detected PII with realistic fake identity profiles (matching `Fake_details_generator.py`).

- 🤖 **ML Model Inspector & Confusion Matrix**  
  Inspects the XGBoost TF-IDF classifier metrics, dataset preview from `Data_Mana.xlsx`, and interactive confusion matrix heatmap.

- 📜 **Security Compliance & Audit Logs**  
  Tracks all actions in real-time with GDPR, HIPAA, PCI-DSS, and DPDP Act compliance indicators, plus JSON audit log exports.

---

## 🚀 How to Launch & Use the Web UI

### Option 1: Direct Web Browser Access (Instant / Client-Side)
Simply open `index.html` in any web browser:
- Double-click `index.html` in your file explorer, OR
- Open your browser and navigate to `file:///c:/Users/Balaji%20M/Intel-AI-_PII-Sentinel/index.html`.

### Option 2: Python Backend API & Web Server (`server.py`)
To run the optional Python FastAPI backend REST API:
```bash
pip install -r requirements.txt
python server.py
```
Then navigate to `http://localhost:8000/app/index.html` in your browser.

---

## 📁 Repository Structure

```
Intel-AI-_PII-Sentinel/
├── index.html                  # Cybernetic Glassmorphism Web UI
├── styles.css                  # Intel AI Dark Design System
├── app.js                      # PII Detection, RSA, OCR Canvas & Anonymizer Engine
├── server.py                   # FastAPI REST API Backend Server
├── requirements.txt            # Python dependencies
├── full_changer.py             # RSA Encryption & DOCX Rewriter
├── OCR_tech.py                 # OpenCV Bounding Box Color Masking
├── reverse_OCR.py              # Negative Color Filter Reconstruction
├── Final_ML.py                 # XGBoost + TF-IDF Classifier & Confusion Matrix
├── Data_Mana.xlsx              # PII Training & Testing Dataset
└── README.md                   # System Documentation
```

---

> 🧾 Built with a focus on privacy, security, high usability, and state-of-the-art Intel AI aesthetics.
