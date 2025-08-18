import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../../../AuthorizationPageForm.module.css';

import { useAuth } from '../../../../../hooks/useAuth';

import { EyeIconOpen } from '../../../../../shared/icons/EyeIconOpen';
import { EyeIconClosed } from '../../../../../shared/icons/EyeIconClosed';

export const LoginPageForm = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPwd, setShowPwd] = useState<boolean>(false);

    const { login, loading } = useAuth();
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
                        type={showPwd ? 'text' : 'password'}
                        className={styles.field}
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                >
                    {showPwd ? <EyeIconOpen /> : <EyeIconClosed />}
                </button>

                <a href="#" className={styles.forgotLink}>
                    забыли?
                </a>
            </div>

            <button type="submit" className={styles.loginButton} disabled={loading}>
                {loading ? 'Загрузка…' : 'Войти'}
            </button>

            <button type="button" className={styles.googleButton}>
                Войти с помощью Google
            </button>
        </form>
    );
};
