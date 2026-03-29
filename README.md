# DocVision X: Neural Document Intelligence CLI

**DocVision X CLI** is a high-performance terminal utility for document analysis. It implements a **Neural-Optimized Computer Vision pipeline** that enhances document images before performing deep neural analysis via the Gemini API. It provides high-precision OCR, forgery detection, layout intelligence, and smart field extraction.

---

## 🚀 VITyarthi BYOP Submission Details
- **Project Title:** DocVision X CLI
- **Domain:** Computer Vision / Document Image Analysis
- **Course Component:** Bring Your Own Project (BYOP)
- **Submission Date:** March 29, 2026

---

## 🛠️ Architecture & CV Pipeline
The application follows a **"Neural-First" architecture**, using Computer Vision to optimize images for AI-driven extraction.

### 1. Neural-Optimization Preprocessing (Local)
Using the `sharp` library (OpenCV-like), the system performs:
- **Grayscale Conversion**: Reduces 3-channel RGB to 1-channel intensity.
- **CLAHE**: Contrast Limited Adaptive Histogram Equalization for uneven lighting.
- **Gamma Correction**: Darkens ink strokes for better neural recognition.
- **Adaptive Sharpening**: Defines character boundaries in photos.

### 2. Deep Neural Scan (Gemini AI)
The system leverages the Gemini API for:
- **High-Precision OCR**: Accurate transcription of printed and handwritten text.
- **Forgery Scan**: Detects font inconsistencies and signature tampering.
- **Layout Intelligence**: Segments headers, tables, and signatures.
- **Smart Field Extraction**: Identifies key-value pairs (e.g., Total Amount).

---

## 📦 Setup & Installation

### 1. Prerequisites
- **Node.js**: v18 or higher.
- **npm**: v9 or higher.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/docvision-x-cli
cd docvision-x-cli

# Install dependencies
npm install
```

### 3. Configuration
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 💻 Usage & Commands

### 1. Analyze Document (`analyze`)
This is the primary command. It preprocesses the image and performs a full neural scan.

**Example:**
```bash
# Basic analysis
npm start -- "path/to/invoice.jpg"

# Example (Windows)
npm start -- "C:\Users\shash\Downloads\WhatsApp Image 2026-03-28 at 11.24.58 PM.jpeg"

# Advanced analysis with verbose output and JSON export
npm start -- "path/to/document.png" --verbose --output result.json

# Example (Windows)
npm start -- "C:\Users\shash\Downloads\WhatsApp Image 2026-03-28 at 11.24.58 PM.jpeg" --verbose --output result.json
```

### 2. Document Q&A (`ask`)
Ask specific questions about the content of a document.

**Example:**
```bash
# Ask about a specific value
npm run cli -- ask "path/to/receipt.jpg" "What is the total amount including tax?"

# Example (Windows)
npm run cli -- ask "C:\Users\shash\Downloads\WhatsApp Image 2026-03-28 at 11.24.58 PM.jpeg" "What is the total amount including tax?"

# Ask about a date
npm run cli -- ask "path/to/contract.pdf.png" "When does this agreement expire?"

# Example (Windows)
npm run cli -- ask "C:\Users\shash\Downloads\WhatsApp Image 2026-03-28 at 11.24.58 PM.jpeg" "What is the invoice date?"
```

### 3. Document Comparison (`compare`)
Compare two document images to find similarities and differences.

**Example:**
```bash
# Compare two versions of a document
npm run cli -- compare "invoice_v1.jpg" "invoice_v2.jpg"

# Example (Windows)
npm run cli -- compare "C:\Users\shash\Downloads\doc1.jpg" "C:\Users\shash\Downloads\doc2.jpg"
```

---

## 📁 Project Structure
- `/src/services/imageProcessor.ts`: Core Computer Vision logic (Sharp).
- `/src/services/geminiService.ts`: Neural analysis layer (Gemini API).
- `/src/cli.ts`: Command-line interface orchestration.
- `PROJECT_REPORT.md`: Detailed academic project report.

---

## 📝 Project Report
A comprehensive academic report is available in **`PROJECT_REPORT.md`**. This file includes:
- **Syllabus Alignment Table** (Mapping CV concepts to implementation).
- **Methodology & Algorithms** (Detailed explanation of filters and thresholding).
- **Evaluation Metrics** (How accuracy and performance are measured).

*For final submission, please convert `PROJECT_REPORT.md` to PDF format.*

---
*Developed for the VITyarthi Computer Vision BYOP Course.*
