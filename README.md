# UK EPC Compliance Dashboard (Concept)

A portfolio compliance-data dashboard concept exploring how public property datasets (EPC/MEES) could be aggregated, visualized, and filtered.

> [!WARNING]
> **PERSONAL PORTFOLIO PROJECT - NOT FOR PRODUCTION USE**
> This is strictly a **personal, educational portfolio project** and technical demonstration. 
> It is **not** affiliated with, endorsed by, or connected to the UK Government, any official EPC assessment body, or any regulatory authority. It does not ingest live proprietary landlord data, and the heuristic SAP calculations provided are for UI demonstration only. This software must not be used to provide legal, financial, or official compliance advice regarding MEES regulations or government fines.

---

## Business Case & Compliance Context

Understanding property energy efficiency is critical for modern housing management.

* **The Challenge:** Aggregating and normalizing energy performance data across sprawling property portfolios to identify units with EPC ratings of F or G.
* **The Solution:** This dashboard concept automates property data processing by matching address datasets against the official UK Government EPC API, visualizing the data in a clean, responsive UI.

---

## Technology Stack

### Frontend (User Interface)
* **Framework:** React + Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom HSL Grid system, dark mode supported)

### Backend (Local Proxy & Heuristics)
* **Framework:** FastAPI (Python)
* **Data Validation:** Pydantic
* **Calculations:** Local SAP and EPC heuristics module
* **Testing:** Pytest

---

## Quick Start (Local Monorepo Setup)

This project runs as two separate local servers (one for the React UI and one for the FastAPI backend) which communicate securely over localhost.

### 1. Setup the Backend (FastAPI)
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
Start the Python backend:
```bash
uvicorn main:app --reload
```
*(The backend runs on http://127.0.0.1:8000)*

### 2. Setup the Frontend (Vite)
Open a **new** terminal in the root directory (`uk-epc-auditor`):
```bash
# Ensure your environment is configured (uses the backend URL)
copy .env.example .env

npm install
```
Start the React development server:
```bash
npm run dev
```
*(The frontend runs on http://localhost:5173)*

### 3. Running Tests & Linters
* **Backend Tests:** Run `pytest` inside the `backend` directory.
* **Frontend Linting:** Run `npm run lint` in the root directory.
* **Frontend Build:** Run `npm run build` in the root directory to generate production files.

---

## Engineering Challenges Solved

Building this auditor required overcoming several real-world data engineering challenges:

### 1. The UK Government Database Migration (May 30, 2026)
* **Problem:** Mid-development, the UK government retired the legacy `epc.opendatacommunities.org` database domain and its legacy Basic Auth system (using `email:key`). The old URL was set to redirect queries to the login homepage, returning HTML instead of JSON and breaking all existing code.
* **Solution:** We traced the undocumented API updates through the new beta service guidelines. We migrated the integration to the new subdomain (`api.get-energy-performance-data.communities.gov.uk`), switched the header authentication schema to a modern **Bearer Token** protocol, and mapped our parsers to the government's updated JSON schema.

### 2. Substring Address Matching Bug
* **Problem:** If a landlord scanned flat number `9`, a simple text search like `.includes('9')` would match flat `19`, `29`, or blocks labeled `9 to 17`. This resulted in incorrect certificates being matched to properties.
* **Solution:** We implemented strict regex word-boundary matching rules:
  1. Starts with house number (e.g., `^9\b` or `^9,`).
  2. Starts with standard flat/apartment descriptors followed by the number (e.g., `Flat 9`, `Apartment 9`).
  This ensures flat 9 never gets false-matched with block ranges or higher numbers.

### 3. Postcode Sweeping & Expansion
* **Problem:** Letting agents often want to audit an entire street or residential block without entering every house number manually.
* **Solution:** We added a "Postcode Sweep" feature. If a user leaves the address field blank and submits a postcode, the server detects this and expands the single postcode query into a full-scale sweep, returning **every single registered domestic property** in that postcode area.

---

## Security Concept Considerations

If an architecture like this were to be deployed to production, protecting data access would be critical:

### 1. User Authentication Portal (Auth Gate)
* **Action:** Gate the web panel behind a secure authentication system (such as **Clerk** or **Firebase Auth**). 
* **Reason:** This ensures only authorized administrators can input property addresses and view compliance records.

### 2. Rate Limiting on Backend Proxy
* **Action:** Implement rate-limiting middleware (such as `express-rate-limit`) on the `/api/check` endpoint.
* **Reason:** This prevents malicious actors from automating address lookups or attempting to scrape the government database through your server proxy.

### 3. Masking & Minimization
* **Action:** Restrict the return payload to only what is required for MEES audits. UPRNs (Unique Property Reference Numbers) and certificate numbers can be masked on client screens, displaying only compliance ratings to non-administrators.

---

## CSV Upload Format

To audit a portfolio in bulk, upload a `.csv` file containing the following column headers:
```csv
address,postcode
"Flat 1, 10 High Street","ST5 1QA"
"24 London Road","ST4 1BU"
```
The tracker will automatically geocode/query each address, fetch its live EPC certificate, and generate your compliance summary dashboard.


