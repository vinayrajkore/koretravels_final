// useAutoLogout.js
// Watches for user activity (mouse, keyboard, touch, scroll).
// If no activity for TIMEOUT_MS, clears session and calls onLogout().

import { useEffect, useRef } from "react";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const WARN_MS    = 4 * 60 * 1000; // warn at 4 minutes (1 min before logout)

const ACTIVITY_EVENTS = [
    "mousemove", "mousedown", "keydown",
    "touchstart", "scroll", "click",
];

export function useAutoLogout(isLoggedIn, onLogout, onWarn) {
    const logoutTimer = useRef(null);
    const warnTimer   = useRef(null);

    useEffect(() => {
        if (!isLoggedIn) return;

        const resetTimers = () => {
            clearTimeout(logoutTimer.current);
            clearTimeout(warnTimer.current);

            // warn before logout
            warnTimer.current = setTimeout(() => {
                if (onWarn) onWarn();
            }, WARN_MS);

            // actual logout
            logoutTimer.current = setTimeout(() => {
                onLogout();
            }, TIMEOUT_MS);
        };

        // Start timers immediately
        resetTimers();

        // Reset on any activity
        ACTIVITY_EVENTS.forEach(evt =>
            window.addEventListener(evt, resetTimers, { passive: true })
        );

        return () => {
            clearTimeout(logoutTimer.current);
            clearTimeout(warnTimer.current);
            ACTIVITY_EVENTS.forEach(evt =>
                window.removeEventListener(evt, resetTimers)
            );
        };
    }, [isLoggedIn, onLogout, onWarn]);
}
