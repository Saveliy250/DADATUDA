/*
  Centralized Yandex.Metrica helper: safe calls, user params, session/swipe/screen tracking
*/

type YmParams = Record<string, unknown> | undefined;

const COUNTER_ID: number | null = Number(import.meta.env.VITE_METRICA_ID || '') || null;

import { logger } from '../logger';

function hasYm(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ym === 'function' && COUNTER_ID !== null;
}

function safeYm(method: string, ...args: any[]): void {
    if (!hasYm()) return;
    try {
        // debug log for every ym call
        // Note: keep concise to avoid flooding
        logger.info('[ym]', { id: COUNTER_ID, method, args });
        (window as any).ym(COUNTER_ID, method, ...args);
    } catch {
        logger.error(new Error('Error calling ym'), 'Error calling ym');
    }
}

export function trackGoal(goalName: string, params?: YmParams): void {
    if (!goalName) return;
    if (params) {
        logger.info('[ym.goal]', goalName, params);
        safeYm('reachGoal', goalName, params);
    } else {
        logger.info('[ym.goal]', goalName);
        safeYm('reachGoal', goalName);
    }
}

export function trackHit(path: string, referrer?: string): void {
    if (!path) return;
    logger.info('[ym.hit]', path, { referrer });
    safeYm('hit', path, { referer: referrer });
}

export function setUserParams(params: Record<string, unknown>): void {
    if (!params) return;
    logger.info('[ym.userParams]', params);
    safeYm('userParams', params);
}

interface SessionState {
    sessionId: number | null;
    startedAt: number | null;
    swipeCount: number;
    swipes10Fired: boolean;
    currentScreenPath: string | null;
    currentScreenStartedAt: number | null;
}

const session: SessionState = {
    sessionId: null,
    startedAt: null,
    swipeCount: 0,
    swipes10Fired: false,
    currentScreenPath: null,
    currentScreenStartedAt: null,
};

const LS_FIRST_VISIT_AT = 'app_first_visit_at';
const LS_FIRST_SESSION_ID = 'app_first_session_id';
const LS_REG_FIRST_SENT = 'app_reg_first_sent';

export function startSession(): void {
    const now = Date.now();
    session.sessionId = now;
    session.startedAt = now;
    session.swipeCount = 0;
    session.swipes10Fired = false;
    logger.info('[session.start]', { sessionId: session.sessionId });

    // mark first app visit and first session only once
    if (!localStorage.getItem(LS_FIRST_VISIT_AT)) {
        localStorage.setItem(LS_FIRST_VISIT_AT, String(now));
    }
    if (!localStorage.getItem(LS_FIRST_SESSION_ID)) {
        localStorage.setItem(LS_FIRST_SESSION_ID, String(now));
    }
}

export function endSession(reason: 'hidden' | 'unload' | 'manual' = 'manual'): void {
    if (!session.startedAt) return;
    const durationSec = Math.max(0, Math.round((Date.now() - session.startedAt) / 1000));
    const swipes = session.swipeCount;
    logger.info('[session.end]', { durationSec, swipes, reason });
    trackGoal('session_end', { durationSec, swipes, reason });

    // reset
    session.sessionId = null;
    session.startedAt = null;
    session.swipeCount = 0;
    session.swipes10Fired = false;
    session.currentScreenPath = null;
    session.currentScreenStartedAt = null;
}

export function startScreen(path: string): void {
    const now = Date.now();
    if (session.currentScreenPath && session.currentScreenStartedAt) {
        const durationSec = Math.max(0, Math.round((now - session.currentScreenStartedAt) / 1000));
        logger.info('[screen.time]', { path: session.currentScreenPath, durationSec });
        trackGoal('screen_time', { path: session.currentScreenPath, durationSec });
    }
    session.currentScreenPath = path;
    session.currentScreenStartedAt = now;
    logger.info('[screen.start]', path);
    trackHit(path);
}

export function addSwipe(): void {
    session.swipeCount += 1;
    logger.info('[swipe]', { count: session.swipeCount });
    trackGoal('mainPageSwipe');
    if (!session.swipes10Fired && session.swipeCount >= 10) {
        logger.info('[swipe.10]');
        trackGoal('swipes_10');
        session.swipes10Fired = true;
    }
}

export function isCurrentSessionFirstVisit(): boolean {
    if (!session.sessionId) return false;
    const firstId = localStorage.getItem(LS_FIRST_SESSION_ID);
    return String(session.sessionId) === String(firstId || '');
}

export function markRegFirstVisitSent(): void {
    localStorage.setItem(LS_REG_FIRST_SENT, '1');
}

export function wasRegFirstVisitSent(): boolean {
    return localStorage.getItem(LS_REG_FIRST_SENT) === '1';
}

// Auto end on tab hide/unload
if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            endSession('hidden');
        }
    });
    window.addEventListener('pagehide', () => endSession('unload'));
    window.addEventListener('beforeunload', () => endSession('unload'));
}


