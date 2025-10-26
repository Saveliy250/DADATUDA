import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { authenticate, registerUser, setOnLogoutCallback, getShortlist } from '../tools/api/api';
import { queryClient } from '../tools/queryClient';
import { isCurrentSessionFirstVisit, markRegFirstVisitSent, wasRegFirstVisitSent, setUserParams } from '../tools/analytics/ym';
import { jwtDecode } from 'jwt-decode';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../tools/storageHelpers';
import { logger } from '../tools/logger';

interface AuthState {
    loading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
}

interface AuthActions {
    registration: (data: string) => Promise<void>;
    login: (username?: string, password?: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
    devtools((set) => ({
        loading: true,
        isAuthenticated: false,
        error: null,

        checkAuth: () => {
            const hasToken = !!getAccessToken() || !!getRefreshToken();
            logger.info('[authSlice.checkAuth] hasToken', hasToken);
            set({ isAuthenticated: hasToken, loading: false });
        },

        registration: async (data: string) => {
            set({ loading: true, error: null });
            try {
                logger.info('[authSlice.registration] start');
                await registerUser(data);
                // registration successful
                try {
                    if (isCurrentSessionFirstVisit() && !wasRegFirstVisitSent()) {
                        // goal: registration on first visit
                        // Use ym helper goal name: reg_first_visit
                        // We do not import trackGoal directly to keep API surface minimal here
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const { trackGoal } = await import('../tools/analytics/ym');
                        trackGoal('reg_first_visit');
                        markRegFirstVisitSent();
                    }
                } catch {}
                logger.info('[authSlice.registration] success');
            } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error('An unknown registration error occurred');
                logger.error(err, '[authSlice.registration] failed');
                set({ error: err });
                throw err;
            } finally {
                set({ loading: false });
            }
        },

        login: async (username?: string, password?: string) => {
            set({ loading: true, error: null });
            try {
                logger.info('[authSlice.login] start', { hasUsername: !!username });
                const { accessToken, refreshToken } = await authenticate({ username, password });
                logger.info('[authSlice.login] success, saving tokens');
                saveTokens(accessToken, refreshToken);
                // set user params to metrica (userId from JWT)
                try {
                    const decoded = jwtDecode<{ sub?: string }>(accessToken);
                    if (decoded?.sub) {
                        setUserParams({ userId: decoded.sub });
                    }
                    // Prime shortlist cache for persistence
                    try {
                        const PAGE_SIZE = 10;
                        const firstPage = await getShortlist(PAGE_SIZE, 0);
                        queryClient.setQueryData(['shortlist', decoded?.sub ?? null], {
                            pageParams: [0],
                            pages: [firstPage],
                        });
                    } catch (e) {
                        logger.warn('[authSlice.login] shortlist prime failed');
                    }
                } catch {}
                set({ isAuthenticated: true });
            } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error('An unknown login error occurred');
                logger.error(err, '[authSlice.login] failed');
                set({ isAuthenticated: false, error: err });
                throw err;
            } finally {
                set({ loading: false });
            }
        },

        logout: () => {
            logger.info('[authSlice.logout] called');
            clearTokens();
            try {
                queryClient.clear();
            } catch {}
            set({ isAuthenticated: false });
        },
    })),
);

useAuthStore.getState().checkAuth();
setOnLogoutCallback(() => {
    logger.info('[App] onLogoutCallback');
    useAuthStore.getState().logout();
});
