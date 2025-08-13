# 11Mercado Educational Platform

A comprehensive educational platform designed for student learning and PTA community engagement.

## 🌟 Features

### Student Portal
- **Access Control**: Secure login with access codes (80 concurrent users max)
- **Session Management**: 15-minute inactivity timeout for optimal resource usage
- **Educational Tools**: AI-powered STEM resources and quiz generators
- **Community Hub**: Interactive space for student discussions and announcements

### Admin Dashboard
- **User Monitoring**: Real-time tracking of active users with IP addresses
- **Activity Logs**: Comprehensive logging of user activities and system events
- **Error Management**: AI-assisted error resolution and issue tracking
- **Analytics**: Detailed statistics and user engagement metrics

### Educational Tools
- **College Entrance Exam Quiz Generator**: AI-powered UPCAT practice tests
- **AI Scientific Calculator**: Advanced mathematical problem solving
- **Research and STEM-GPT**: Combined AI assistant for STEM subjects
- **Interactive Tutorials**: Step-by-step guides for platform features

### Donation System
- **Upload Tracking**: Receipt upload with reference number generation
- **Progress Monitoring**: Real-time donation drive progress tracking
- **Google Sheets Integration**: Automated data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ipswich38/11mercado.git
   cd 11mercado
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Access Codes

### Student Access
- **Code**: `MERCADO80`
- **Features**: All educational tools, community access, donation uploads

### Admin Access  
- **Code**: `ADMIN2025`
- **Features**: Full admin dashboard, user monitoring, system analytics

### Financial Officer Access (Treasurer/Auditor)
- **Code**: `FINANCE2025`
- **Features**: Specialized financial dashboard, donation tracking, audit reports

## 🛠️ Environment Setup

### Required Environment Variables

```env
# Groq AI API Key (Required for AI features)
VITE_GROQ_API_KEY=your-groq-api-key-here

# Google Sheets API (Optional for donation tracking)
VITE_GOOGLE_SHEETS_API_KEY=your-google-client-id-here
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
```

### Vercel Environment Variables Setup

**For Vercel deployment, add these in your project settings:**

1. **VITE_GROQ_API_KEY**: Your Groq API key from console.groq.com
2. **VITE_GOOGLE_SHEETS_API_KEY**: Your Google OAuth client ID for Sheets API
3. **VITE_GOOGLE_SHEETS_SPREADSHEET_ID**: Target spreadsheet ID for donation tracking

**Steps:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development environments
3. Redeploy the project to apply changes

### Get API Keys

1. **Groq API Key**: 
   - Visit [Groq Console](https://console.groq.com/)
   - Create free account
   - Generate API key

2. **Google Sheets API** (Optional):
   - Follow setup guide in `DONATION_SETUP.md`

## 📱 Platform Overview

### User Experience
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Glassmorphism UI**: Modern design with backdrop blur effects
- **High Contrast Mode**: Accessibility support for better visibility
- **Session Persistence**: Automatic login restoration on page refresh

### Security Features
- **Access Code Authentication**: Secure entry with role-based permissions
- **Session Management**: Automatic timeout and cleanup
- **IP Tracking**: Monitor user locations for security purposes
- **Input Validation**: Comprehensive form validation and sanitization

### Performance
- **Optimized Builds**: Production-ready with code splitting
- **Lazy Loading**: Dynamic imports for improved load times
- **Caching**: Efficient resource caching strategies
- **Bundle Size**: ~1MB minified for fast loading

## 🔧 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the project: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure environment variables on hosting platform

## 📚 Additional Documentation

- **Admin Guide**: `ADMIN_GUIDE.md` - Complete admin dashboard guide
- **Donation Setup**: `DONATION_SETUP.md` - Google Sheets integration
- **User Limits**: `USER_LIMIT_README.md` - Session management details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in this repository
- Contact: 11mercado.pta@gmail.com

## 🙏 Acknowledgments

- Built with React + TypeScript + Vite
- UI Framework: Tailwind CSS
- Icons: Lucide React
- AI Integration: Groq SDK
- Hosting: Vercel

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**