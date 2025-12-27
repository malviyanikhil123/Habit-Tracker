// ================================================
// PREMIUM HABIT TRACKER - JAVASCRIPT
// ================================================

// Global state
let habits = [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let daysInMonth = getDaysInCurrentMonth();

// Motivation quotes (rotates on refresh)
const motivationQuotes = [
    'Small steps, done daily, change everything.',
    'Consistency beats intensity. Focus on today.',
    'Progress is built quietly.',
    'Focus on today. Results will follow.',
    'Show up. Keep it simple. Repeat.',
    'Discipline is a calm decision, repeated daily.'
];

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// ================================================
// INITIALIZATION
// ================================================

function initializeApp() {
    loadFromLocalStorage();
    generateWeekHeaders();
    generateDayHeaders();
    renderHabits();
    updateMonthDisplay();
    setMotivationQuote();
    highlightTodayColumn();
    updateAllAnalytics();
    attachEventListeners();
    updateResetButtonState();

    // Keep charts crisp on resize
    window.addEventListener('resize', debounce(() => {
        renderCharts();
    }, 150));
}

function attachEventListeners() {
    document.getElementById('addHabitBtn').addEventListener('click', addHabit);
    document.getElementById('resetBtn').addEventListener('click', resetMonth);
}

// ================================================
// DATE UTILITIES
// ================================================

function getDaysInCurrentMonth() {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
}

function updateMonthDisplay() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent =
        `${monthNames[currentMonth]} ${currentYear}`;
}

function setMotivationQuote() {
    const el = document.getElementById('motivationQuote');
    if (!el) return;

    const quote = motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
    el.textContent = quote;
}

function getTodayDay() {
    const now = new Date();
    if (now.getMonth() === currentMonth && now.getFullYear() === currentYear) {
        return now.getDate();
    }
    return null;
}

// ================================================
// DAY HEADERS GENERATION
// ================================================

function generateWeekHeaders() {
    const weekHeaderRow = document.querySelector('.week-header-row');
    if (!weekHeaderRow) return;

    // Keep the first sticky "Habit" header, rebuild the rest dynamically
    while (weekHeaderRow.children.length > 1) {
        weekHeaderRow.removeChild(weekHeaderRow.lastChild);
    }

    const weeks = [
        { name: 'WEEK 1', start: 1, end: 7 },
        { name: 'WEEK 2', start: 8, end: 14 },
        { name: 'WEEK 3', start: 15, end: 21 },
        { name: 'WEEK 4', start: 22, end: 28 },
        { name: 'WEEK 5', start: 29, end: daysInMonth }
    ];

    const today = getTodayDay();

    weeks.forEach((w) => {
        if (w.start > daysInMonth) return;
        const actualEnd = Math.min(w.end, daysInMonth);
        const span = actualEnd - w.start + 1;
        const th = document.createElement('th');
        th.className = 'week-header';
        th.colSpan = span;
        th.textContent = w.name;

        // Highlight current running week
        if (today !== null && today >= w.start && today <= actualEnd) {
            th.classList.add('current-week');
        }

        weekHeaderRow.appendChild(th);
    });

    // Sticky summary headers at the end
    const totalTh = document.createElement('th');
    totalTh.textContent = 'Total';
    totalTh.className = 'sticky-total-header';
    weekHeaderRow.appendChild(totalTh);

    const progressTh = document.createElement('th');
    progressTh.textContent = 'Progress';
    progressTh.className = 'sticky-progress-header';
    weekHeaderRow.appendChild(progressTh);
}

function generateDayHeaders() {
    const dayHeaderRow = document.querySelector('.day-header-row');

    // Clear existing day headers (keep habit header)
    while (dayHeaderRow.children.length > 1) {
        dayHeaderRow.removeChild(dayHeaderRow.lastChild);
    }

    // Generate day headers for current month
    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement('th');
        th.textContent = day;
        th.dataset.day = day;

        // Soft week grouping separators (Week 2/3/4/5 starts)
        if (day === 8 || day === 15 || day === 22 || day === 29) {
            th.classList.add('week-start');
        }

        dayHeaderRow.appendChild(th);
    }

    // Add Total and Progress headers
    const totalTh = document.createElement('th');
    totalTh.textContent = 'Total';
    totalTh.className = 'sticky-total-header';
    dayHeaderRow.appendChild(totalTh);

    const progressTh = document.createElement('th');
    progressTh.textContent = 'Progress';
    progressTh.className = 'sticky-progress-header';
    dayHeaderRow.appendChild(progressTh);
}

