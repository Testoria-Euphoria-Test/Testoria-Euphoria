/**
 * Custom hook untuk monitoring authentication state
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AuthState {
    isLoggedIn: boolean;
    userRole: string | null;
    loading: boolean;
}

export const useAuthState = (): AuthState => {
    const [authState, setAuthState] = useState<AuthState>({
        isLoggedIn: false,
        userRole: null,
        loading: true,
    });

    const pathname = usePathname();

    const checkAuthStatus = () => {
        console.log("useAuthState: Checking auth status");

        if (typeof document !== "undefined") {
            const cookies = document.cookie.split(";").map((c) => c.trim());
            const authCookie = cookies.find((c) => c.startsWith("Authorization="));
            const roleCookie = cookies.find((c) => c.startsWith("user-role="));

            console.log("useAuthState: Auth cookie exists:", !!authCookie);
            console.log("useAuthState: Role cookie:", roleCookie);

            if (authCookie && authCookie.split("=")[1] !== "") {
                const role = roleCookie ? roleCookie.split("=")[1] : null;
                setAuthState({
                    isLoggedIn: true,
                    userRole: role,
                    loading: false,
                });
                console.log("useAuthState: User logged in with role:", role);
            } else {
                console.log("useAuthState: User not logged in");
                setAuthState({
                    isLoggedIn: false,
                    userRole: null,
                    loading: false,
                });
            }
        }
    };

    useEffect(() => {
        // Check auth status when component mounts or pathname changes
        checkAuthStatus();
    }, [pathname]);

    useEffect(() => {
        // Check when window gets focus (in case cookies changed in another tab)
        const handleFocus = () => {
            console.log("useAuthState: Window focus, rechecking auth");
            checkAuthStatus();
        };

        // Check when page becomes visible (useful for tab switching)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log("useAuthState: Page visible, rechecking auth");
                checkAuthStatus();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return authState;
};
