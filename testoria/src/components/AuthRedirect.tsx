"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDashboardUrl } from "@/helpers/auth";

export default function AuthRedirect() {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        // Function to check authentication and redirect
        const checkAuthAndRedirect = () => {
            console.log("AuthRedirect: Starting auth check, pathname:", pathname);

            // Only redirect if user is on root path
            if (pathname !== "/") {
                console.log("AuthRedirect: Not on root path, skipping check");
                setIsChecking(false);
                return;
            }

            // Check cookies synchronously
            if (typeof document !== "undefined") {
                const cookies = document.cookie.split(";").map((c) => c.trim());
                const authCookie = cookies.find((c) => c.startsWith("Authorization="));
                const roleCookie = cookies.find((c) => c.startsWith("user-role="));

                console.log("AuthRedirect: Cookies found:", {
                    auth: !!authCookie,
                    role: !!roleCookie,
                    authValue: authCookie ? authCookie.substring(0, 30) + "..." : "none",
                    roleValue: roleCookie ? roleCookie.split("=")[1] : "none"
                });

                if (!authCookie || authCookie.split("=")[1] === "") {
                    console.log("AuthRedirect: No valid auth cookie, staying on landing page");
                    setIsChecking(false);
                    return;
                }

                // Get user role from cookie
                const userRole = roleCookie ? roleCookie.split("=")[1] : null;
                console.log("AuthRedirect: User role from cookie:", userRole);

                if (userRole) {
                    // We have both auth and role, redirect immediately
                    const dashboardUrl = getDashboardUrl(userRole);
                    console.log("AuthRedirect: Valid auth + role found, redirecting to:", dashboardUrl);
                    setShouldRedirect(true);
                    setIsChecking(false);

                    // Use replace instead of push to prevent back button issues
                    router.replace(dashboardUrl);
                    return;
                } else {
                    // We have auth but no role, fetch from API
                    console.log("AuthRedirect: Auth found but no role, fetching from API");
                    fetchRoleAndRedirect();
                }
            } else {
                console.log("AuthRedirect: Document not available");
                setIsChecking(false);
            }
        };

        const fetchRoleAndRedirect = async () => {
            try {
                console.log("AuthRedirect: Fetching role from API");
                const response = await fetch("/api/auth/check");

                if (response.ok) {
                    const data = await response.json();
                    const userRole = data.data.userRole;
                    console.log("AuthRedirect: Role from API:", userRole);

                    if (userRole) {
                        const dashboardUrl = getDashboardUrl(userRole);
                        console.log("AuthRedirect: API success, redirecting to:", dashboardUrl);
                        setShouldRedirect(true);
                        setIsChecking(false);
                        router.replace(dashboardUrl);
                    } else {
                        console.log("AuthRedirect: No role from API, staying on landing page");
                        setIsChecking(false);
                    }
                } else {
                    console.log("AuthRedirect: API check failed, response:", response.status);
                    setIsChecking(false);
                }
            } catch (apiError) {
                console.error("AuthRedirect: API error:", apiError);
                setIsChecking(false);
            }
        };

        // Start checking immediately
        checkAuthAndRedirect();

        // Add a fallback timeout
        const fallbackTimer = setTimeout(() => {
            console.log("AuthRedirect: Fallback timeout reached, stopping check");
            setIsChecking(false);
        }, 3000);

        return () => {
            clearTimeout(fallbackTimer);
        };
    }, [router, pathname]);

    // Show loading state while checking or redirecting
    if (isChecking || shouldRedirect) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-sm">
                        {shouldRedirect ? "Mengarahkan ke dashboard..." : "Memeriksa autentikasi..."}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
