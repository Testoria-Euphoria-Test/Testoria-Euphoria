"use client";

import { handleLogout } from "@/action";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ButtonLogout() {
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      console.log("ButtonLogout: Logging out...");

      // Clear cookies client-side first
      document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "x-user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "x-user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Call server action
      await handleLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force page reload to clear state
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleLogoutClick}
      style={{ fontSize: "0.9rem" }}
      className="flex items-center space-x-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-red-400/30 hover:border-red-400/50 cursor-pointer"
    >
      <LogOut className="w-4 h-4" />
      <span>Keluar</span>
    </button>
  );
}