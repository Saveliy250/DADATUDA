import './index.css'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import {Route, Routes} from "react-router-dom";
import MainScreen from "./MainScreen.jsx";
import FiltersPage from "./pages/FiltersPage.jsx";
import Favorites from "./FavoritesPage.jsx";
import EventPage from "./EventPage.jsx";
import LogInPage from "./LogInPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import {RegistrationPage} from "./RegistrationPage.jsx";
import {useEffect} from "react";
import {logTelegramVersion} from "./tools/logTelegramVersion.js";
import { init, swipeBehavior, retrieveLaunchParams, retrieveRawInitData } from '@telegram-apps/sdk';




function App() {
    useEffect(() => {
        try{
            init();
            logTelegramVersion();
            const launchParams = retrieveLaunchParams()
            console.log(launchParams);

            const rawInitData = retrieveRawInitData();
            console.log(rawInitData);

            if (swipeBehavior.mount.isAvailable()) {
                swipeBehavior.mount();
                console.log(swipeBehavior.isMounted()); // true
            }
            if (swipeBehavior.disableVertical.isAvailable()) {
                swipeBehavior.disableVertical();
                console.log(swipeBehavior.isVerticalEnabled()); // false
            }
        } catch (e) {
            console.log(e);
        }
    }, []);
    return (
        <>
            <Routes>
                <Route path="/login" element={<LogInPage/>} />
                <Route path="/registration" element={<RegistrationPage/>} />
                <Route path="/" element={
                    <PrivateRoute>
                        <MainScreen />
                    </PrivateRoute>} />
                <Route path="/filters" element={
                    <PrivateRoute>
                        <FiltersPage />
                    </PrivateRoute>
                    }  />
                <Route path="/favorites" element={
                    <PrivateRoute>
                        <Favorites />
                    </PrivateRoute>
                    } />
                <Route path="/events/:eventId" element={<EventPage />} />
            </Routes>
        </>
    )
}

export default App