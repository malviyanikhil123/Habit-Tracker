import { useState, FormEvent } from 'react';

interface SignupProps {
    onSignup: (name: string, email: string, password: string) => boolean;
    onSwitchToLogin: () => void;
}

export const Signup = ({ onSignup, onSwitchToLogin }: SignupProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

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

        const success = onSignup(name, email, password);
        if (!success) {
            setError('Signup failed. Please try again.');
        }
    };

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
                    />
                </div>

                {error && <div className="auth-form__error">{error}</div>}

                <button type="submit" className="auth-form__button">
                    Sign Up
                </button>
            </form>

            <p className="auth-form__switch">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="auth-form__switch-btn"
                >
                    Log In
                </button>
            </p>
        </div>
    );
};
