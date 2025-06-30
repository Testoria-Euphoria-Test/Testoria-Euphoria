import ButtonLogout from "./ButtonLogout";
import Image from "next/image";
import ButtonProfile from "./ButtonProfile";
import Link from "next/link";
import { useEffect, useState } from "react";

interface NavbarProps {
  showUserActions?: boolean;
}

export default function Navbar({ showUserActions = true }: NavbarProps) {
  const [userRole, setUserRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const found = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user-role="))
        ?.split("=")[1];
      setUserRole(found);
    }
  }, []);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Image
                src="/testoria.svg"
                alt="Testoria Logo"
                width={80}
                height={80}
                className="cursor-pointer"
              />
            </Link>
          </div>
          {/* Hanya tampilkan tombol My-Paket jika role creator */}
          {userRole === "creator" && (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard-creator">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  My-Paket
                </button>
              </Link>
              <Link href="/packages">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  List Paket
                </button>
              </Link>
            </div>
          )}
          {showUserActions ? (
            <div className="flex items-center space-x-2">
              {userRole !== "admin" && <ButtonProfile />}
              <ButtonLogout />
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-slate-900 transition-colors">
                  Masuk
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Daftar
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}