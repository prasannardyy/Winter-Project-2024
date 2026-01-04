# User Manual
**Project:** Banking KYC Verification System

## 1. Getting Started
### 1.1 Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Web Browser (Chrome/Safari)

### 1.2 Installation
1. Navigate to project root.
2. Install Backend: `cd backend && npm install`
3. Install Frontend: `cd frontend && npm install`
4. Install AI Tools: `cd ai-tools && pip install -r requirements.txt` (or just install streamlit directly)

### 1.3 Running the App
- **Backend:** `node backend/index.js` (Runs on Port 5000)
- **Frontend:** `cd frontend && npm run dev` (Runs on Port 3000)
- **AI Checker:** `cd ai-tools && streamlit run app.py`

## 2. Customer Guide
### 2.1 Registration
1. Go to `http://localhost:3000`.
2. Click **Open Account**.
3. Fill in Name, Email, Password.

### 2.2 Uploading Documents
1. Login to your Dashboard.
2. Click **Upload** next to "Government ID".
3. Select a clear image of your ID (JPG/PNG).
4. Click **Submit**.
5. Wait for the "AI Verification Successful" message.
6. The extracted text will be shown below.

## 3. Admin Guide
### 3.1 Reviewing Documents
1. Go to `http://localhost:3000/admin`.
2. You will see a list of Pending documents.
3. Review the AI Confidence Score.
4. Click **Approve** or **Reject**.

## 4. AI Code Quality Checker
1. Run the Streamlit app.
2. Open `http://localhost:8501`.
3. Paste any code snippet or upload a file.
4. Click **Analyze**.
5. View security and performance violations.
