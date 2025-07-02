/**
 * Utility functions for authentication
 */

/**
 * Check if user is authenticated by checking cookies
 */
export const isAuthenticated = (): boolean => {
    if (typeof document === "undefined") return false;

    const cookies = document.cookie.split(";").map((c) => c.trim());
    const authCookie = cookies.find((c) => c.startsWith("Authorization="));

    const hasValidAuth = !!(authCookie && authCookie.split("=")[1] !== "");
    console.log("auth.ts: isAuthenticated check:", hasValidAuth, "cookie:", authCookie?.substring(0, 30) + "...");

    return hasValidAuth;
};

/**
 * Get user role from cookies
 */
export const getUserRole = (): string | null => {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";").map((c) => c.trim());
    const roleCookie = cookies.find((c) => c.startsWith("user-role="));

    const role = roleCookie ? roleCookie.split("=")[1] : null;
    console.log("auth.ts: getUserRole:", role);

    return role;
};

/**
 * Get dashboard URL based on user role
 */
export const getDashboardUrl = (role: string | null): string => {
    switch (role) {
        case "admin":
            return "/dashboard-admin";
        case "creator":
            return "/dashboard-creator";
        case "customer":
            return "/dashboard-customer";
        default:
            return "/dashboard-customer";
    }
};

/**
 * Get authentication info
 */
export const getAuthInfo = () => {
    return {
        isAuthenticated: isAuthenticated(),
        userRole: getUserRole(),
    };
};
