# 🔐 PII Detection and Protection System

## 📝 Overview

This project provides a comprehensive solution for detecting and securing **Personally Identifiable Information (PII)** using:

📄 Optical Character Recognition (OCR)  
🧠 Named Entity Recognition (NER)  
📊 Machine Learning (ML)  
🔒 Encryption  
🎨 Color masking techniques

It detects sensitive data such as emails, phone numbers, and names from text files and scanned documents. Detected PII is encrypted, visually masked, and can be decrypted using a negative color filter.

---

## ✨ Features

- 📷 **OCR Integration**  
  Extracts text from scanned documents or images to detect PII in non-digital formats.

- 🧠 **NER-based PII Detection**  
  Utilizes Natural Language Processing (NLP) to identify personal identifiers like names, emails, and phone numbers.

- 🤖 **Machine Learning for Accuracy**  
  A trained ML model refines PII detection results, improving precision and reducing false positives.

- 🔐 **Data Encryption**  
  Automatically encrypts detected PII, ensuring secure handling and transmission.

- 🎨 **Color Masking**  
  Masks detected PII in the OCR output using random colors to visually obfuscate sensitive information.

- 🌓 **Decryption through Negative Coloring**  
  Allows users to reveal masked PII by applying a negative color filter, restoring the original text.

- 🛠️ **Customizable Models**  
  Models can be retrained to improve detection performance for specific domains or requirements.

---

## ⚙️ How It Works

### 1️⃣ Text Extraction (OCR) 📄

OCR extracts text from scanned documents, PDFs, or images and converts them into a machine-readable format. This allows PII detection in both digital and scanned formats.

### 2️⃣ Entity Recognition (NER) 🧠

Named Entity Recognition detects potential PII, including:

- 👤 Names  
- 📧 Email addresses  
- 📞 Phone numbers  
- 🆔 Social security numbers  
- 📍 Addresses, 📅 dates, and other personal data

Entities matching predefined PII patterns are flagged.

### 3️⃣ Machine Learning Validation 🤖

Flagged results are passed through a trained ML model to:

- ✅ Reduce false positives  
- ❌ Minimize false negatives  

This increases detection accuracy by recognizing more complex data patterns.

### 4️⃣ Color Masking 🎨

Detected PII is masked using random colors, visually obscuring it in the output. Even if viewed directly, the sensitive content remains unreadable.

### 5️⃣ Data Encryption 🔒

The masked PII is securely encrypted using standard algorithms like AES, protecting it during storage and transmission.

### 6️⃣ Decryption via Negative Coloring 🌓

Authorized users can apply a **negative color filter** to reveal the masked PII, restoring the original text for secure and controlled access.

---

## 📤 Output

- 📊 A detailed report is generated, outlining:
  - ✅ Locations of detected PII  
  - 🎨 Areas where color masking has been applied  
  - 🔐 Encrypted content metadata  

This ensures that users remain informed about the presence and protection of sensitive data.

---

## 🔐 Security

- 🛡️ **Encryption Algorithm:**  
  Industry-standard algorithms like AES are used for robust encryption.

- 🔄 **End-to-End Protection:**  
  From detection to encryption to decryption, PII is protected at every stage and only accessible to authorized users via negative coloring.

---

## 🚀 Future Improvements

- 🌍 Support for multiple languages  
- 📈 Active learning to improve model accuracy  
- 🧩 Plugin-style integration with document management systems

---

> 🧾 Built with a focus on privacy, security, and usability.
