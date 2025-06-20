
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

## 🎨 Design System

### Colors
- **Primary**: Indigo to Purple gradient
- **Success**: Emerald shades
- **Warning**: Amber shades  
- **Danger**: Rose shades
- **Neutral**: Slate shades

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale from xs to 4xl
- **Weights**: 400, 500, 600, 700

### Components
- **Cards**: Elevated with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with proper validation
- **Badges**: Color-coded for different states

## 📱 Screenshots

### Dashboard
Beautiful overview of all groups, balances, and recent activity with gradient cards and smooth animations.

### Group Management  
Easy group creation with emoji selection, member management, and real-time balance calculations.

### Expense Tracking
Intuitive expense entry with smart splitting options and category icons.

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

### Phase 1 (Current) ✅
- [x] Modern UI design system
- [x] Dashboard with balance overview
- [x] Group creation and management
- [x] Responsive layout
- [x] Dark mode support

### Phase 2 (Next)
- [ ] Expense creation and editing
- [ ] Smart splitting algorithms  
- [ ] Member management
- [ ] Settlement calculations
- [ ] Export functionality

### Phase 3 (Future)
- [ ] Supabase backend integration
- [ ] Real-time synchronization
- [ ] Mobile app (React Native)
- [ ] Receipt scanning with AI
- [ ] Multi-currency support
- [ ] Analytics dashboard

### Phase 4 (Advanced)
- [ ] Natural language chatbot
- [ ] Social features and sharing
- [ ] Automated expense categorization
- [ ] Advanced reporting
- [ ] API for third-party integrations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: support@spliteasy.com
- 💭 Discord: [Join our community](https://discord.gg/spliteasy)
- 📱 Twitter: [@SplitEasyApp](https://twitter.com/SplitEasyApp)

---


