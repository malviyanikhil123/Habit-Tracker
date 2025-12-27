import { useEffect, useLayoutEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import {
    Header,
    MotivationBanner,
    DailyRoutine,
    SmartReminder,
    AnalyticsDashboard,
    Charts,
    TrackerTable,
    AddHabitButton,
    WeeklyBreakdown,
    AuthForm
} from '@/components';
import { useHabits, useAnalytics, useMotivation, useRoutine, useAuth } from '@/hooks';
import './styles/App.css';

function App() {
    const { isAuthenticated, isLoading, user, login, signup, logout } = useAuth();

    // Force scroll to top before render (runs synchronously before paint)
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    });

    // Also scroll to top after render
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Set a timer to force scroll again after a brief delay
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated]);
    const {
        habits,
        currentMonth,
        currentYear,
        daysInMonth,
        todayDay,
        addHabit,
        deleteHabit,
        updateHabitName,
        toggleDay,
        resetMonth,
        hasAnyChecked
    } = useHabits();

    const {
        monthlyCompletion,
        totalHabits,
        bestStreak,
        consistencyScore,
        smartReminderStatus,
        habitChartData,
        progressChartData
    } = useAnalytics(habits, daysInMonth, todayDay);

    const motivationQuote = useMotivation();

    const {
        scheduleType,
        activeTab,
        setActiveTab,
        currentTask,
        routines,
        setCustomRoutines,
        hasCustomRoutines,
        resetToDefaultRoutines,
        updateRoutineForSchedule
    } = useRoutine();

    // Show loading state
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    // Show auth form if not authenticated
    if (!isAuthenticated) {
        return <AuthForm onLogin={login} onSignup={signup} />;
    }

    return (
        <>
            <Header
                currentMonth={currentMonth}
                currentYear={currentYear}
                hasAnyChecked={hasAnyChecked}
                onReset={resetMonth}
                onImportRoutine={setCustomRoutines}
                onLogout={logout}
                userName={user?.name}
            />

            <MotivationBanner quote={motivationQuote} />

            <DailyRoutine
                scheduleType={scheduleType}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                currentTask={currentTask}
                routines={routines}
                hasCustomRoutines={hasCustomRoutines}
                resetToDefaultRoutines={resetToDefaultRoutines}
                onUpdateRoutines={updateRoutineForSchedule}
            />

            <SmartReminder status={smartReminderStatus} />

            <TrackerTable
                habits={habits}
                daysInMonth={daysInMonth}
                todayDay={todayDay}
                onNameChange={updateHabitName}
                onDelete={deleteHabit}
                onToggleDay={toggleDay}
            />

            <AddHabitButton onClick={addHabit} />

            <AnalyticsDashboard
                monthlyCompletion={monthlyCompletion}
                totalHabits={totalHabits}
                bestStreak={bestStreak}
                consistencyScore={consistencyScore}
            />

            <Charts
                habitChartData={habitChartData}
                progressChartData={progressChartData}
                daysInMonth={daysInMonth}
            />

            <WeeklyBreakdown habits={habits} daysInMonth={daysInMonth} />

            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#E3FDFD',
                        color: '#2f2f2f',
                        border: '1px solid #A6E3E9',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 15px rgba(113, 201, 206, 0.3)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#71C9CE',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#e57373',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}

export default App;
