# Functional Requirements Document (FRD)
**Project:** Banking KYC Document Upload & Verification System
**Date:** 2025-12-30
**Version:** 1.0

## 1. Introduction
This document outlines the functional and non-functional requirements for the Banking KYC Verification System. The system aims to digitize the Know Your Customer (KYC) process, enabling remote document upload, AI-driven verification, and secure compliance auditing.

## 2. Actors & Roles
| Actor | Description |
|-------|-------------|
| **Customer** | A new or existing bank user who needs to complete KYC verification. |
| **Admin/Officer** | Bank official responsible for manually verifying flagged documents and overseeing the process. |
| **System (AI)** | Automated agents performing OCR, validation, and notifications. |
| **Auditor** | Viewer with access to compliance logs and reports. |

## 3. Functional Requirements

### 3.1 Customer Portal
#### FR-01: Registration & Login
- System must allow users to register with Email and Phone Number.
- Secure Login using JWT-based authentication.
- Password/OTP management (simulation).

#### FR-02: Document Upload
- User can upload ID Proof (Passport/Driving License) and Address Proof.
- Supported formats: PDF, JPG, PNG.
- Max file size limit: 5MB.
- **AI Check:** System must instantly check for image quality (blurriness) before accepting upload.

#### FR-03: Dashboard
- View current KYC Status (Pending, Verified, Rejected).
- View recent notifications/messages from the bank.

### 3.2 Verification Engine (AI & Back Office)
#### FR-04: AI/OCR Processing
- Automatically extract fields: Name, DOB, ID Number, Address.
- Validate document completeness (e.g., ensure all corners are visible).
- Match extracted data against user-provided registration details.

#### FR-05: Validation Logic
- **Positive:** If OCR confidence > 90% and data matches -> Auto-Verify (or mark for fast-track).
- **Negative:** If document is missing or invalid format -> Trigger immediate error alert.

### 3.3 Admin Panel
#### FR-06: Verification Queue
- Admin can view a list of "Pending Verification" requests.
- Admin can approve or reject documents with comments.

#### FR-07: Reports
- Generate "Daily KYC Report" and "Audit Trail Log".

### 3.4 Notifications
- **Real-time:** Send email/SMS (simulated) upon successful upload, verification success, or rejection.

## 4. Non-Functional Requirements
- **Security:** Data at rest encryption (simulated or implemented via DB features). HTTPS enforcement.
- **Scalability:** Microservices or modular monolith architecture.
- **Performance:** OCR processing should take < 5 seconds per document.
- **Compliance:** Full audit logging of every user action (Upload, View, Approve, Reject).

## 5. Error Scenarios & Handling
| Scenario | System Behavior |
|----------|-----------------|
| Uploading a non-supported file | Display "Invalid file format. Please upload JPG/PNG/PDF". |
| Blurry or Unreadable Image | AI Agent detects low contrast/blur and prompts "Image unclear, please retake". |
| Database Connection Fail | Fail gracefully with "Service temporarily unavailable" message. |
| Duplicate ID Upload | Detect if ID number already exists in DB and flag as potential duplicate account. |
