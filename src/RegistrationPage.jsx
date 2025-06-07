import {useState}   from 'react';
import {Link}       from 'react-router-dom';
import useAuth      from './hooks/useAuth.js';
import './LogInPage.css';


export function RegistrationPage() {
    const {registration, loading, error: serverError, isAuthenticated} = useAuth();

    const [username, setUsername]         = useState('');
    const [email,    setEmail]            = useState('');
    const [password, setPassword]         = useState('');
    const [confirm,  setConfirm]          = useState('');
    const [showPwd,  setShowPwd]          = useState(false);
    const [errors,   setErrors]           = useState({});

    const validate = () => {
        const e = {};
        if (!username.trim())   e.username = 'Заполните ник';
        if (!email.trim())      e.email    = 'Укажите e-mail';
        else if (!/^[\w.-]+@[\w.-]+\.[a-z]{2,}$/i.test(email))
            e.email = 'Некорректный e-mail';
        if (!password)          e.password = 'Введите пароль';
        if (password !== confirm)
            e.confirm = 'Пароли не совпадают';
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        await registration(JSON.stringify({username, password, email}));
    };

    if (isAuthenticated) {
        return <div className="login">Вы уже вошли в систему</div>;
    }

    return (
        <div className="login">
            <h1 className="login__title">
                <svg width="28" height="29" viewBox="0 0 28 29" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.47 18.79h13.38" stroke="#ECFE54" strokeWidth="3.35"/>
                    <path d="M19 10.05 26 18.83 19 27.45"
                          stroke="#ECFE54" strokeWidth="3.35" strokeLinejoin="round"/>
                    <path d="M25.95 2H11.6C-1.2 2-1.2 18.79 11.6 18.79h14.35"
                          stroke="#ECFE54" strokeWidth="3.35"/>
                </svg>
                регистрация
            </h1>

            {serverError && <p className="login__error">{serverError.message}</p>}

            <form onSubmit={handleSubmit} noValidate autoComplete="off">

                <div className="login__wrap">
                    <input
                        className="login__field"
                        placeholder="Ник"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    {errors.username && <span className="field-error">{errors.username}</span>}
                </div>

                <div className="login__wrap">
                    <input
                        className="login__field"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="login__row">
                    <input
                        className="login__field"
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Пароль"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPwd(!showPwd)}
                        aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                    />
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}

                <div className="login__wrap" style={{marginTop: 24}}>
                    <input
                        className="login__field"
                        type={showPwd ? 'text' : 'password'}
                        placeholder="Повторите пароль"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                    />
                    {errors.confirm && <span className="field-error">{errors.confirm}</span>}
                </div>

                <button className="login__btn" type="submit" disabled={loading}>
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
        </div>
    );
}
