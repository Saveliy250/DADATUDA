import '../LoginPage/loginPage.css';

import { useAuth } from '../../hooks/useAuth.js';

import { Link } from 'react-router-dom';

import { ArrowSubtitle } from '../../shared/components/ArrowSubtitle.jsx';
import { RegistrationPageForm } from './components/RegistrationPageForm.jsx';

export const RegistrationPage = () => {
    const { error: serverError, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <div className="login">Вы уже вошли в систему</div>;
    }

    return (
        <div className="login">
            <ArrowSubtitle color="#ECFE54" subtitle="регистрация" className="login__title" />

            {serverError && <p className="login__error">{serverError.message}</p>}

            <RegistrationPageForm />

            <p className="login__bottom">
                У вас уже есть аккаунт?{' '}
                <Link className="login__link" to="/login">
                    Вход
                </Link>
            </p>
        </div>
    );
};
