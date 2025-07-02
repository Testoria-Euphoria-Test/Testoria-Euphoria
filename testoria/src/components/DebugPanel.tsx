"use client";

import { useState, useEffect } from "react";

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [cookies, setCookies] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<any>(null);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

    const refreshCookies = () => {
        const allCookies = document.cookie;
        setCookies(allCookies);

        const cookies = allCookies.split(";").map((c) => c.trim());
        const authCookie = cookies.find((c) => c.startsWith("Authorization="));
        const roleCookie = cookies.find((c) => c.startsWith("user-role="));

        const authToken = authCookie ? authCookie.split("=")[1] : null;
        const userRole = roleCookie ? decodeURIComponent(roleCookie.split("=")[1]) : null;

        setAuthStatus({
            isAuthenticated: !!(authToken && authToken !== "" && authToken !== "undefined"),
            authToken: authToken ? authToken.substring(0, 30) + "..." : null,
            userRole,
            shouldRedirect: !!(authToken && userRole && window.location.pathname === "/")
        });
    };

    const simulateLogin = (role: string) => {
        document.cookie = `Authorization=Bearer fake-token-${Date.now()}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        document.cookie = `user-role=${encodeURIComponent(role)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        refreshCookies();
        console.log(`Simulated login as ${role}`);

        // Try to trigger redirect
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    const clearCookies = () => {
        document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "x-user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "x-user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        refreshCookies();
        console.log("Cookies cleared");
    };

    const testAPICheck = async () => {
        try {
            console.log("Testing /api/auth/check...");
            const response = await fetch("/api/auth/check", {
                method: "GET",
                credentials: "include",
            });

            console.log("API Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("API Response data:", data);
                alert(`API Success: ${JSON.stringify(data, null, 2)}`);
            } else {
                const errorText = await response.text();
                console.log("API Error:", errorText);
                alert(`API Error (${response.status}): ${errorText}`);
            }
        } catch (error) {
            console.error("API Network Error:", error);
            alert(`Network Error: ${error}`);
        }
    };

    useEffect(() => {
        refreshCookies();
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 z-50"
            >
                🔧 Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96 z-50 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Debug Panel</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-2">Current Status:</h4>
                    <div className="text-xs bg-gray-100 p-2 rounded">
                        <div>URL: {typeof window !== "undefined" ? window.location.href : "N/A"}</div>
                        <div>Authenticated: {authStatus?.isAuthenticated ? "✅ YES" : "❌ NO"}</div>
                        <div>Role: {authStatus?.userRole || "None"}</div>
                        <div>Should Redirect: {authStatus?.shouldRedirect ? "✅ YES" : "❌ NO"}</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-2">Cookies:</h4>
                    <div className="text-xs bg-gray-100 p-2 rounded break-all">
                        {cookies || "No cookies"}
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={refreshCookies}
                        className="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                    >
                        🔄 Refresh Status
                    </button>

                    <button
                        onClick={testAPICheck}
                        className="w-full bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600"
                    >
                        🧪 Test API Check
                    </button>
                </div>

                <div>
                    <h4 className="font-semibold text-sm mb-2">Simulate Login:</h4>
                    <div className="grid grid-cols-3 gap-1">
                        <button
                            onClick={() => simulateLogin("admin")}
                            className="bg-purple-500 text-white text-xs py-1 px-2 rounded hover:bg-purple-600"
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => simulateLogin("creator")}
                            className="bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                        >
                            Creator
                        </button>
                        <button
                            onClick={() => simulateLogin("customer")}
                            className="bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600"
                        >
                            Customer
                        </button>
                    </div>
                </div>

                <button
                    onClick={clearCookies}
                    className="w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                >
                    🗑️ Clear All Cookies
                </button>
            </div>
        </div>
    );
}
