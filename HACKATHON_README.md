# 🚀 Hackathon 2024 - Retro Tech Edition

A full-stack hackathon management web app built with Next.js, Convex, and shadcn/ui components.

## ✨ Features

### 🎮 Retro Gaming Theme
- Immersive retro gaming aesthetic with neon colors and gradients
- Customizable UI components with retro styling
- Responsive design optimized for all devices

### 👥 User Management
- **Role-based Registration**: Users choose between Developer or Non-Developer roles
- **Company Email Tracking**: Optional company email for internal tracking
- **Authentication**: Secure sign-in/sign-up with Convex Auth

### 💡 Ideas Management
- **Submit Ideas**: Registered users can submit hackathon ideas
- **Vote for Ideas**: One vote per idea per user
- **Real-time Updates**: Live vote counts and idea submissions

### 🏆 Team Formation
- **Create Teams**: Users can create teams with balanced roles
- **Join Teams**: Users can join existing teams (one team per user)
- **Role Constraints**: Teams must have 1-2 Developers and 1-2 Non-Developers
- **Idea Selection**: Teams must select an idea to be marked as "assembled"

### 🏅 Leaderboard
- **Team Voting**: Users can vote for their favorite teams
- **Real-time Rankings**: Live leaderboard with vote counts
- **Podium Display**: Top 3 teams get special recognition

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database and functions)
- **Authentication**: Convex Auth with password provider
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Custom retro theme with CSS animations

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
app/
├── (splash)/              # Landing page
│   └── HackathonHome/     # Retro-themed homepage
├── hackathon/             # Main hackathon app
│   ├── HackathonDashboard/ # Ideas, teams, leaderboard tabs
│   └── Leaderboard/       # Dedicated leaderboard page
├── signin/                # Authentication with role selection
└── product/               # Original chat app (preserved)

convex/
├── schema.ts              # Database schema for hackathon entities
├── hackathon.ts           # Hackathon-specific functions
└── auth.ts                # Authentication configuration

components/
├── ui/                    # shadcn/ui components
└── UserMenu.tsx           # User navigation menu
```

## 🎨 Theme Customization

The app includes custom CSS classes for retro styling:

- `.retro-glow` - Yellow glow effects
- `.retro-button` - Gradient buttons with hover animations
- `.retro-card` - Glassmorphism cards with cyan borders
- `.retro-input` - Styled form inputs
- `.retro-gradient-text` - Multi-color gradient text
- `.retro-pulse` - Pulsing animation for important elements

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with your Convex deployment URL:
```
CONVEX_DEPLOYMENT=your-convex-deployment-url
```

### Database Schema
The app uses the following main entities:
- `hackathonUsers` - User profiles with roles and team assignments
- `ideas` - Submitted hackathon ideas with vote counts
- `teams` - Team information with member counts and selected ideas
- `ideaVotes` - Individual votes for ideas
- `teamVotes` - Individual votes for teams

## 🚀 Deployment

The app is designed to be easily deployable to CDNs and static hosting:

1. **Build the app**: `npm run build`
2. **Deploy**: Upload the `out` directory to your CDN/hosting provider
3. **Configure Convex**: Set up your Convex deployment for production

## 🎯 Hackathon Rules

- **Team Formation**: Teams need 1-2 Developers and 1-2 Non-Developers
- **Voting**: Each user can vote once per idea and once per team
- **Team Assembly**: Teams must select an idea to be marked as "assembled"
- **Competition**: Most popular teams (by votes) win!

## 🤝 Contributing

This is an internal hackathon project. For modifications:
1. Follow the existing code patterns
2. Maintain the retro theme consistency
3. Test all functionality before deployment
4. Update this README for any new features

---

**Built with ❤️ for Hackathon 2024** 🚀✨