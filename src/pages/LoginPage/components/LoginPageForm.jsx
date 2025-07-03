import { useState } from 'react';

import '../loginPage.css';

import { useAuth } from '../../../hooks/useAuth.js';

import { EyeIconOpen } from '../../../shared/icons/EyeIconOpen.jsx';
import { EyeIconClosed } from '../../../shared/icons/EyeIconClosed.jsx';

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
        <form className="form-gap" onSubmit={handleSubmit}>
            <div className="login__wrap">
                <input
                    className="login__field"
                    placeholder="Ник"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="login__row">
                <div className="login__wrap">
                    <input
                        type={showPwd ? 'text' : 'password'}
                        className="login__field"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                >
                    {showPwd ? <EyeIconOpen /> : <EyeIconClosed />}
                </button>
                <a href="#" className="login__forgot">
                    забыли?
                </a>
            </div>

            <button type="submit" className="login__btn" disabled={loading}>
                {loading ? 'Загрузка…' : 'Войти'}
            </button>

            <button type="button" className="login__btn login__btn-google">
                Войти с помощью Google
            </button>
        </form>
    );
};
