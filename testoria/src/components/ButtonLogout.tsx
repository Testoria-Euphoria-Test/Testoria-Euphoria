"use client";

import { handleLogout } from "@/action";
import { LogOut } from "lucide-react";

export default function ButtonLogout() {
  return (
    <form action={handleLogout}>
      <button 
        type="submit"
        style={{ fontSize: "0.9rem" }}
        className="flex items-center space-x-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm border border-red-400/30 hover:border-red-400/50 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>LOGOUT</span>
      </button>
    </form>
  );
}