# 🎯 Habit Tracker - React + TypeScript + Supabase

A beautiful, feature-rich habit tracking web application with user authentication, daily routines, analytics, and real-time data synchronization. Built with modern web technologies for a seamless user experience.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Features

### 🔐 User Authentication
- **Secure Sign Up & Login** - Email/password authentication via Supabase
- **Session Management** - Automatic session restoration on page reload
- **Protected Routes** - Content visible only to authenticated users
- **User-specific Data** - Each user has their own isolated habit data

### 📊 Habit Tracking
- **Monthly Calendar View** - Full month grid with day-by-day tracking
- **Week-based Organization** - Days grouped into Week 1-5 for better visualization
- **Today Highlight** - Current day column stands out with visual indicator
- **Past Days Protection** - Cannot modify previous days (locked with red checkboxes)
- **Custom Habits** - Add unlimited habits with emoji icons
- **Quick Toggle** - Click any checkbox to mark habit completion
- **Timezone-aware** - Correctly handles date boundaries regardless of timezone

### 🎓 New User Onboarding
- **2-Step Guided Setup** - First-time users are guided through setup
- **Habit Suggestions** - Pre-defined habit categories (Health, Productivity, Personal Growth, etc.)
- **Routine Templates** - Select from common daily activities to build your schedule
- **Custom Additions** - Add your own habits and routine tasks during onboarding
- **Skip Options** - Users can skip onboarding entirely or individual steps

### 📅 Daily Routine Manager
- **Weekly Schedule** - Create different routines for each day of the week
- **Day Groups** - Combine similar days (e.g., Weekdays, Weekends)
- **Time-based Tasks** - Assign specific time slots to activities
- **Current Task Highlight** - Shows what you should be doing right now
- **Collapsible View** - Minimize/expand routine section with state persistence
- **Visual Timeline** - Color-coded tasks (Morning, Work, Study, Break, Evening, Night)
- **Routine Editor** - Drag-and-drop interface to customize your schedule

### 📈 Analytics Dashboard
- **Monthly Completion Rate** - Overall progress percentage for the month
- **Best Streak** - Longest consecutive completion across all habits
- **Consistency Score** - Algorithm-based score reflecting habit adherence
- **Total Habits Tracked** - Count of active habits
- **Habit Performance Chart** - Bar chart showing completion count per habit (top 8)
- **Daily Progress Chart** - Line chart tracking daily completion percentage over time
- **Smart Insights** - AI-generated tips based on your tracking patterns

### 📉 Visual Charts
- **Bar Chart** - Top 8 performing habits by completion count
- **Line Chart** - Daily completion trends throughout the month
- **Responsive Design** - Charts adapt to screen size
- **Interactive Tooltips** - Hover to see detailed statistics

### 🗓️ Weekly Breakdown
- **Week Cards** - Individual cards for each week of the month
- **Quick Stats** - Completion count and percentage per week
- **Progress Indicators** - Visual representation of weekly performance
- **Active Week Badge** - Current week highlighted with 🔥 emoji

### 💪 Motivation System
- **Daily Quotes** - Inspiring quotes that change based on your progress
- **Contextual Messages** - Different messages for high/low completion rates
- **Encouraging Feedback** - Positive reinforcement to maintain consistency

### 🔔 Smart Reminders
- **Progress-based Suggestions** - Tips based on your current streak
- **Context-aware Advice** - Different messages for excellent/good/needs improvement performance
- **Custom Icons** - Visual indicators matching the message type

### 🎨 Beautiful UI/UX
- **Teal Color Palette** - Calming, modern color scheme
- **Smooth Animations** - Subtle transitions and hover effects
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Sticky Headers** - Column and row headers stay visible while scrolling
- **Custom Scrollbars** - Styled scrollbars matching the theme
- **Toast Notifications** - Real-time feedback for user actions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Supabase account (free tier works perfectly)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your project URL and anon/public key

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Set up database tables**
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create habits table
CREATE TABLE habits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    month INTEGER NOT NULL,
    year INTEGER NOT NULL
);

