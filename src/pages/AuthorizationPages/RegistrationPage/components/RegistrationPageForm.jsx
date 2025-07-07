import { useState } from 'react';

import styles from '../../AuthorizationPageForm.module.css';

import { useAuth } from '../../../../hooks/useAuth.js';
import { EyeIconOpen } from '../../../../shared/icons/EyeIconOpen.jsx';
import { EyeIconClosed } from '../../../../shared/icons/EyeIconClosed.jsx';

export const RegistrationPageForm = () => {
    const { registration, loading } = useAuth();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!username.trim()) e.username = 'Заполните ник';
        if (!email.trim()) e.email = 'Укажите e-mail';
        else if (!/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(email)) e.email = 'Некорректный e-mail';
        if (!password) e.password = 'Введите пароль';
        if (password !== confirm) e.confirm = 'Пароли не совпадают';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await registration(JSON.stringify({ username, password, email }));
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className={styles.inputWrapper}>
                <input
                    className={styles.field}
                    placeholder="Ник"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <span className={styles.error}>{errors.username}</span>}
            </div>

            <div className={styles.row}>
                <div className={styles.inputWrapper}>
                    <input
                        className={styles.field}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.inputWrapper}>
                    <input
                        className={styles.field}
                        type={showPwd ? 'text' : 'password'}
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
            </div>
            {errors.password && <span className={styles.error}>{errors.password}</span>}

            <div className={styles.row}>
                <div className={styles.inputWrapper}>
                    <input
                        className={styles.field}
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>
                {errors.confirm && <span className={styles.error}>{errors.confirm}</span>}
            </div>

            <button className={styles.loginButton} type="submit" disabled={loading}>
                {loading ? 'Загрузка…' : 'Зарегистрироваться'}
            </button>

            <button type="button" className={styles.googleButton} onClick={() => alert('OAuth Google')}>
                Регистрация с помощью Google
            </button>
        </form>
    );
};
