import { useState, FormEvent } from 'react';

/**
 * Login component with async Supabase authentication
 */
interface LoginProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onSwitchToSignup: () => void;
}

export const Login = ({ onLogin, onSwitchToSignup }: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        // Start loading
        setIsLoading(true);

        try {
            // Call async login function
            const result = await onLogin(email, password);

            if (!result.success) {
                setError(result.error || 'Login failed');
            }
            // If successful, the auth state change will redirect automatically
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2 className="auth-form__title">Welcome Back!</h2>
            <p className="auth-form__subtitle">Log in to continue tracking your habits</p>

            <form onSubmit={handleSubmit} className="auth-form__form">
                <div className="auth-form__field">
                    <label htmlFor="email" className="auth-form__label">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-form__input"
                        placeholder="your@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                    />
                </div>

                <div className="auth-form__field">
                    <label htmlFor="password" className="auth-form__label">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-form__input"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                    />
                </div>

                {error && <div className="auth-form__error">{error}</div>}

                <button
                    type="submit"
                    className="auth-form__button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <p className="auth-form__switch">
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="auth-form__switch-btn"
                    disabled={isLoading}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
};
