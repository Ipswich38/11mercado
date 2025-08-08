# 11Mercado Educational Platform

A comprehensive React-based educational platform for Grade 11 students featuring real-time weather, fund tracking, AI-powered STEM assistance, and college entrance exam preparation tools.

## 🚀 Features

- **Real-time Weather Updates** - Localized weather information with API integration
- **Fund Tracking** - Connected to Google Forms for transparent donation tracking
- **AI STEM Assistant** - Groq-powered AI tutor restricted to STEM subjects only
- **AI Quiz Generator** - UPCAT-style practice questions with instant feedback
- **School News Feed** - Integration with DepEd website and Facebook updates
- **Project Status Dashboard** - Track proposed, ongoing, and completed projects
- **Exclusive Bulletin Board** - Community announcements for students and parents

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS with custom components
- **AI Integration**: Groq API with LLaMA models
- **Weather API**: OpenWeatherMap
- **Icons**: Lucide React
- **Build Tool**: Vite with optimized production builds

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd 11mercado
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   REACT_APP_GROQ_API_KEY=your-groq-api-key-here
   REACT_APP_WEATHER_API_KEY=your-openweather-api-key-here
   REACT_APP_GOOGLE_FORMS_URL=https://forms.gle/MDj8jhiZpMjyGZKL8
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔑 API Keys Setup

### Groq API (Required for AI Features)

1. Visit [Groq Console](https://console.groq.com/)
2. Create an account and get your API key
3. Add `REACT_APP_GROQ_API_KEY=your-key-here` to your `.env` file

### OpenWeatherMap API (Optional)

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key and add `REACT_APP_WEATHER_API_KEY=your-key-here` to your `.env` file

## 🎯 AI Features

### STEM Assistant

- **Scope**: Physics, Chemistry, Biology, Mathematics, Earth Science
- **Restrictions**: Automatically declines non-STEM questions
- **Model**: LLaMA 3 8B via Groq (optimized for educational content)
- **Features**:
  - Conversational interface with context memory
  - Grade 11 Filipino curriculum focus
  - Step-by-step problem solving
  - Real-world examples using Philippine context

### Quiz Generator

- **Subjects**: Math, Science, English, Abstract Reasoning
- **Format**: UPCAT-style multiple choice questions
- **Difficulty**: Adaptive based on Grade 11-12 level
- **Features**:
  - AI-generated questions with explanations
  - Progress tracking and statistics
  - Timed practice sessions
  - Instant feedback with detailed explanations

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AISTEMAssistant.jsx    # AI tutor component
│   ├── AIQuizGenerator.jsx    # Quiz generator component
│   ├── StudentDashboard.jsx   # Main dashboard
│   └── ui/                    # Reusable UI components
├── utils/
│   ├── groqService.js         # Groq API integration
│   ├── weatherService.js      # Weather API service
│   └── fundingService.js      # Google Forms integration
└── App.jsx                    # Main application component
```

## 🚀 Deployment to Netlify

### Method 1: Drag & Drop (Fastest)

1. **Visit** https://netlify.com and sign up/login
2. **Drag the entire project folder** to Netlify's deploy area
3. **Your site will be live immediately!**

### Method 2: GitHub Integration

1. **Push to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Complete 11Mercado platform with secure login"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to https://netlify.com
   - Click "New site from Git"
   - Choose "GitHub" and select your repository
   - Build settings are already configured in `netlify.toml`
   - Click "Deploy site"

3. **Your site will be live** at `https://your-site-name.netlify.app`

### 🔐 Access Information

#### For Students/Parents/Teachers:
- **User Access Code**: `MERCADO112025`

#### For Admin:
- **Admin Access Code**: `ADMIN2025MERCADO`
- **Admin Email**: `11mercado.pta@gmail.com`

#### System Settings:
- **Max Users**: 100 concurrent sessions
- **Session Timeout**: 30 minutes

### 📱 Live URLs (after deployment)

- **Login**: `https://your-site.netlify.app/login`
- **Admin**: `https://your-site.netlify.app/admin`
- **Dashboard**: `https://your-site.netlify.app/dashboard`

### Alternative: Standalone Version

Use `standalone.html` for a complete demonstration without backend dependencies.

## 📚 Educational Focus

This platform is specifically designed for:

- **Grade 11 Filipino students** preparing for college
- **STEM education** with curriculum-aligned content
- **College entrance exam preparation** (UPCAT focus)
- **Community engagement** through fund tracking and announcements

## 🔒 Safety & Restrictions

- AI assistant strictly limited to STEM subjects
- No personal data collection beyond quiz statistics
- Educational content appropriate for high school students
- Secure API key handling with environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for educational purposes for the 11Mercado community.

## 📞 Support

For technical issues or feature requests, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for Grade 11 STEM students in the Philippines**
