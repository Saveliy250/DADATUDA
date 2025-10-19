import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../../../AuthorizationPageForm.module.css';

import { useAuthStore } from '../../../../../store/authStore';


export const LoginPageForm = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const { login, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await login(username, password);
            await navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
            <div className={styles.inputWrapper}>
                <input
                    className={styles.field}
                    placeholder="Ник"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.inputWrapper}>
                    <input
                        type="password"
                        className={styles.field}
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <a href="#" className={styles.forgotLink}>
                    забыли?
            </a>

            <button type="submit" className={styles.loginButton} disabled={loading}>
                {loading ? 'Загрузка…' : 'Войти'}
            </button>

            <button type="button" className={styles.yandexButton}>
                Войти с помощью Яндекс
            </button>
        </form>
    );
};
