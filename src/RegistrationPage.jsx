import {useState}   from 'react';
import {Link}       from 'react-router-dom';
import useAuth      from './hooks/useAuth.js';
import "./LogInPage.css";


export function RegistrationPage() {

    const {registration, loading, error, isAuthenticated} = useAuth();

    const [username, setUsername]  = useState('');
    const [email, setEmail]        = useState('');
    const [password, setPassword]  = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = JSON.stringify({
            "username": username,
            "password": password,
            "email": email,
        })
        await registration(data);
    };

    if (isAuthenticated) {
        return <div className="login">Вы уже вошли в систему</div>;
    }
    return (
        <div className="login">

            <h1 className="login__title">
                <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4745 18.7925L23.8558 18.7925" stroke="#ECFE54" strokeWidth="3.35446"/>
                    <path d="M19.0019 10.0492L26.0002 18.8338L19.0019 27.4502"
                          stroke="#ECFE54" strokeWidth="3.35446" strokeLinejoin="round"/>
                    <path d="M25.9548 2H11.6037C-1.20125 2 -1.20122 18.7921 11.6037 18.7921H25.9548"
                          stroke="#ECFE54" strokeWidth="3.35446"/>
                </svg>
                регистрация
            </h1>

            {error && <p className="login__error">{error.message}</p>}

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="login__wrap">
                    <input
                        className="login__field"
                        type="text"
                        placeholder="Ник"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="login__wrap">
                    <input
                        className="login__field"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="login__row">
                    <input
                        className="login__field"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    className="login__btn"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Загрузка…' : 'Зарегистрироваться'}
                </button>

                <button
                    type="button"
                    className="login__btn-google"
                    onClick={() => alert('OAuth Google')}
                >
                    Регистрация с помощью Google
                </button>
            </form>

            <p className="login__bottom">
                У вас уже есть аккаунт?{' '}
                <Link className="login__link" to="/login">Вход</Link>
            </p>
        </div>
    );
}
