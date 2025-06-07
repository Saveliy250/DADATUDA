import useAuth from "./hooks/useAuth.js";
import {useState} from "react";
import {Link} from "react-router-dom";
import "./LogInPage.css"

function LogInPage() {

    const {login,loading, error, isAuthenticated} = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd,  setShowPwd]          = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(username, password);
    };

    if (isAuthenticated) {
        return <div>You already logged in</div>
    }

    return (

        <main className="login">
            <p>0.1.5</p>
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

                <div className="login__row">
                    <div className="login__wrap">
                        <input
                            type={showPwd ? 'text' : 'password'}
                            className="login__field"
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPwd(!showPwd)}
                        aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                    />
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
            <style>{`
        .field-error{
          display:block;margin-top:4px;font-size:14px;color:#ff5555;
        }
        .eye-btn{
          flex:0 0 34px;height:34px;margin-left:6px;
          border:none;background:no-repeat center/20px url("data:image/svg+xml;utf8,\
           <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23bfbfbf'><path d='M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12c-2.75 0-5-2.25-5-5s2.25-5 5-5 5 2.25 5 5-2.25 5-5 5zm0-8c-1.66 0-3 1.35-3 3s1.34 3 3 3 3-1.35 3-3-1.34-3-3-3z'/></svg>");
          cursor:pointer;opacity:.7;
        }
        .eye-btn:hover{opacity:1}
      `}</style>
        </main>

    );
}

export default LogInPage;