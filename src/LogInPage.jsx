import useAuth from "./hooks/useAuth.js";
import {useState} from "react";

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
        <>
            <div>Вход в аккаунт</div>
            {error && <p style={{color: 'red'}}>{error.message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Логин</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} />
                <label>Пароль</label>
                <input type={"password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading}>
                    {loading ? `Загрузка...` : `Войти`}
                </button>
            </form>
        </>
    )
}

export default LogInPage;