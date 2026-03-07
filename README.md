# Health Passport - Complete Implementation

A comprehensive digital health passport system with blockchain-grade security, QR code integration, and multi-role authentication for patients, doctors, and hospitals.

##  Features Completed

### Authentication System
- ✅ **Patient Registration & Login** - Complete with Health Passport ID generation
- ✅ **Doctor Registration & Login** - Medical license verification and hospital affiliation
- ✅ **Hospital Registration & Login** - Facility management with admin accounts
- ✅ **NextAuth.js Integration** - Secure session management with role-based access

### Patient Portal
- ✅ **Dashboard** - Real-time health score, recent visits, active medications
- ✅ **Profile Management** - Personal information, emergency contacts, medical details
- ✅ **QR Code Generation** - Secure health passport QR codes for quick access
- ✅ **Document Management** - Upload and manage medical documents
- ✅ **Medical History** - Track conditions, medications, and treatments
- ✅ **Vitals Tracking** - Record and monitor vital signs over time

### Hospital Portal
- ✅ **Dashboard** - Patient statistics, recent visits, system health
- ✅ **QR Scanner** - Scan patient QR codes for instant access to health data
- ✅ **Patient Search** - Find patients by ID, name, or phone number
- ✅ **Staff Management** - Manage doctors and hospital staff
- ✅ **Patient Records** - View and update patient information
- ✅ **Analytics** - Hospital performance and patient flow analytics

### Backend APIs
- ✅ **Authentication APIs** - Register/login for all user types
- ✅ **Patient APIs** - Registration, dashboard, profile, documents, search
- ✅ **Hospital APIs** - Dashboard, staff management, patient management
- ✅ **Doctor APIs** - Registration, authentication
- ✅ **QR Code APIs** - Generate and scan QR codes
- ✅ **Database Models** - Complete MongoDB schemas for all entities

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with custom providers
- **UI Components**: shadcn/ui
- **QR Code**: qrcode.react
- **Styling**: Tailwind CSS

## Project Structure

```
health-passport/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── patients/          # Patient management APIs
│   │   ├── doctors/           # Doctor management APIs
│   │   ├── hospitals/         # Hospital management APIs
│   │   └── qr/                # QR code APIs
│   ├── auth/                  # Authentication pages
│   │   ├── patient/           # Patient login/signup
│   │   ├── doctor/            # Doctor login/signup
│   │   └── hospital/          # Hospital login/signup
│   ├── patient/               # Patient portal pages
│   ├── hospital/              # Hospital portal pages
│   └── layout.tsx             # Root layout with AuthProvider
├── components/                # Reusable UI components
├── lib/                       # Utilities and configurations
│   ├── models/                # Database models
│   ├── utils/                 # Helper functions
│   ├── auth/                  # Authentication configuration
│   └── db/                    # Database connection
└── types/                     # TypeScript type definitions
```

##  Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-passport
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/health-passport
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000
   - Navigate to different portals:
     - Patient: `/auth/patient/login`
     - Hospital: `/auth/hospital/login` 
     - Doctor: `/auth/doctor/login`

##  User Flows

### Patient Journey
1. **Registration**: `/auth/patient/signup`
   - Fill personal information (name, email, phone, DOB, blood type, Aadhar)
   - System generates unique Health Passport ID (HP-XXXXX-XXXXX)
   - Account created and redirected to login

2. **Login**: `/auth/patient/login`
   - Enter Health Passport ID and password
   - Access patient dashboard

3. **Dashboard**: `/patient/dashboard`
   - View health score, recent visits, active medications
   - Access QR code for health passport

4. **Profile**: `/patient/profile`
   - Update personal information
   - Manage emergency contacts
   - View and download QR code

### Hospital Journey
1. **Registration**: `/auth/hospital/signup`
   - Enter facility details, admin information
   - System generates Hospital ID (HOS-YYYY-XXXXXX)
   - Wait for admin verification

2. **Login**: `/auth/hospital/login`
   - Enter email and password
   - Access hospital dashboard

3. **Dashboard**: `/hospital/dashboard`
   - View patient statistics and recent visits
   - Monitor system health

