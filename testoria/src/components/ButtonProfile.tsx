"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ButtonProfile() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from cookies on client side
    const cookies = document.cookie.split("; ");
    const userIdCookie = cookies.find((row) => row.startsWith("x-user-id="));
    if (userIdCookie) {
      setUserId(userIdCookie.split("=")[1]);
    }
  }, []);

  return (
    <Link
      href="/profile/me"
      className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
      title="Profile"
    >
      <User className="w-5 h-5" />
    </Link>
  );
}