// ================================================
// HABIT MANAGEMENT
// ================================================

function addHabit() {
    const newHabit = {
        id: Date.now(),
        name: '',
        days: Array(31).fill(false)
    };
    habits.push(newHabit);
    renderHabits();
    saveToLocalStorage();
    updateAllAnalytics();
}

function deleteHabit(habitId) {
    habits = habits.filter(h => h.id !== habitId);
    renderHabits();
    saveToLocalStorage();
    updateAllAnalytics();
}

function updateHabitName(habitId, newName) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.name = newName;
        saveToLocalStorage();
        updateAllAnalytics();
    }
}

function toggleDay(habitId, day) {
    const today = getTodayDay();

    // Only allow toggling for today and future days (not past days)
    if (today !== null && day < today) {
        return; // Past day - don't allow changes
    }

    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        habit.days[day - 1] = !habit.days[day - 1];
        renderHabits();
        saveToLocalStorage();
        updateAllAnalytics();
        updateResetButtonState();
    }
}

// ================================================
// RENDERING
// ================================================

function renderHabits() {
    const tbody = document.getElementById('habitRows');
    tbody.innerHTML = '';

    habits.forEach(habit => {
        const tr = document.createElement('tr');

        // Habit name cell
        const nameTd = document.createElement('td');
        nameTd.className = 'habit-name-cell';
        nameTd.innerHTML = `
            <input 
                type="text" 
                class="habit-name-input" 
                value="${habit.name}" 
                placeholder="Enter habit name..."
                data-habit-id="${habit.id}"
            />
            <button class="delete-habit-btn" data-habit-id="${habit.id}">✕</button>
        `;
        tr.appendChild(nameTd);

        // Day checkboxes
        const today = getTodayDay();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayTd = document.createElement('td');
            dayTd.className = 'checkbox-cell';
            dayTd.dataset.day = day;

            // Soft week grouping separators (Week 2/3/4/5 starts)
            if (day === 8 || day === 15 || day === 22 || day === 29) {
                dayTd.classList.add('week-start');
            }

            // Check if this is a past day
            const isPastDay = today !== null && day < today;

            dayTd.innerHTML = `
                <input 
                    type="checkbox" 
                    ${habit.days[day - 1] ? 'checked' : ''}
                    ${isPastDay ? 'disabled' : ''}
                    data-habit-id="${habit.id}"
                    data-day="${day}"
                />
            `;

            // Add class for styling past days
            if (isPastDay) {
                dayTd.classList.add('past-day');
            }

            tr.appendChild(dayTd);
        }

        // Total cell
        const total = habit.days.slice(0, daysInMonth).filter(d => d).length;
        const totalTd = document.createElement('td');
        totalTd.className = 'total-cell';
        totalTd.textContent = total;
        tr.appendChild(totalTd);

        // Progress cell
        const progress = Math.round((total / daysInMonth) * 100);
        const progressTd = document.createElement('td');
        progressTd.className = 'progress-cell';
        progressTd.textContent = `${progress}%`;
        tr.appendChild(progressTd);

        tbody.appendChild(tr);
    });

    // Attach event listeners
    attachHabitEventListeners();
    highlightTodayColumn();
}

function attachHabitEventListeners() {
    // Habit name inputs
    document.querySelectorAll('.habit-name-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const habitId = parseInt(e.target.dataset.habitId);
            updateHabitName(habitId, e.target.value);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const habitId = parseInt(e.target.dataset.habitId);
            if (confirm('Delete this habit?')) {
                deleteHabit(habitId);
            }
        });
    });

    // Checkboxes
    document.querySelectorAll('.checkbox-cell input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const habitId = parseInt(e.target.dataset.habitId);
            const day = parseInt(e.target.dataset.day);
            toggleDay(habitId, day);
        });
    });
}

