import React from 'react';

import styles from '../AuthorizationPage.module.css';

import { Link } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth';

import { ArrowSubtitle } from '../../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { LoginPageForm } from './components/LoginPageForm/LoginPageForm';

export const LoginPage: React.FC = () => {
    const { error, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <div>You already logged in</div>;
    }

    return (
        <div className={styles.login}>
            <p>0.1.5</p>
            <ArrowSubtitle color="#ECFE54" subtitle="вход в аккаунт" className={styles.title} />

            {error && <p className={styles.error}>{error.message}</p>}

            <LoginPageForm />

            <p className={styles.describe}>
                У вас ещё нет аккаунта?{' '}
                <Link to="/registration" className={styles.describeLink}>
                    Регистрация
                </Link>
            </p>
        </div>
    );
};
