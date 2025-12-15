# 📋 Habit Tracker - Premium

A beautiful, Excel-style habit tracking web application with a modern teal/cyan color theme. Track your daily habits, visualize progress, and build consistency.

![Color Palette](https://img.shields.io/badge/Theme-Teal%2FCyan-71C9CE)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 📊 Habit Tracking
- **Dynamic Calendar Grid** - Displays days according to current month (28/29/30/31 days)
- **Week-based Organization** - Days grouped into Week 1-5 with visual separators
- **Current Week Highlight** - Active week marked with 🔥 emoji
- **Today Column Highlight** - Current day stands out with accent color

### 🔒 Smart Date Control
- **Past Days Locked** - Cannot modify checkboxes for days that have passed (shown in red)
- **Today & Future Editable** - Only current and future days can be checked/unchecked
- **Reset Button Control** - Disabled when no checkboxes are checked

### 📈 Analytics Dashboard
- **Monthly Completion** - Overall progress percentage
- **Total Habits** - Count of active habits
- **Best Streak** - Longest consecutive days completed
- **Consistency Score** - Overall consistency percentage

### 📉 Visual Charts
- **Bar Chart** - Total completion per habit
- **Line Chart** - Progress % over days
- Built with vanilla JavaScript Canvas (no external libraries)

### 💾 Data Persistence
- **Local Storage** - All data saved automatically in browser
- **Month Auto-Reset** - Clears checkboxes when month changes (keeps habit names)

### 🎨 Design
- **Color Palette**: `#E3FDFD`, `#CBF1F5`, `#A6E3E9`, `#71C9CE`
- **Responsive Layout** - Works on desktop and mobile
- **Sticky Headers** - Habit column and week headers stay visible while scrolling
- **Hidden Scrollbar** - Clean look with scroll functionality preserved

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- Local web server (optional, for development)

### Installation

1. **Clone or Download** the project files:
   ```
   index.html
   styles.css
   script.js
   favicon.svg
   ```

2. **Open** `index.html` in your browser

   Or use a local server:
   ```bash
   # Using Python
   python -m http.server 5500

   # Using Node.js (npx)
   npx serve
   
   # Using VS Code Live Server extension
   Right-click index.html → Open with Live Server
   ```

3. **Start tracking** your habits!

## 📁 Project Structure

```
Habit-Tracker/
├── index.html      # Main HTML structure
├── styles.css      # All styling (CSS variables, responsive design)
├── script.js       # Application logic, charts, localStorage
├── favicon.svg     # Custom teal-themed favicon
└── README.md       # Documentation
```

## 🎯 How to Use

1. **Add Habits** - Click "+ Add Habit" button
2. **Name Your Habit** - Type in the habit name field
3. **Check Days** - Click checkboxes for today and future days
4. **Track Progress** - View analytics cards and charts
5. **Weekly Review** - Check the Weekly Breakdown section
6. **Reset Month** - Use "Reset Month" to clear all checkboxes

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Lightest Teal | `#E3FDFD` | Cards, backgrounds |
| Light Teal | `#CBF1F5` | Week headers, hover states |
| Medium Teal | `#A6E3E9` | Borders, today highlight |
| Dark Teal | `#71C9CE` | Primary accent, checkmarks, buttons |

## 🔧 Customization

### Change Color Theme
Edit the CSS variables in `styles.css`:
```css
:root {
    --color-bg-main: #71C9CE;
    --color-accent-primary: #71C9CE;
    /* ... other variables */
}
```

### Modify Motivation Quotes
Edit the `motivationQuotes` array in `script.js`:
```javascript
const motivationQuotes = [
    'Your custom quote here',
    // ... more quotes
];
```

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Opera

## 🤝 Contributing

Feel free to fork and modify this project for your own use!

## 📄 License

This project is open source and available for personal and commercial use.

---

Made with 💚 using HTML, CSS & JavaScript
