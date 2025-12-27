import { useState, useEffect } from 'react';
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
    AuthForm,
    NewUserOnboarding
} from '@/components';
import { useHabits, useAnalytics, useMotivation, useRoutine, useAuth } from '@/hooks';
import { DailyRoutines } from '@/types';
import './styles/App.css';

function App() {
    const { isAuthenticated, isLoading, user, login, signup, logout, isNewSignup, clearNewSignupFlag } = useAuth();

    // Track if user has completed onboarding (for new users with no habits)
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [onboardingChecked, setOnboardingChecked] = useState(false);

    // Get onboarding completed key for current user
    const getOnboardingKey = (userId: string) => `habit_tracker_onboarding_${userId}`;

    // Mark onboarding as completed
    const markOnboardingComplete = (userId: string) => {
        localStorage.setItem(getOnboardingKey(userId), 'true');
    };

    // Pass user ID to useHabits for Supabase queries
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
        hasAnyChecked,
        isLoading: habitsLoading,
        refetch: refetchHabits
    } = useHabits({ userId: user?.id ?? null });

    // Check if new user needs onboarding (ONLY for new signups, not existing users logging in)
    useEffect(() => {
        if (isAuthenticated && user?.id && !habitsLoading && !onboardingChecked) {
            console.log('Checking onboarding:', { isNewSignup, habitsLength: habits.length });
            setOnboardingChecked(true);
            // Only show onboarding if this is a NEW SIGNUP (not a login)
            if (isNewSignup && habits.length === 0) {
                console.log('Showing onboarding for new signup');
                setShowOnboarding(true);
            } else {
                console.log('Not showing onboarding:', { isNewSignup, hasHabits: habits.length > 0 });
            }
        }
    }, [isAuthenticated, habitsLoading, habits.length, onboardingChecked, user?.id, isNewSignup]);

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
    } = useRoutine({ userId: user?.id ?? null });

    // Handle onboarding completion with optional custom routines
    const handleOnboardingComplete = (customRoutines?: DailyRoutines) => {
        if (user?.id) {
            markOnboardingComplete(user.id);
        }
        // Clear the new signup flag
        clearNewSignupFlag();
        // If user selected custom routines, save them
        if (customRoutines) {
            setCustomRoutines(customRoutines);
        }
        setShowOnboarding(false);
        refetchHabits();
    };

    // Show loading state (auth or habits loading)
    if (isLoading || (isAuthenticated && habitsLoading)) {
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

    // Show onboarding for new users
    if (showOnboarding && user) {
        return (
            <NewUserOnboarding
                userId={user.id}
                userName={user.name}
                onComplete={handleOnboardingComplete}
            />
        );
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