-- Create habit_logs table
CREATE TABLE habit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    day INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, day)
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for habits
CREATE POLICY "Users can view their own habits"
    ON habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
    ON habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
    ON habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
    ON habits FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for habit_logs
CREATE POLICY "Users can view their own habit logs"
    ON habit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own habit logs"
    ON habit_logs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own habit logs"
    ON habit_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own habit logs"
    ON habit_logs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM habits
            WHERE habits.id = habit_logs.habit_id
            AND habits.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_month_year ON habits(month, year);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_day ON habit_logs(day);
```

6. **Start development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 📁 Project Architecture

```
habit-tracker/
├── public/
│   └── favicon.svg                 # App favicon
├── src/
│   ├── components/                 # React Components
│   │   ├── AddHabitButton/        # Floating button to add habits
│   │   ├── Analytics/             # Analytics dashboard & cards
│   │   ├── Auth/                  # Login/Signup forms
│   │   ├── Charts/                # Data visualization components
│   │   ├── DailyRoutine/          # Daily schedule manager
│   │   ├── Header/                # App header with user menu
│   │   ├── MotivationBanner/      # Inspirational quotes
│   │   ├── Onboarding/            # New user onboarding flow
│   │   ├── SmartReminder/         # Context-aware reminders
│   │   ├── TrackerTable/          # Main habit tracking table
│   │   ├── WeeklyBreakdown/       # Week-by-week summary
│   │   └── index.ts               # Component barrel export
│   ├── constants/                 # Application Constants
│   │   ├── quotes.ts              # Motivational quotes
│   │   ├── routines.ts            # Default routine templates
│   │   ├── weeks.ts               # Week configuration
│   │   └── index.ts
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useAnalytics.ts        # Analytics calculations
│   │   ├── useAuth.ts             # Authentication state
│   │   ├── useDayGroups.ts        # Day grouping logic
│   │   ├── useHabits.ts           # Habit CRUD operations
│   │   ├── useMotivation.ts       # Quote selection
│   │   ├── useRoutine.ts          # Routine management
│   │   └── index.ts
│   ├── services/                  # External Services
│   │   ├── authService.ts         # Supabase auth wrapper
│   │   ├── habitService.ts        # Habit database operations
│   │   └── supabase.ts            # Supabase client config
│   ├── styles/                    # Global Styles
│   │   └── App.css                # Main stylesheet
│   ├── types/                     # TypeScript Definitions
│   │   └── index.ts               # Type definitions
│   ├── utils/                     # Utility Functions
│   │   ├── analyticsUtils.ts      # Analytics helpers
│   │   ├── chartUtils.ts          # Chart data formatting
│   │   ├── dateUtils.ts           # Date manipulation
│   │   ├── helpers.ts             # General utilities
│   │   └── index.ts
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Application entry
│   └── vite-env.d.ts              # Vite type definitions
├── .env                           # Environment variables (not in git)
├── .gitignore                     # Git ignore rules
├── index.html                     # HTML template
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tsconfig.node.json             # TypeScript Node config
├── vite.config.ts                 # Vite configuration
└── README.md                      # This file
```

## 🧩 Key Components Explained

### **TrackerTable** (`src/components/TrackerTable/`)
The main habit tracking interface. Displays a calendar-style grid with habits as rows and days as columns.
- **TableHeader**: Renders week headers and day numbers
- **HabitRow**: Individual habit row with checkboxes and name input
- Handles timezone-aware date logic
- Implements sticky columns for habit names and totals

### **DailyRoutine** (`src/components/DailyRoutine/`)
Manages user's daily schedule across different days of the week.
- **RoutineSchedule**: Displays time-based task list
- **RoutineEditor**: Modal for editing routine tasks
- **DayGroupConfigModal**: Configure day groupings (Weekdays, Weekends, etc.)
- **CurrentTaskHighlight**: Shows current active task based on time

### **Analytics Dashboard** (`src/components/Analytics/`)
Displays progress metrics and insights.
- **AnalyticsDashboard**: Container for all analytics cards
- **AnalyticsCard**: Individual metric cards
- Calculates streaks, consistency scores, and completion rates

### **Auth Components** (`src/components/Auth/`)
User authentication interface.
- **AuthForm**: Combined login/signup form with toggle
- Handles validation and error display
- Integrates with Supabase authentication

### **Onboarding** (`src/components/Onboarding/`)
New user setup wizard.
- **NewUserOnboarding**: 2-step guided setup
- Step 1: Select habits from suggestions
- Step 2: Choose routine tasks
- Bulk creates habits and generates routine

## 🎨 Color Palette & Design System

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Lightest Teal | `#E3FDFD` | rgb(227, 253, 253) | Background, cards, table cells |
| Light Teal | `#CBF1F5` | rgb(203, 241, 245) | Week headers, hover states, row backgrounds |
| Medium Teal | `#A6E3E9` | rgb(166, 227, 233) | Borders, today highlight, scrollbars |
| Dark Teal | `#71C9CE` | rgb(113, 201, 206) | Primary buttons, checkmarks, active states |

