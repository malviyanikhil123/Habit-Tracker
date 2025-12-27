# Habit Tracker - React + TypeScript

A beautiful, Excel-style habit tracking web application built with React and TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
habit-tracker-react/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/           # React components
│   │   ├── AddHabitButton/
│   │   ├── Analytics/
│   │   ├── Charts/
│   │   ├── DailyRoutine/
│   │   ├── Header/
│   │   ├── MotivationBanner/
│   │   ├── SmartReminder/
│   │   ├── TrackerTable/
│   │   ├── WeeklyBreakdown/
│   │   └── index.ts
│   ├── constants/            # App constants
│   │   ├── quotes.ts
│   │   ├── routines.ts
│   │   ├── weeks.ts
│   │   └── index.ts
│   ├── hooks/                # Custom React hooks
│   │   ├── useAnalytics.ts
│   │   ├── useHabits.ts
│   │   ├── useMotivation.ts
│   │   ├── useRoutine.ts
│   │   └── index.ts
│   ├── styles/               # CSS styles
│   │   └── App.css
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   ├── analyticsUtils.ts
│   │   ├── chartUtils.ts
│   │   ├── dateUtils.ts
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## ✨ Features

- **Dynamic Calendar Grid** - Days according to current month
- **Week-based Organization** - Days grouped into Week 1-5
- **Current Week Highlight** - Active week marked with 🔥
- **Today Column Highlight** - Current day stands out
- **Past Days Locked** - Cannot modify past days
- **Analytics Dashboard** - Progress stats
- **Visual Charts** - Bar and line charts
- **Daily Routine** - Schedule management
- **Local Storage** - Data persistence

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Lightest Teal | `#E3FDFD` | Cards, backgrounds |
| Light Teal | `#CBF1F5` | Week headers, hover states |
| Medium Teal | `#A6E3E9` | Borders, today highlight |
| Dark Teal | `#71C9CE` | Primary accent, checkmarks |

## 📱 Technologies

- React 18
- TypeScript
- Vite
- CSS3

---
Made with 💚 using React + TypeScript
