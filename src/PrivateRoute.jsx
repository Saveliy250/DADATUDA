import {Navigate} from "react-router-dom";

function PrivateRoute({children}) {
    const token = localStorage.getItem("access-token");
    if (!token) {
        return <Navigate to={"/login"} replace />;
    }
    return children;
}

export default PrivateRoute;