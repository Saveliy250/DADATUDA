import './loginPage.css';

import { useAuth } from '../../hooks/useAuth.js';

import { Link } from 'react-router-dom';
import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle.jsx';
import { LoginPageForm } from './components/LoginPageForm.jsx';

export const LoginPage = () => {
    const { error, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <div>You already logged in</div>;
    }

    return (
        <main className="login">
            <p>0.1.5</p>
            <ArrowSubtitle color="#ECFE54" subtitle="вход в аккаунт" className="login__title" />

            {error && <p className="login__error">{error.message}</p>}

            <LoginPageForm />

            <p className="login__bottom">
                У вас ещё нет аккаунта?{' '}
                <Link to="/registration" className="login__link">
                    Регистрация
                </Link>
            </p>
        </main>
    );
};

export default LoginPage;
