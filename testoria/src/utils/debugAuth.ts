/**
 * Debug utilities for authentication
 * Add this to your browser console to debug auth issues
 */

// Add to window object for easy access in browser console
if (typeof window !== 'undefined') {
    (window as any).debugAuth = {
        // Show all cookies
        showCookies: () => {
            const cookies = document.cookie.split(";").map((c) => c.trim());
            console.log("All cookies:", cookies);
            return cookies;
        },

        // Show auth-specific cookies
        showAuthCookies: () => {
            const cookies = document.cookie.split(";").map((c) => c.trim());
            const authCookie = cookies.find((c) => c.startsWith("Authorization="));
            const roleCookie = cookies.find((c) => c.startsWith("user-role="));
            const userIdCookie = cookies.find((c) => c.startsWith("x-user-id="));

            console.log("Auth cookies:", {
                authorization: authCookie || "Not found",
                role: roleCookie || "Not found",
                userId: userIdCookie || "Not found"
            });

            const hasValidAuth = !!(authCookie && authCookie.split("=")[1] !== "");
            const userRole = roleCookie ? roleCookie.split("=")[1] : null;

            console.log("Auth status:", {
                isAuthenticated: hasValidAuth,
                userRole: userRole,
                shouldRedirectFromHome: hasValidAuth && userRole && window.location.pathname === "/"
            });

            return { authCookie, roleCookie, userIdCookie, isAuthenticated: hasValidAuth, userRole };
        },

        // Clear all auth cookies
        clearAuthCookies: () => {
            document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "x-user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "x-user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            console.log("Auth cookies cleared");
            window.location.reload();
        },

        // Force auth check
        checkAuth: async () => {
            try {
                const response = await fetch("/api/auth/check");
                const data = await response.json();
                console.log("Auth check result:", data);
                return data;
            } catch (error) {
                console.error("Auth check failed:", error);
                return null;
            }
        },

        // Test redirect manually
        testRedirect: () => {
            console.log("🚀 Testing manual redirect...");
            const authData = (window as any).debugAuth.showAuthCookies();

            if (authData.isAuthenticated && authData.userRole) {
                const dashboardUrls = {
                    admin: "/dashboard-admin",
                    creator: "/dashboard-creator",
                    customer: "/dashboard-customer"
                };
                const url = dashboardUrls[authData.userRole as keyof typeof dashboardUrls] || "/dashboard-customer";
                console.log("✅ Should redirect to:", url);
                console.log("🔄 Redirecting now...");
                window.location.replace(url);
            } else {
                console.log("❌ Not authenticated or no role found");
                console.log("Current status:", authData);
            }
        },

        // Force check what NavigationGuard should do
        simulateNavigationGuard: () => {
            console.log("🛡️ Simulating NavigationGuard logic...");

            if (window.location.pathname !== "/") {
                console.log("❌ Not on home page, no redirect needed");
                return;
            }

            const authData = (window as any).debugAuth.showAuthCookies();
            console.log("Current page:", window.location.pathname);
            console.log("Auth status:", authData);

            if (authData.isAuthenticated && authData.userRole) {
                console.log("✅ Should redirect! User is authenticated with role:", authData.userRole);
                (window as any).debugAuth.testRedirect();
            } else {
                console.log("❌ Should stay on home page");
            }
        },

        // Simulate login (for testing)
        simulateLogin: (role: 'admin' | 'creator' | 'customer' = 'customer') => {
            document.cookie = `Authorization=Bearer fake-token-${Date.now()}; path=/;`;
            document.cookie = `user-role=${role}; path=/;`;
            document.cookie = `x-user-id=fake-user-id; path=/;`;
            console.log(`Simulated login with role: ${role}`);
            window.location.reload();
        }
    };

    console.log("🔧 Debug utilities loaded. Available commands:");
    console.log("📋 window.debugAuth.showCookies() - Show all cookies");
    console.log("🔑 window.debugAuth.showAuthCookies() - Show auth cookies + status");
    console.log("🗑️ window.debugAuth.clearAuthCookies() - Clear auth cookies");
    console.log("🔍 window.debugAuth.checkAuth() - Test API auth check");
    console.log("🚀 window.debugAuth.testRedirect() - Test manual redirect");
    console.log("👤 window.debugAuth.simulateLogin('role') - Simulate login (admin/creator/customer)");
}
