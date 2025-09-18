import React, { useEffect, useState } from 'react';

import styles from '../AuthorizationPage.module.css';

import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/useAuth';
import { getInitData } from '../../../tools/storageHelpers';
import { loginWithInitData, clearInitData } from '../../../tools/api/api';
import { saveTokens } from '../../../tools/storageHelpers';

import { ArrowSubtitle } from '../../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { LoginPageForm } from './components/LoginPageForm/LoginPageForm';

export const LoginPage = () => {
    const { error, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [autoLoginLoading, setAutoLoginLoading] = useState(false);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        const initData = getInitData();
        if (initData && initData.trim() && !isAuthenticated) {
            setAutoLoginLoading(true);
            setShowForm(false);
            
            loginWithInitData(initData)
                .then(({ accessToken, refreshToken }) => {
                    saveTokens(accessToken, refreshToken);
                    navigate('/', { replace: true });
                })
                .catch((error) => {
                    console.warn('Auto-login by initData failed:', error);
                    clearInitData();
                    setShowForm(true);
                })
                .finally(() => {
                    setAutoLoginLoading(false);
                });
        }
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return <div>You already logged in</div>;
    }

    if (autoLoginLoading) {
        return (
            <div className={styles.login}>
                <p>0.1.5</p>
                <ArrowSubtitle color="#ECFE54" subtitle="вход в аккаунт" className={styles.title} />
                <div>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.login}>
            <p>0.1.5</p>
            <ArrowSubtitle color="#ECFE54" subtitle="вход в аккаунт" className={styles.title} />

            {error && <p className={styles.error}>{error.message}</p>}

            {showForm && <LoginPageForm />}

            {showForm && (
                <p className={styles.describe}>
                    У вас ещё нет аккаунта?{' '}
                    <Link to="/registration" className={styles.describeLink}>
                        Регистрация
                    </Link>
                </p>
            )}
        </div>
    );
};
