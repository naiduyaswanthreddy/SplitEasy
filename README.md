
# 💰 SplitEasy - Advanced Trip Expense Manager

A modern, full-featured expense management platform built with React, TypeScript, and TailwindCSS. Think Splitwise, but better - with delightful UX, powerful logic, and clean modular code.

## ✨ Features

### 🔹 Core Functionality
- **Smart Expense Splitting** - Equal, percentage, and custom splits
- **Real-time Balance Tracking** - See who owes what at a glance  
- **Group Management** - Create and manage expense groups effortlessly
- **Visual Analytics** - Beautiful charts and breakdowns
- **Settlement Optimization** - Minimize transactions to settle balances

### 🔹 User Experience
- **Modern UI Design** - Inspired by Splitwise, Notion, and Linear
- **Responsive Layout** - Perfect on mobile, tablet, and desktop
- **Dark Mode Support** - Easy on the eyes
- **Smooth Animations** - Delightful micro-interactions
- **Toast Notifications** - Clear feedback for all actions

### 🔹 Advanced Features (Planned)
- **Natural Language Chatbot** - "Who owes me?", "How much did I spend in Goa?"
- **Receipt Scanning** - AI-powered expense extraction
- **Multi-currency Support** - Handle international trips
- **Export/Import** - CSV, PDF, and Excel support
- **Real-time Sync** - Live updates across devices

### 🔹 PWA Features
- Installable on desktop and mobile devices
- Offline support
- Push notification ready
- Responsive design

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Shadcn/UI** component library
- **React Query** for state management
- **Lucide React** for icons
- **Recharts** for analytics (planned)

### Planned Backend
- **FastAPI** (Python) 
- **PostgreSQL** with SQLAlchemy
- **Supabase** for authentication
- **OpenAI API** for chatbot

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn components
│   ├── Header.tsx      # Navigation header
│   ├── GroupCard.tsx   # Group display card
│   ├── BalanceSummary.tsx # Balance overview
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Dashboard
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```


## 🔧 Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd spliteasy
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
   ## 🐳 Docker Deployment
The application includes Docker support for easy deployment:
```bash
docker-compose up --build
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist folder
```

### Full-Stack (Planned)
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render
- **Database**: Supabase/PlanetScale
- **File Storage**: Supabase Storage

## 📋 Roadmap

### Phase 1 
- [x] Modern UI design system
- [x] Dashboard with balance overview
- [x] Group creation and management
- [x] Responsive layout
- [x] Dark mode support

### Phase 2 
- [x] Expense creation and editing
- [x] Smart splitting algorithms  
- [x] Member management
- [x] Settlement calculations
- [x] Export functionality

### Phase 3 
- [x] Supabase backend integration
- [x] Real-time synchronization
- [x] Mobile app (React Native)
- [x] Receipt scanning with AI
- [x] Multi-currency support
- [x] Analytics dashboard

### Phase 4 (Next)
- [ ] Natural language chatbot
- [ ] Social features and sharing
- [ ] Automated expense categorization
- [ ] Advanced reporting
- [ ] API for third-party integrations


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: yeswanthreddynaidu@gmail.com


---


