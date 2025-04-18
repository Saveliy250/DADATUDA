import useAuth from "./hooks/useAuth.js";
import {useState} from "react";

export function RegistrationPage() {

    const {registration, login, loading, error, isAuthenticated} = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const data = JSON.stringify({
        "username": username,
        "password": password,
        "email": email,
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        registration(data);
    };

    if (isAuthenticated) {
        return <div>You already logged in</div>
    }

    return (
        <>
            <div>Регистрация</div>
            {error && <p style={{color: 'red'}}>{error.message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Логин</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <label>Пароль</label>
                <input type={"password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <label>Почта</label>
                <input type={"email"} value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" disabled={loading}>
                    {loading ? `Загрузка...` : `Зарегистрироваться`}
                </button>
            </form>
        </>
    )
}
