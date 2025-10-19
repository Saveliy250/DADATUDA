import React from 'react';
import styles from '../AuthorizationPage.module.css';
import { useAuthStore } from '../../../store/authStore';
import { Link } from 'react-router-dom';
import { ArrowSubtitle } from '../../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { RegistrationPageForm } from './components/RegistrationPageForm';

export const RegistrationPage = () => {
    const { error: serverError, isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <div className="login">Вы уже вошли в систему</div>;
    }

    return (
        <div className={styles.login}>
            <ArrowSubtitle color="#000000" subtitle="Регистрация" className={styles.title} />

            {serverError && <p className={styles.error}>{serverError.message}</p>}

            <RegistrationPageForm />

            <p className={styles.describe}>
                У вас уже есть аккаунт?{' '}
                <Link className={styles.describeLink} to="/login">
                    Вход
                </Link>
            </p>
        </div>
    );
};
