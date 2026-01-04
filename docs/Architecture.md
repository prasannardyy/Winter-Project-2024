# Application Architecture Document
**Project:** Banking KYC Verification System
**Date:** 2025-12-30

## 1. High-Level Architecture
The system follows a layered Microservices-inspired architecture, separating the Frontend, Backend API, Database, and AI Services.

```mermaid
graph TD
    User[Client / Browser] -->|HTTPS/JSON| FE[Frontend - Next.js]
    FE -->|API Calls| API[Backend - Node.js/Express]
    
    subgraph "Backend Services"
        API -->|Queries| DB[(PostgreSQL/MySQL)]
        API -->|Uploads| Storage[File Storage (Local/S3)]
        API -->|Events| Agents[AI Agents Logic]
    end
    
    subgraph "AI Layer"
        Agents -->|OCR Request| AICore[OCR & Validation Agent]
        Agents -->|Status Update| Notify[Notification Agent]
    end
    
    subgraph "Admin Tooling"
        Admin[Admin User] -->|Verify/Audit| FE
        Dev[Developer] -->|Upload Code| Quality[AI Code Quality Checker (Streamlit)]
    end
```

## 2. Technology Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + Lucide Icons
- **State Management:** React Context / Hooks
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Validation:** Joi / Zod
- **ORM:** Prisma or Sequelize (Standard SQL client)
- **Authentication:** JWT (Json Web Tokens)

### Database
- **Primary RDBMS:** PostgreSQL (Preferred) or MySQL.
- **Tables:** Users, Documents, Verifications, AuditLogs.

### AI & Agents
- **Agent 1 (OCR):** Tesseract.js (Node) or Python Bridge.
- **Agent 2 (Notification):** Simulated Email/SMS Service.
- **Agent 3 (Code Quality):** Python + Streamlit + Flake8/Pylint.

## 3. Security Design
- **Data Protection:** All PII (Personally Identifiable Information) stored with encryption where possible.
- **API Security:** Rate limiting, Helmet.js headers, JWT middleware.
- **File Security:** Validation of file magic numbers (mimetype checking) to prevent malicious uploads.

## 4. AI Agent Integration
The AI agents interact via internal service calls.
- **Trigger:** When a file is uploaded to `POST /api/upload`.
- **Action:** Backend triggers `OCR_Agent.scan(file)`.
- **Result:** Agent returns JSON `{ name: "...", id: "...", confidence: 0.95 }`.
- **Decision:** Backend logic determines if `VerificationStatus = AUTO_APPROVED` or `MANUAL_REVIEW`.
