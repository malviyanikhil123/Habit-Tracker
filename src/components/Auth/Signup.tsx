import { useState, FormEvent } from 'react';

/**
 * Signup component with async Supabase authentication
 */
interface SignupProps {
    onSignup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    onSwitchToLogin: () => void;
}

export const Signup = ({ onSignup, onSwitchToLogin }: SignupProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Start loading
        setIsLoading(true);

        try {
            // Call async signup function
            const result = await onSignup(name, email, password);

            if (!result.success) {
                setError(result.error || 'Signup failed');
            } else {
                // Show success message (email confirmation may be required)
                setSuccess(true);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Show success message if signup was successful
    if (success) {
        return (
            <div className="auth-form">
                <h2 className="auth-form__title">Check Your Email! 📧</h2>
                <p className="auth-form__subtitle">
                    We've sent a confirmation link to <strong>{email}</strong>.
                    Please check your inbox and click the link to activate your account.
                </p>
                <button
                    onClick={onSwitchToLogin}
                    className="auth-form__button"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="auth-form">
            <h2 className="auth-form__title">Start Your Journey!</h2>
            <p className="auth-form__subtitle">Create an account to track your habits</p>

            <form onSubmit={handleSubmit} className="auth-form__form">
                <div className="auth-form__field">
                    <label htmlFor="name" className="auth-form__label">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-form__input"
                        placeholder="Your Name"
                        autoComplete="name"
                        disabled={isLoading}
                    />
                </div>

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
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                </div>

                <div className="auth-form__field">
                    <label htmlFor="confirmPassword" className="auth-form__label">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-form__input"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isLoading}
                    />
                </div>

                {error && <div className="auth-form__error">{error}</div>}

                <button
                    type="submit"
                    className="auth-form__button"
                    disabled={isLoading}
                >
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>

            <p className="auth-form__switch">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="auth-form__switch-btn"
                    disabled={isLoading}
                >
                    Log In
                </button>
            </p>
        </div>
    );
};
