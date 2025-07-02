"use client";

import { useEffect, useState } from "react";
import "@/utils/debugAuth"; // Load debug utilities

interface NavigationGuardProps {
    children: React.ReactNode;
}

export default function NavigationGuard({ children }: NavigationGuardProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Small delay to ensure hydration is complete
        const timer = setTimeout(() => {
            setIsReady(true);
            console.log("NavigationGuard: Client-side ready");
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Show loading during hydration
    if (!isReady) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[9999] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-sm">Memuat aplikasi...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}