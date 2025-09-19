# Opportune – AI-Powered Job Application Platform

**Full-stack job platform with AI resume parsing, multi-role dashboards, and real-time analytics.** Built with React + Spring Boot, deployed with Google Cloud Document AI integration.

## 🌐 Live Demo

**[🚀 Try the Live Application](https://job-app-frontend-shristi.netlify.app)**

**Demo Accounts Available:**
- **Admin**: `admin_test` / `test123` (Full system access)
- **HR Manager**: `hr_test` / `test123` (Post jobs, manage applications)  
- **Job Seeker**: `newuser` / `password1234` (Apply to jobs, track applications)

## 🚀 Key Differentiators

- **🤖 AI-Powered Resume Parsing** - Google Cloud Document AI extracts skills, experience, and contact info with machine-learning based confidence scoring
- **👥 Multi-Role System** - Seamless Admin/HR/Job Seeker dashboards with role-based access control
- **📊 Real-Time Analytics** - Live application tracking, candidate scoring, and platform insights
- **🔧 Full-Stack Deployment** - React frontend + Spring Boot backend, with JWT authentication

## 📸 Platform Overview

<p align="center">
  <img src="https://i.imgur.com/eBF0JzJ.png" width="400" />
</p>

**Modern landing page with clean design and clear value proposition**

## 🤖 AI-Powered Resume Analytics

<p align="center">
  <img src="https://i.imgur.com/6VznnVp.png" width="400" />
</p>

**Google Cloud Document AI extracts skills, experience, and contact info with machine-learning based confidence scoring**

## 💼 Platform Showcase

### Job Seeker Dashboard

<p align="center">
  <img src="https://i.imgur.com/3udRTBm.png" width="400" />
</p>

**Comprehensive application tracking with status updates and job management**

### HR Management Interface

<p align="center">
  <img src="https://i.imgur.com/rPfpVnq.png" width="400" />
</p>

**Professional HR dashboard for application management and candidate review**

### Admin Analytics Dashboard

<p align="center">
  <img src="https://i.imgur.com/KKEKX3r.png" width="400" />
</p>

**Comprehensive analytics showing platform usage, user roles, and system metrics**

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS  
- **Backend**: Spring Boot, JWT Authentication  
- **AI Integration**: Google Cloud Document AI  
- **Database**: PostgreSQL with RESTful APIs  
- **Deployment**: Netlify (Frontend) + Render (Backend)

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Backend API running (see [Opportune-Backend](https://github.com/shristikhadka/Opportune-Backend))

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```bash
# Backend API URL
REACT_APP_API_URL=http://localhost:8080/api

# For production
REACT_APP_API_URL=https://your-backend-api.onrender.com/api
```

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/shristikhadka/Opportune-Frontend.git
cd Opportune-Frontend
npm install

# Configure environment
cp .env.example .env
# Add your backend API URL

# Start development server
npm start
# Access at http://localhost:3000
```

### Production Build
```bash
npm run build
npm install -g serve
serve -s build
```

### Deployment (Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Set environment variable: `REACT_APP_API_URL`

## 🎯 Key Achievements

- **AI Integration**: Successfully integrated Google Cloud Document AI for resume parsing
- **Multi-Role System**: Implemented role-based access control for three user types
- **Modern UI/UX**: Created responsive, professional interface with Tailwind CSS
- **Full-Stack**: Built complete job application platform with frontend and backend
- **Production Ready**: Deployed live application with demo accounts for testing

## 🔗 Related Repositories

- **Backend API**: [Opportune-Backend](https://github.com/shristikhadka/Opportune-Backend)
- **Full-Stack Demo**: [Live Application](https://job-app-frontend-shristi.netlify.app)

## 👨‍💻 Author

**Shristi Khadka** - Full-Stack Developer
- 💼 **GitHub**: [@shristikhadka](https://github.com/shristikhadka)
- 📧 **Email**: shristikhadka0988@gmail.com
- 🔗 **LinkedIn**: [Connect with me](https://www.linkedin.com/in/shristi-k-34b53922a/)