// ================================================
// CURRENT DAY HIGHLIGHT
// ================================================

function highlightTodayColumn() {
    const today = getTodayDay();
    if (today === null) return;

    // Remove existing highlights
    document.querySelectorAll('.today-column').forEach(el => {
        el.classList.remove('today-column');
    });

    // Highlight header
    const dayHeaders = document.querySelectorAll('.day-header-row th');
    dayHeaders.forEach(th => {
        if (parseInt(th.dataset.day) === today) {
            th.classList.add('today-column');
        }
    });

    // Highlight cells in all rows
    document.querySelectorAll(`td[data-day="${today}"]`).forEach(td => {
        td.classList.add('today-column');
    });
}

// ================================================
// SMART REMINDER SYSTEM
// ================================================

function updateSmartReminder() {
    const today = getTodayDay();
    if (today === null || habits.length === 0) {
        document.getElementById('smartReminder').style.display = 'none';
        return;
    }

    const expectedProgress = (today / daysInMonth) * 100;

    // Calculate average actual progress
    let totalProgress = 0;
    habits.forEach(habit => {
        const completed = habit.days.slice(0, daysInMonth).filter(d => d).length;
        totalProgress += (completed / daysInMonth) * 100;
    });
    const actualProgress = totalProgress / habits.length;

    const reminderDiv = document.getElementById('smartReminder');

    if (actualProgress >= expectedProgress) {
        reminderDiv.className = 'smart-reminder on-track';
        reminderDiv.textContent = '✓ On Track';
    } else {
        reminderDiv.className = 'smart-reminder needs-focus';
        reminderDiv.textContent = '⚠ Needs Focus';
    }
}

// ================================================
// ANALYTICS DASHBOARD
// ================================================

function updateAllAnalytics() {
    updateSmartReminder();
    updateMonthlyCompletion();
    updateTotalHabits();
    updateBestStreak();
    updateConsistencyScore();
    renderCharts();
    updateWeeklyBreakdown();
}

// ================================================
// CHARTS (Vanilla canvas)
// ================================================

function renderCharts() {
    renderHabitBarChart();
    renderProgressLineChart();
}

function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function setupCanvas(canvas, heightCssPx) {
    const wrap = canvas.parentElement;
    const widthCssPx = wrap ? wrap.clientWidth : canvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.height = `${heightCssPx}px`;
    canvas.style.width = `${widthCssPx}px`;
    canvas.width = Math.floor(widthCssPx * dpr);
    canvas.height = Math.floor(heightCssPx * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: widthCssPx, height: heightCssPx };
}

function renderHabitBarChart() {
    const canvas = document.getElementById('habitBarChart');
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas, 220);
    ctx.clearRect(0, 0, width, height);

    const namedHabits = habits.filter(h => (h.name || '').trim() !== '');
    if (namedHabits.length === 0) {
        ctx.fillStyle = getCssVar('--color-text-muted');
        ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Add a habit to see the chart.', width / 2, height / 2);
        return;
    }

    const data = namedHabits.map(h => ({
        name: h.name,
        value: h.days.slice(0, daysInMonth).filter(Boolean).length
    }));

    const maxValue = Math.max(1, ...data.map(d => d.value));
    const padding = { top: 16, right: 10, bottom: 46, left: 28 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const grid = getCssVar('--color-border-soft');
    const bar = '#71C9CE';  // Teal accent color
    const text = getCssVar('--color-text-muted');
    const textMain = getCssVar('--color-text-main');

    // Grid (light)
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
    }

    const barSlot = chartW / data.length;
    const barW = Math.max(12, Math.min(26, barSlot * 0.6));

    data.forEach((d, i) => {
        const x = padding.left + i * barSlot + (barSlot - barW) / 2;
        const h = (d.value / maxValue) * chartH;
        const y = padding.top + chartH - h;

        // Bar
        ctx.fillStyle = bar;
        roundRect(ctx, x, y, barW, h, 6);
        ctx.fill();

        // Value
        ctx.fillStyle = textMain;
        ctx.font = '12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(d.value), x + barW / 2, y - 6);

        // Label (trim)
        const label = (d.name || '').trim();
        const short = label.length > 10 ? `${label.slice(0, 10)}…` : label;
        ctx.fillStyle = text;
        ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.fillText(short, x + barW / 2, padding.top + chartH + 28);
    });
}

