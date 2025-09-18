# Opportune - Frontend

A modern React-based frontend for the Opportune job application management system with AI-powered resume analytics.

## 🌐 Live Demo

**[View Live Application](https://job-app-frontend-shristi.netlify.app)**

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Job Search & Filtering**: Advanced search with multiple filters
- **Resume Management**: Upload, delete, and manage resumes
- **AI Resume Analytics**: View AI-parsed resume insights and candidate metrics
- **Real-time Updates**: Dynamic updates for job applications and status changes
- **Role-based Access**: Different interfaces for candidates, HR, and admins
- **Mobile Responsive**: Fully optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **HTTP Client**: Axios
- **Routing**: React Router
- **Build Tool**: Create React App
- **Icons**: Heroicons

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

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/shristikhadka/Opportune-Frontend.git
   cd Opportune-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Serve production build locally
npm install -g serve
serve -s build
```

### Deployment (Netlify)

1. **Connect to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. **Environment Variables**
   - Set `REACT_APP_API_URL` to your backend API URL

## 📱 Pages & Features

### Public Pages
- **Home**: Landing page with job search
- **Login/Register**: User authentication
- **Job Listings**: Browse and search jobs
- **Job Details**: View job information and apply

### Candidate Dashboard
- **Profile Management**: Update personal information
- **My Applications**: Track application status
- **Resume Management**: Upload and manage resumes
- **Job Search**: Advanced filtering and search

### HR Dashboard
- **Job Management**: Create, edit, and manage job postings
- **Application Review**: View and manage applications
- **Candidate Analytics**: AI-powered candidate insights
- **Resume Analysis**: View parsed resume data and metrics

### Admin Panel
- **User Management**: Manage all users and permissions
- **Access Requests**: Approve HR access requests
- **System Analytics**: Overview of platform usage

## 🎨 Key Components

### Core Components
- **JobCard**: Display job information in lists
- **FileUpload**: Drag-and-drop file upload with progress
- **SearchFilters**: Advanced job search filtering
- **ApplicationModal**: Job application submission
- **ConfirmDialog**: Reusable confirmation dialogs

### AI Features
- **ResumeAnalytics**: Display AI-parsed resume data
- **CandidateSearch**: AI-powered candidate filtering
- **SkillsAnalysis**: Extract and display candidate skills
- **ExperienceMapping**: Match candidate experience to job requirements

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## 🔧 Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript for type safety

### API Integration
- Centralized API configuration in `services/api.ts`
- Axios interceptors for authentication
- Error handling with user-friendly messages

## 📝 Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (irreversible)

## 🔒 Security Features

- JWT token management
- Protected routes based on user roles
- Input validation and sanitization
- Secure file upload handling
- CORS-enabled API communication

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🌐 Related Repositories

- **Backend API**: [Opportune-Backend](https://github.com/shristikhadka/Opportune-Backend)

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Shristi Khadka**
- GitHub: [@shristikhadka](https://github.com/shristikhadka)
- Email: shristikhadka0988@gmail.com
