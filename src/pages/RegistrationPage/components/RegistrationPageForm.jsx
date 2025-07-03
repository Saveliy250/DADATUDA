import { useState } from 'react';

import '../../LoginPage/loginPage.css';

import { useAuth } from '../../../hooks/useAuth.js';
import { EyeIconOpen } from '../../../shared/icons/EyeIconOpen.jsx';
import { EyeIconClosed } from '../../../shared/icons/EyeIconClosed.jsx';

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
        <form className="form-gap" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="login__wrap">
                <input
                    className="login__field"
                    placeholder="Ник"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="login__wrap">
                <input
                    className="login__field"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="login__row">
                <input
                    className="login__field"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                >
                    {showPwd ? <EyeIconOpen /> : <EyeIconClosed />}
                </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}

            <div className="login__wrap" style={{ marginTop: 24 }}>
                <input
                    className="login__field"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Повторите пароль"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            <button className="login__btn" type="submit" disabled={loading}>
                {loading ? 'Загрузка…' : 'Зарегистрироваться'}
            </button>

            <button type="button" className="login__btn-google" onClick={() => alert('OAuth Google')}>
                Регистрация с помощью Google
            </button>
        </form>
    );
};
