# StudyFlow AI - Smart Study Planner & AI Study Coach

A comprehensive full-stack web application built with Next.js, MongoDB, and AI features to help students organize their studies, track progress, and receive personalized learning recommendations.

## 🚀 Features

### For Students
- **Smart Dashboard** - Overview of study progress, tasks, and AI recommendations
- **Subject Management** - Add, edit, and track progress across multiple subjects
- **Study Planner** - Create and manage study tasks with priorities and deadlines
- **AI Recommendations** - Personalized study suggestions based on performance and patterns
- **Progress Analytics** - Detailed insights into study habits and performance
- **Interactive Quizzes** - Test knowledge and identify weak areas
- **Smart Flashcards** - Spaced repetition for effective memorization
- **Study Sessions** - Track focus time and study sessions with distractions
- **Notes Management** - Organize study materials and notes by subject
- **Study Groups** - Collaborate with peers and share resources
- **Goal Setting** - Set and track short-term and long-term academic goals

### For Mentors
- **Student Management** - Monitor and guide assigned students
- **Content Creation** - Create study materials and quizzes
- **Progress Tracking** - View detailed student performance analytics
- **Communication Tools** - Send announcements and provide feedback

### For Administrators
- **User Management** - Manage students, mentors, and platform users
- **Analytics Dashboard** - Platform-wide usage and performance metrics
- **Content Moderation** - Review and manage user-generated content

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 19** - Latest React features
- **Tailwind CSS** - Utility-first CSS framework
- **NextAuth.js** - Authentication and session management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js

### Authentication & Security
- **NextAuth.js** - Secure authentication system
- **bcrypt** - Password hashing
- **JWT** - JSON Web Tokens for secure sessions

## 📁 Project Structure

```
studyflow-ai/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── student/
│   │   │   ├── dashboard/
│   │   │   ├── subjects/
│   │   │   ├── planner/
│   │   │   ├── sessions/
│   │   │   ├── notes/
│   │   │   ├── flashcards/
│   │   │   ├── quizzes/
│   │   │   └── progress/
│   │   ├── mentor/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── common/
│   │   └── forms/
│   ├── lib/
│   ├── models/
│   ├── services/
│   ├── hooks/
│   └── types/
├── public/
└── package.json
```

## 🗄️ Database Schema

### Core Models
- **Users** - Student, mentor, and admin accounts
- **Subjects** - Academic subjects with progress tracking
- **Tasks** - Study tasks with scheduling and priorities
- **StudySessions** - Time tracking and focus metrics
- **Notes** - Study materials organized by subject
- **Flashcards** - Spaced repetition learning cards
- **Quizzes** - Knowledge testing and assessment
- **QuizResults** - Performance tracking and analytics
- **Groups** - Study groups and collaboration
- **Notifications** - System alerts and reminders

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studyflow-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/studyflow-ai
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/studyflow-ai

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-in-production

   # JWT Secret
   JWT_SECRET=your-jwt-secret-change-in-production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Subjects
- `GET /api/subjects` - Get user subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/[id]` - Update subject
- `DELETE /api/subjects/[id]` - Delete subject

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Study Sessions
- `POST /api/sessions/start` - Start study session
- `POST /api/sessions/end` - End study session
- `GET /api/sessions/history` - Get session history

### Progress & Analytics
- `GET /api/progress/overview` - Get study overview
- `GET /api/progress/subjects` - Get subject-wise progress
- `GET /api/progress/streak` - Get study streak data

## 🎨 User Interface

### Design System
- **Color Palette** - Blue primary with purple accents
- **Typography** - Geist Sans for clean readability
- **Components** - Reusable UI components with Tailwind CSS
- **Responsive** - Mobile-first design approach
- **Accessibility** - WCAG compliant interface elements

### Key Pages
- **Landing Page** - Marketing site with features and testimonials
- **Student Dashboard** - Personalized study overview with AI recommendations
- **Subject Management** - Visual subject cards with progress tracking
- **Study Planner** - Calendar-based task organization
- **Progress Analytics** - Charts and insights into study patterns

## 🤖 AI Features

### Intelligent Recommendations
- **Study Suggestions** - AI analyzes performance to suggest focus areas
- **Optimal Scheduling** - Smart timetable generation based on priorities
- **Performance Insights** - Identify weak areas and improvement opportunities
- **Adaptive Learning** - Personalized difficulty adjustment for quizzes

### Analytics & Insights
- **Study Pattern Analysis** - Track focus time and productivity trends
- **Subject Performance** - Compare progress across different subjects
- **Learning Efficiency** - Measure time spent vs. knowledge gained
- **Predictive Modeling** - Forecast exam performance and readiness

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style
- ESLint configuration for code quality
- Prettier for consistent formatting
- Absolute imports with `@/` prefix
- Component-based architecture

## 🚀 Deployment

### Production Checklist
1. Set up production MongoDB database
2. Configure environment variables
3. Build and test the application
4. Deploy to hosting platform (Vercel, Netlify, etc.)
5. Set up domain and SSL certificate

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=secure-production-secret
NEXTAUTH_URL=https://your-domain.com
JWT_SECRET=secure-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the flexible database solution
- Open source community for the amazing tools and libraries

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@studyflow.ai

---

**StudyFlow AI** - Empowering students with intelligent study planning and personalized learning experiences.