"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ButtonProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get userId and userRole from cookies on client side
    const cookies = document.cookie.split("; ");
    const userIdCookie = cookies.find((row) => row.startsWith("x-user-id="));
    const userRoleCookie = cookies.find((row) => row.startsWith("x-user-role="));
    
    if (userIdCookie) {
      setUserId(userIdCookie.split("=")[1]);
    }
    if (userRoleCookie) {
      setUserRole(userRoleCookie.split("=")[1]);
    }
  }, []);

  // Don't render profile icon for admin users
  if (userRole === "admin") {
    return null;
  }

  return (
    <Link
      href="/profile"
      className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
      title="Profile"
    >
      <User className="w-5 h-5" />
    </Link>
  );
}
