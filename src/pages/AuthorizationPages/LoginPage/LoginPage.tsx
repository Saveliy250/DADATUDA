import React, { useEffect, useRef, useState } from 'react';

import styles from '../AuthorizationPage.module.css';

import { Link, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../../store/authStore';
import { getInitData } from '../../../tools/storageHelpers';
import { loginWithInitData, clearInitData } from '../../../tools/api/api';
import { saveTokens } from '../../../tools/storageHelpers';

import { ArrowSubtitle } from '../../../shared/components/ArrowSubtitle/ArrowSubtitle';
import { LoginPageForm } from './components/LoginPageForm/LoginPageForm';
import { logger } from '../../../tools/logger';

export const LoginPage = () => {
    const { error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [autoLoginLoading, setAutoLoginLoading] = useState(false);
    const [showForm, setShowForm] = useState(true);
    const startedRef = useRef(false);

    useEffect(() => {
        if (isAuthenticated || startedRef.current) return;

        const tryAutoLogin = () => {
            const initData = getInitData();
            logger.info('[LoginPage] check initData', Boolean(initData));
            if (!initData || !initData.trim()) return false;

            startedRef.current = true;
            setAutoLoginLoading(true);
            setShowForm(false);

            loginWithInitData(initData)
                .then(({ accessToken, refreshToken }) => {
                    logger.info('[LoginPage] loginWithInitData success');
                    saveTokens(accessToken, refreshToken);
                    navigate('/', { replace: true });
                })
                .catch((error) => {
                    logger.warn('[LoginPage] Auto-login by initData failed');
                    logger.error(error);
                    clearInitData();
                    setShowForm(true);
                })
                .finally(() => {
                    logger.info('[LoginPage] autologin finished');
                    setAutoLoginLoading(false);
                });
            return true;
        };

        // 1) мгновенная попытка
        if (tryAutoLogin()) return;

        // 2) слушаем запись init-data из App
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'init-data' && e.newValue && !isAuthenticated && !startedRef.current) {
                tryAutoLogin();
            }
        };
        window.addEventListener('storage', onStorage);

        // 3) на всякий случай таймаут повторной проверки
        const t = setTimeout(() => {
            if (!isAuthenticated && !startedRef.current) tryAutoLogin();
        }, 250);

        return () => {
            window.removeEventListener('storage', onStorage);
            clearTimeout(t);
        };
    }, [isAuthenticated, navigate]);

    if (isAuthenticated) {
        return <div>You already logged in</div>;
    }

    if (autoLoginLoading) {
        return (
            <div className={styles.login}>
                <p>0.1.5</p>
                <ArrowSubtitle color="#000000" subtitle="Вход в аккаунт" className={styles.title} />
                <div>Загрузка...</div>
            </div>
        );
    }

    return (
        <div className={styles.login}>
            <p>0.1.5</p>
            <ArrowSubtitle color="#000000" subtitle="Вход в аккаунт" className={styles.title} />

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
