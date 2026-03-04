# 🏥 AI Clinic Management + Smart Diagnosis SaaS

A modern, AI-powered clinic management system built for the AI Hackathon. This SaaS platform digitizes clinic operations and provides intelligent AI assistance for doctors.

## 🚀 Features

### User Roles (4 Roles)
- **Admin** - Manage doctors, receptionists, view analytics, manage subscriptions
- **Doctor** - View appointments, access patient history, AI diagnosis assistance, write prescriptions
- **Receptionist** - Register patients, book appointments, manage schedules
- **Patient** - View profile, appointment history, prescriptions, download PDFs

### Core Features
- ✅ JWT Authentication with Role-Based Access Control
- ✅ Patient Management (CRUD operations)
- ✅ Appointment Booking & Management
- ✅ Digital Prescription System with PDF Generation
- ✅ Medical History Timeline
- ✅ AI-Powered Smart Symptom Checker (Gemini API)
- ✅ Prescription Explanation (AI-generated)
- ✅ Risk Flagging for High-Risk Conditions
- ✅ Analytics Dashboard (Admin & Doctor)
- ✅ Responsive Design (Desktop & Mobile)

### AI Features
1. **Smart Symptom Checker** - AI analyzes symptoms and suggests possible conditions
2. **Prescription Explanation** - Simple language explanations for patients
3. **Risk Flagging** - Detects high-risk symptom combinations
4. **Predictive Analytics** - Patient load forecasting

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Google Gemini AI** - AI diagnosis
- **Cloudinary** - Image storage
- **PDFKit** - Prescription PDF generation
- **Helmet, CORS, Rate Limiting** - Security

### Frontend
- **Next.js 16** - React Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Analytics charts
- **jsPDF + html2canvas** - PDF generation
- **Lucide Icons** - Icons

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18+ installed
- **MongoDB** running locally or MongoDB Atlas connection
- API keys for external services

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd recreate
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/healthcare

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini API Configuration (for AI diagnosis)
GEMINI_API_KEY=your-gemini-api-key

# OpenRouter API Configuration (for prescription explanation)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
```

**Get your API keys:**
- Google Gemini: https://makersuite.google.com/app/apikey
- OpenRouter: https://openrouter.ai/keys
- Cloudinary: https://cloudinary.com

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

## 📱 Usage

### Demo Accounts

Use the quick-access buttons on the login page or:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | password123 |
| Doctor | doctor@clinic.com | password123 |
| Receptionist | receptionist@clinic.com | password123 |
| Patient | patient@clinic.com | password123 |

### User Flow

1. **Register/Login** - Create an account or use demo accounts
2. **Dashboard** - Role-specific dashboard appears
3. **Key Actions:**
   - **Doctors:** Use AI Symptom Checker, Write Prescriptions, View Queue
   - **Receptionists:** Register Patients, Book Appointments
   - **Patients:** View Appointments, Download Prescriptions
   - **Admins:** Manage Users, View Analytics

## 📁 Project Structure

```
recreate/
├── backend/
│   ├── config/          # Database, Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── app/
│   │   ├── (auth)/      # Login, Register pages
│   │   ├── (dashboard)/ # Role-specific dashboards
│   │   ├── components/  # Reusable components
│   │   └── contexts/    # React contexts (Auth)
│   └── lib/             # Utilities
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update status
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Prescriptions
- `GET /api/prescriptions/patient/:patientId` - Get patient prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `GET /api/prescriptions/:id/pdf` - Download PDF
- `POST /api/prescriptions` - Create prescription
- `POST /api/prescriptions/:id/explanation` - Get AI explanation

### AI Diagnosis
- `POST /api/diagnosis/suggest` - Get AI diagnosis suggestion
- `GET /api/diagnosis/history/:patientId` - Get diagnosis history
- `POST /api/diagnosis/risk-flag` - Flag patient risk

### Analytics
- `GET /api/analytics/dashboard` - Admin dashboard stats
- `GET /api/analytics/doctor/:doctorId` - Doctor analytics
- `GET /api/analytics/monthly-appointments` - Monthly trends
- `GET /api/analytics/common-diagnoses` - Common diagnoses
- `GET /api/analytics/patient-forecast` - Patient load forecast

## 🚀 Deployment

### Backend (Render/Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` to production backend URL
4. Deploy

## 🎯 Hackathon Submission Checklist

- [x] Deployed URL (Live App)
- [ ] GitHub Repository URL
- [ ] Project Demo Video (3-7 minutes showing):
  - [ ] Login + role dashboards
  - [ ] Patient management
  - [ ] Appointment booking
  - [ ] Prescription generation (PDF)
  - [ ] Medical history timeline
  - [ ] AI features
  - [ ] Admin analytics

## 🐛 Known Issues

- Some analytics use mock data (needs real API integration)
- Patient appointment booking page needs backend integration

## 📝 Future Enhancements

- SMS/WhatsApp reminders
- Billing module
- Telemedicine video calls
- Mobile app (React Native)
- Multi-language support (Urdu)
- E-prescription integration with pharmacies

## 👥 Team

Built for the AI Hackathon - MERN Stack Students

## 📄 License

MIT License - Feel free to use this for learning or startup purposes.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Next.js team for the amazing framework
- Hackathon organizers

---

**Note:** This project is built as a hackathon submission and can be extended into a real SaaS product for small clinics.
