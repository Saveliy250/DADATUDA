import useAuth from "./hooks/useAuth.js";
import {useState} from "react";
import {Link} from "react-router-dom";
import "./LogInPage.css"

function LogInPage() {

    const {login,loading, error, isAuthenticated} = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    if (isAuthenticated) {
        return <div>You already logged in</div>
    }

    return (

        <main className="login">
            <div className={"dev-version"}>V0.0.1</div>
            <h1 className="login__title">
                <svg width="28" height="29" viewBox="0 0 28 29" fill="none">
                    <path d="M10.5 18.8H23.9" stroke="#ECFE54" strokeWidth="3.4"/>
                    <path d="M19 10l7 9-7 9" stroke="#ECFE54" strokeWidth="3.4" strokeLinejoin="round"/>
                    <path d="M26 2H11.6C-1.2 2-1.2 18.8 11.6 18.8H26" stroke="#ECFE54" strokeWidth="3.4"/>
                </svg>
                вход в аккаунт
            </h1>

            {error && <p className="login__error">{error.message}</p>}

            <form className="login__form" onSubmit={handleSubmit}>
                <div className="login__wrap">
                    <input
                        className="login__field"
                        placeholder="Ник"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                {/* ------------ Пароль + forgot ------------- */}
                <div className="login__row">
                    <div className="login__wrap">
                        <input
                            type="password"
                            className="login__field"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <a href="#" className="login__forgot">забыли?</a>
                </div>

                <button type="submit" className="login__btn" disabled={loading}>
                    {loading ? "Загрузка…" : "Войти"}
                </button>

                <button type="button" className="login__btn login__btn-google">
                    Войти с помощью Google
                </button>
            </form>

            <p className="login__bottom">
                У вас ещё нет аккаунта?{" "}
                <Link to="/registration" className="login__link">Регистрация</Link>
            </p>
        </main>
    );
}

export default LogInPage;