function renderProgressLineChart() {
    const canvas = document.getElementById('progressLineChart');
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas, 220);
    ctx.clearRect(0, 0, width, height);

    if (habits.length === 0) {
        ctx.fillStyle = getCssVar('--color-text-muted');
        ctx.font = '13px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Check off days to see progress.', width / 2, height / 2);
        return;
    }

    // Progress % over days (overall consistency up to that day)
    const points = [];
    for (let day = 1; day <= daysInMonth; day++) {
        let done = 0;
        habits.forEach(h => {
            done += h.days.slice(0, day).filter(Boolean).length;
        });
        const possible = habits.length * day;
        const pct = possible > 0 ? (done / possible) * 100 : 0;
        points.push(pct);
    }

    const padding = { top: 16, right: 10, bottom: 32, left: 28 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const grid = getCssVar('--color-border-soft');
    const line = '#71C9CE';  // Teal accent color
    const text = getCssVar('--color-text-muted');

    // Grid + Y labels
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = text;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartW, y);
        ctx.stroke();
        ctx.fillText(`${100 - i * 25}%`, padding.left - 6, y + 4);
    }

    // X labels (few)
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.ceil(daysInMonth / 7));
    for (let d = 1; d <= daysInMonth; d += step) {
        const x = padding.left + ((d - 1) / Math.max(1, (daysInMonth - 1))) * chartW;
        ctx.fillText(String(d), x, padding.top + chartH + 22);
    }

    // Line
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((pct, i) => {
        const x = padding.left + (i / Math.max(1, (daysInMonth - 1))) * chartW;
        const y = padding.top + chartH - (pct / 100) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function debounce(fn, waitMs) {
    let t;
    return (...args) => {
        window.clearTimeout(t);
        t = window.setTimeout(() => fn(...args), waitMs);
    };
}

function updateMonthlyCompletion() {
    if (habits.length === 0) {
        document.getElementById('monthlyCompletion').textContent = '0%';
        return;
    }

    let totalProgress = 0;
    habits.forEach(habit => {
        const completed = habit.days.slice(0, daysInMonth).filter(d => d).length;
        totalProgress += (completed / daysInMonth) * 100;
    });
    const avgProgress = totalProgress / habits.length;
    document.getElementById('monthlyCompletion').textContent = `${Math.round(avgProgress)}%`;
}

function updateTotalHabits() {
    const totalHabits = habits.filter(h => h.name.trim() !== '').length;
    document.getElementById('totalHabits').textContent = totalHabits;
}

function updateBestStreak() {
    let maxStreak = 0;

    habits.forEach(habit => {
        let currentStreak = 0;
        let bestStreakForHabit = 0;

        for (let i = 0; i < daysInMonth; i++) {
            if (habit.days[i]) {
                currentStreak++;
                bestStreakForHabit = Math.max(bestStreakForHabit, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        maxStreak = Math.max(maxStreak, bestStreakForHabit);
    });

    document.getElementById('bestStreak').textContent = `${maxStreak} days`;
}

function updateConsistencyScore() {
    if (habits.length === 0) {
        document.getElementById('consistencyScore').textContent = '0%';
        return;
    }

    const today = getTodayDay() || daysInMonth;
    let totalPossible = habits.length * today;
    let totalCompleted = 0;

    habits.forEach(habit => {
        totalCompleted += habit.days.slice(0, today).filter(d => d).length;
    });

    const consistency = Math.round((totalCompleted / totalPossible) * 100);
    document.getElementById('consistencyScore').textContent = `${consistency}%`;
}

// ================================================
// WEEKLY BREAKDOWN
// ================================================

function updateWeeklyBreakdown() {
    const weeksContainer = document.getElementById('weeksContainer');
    weeksContainer.innerHTML = '';

    // Display format (as requested):
    // Week 1  Week 2  Week 3
    // Week 4  Week 5
    const weekRanges = [
        { name: 'Week 1', start: 1, end: 7 },
        { name: 'Week 2', start: 8, end: 14 },
        { name: 'Week 3', start: 15, end: 21 },
        { name: 'Week 4', start: 22, end: 28 },
        { name: 'Week 5', start: 29, end: 35 }
    ];

    weekRanges.forEach(week => {
        const hasDays = week.start <= daysInMonth;
        const actualEnd = hasDays ? Math.min(week.end, daysInMonth) : null;
        const daysInWeek = hasDays ? (actualEnd - week.start + 1) : 0;

        // Calculate week completion
        let totalCompleted = 0;
        const totalPossible = habits.length * daysInWeek;

        if (hasDays) {
            habits.forEach(habit => {
                for (let day = week.start; day <= actualEnd; day++) {
                    if (habit.days[day - 1]) {
                        totalCompleted++;
                    }
                }
            });
        }

        const weekProgress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
        const daysLabel = hasDays ? `${week.start}–${actualEnd}` : '—';

        // Create week card
        const weekCard = document.createElement('div');
        weekCard.className = 'week-card';
        weekCard.innerHTML = `
            <div class="week-title">${week.name}</div>
            <div class="week-stats">
                <div class="week-stat-row">
                    <span class="week-stat-label">Days</span>
                    <span class="week-stat-value">${daysLabel}</span>
                </div>
                <div class="week-stat-row">
                    <span class="week-stat-label">Completion</span>
                    <span class="week-stat-value">${weekProgress}%</span>
                </div>
                <div class="week-progress-bar">
                    <div class="week-progress-fill" style="width: ${weekProgress}%"></div>
                </div>
            </div>
        `;

        weeksContainer.appendChild(weekCard);
    });
}

// ================================================
// RESET MONTH
// ================================================

// Check if any checkbox is checked across all habits
function hasAnyCheckedBox() {
    return habits.some(habit => habit.days.slice(0, daysInMonth).some(day => day === true));
}

// Update reset button state based on checkbox status
function updateResetButtonState() {
    const resetBtn = document.getElementById('resetBtn');
    if (!resetBtn) return;

    if (hasAnyCheckedBox()) {
        resetBtn.disabled = false;
        resetBtn.style.opacity = '1';
        resetBtn.style.cursor = 'pointer';
        resetBtn.title = 'Reset all checkboxes for this month';
    } else {
        resetBtn.disabled = true;
        resetBtn.style.opacity = '0.5';
        resetBtn.style.cursor = 'not-allowed';
        resetBtn.title = 'No checkboxes checked to reset';
    }
}

function resetMonth() {
    if (!hasAnyCheckedBox()) {
        return; // Don't allow reset if nothing is checked
    }

    if (!confirm('Reset all checkboxes for this month? Habit names will be kept.')) {
        return;
    }

    habits.forEach(habit => {
        habit.days = Array(31).fill(false);
    });

    renderHabits();
    saveToLocalStorage();
    updateAllAnalytics();
    updateResetButtonState();
}

// ================================================
// LOCAL STORAGE
// ================================================

function saveToLocalStorage() {
    const data = {
        habits,
        currentMonth,
        currentYear
    };
    localStorage.setItem('habitTracker', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('habitTracker');
    if (stored) {
        try {
            const data = JSON.parse(stored);

            // Check if we need to reset for a new month
            const now = new Date();
            if (data.currentMonth !== now.getMonth() || data.currentYear !== now.getFullYear()) {
                // New month detected - reset days but keep habits
                habits = data.habits.map(h => ({
                    ...h,
                    days: Array(31).fill(false)
                }));
                currentMonth = now.getMonth();
                currentYear = now.getFullYear();
                daysInMonth = getDaysInCurrentMonth();
            } else {
                // Same month - load everything
                habits = data.habits || [];
                currentMonth = data.currentMonth;
                currentYear = data.currentYear;
                daysInMonth = getDaysInCurrentMonth();
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            habits = [];
        }
    }
}

// ================================================
// DAILY ROUTINE SYSTEM
// ================================================

const dailyRoutines = {
    weekday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 7:40 AM', task: 'DSA Practice', icon: '💻', type: 'study' },
        { time: '7:40 AM – 8:00 AM', task: 'English Practice', icon: '📖', type: 'study' },
        { time: '8:00 AM – 8:30 AM', task: 'Breakfast & Get Ready', icon: '🍳', type: 'break' },
        { time: '8:30 AM – 7:30 PM', task: 'Office Hours', icon: '🏢', type: 'work' },
        { time: '7:30 PM – 8:30 PM', task: 'Travel + Dinner + Rest', icon: '🚗', type: 'break' },
        { time: '8:30 PM – 9:30 PM', task: 'DevOps Learning & Practice', icon: '⚙️', type: 'study' },
        { time: '9:30 PM – 10:00 PM', task: 'SQL Practice', icon: '🗃️', type: 'study' },
        { time: '10:00 PM – 10:20 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:30 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    saturday: [
        { time: '7:30 AM – 8:00 AM', task: 'Wake up + Fresh', icon: '🌅', type: 'morning' },
        { time: '8:00 AM – 10:00 AM', task: 'OpsGuardian Project', icon: '🛡️', type: 'project' },
        { time: '10:00 AM – 10:30 AM', task: 'Long Break', icon: '☕', type: 'break' },
        { time: '10:30 AM – 12:00 PM', task: 'OpsGuardian Project', icon: '🛡️', type: 'project' },
        { time: '12:00 PM – 1:00 PM', task: 'Lunch + Rest', icon: '🍽️', type: 'break' },
        { time: '1:00 PM – 2:30 PM', task: 'SQL Deep Practice', icon: '🗃️', type: 'study' },
        { time: '2:30 PM – 4:00 PM', task: 'Long Rest / Personal Time', icon: '🛋️', type: 'break' },
        { time: '4:30 PM – 5:30 PM', task: 'DSA Revision', icon: '💻', type: 'study' },
        { time: '5:30 PM – 6:30 PM', task: 'Walk / Outing', icon: '🚶', type: 'break' },
        { time: '7:30 PM – 8:30 PM', task: 'English Practice', icon: '📖', type: 'evening' },
        { time: '8:30 PM onwards', task: 'Free Time', icon: '🎮', type: 'night' }
    ],
    sunday: [
        { time: '8:00 AM – 8:30 AM', task: 'Wake up slowly', icon: '🌅', type: 'morning' },
        { time: '8:30 AM – 10:00 AM', task: 'OpsGuardian Project', icon: '🛡️', type: 'project' },
        { time: '10:00 AM – 10:30 AM', task: 'Long Break', icon: '☕', type: 'break' },
        { time: '10:30 AM – 11:30 AM', task: 'OpsGuardian Project', icon: '🛡️', type: 'project' },
        { time: '12:00 PM – 1:00 PM', task: 'Lunch', icon: '🍽️', type: 'break' },
        { time: '1:00 PM – 3:00 PM', task: 'Full Rest / Personal Time', icon: '🛋️', type: 'break' },
        { time: '3:00 PM – 4:00 PM', task: 'English Practice', icon: '📖', type: 'study' },
        { time: '5:00 PM – 6:00 PM', task: 'Next Week Planning', icon: '📋', type: 'study' },
        { time: '6:00 PM onwards', task: 'Relax, Family, Entertainment', icon: '👨‍👩‍👧', type: 'night' }
    ]
};

function initializeDailyRoutine() {
    renderRoutineSchedules();
    updateCurrentDay();
    attachRoutineEventListeners();
    highlightCurrentTask();

    // Update current task every minute
    setInterval(highlightCurrentTask, 60000);
}

function renderRoutineSchedules() {
    Object.keys(dailyRoutines).forEach(scheduleType => {
        const container = document.getElementById(`${scheduleType}-schedule`);
        if (!container) return;

        container.innerHTML = dailyRoutines[scheduleType].map(item => `
            <div class="schedule-item ${item.type}" data-time="${item.time}">
                <span class="time">${item.time}</span>
                <span class="task">
                    <span class="task-icon">${item.icon}</span>
                    ${item.task}
                </span>
            </div>
        `).join('');
    });
}

function updateCurrentDay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    const dayName = days[today];

    document.getElementById('currentDayName').textContent = dayName;

    const badge = document.getElementById('routineType');
    const tabs = document.querySelectorAll('.routine-tab');
    const schedules = document.querySelectorAll('.routine-schedule');

    // Remove all active states
    tabs.forEach(tab => tab.classList.remove('active'));
    schedules.forEach(schedule => schedule.classList.remove('active'));

    let activeTab, activeSchedule;

    if (today === 0) { // Sunday
        badge.textContent = 'Sunday';
        badge.className = 'routine-badge sunday';
        activeTab = document.querySelector('[data-tab="sunday"]');
        activeSchedule = document.getElementById('sunday-schedule');
    } else if (today === 6) { // Saturday
        badge.textContent = 'Weekend';
        badge.className = 'routine-badge weekend';
        activeTab = document.querySelector('[data-tab="saturday"]');
        activeSchedule = document.getElementById('saturday-schedule');
    } else { // Weekday
        badge.textContent = 'Weekday';
        badge.className = 'routine-badge';
        activeTab = document.querySelector('[data-tab="weekday"]');
        activeSchedule = document.getElementById('weekday-schedule');
    }

    if (activeTab) activeTab.classList.add('active');
    if (activeSchedule) activeSchedule.classList.add('active');
}

function attachRoutineEventListeners() {
    document.querySelectorAll('.routine-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and schedules
            document.querySelectorAll('.routine-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.routine-schedule').forEach(s => s.classList.remove('active'));

            // Activate clicked tab and corresponding schedule
            tab.classList.add('active');
            const scheduleId = `${tab.dataset.tab}-schedule`;
            document.getElementById(scheduleId)?.classList.add('active');

            // Re-highlight current task for the active schedule
            highlightCurrentTask();
        });
    });
}

function parseTimeRange(timeStr) {
    // Parse time strings like "6:30 AM – 7:00 AM" or "10:30 PM"
    const parts = timeStr.split('–').map(s => s.trim());

    const parseTime = (str) => {
        // Handle "onwards" case
        if (str.includes('onwards')) {
            str = str.replace(' onwards', '').trim();
        }

        const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return null;

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    };

    const start = parseTime(parts[0]);
    let end = parts[1] ? parseTime(parts[1]) : start + 60; // Default 1 hour if no end time

    // Handle "onwards" - extend to end of day
    if (timeStr.includes('onwards')) {
        end = 23 * 60 + 59;
    }

    return { start, end };
}

function highlightCurrentTask() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const today = now.getDay();

    // Determine which schedule to check based on current day
    let scheduleType;
    if (today === 0) scheduleType = 'sunday';
    else if (today === 6) scheduleType = 'saturday';
    else scheduleType = 'weekday';

    const schedule = dailyRoutines[scheduleType];
    const highlight = document.getElementById('currentTaskHighlight');
    const taskName = document.getElementById('currentTaskName');
    const taskTime = document.getElementById('currentTaskTime');

    // Remove current-task class from all items
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.classList.remove('current-task');
    });

    // Find current task
    let currentTask = null;
    for (const item of schedule) {
        const { start, end } = parseTimeRange(item.time);
        if (start !== null && currentMinutes >= start && currentMinutes < end) {
            currentTask = item;
            break;
        }
    }

    if (currentTask) {
        // Show highlight box
        highlight.classList.add('active');
        taskName.textContent = `${currentTask.icon} ${currentTask.task}`;
        taskTime.textContent = currentTask.time;

        // Highlight the item in the schedule if it's visible
        const activeSchedule = document.querySelector('.routine-schedule.active');
        if (activeSchedule) {
            const items = activeSchedule.querySelectorAll('.schedule-item');
            items.forEach(item => {
                if (item.dataset.time === currentTask.time) {
                    item.classList.add('current-task');
                    // Scroll into view
                    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    } else {
        highlight.classList.remove('active');
    }
}

// Initialize daily routine when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDailyRoutine();
});
