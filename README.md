Overview
This project provides a comprehensive solution for detecting and securing Personally Identifiable Information (PII) using Optical Character Recognition (OCR), Named Entity Recognition (NER), Machine Learning (ML), encryption, and color masking techniques. It detects sensitive data such as emails, phone numbers, and names from text files and scanned documents, while also ensuring that detected PII is encrypted, masked, and can be decrypted through negative coloring.

Features
OCR Integration: Extracts text from scanned documents or images to detect PII in non-digital formats.
NER-based PII Detection: Utilizes Natural Language Processing (NLP) to identify personal identifiers like names, emails, and phone numbers.
Machine Learning for Accuracy: A trained ML model refines PII detection results, improving precision and reducing false positives.
Data Encryption: Automatically encrypts detected PII, ensuring secure handling and transmission.
Color Masking: Masks detected PII in the OCR output using random colors to obfuscate sensitive information visually.
Decryption through Negative Coloring: Allows users to reveal the masked PII by applying a negative color filter, restoring the original text.
Customizable Models: Models can be retrained to improve detection performance based on specific requirements.
How It Works
Text Extraction (OCR):

OCR extracts text from scanned documents, PDFs, or images, converting them into a machine-readable format.
This allows the tool to handle both digital and non-digital formats (such as scanned documents) for PII detection.
Entity Recognition (NER):

After the text is extracted, Named Entity Recognition (NER) is applied to detect potential PII, including:
Names of individuals
Email addresses
Phone numbers
Social security numbers
Addresses, dates, and other personal data
NER flags all entities that match predefined PII patterns.
Machine Learning Validation:

The flagged results are processed through a Machine Learning model that refines detection. It helps reduce false positives (non-PII data being flagged) and false negatives (PII that was missed).
The ML model improves detection accuracy by learning complex patterns beyond simple regular expressions.
Color Masking:

Detected PII in the OCR output is masked using random colors, obfuscating sensitive information visually.
This ensures that even if the document is viewed, the sensitive data is not easily identifiable, maintaining a layer of privacy.
Data Encryption:

The masked PII is then encrypted using a secure encryption algorithm (e.g., AES).
This encryption ensures that PII cannot be accessed or viewed by unauthorized parties, protecting the data throughout its lifecycle.
Decryption through Negative Coloring:

Users can decrypt the masked PII by applying a negative color filter to the OCR output. This process restores the original text that was hidden behind random colors.
This innovative approach allows authorized users to access the original PII securely while maintaining its confidentiality.
Output:

After PII is detected, masked, and encrypted, a report is generated with information about where the encrypted and masked data is located, ensuring that users know where sensitive data exists while keeping it secure.
Security
Encryption Algorithm: The tool uses industry-standard encryption algorithms (e.g., AES) to protect sensitive data.
End-to-End Protection: PII is masked and encrypted as soon as it's detected and can only be decrypted by users with the correct credentials through negative coloring, ensuring secure handling at every step.