### Typography
- **Primary Font**: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui
- **Monospace**: 'Monaco', 'Courier New', monospace (for dates/numbers)

### Spacing Scale
- Extra Small: 4px
- Small: 8px
- Medium: 12px
- Large: 16px
- Extra Large: 20px, 24px, 32px

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool
- **CSS3** - Custom styling with CSS variables

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication & user management

### Libraries
- **react-hot-toast** - Elegant toast notifications
- **@supabase/supabase-js** - Supabase client library

## 🗄️ Database Schema

### `habits` Table
```sql
id          UUID (PK)           -- Unique habit identifier
user_id     UUID (FK → auth.users)  -- Owner of the habit
name        TEXT                -- Habit name/description
created_at  TIMESTAMP           -- When habit was created
month       INTEGER             -- Month number (1-12)
year        INTEGER             -- Year (e.g., 2025)
```

### `habit_logs` Table
```sql
id          UUID (PK)           -- Unique log identifier
habit_id    UUID (FK → habits)  -- Associated habit
day         INTEGER             -- Day of month (1-31)
completed   BOOLEAN             -- Completion status
logged_at   TIMESTAMP           -- When status was logged
UNIQUE(habit_id, day)           -- One log per habit per day
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Authentication Required** - All API calls require valid session
- **SQL Injection Protection** - Parameterized queries via Supabase
- **XSS Protection** - React's built-in escaping
- **HTTPS Only** - Enforced by Supabase
- **JWT Tokens** - Secure session management

## 📱 Responsive Design

- **Desktop** (1024px+): Full layout with all features
- **Tablet** (768px-1023px): Optimized grid, collapsible sections
- **Mobile** (320px-767px): Stacked layout, horizontal scroll for table

## 🎯 State Management

### Local State (useState)
- Form inputs
- Modal visibility
- Loading states
- UI interactions

### Custom Hooks
- `useHabits`: Habit CRUD with Supabase sync
- `useAuth`: Authentication state
- `useRoutine`: Daily routine management
- `useAnalytics`: Derived statistics
- `useMotivation`: Quote selection logic

### Persistence
- **Supabase Database**: Habits and completion logs
- **localStorage**: UI preferences (collapsed states, custom routines, onboarding status)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Netlify
```bash
# Build command: npm run build
# Publish directory: dist

# Add environment variables in Netlify dashboard
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### GitHub Pages
```bash
# Update vite.config.ts with base path
export default defineConfig({
  base: '/habit-tracker/',
  // ...
})

# Deploy
npm run build
# Push dist folder to gh-pages branch
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add TypeScript types for new code
- Test on multiple screen sizes
- Update documentation for new features
- Write meaningful commit messages

## 🐛 Known Issues

- Horizontal scroll on sticky column overlap (under investigation)
- Chart performance with 50+ habits
- Mobile keyboard may cover form inputs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from various productivity apps
- Supabase team for excellent documentation
- React and TypeScript communities

## 📧 Contact

For questions or feedback:
- Create an issue on GitHub
- Email: your.email@example.com
- Twitter: @yourhandle

---

**Made with 💚 using React, TypeScript, and Supabase**

*Happy Habit Tracking! 🎯*