4. **QR Scanner**: `/hospital/qr-scanner`
   - Scan patient QR codes
   - Instantly access patient health data
   - View medical history, allergies, conditions

5. **Patient Search**: `/hospital/patient-search`
   - Search by Health Passport ID, name, or phone
   - Access patient records

### Doctor Journey
1. **Registration**: `/auth/doctor/signup`
   - Enter personal details, medical license, specialty
   - System generates Doctor ID (DOC-XXXXXXXX)
   - Wait for verification

2. **Login**: `/auth/doctor/login`
   - Enter email and password
   - Access hospital portal (doctors use hospital system)

##  QR Code System

### QR Code Generation
- Each patient gets a unique QR code containing their Health Passport ID
- QR codes can be displayed, downloaded, or printed
- Used for quick patient identification in emergencies

### QR Code Scanning
- Hospitals can scan patient QR codes
- Instant access to:
  - Patient identification
  - Medical history
  - Current medications
  - Allergies and conditions
  - Emergency contact information

##  Security Features

- **Role-based Authentication**: Separate login systems for patients, doctors, hospitals
- **Session Management**: Secure JWT tokens with NextAuth.js
- **Data Encryption**: Sensitive data like Aadhar numbers are formatted and protected
- **Access Control**: Users can only access their own data and authorized information
- **Audit Logging**: Track access to patient data for compliance

##  API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handler
- `POST /api/patients/register` - Patient registration
- `POST /api/doctors/register` - Doctor registration  
- `POST /api/hospitals/register` - Hospital registration

### Patient APIs
- `GET /api/patients/dashboard` - Patient dashboard data
- `GET /api/patients/search` - Search patients (hospital/doctor access)
- `GET /api/patients/documents` - Patient documents
- `GET /api/patients/vitals` - Patient vital signs
- `GET /api/patients/medications` - Patient medications

### Hospital APIs
- `GET /api/hospitals/dashboard` - Hospital dashboard data
- `GET /api/hospitals/patients` - Hospital patient list
- `GET /api/hospitals/staff` - Hospital staff management

### QR Code APIs
- `POST /api/qr/scan` - Scan QR code and get patient data
- `POST /api/qr/verify` - Verify QR code validity

##  Testing the System

### Test Patient Registration
1. Go to `/auth/patient/signup`
2. Fill the form with valid data
3. Note the generated Health Passport ID
4. Login with the credentials

### Test Hospital QR Scanner
1. Register as a hospital
2. Login to hospital dashboard
3. Go to QR Scanner (`/hospital/qr-scanner`)
4. Use the test ID: `HP-A28B3-T9I1L` to simulate scanning

### Test Patient Search
1. From hospital portal, go to Patient Search
2. Search by Health Passport ID, name, or phone
3. View patient details

##  Production Deployment

### Environment Variables
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/health-passport
NEXTAUTH_SECRET=your-super-secure-random-secret-key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Security Considerations
- Use strong, unique secrets for production
- Enable MongoDB authentication and SSL
- Implement rate limiting on APIs
- Set up proper CORS policies
- Use HTTPS everywhere
- Regular security audits

##  Database Schema

### Patient Model
```typescript
{
  healthPassportId: string,
  personalInfo: {
    firstName, lastName, email, phone,
    dateOfBirth, bloodType, aadharNumber
  },
  medicalHistory: [],
  medications: [],
  vitals: [],
  visits: [],
  documents: []
}
```

### Hospital Model
```typescript
{
  hospitalId: string,
  facilityInfo: {
    name, type, email, phone, address, licenseNumber
  },
  adminInfo: {
    firstName, lastName
  },
  verified: boolean
}
```

### Doctor Model
```typescript
{
  doctorId: string,
  personalInfo: {
    firstName, lastName, email, phone,
    licenseNumber, specialty, hospitalAffiliation
  },
  credentials: {
    verified: boolean
  }
}
```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request




##  Support

For issues and questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Health Passport** - Revolutionizing healthcare data management with secure, instant, and universal access to medical information.
