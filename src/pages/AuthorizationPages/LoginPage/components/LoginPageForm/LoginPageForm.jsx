import { useState } from 'react';

import styles from '../../../AuthorizationPageForm.module.css';

import { useAuth } from '../../../../../hooks/useAuth.js';

import { EyeIconOpen } from '../../../../../shared/icons/EyeIconOpen.jsx';
import { EyeIconClosed } from '../../../../../shared/icons/EyeIconClosed.jsx';

export const LoginPageForm = () => {
    const { login, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
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
