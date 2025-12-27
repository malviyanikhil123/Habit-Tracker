import { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';

interface AuthFormProps {
    onLogin: (email: string, password: string) => boolean;
    onSignup: (name: string, email: string, password: string) => boolean;
}

export const AuthForm = ({ onLogin, onSignup }: AuthFormProps) => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-container">
            <div className="auth-container__background">
                <div className="auth-container__card">
                    <div className="auth-container__logo">
                        <h1>🎯 Habit Tracker</h1>
                    </div>

                    {isLogin ? (
                        <Login
                            onLogin={onLogin}
                            onSwitchToSignup={() => setIsLogin(false)}
                        />
                    ) : (
                        <Signup
                            onSignup={onSignup}
                            onSwitchToLogin={() => setIsLogin(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
