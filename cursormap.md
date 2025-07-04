# Health Passport Project: Backend, Database, and Document Storage Roadmap

## 1. Backend API Setup

- Use Node.js (Express) or Next.js API routes.
- Define endpoints for:
  - User authentication (patients, doctors, hospitals)
  - Health records CRUD
  - Patient document upload/download
  - QR code generation

## 2. Database Setup

### Main Data (Users, Health Records)
- **MongoDB Atlas**
  - Free tier, no credit card required for basic usage.
  - [Sign up here](https://www.mongodb.com/atlas/database)
  - Create a cluster, get connection string, add to `.env`:
    ```
    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
    ```

### Patient Document Storage

#### Option 1: Supabase Storage
- Free, no card, S3-compatible.
- [Sign up here](https://supabase.com/)
- Use Supabase JS SDK to upload/download files.

#### Option 2: Firebase Storage
- Free tier, no card.
- [Sign up here](https://firebase.google.com/)
- Use Firebase JS SDK for file operations.

#### Option 3: Cloudinary (for images/PDFs)
- Free, no card.
- [Sign up here](https://cloudinary.com/)

#### Option 4: DICOM Library (for medical images)
- [DICOM Library](https://www.dicomlibrary.com/) is free for DICOM files, but not for general documents.

## 3. Document Upload API

- Create a POST endpoint `/api/patient/upload-document`
- Use Supabase/Firebase SDK to upload file, get public URL.
- Store file metadata (URL, type, patient ID, upload date) in MongoDB.

## 4. QR Code Generation API

- Use **goQR.me** (no card, no signup required):
  - Example API call:
    ```
    https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=YOUR_DATA
    ```
  - Returns a PNG image of the QR code.

- Alternative: [AQRCode](https://qrcode.chooyee.co/) or [QRCoder](https://www.qrcoder.co.uk/)

## 5. Security

- Use JWT for authentication.
- Role-based authorization for all endpoints.
- Secure file access (signed URLs or access tokens).
- Encrypt sensitive data at rest and in transit.

## 6. Deployment

- Deploy backend on Vercel, Heroku, or Render (all have free tiers).
- Set up environment variables for DB and storage.
- Monitor logs and errors.

---

## Useful Links

- [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- [Supabase Storage](https://supabase.com/storage)
- [Firebase Storage](https://firebase.google.com/products/storage)
- [goQR.me API](https://goqr.me/api/)
- [AQRCode API](https://qrcode.chooyee.co/)
- [QRCoder API](https://www.qrcoder.co.uk/)

---

## Example `.env` (Do not commit to git)
