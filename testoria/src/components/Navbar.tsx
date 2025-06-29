import ButtonLogout from "./ButtonLogout";
import Image from "next/image";
import ButtonProfile from "./ButtonProfile";
import Link from "next/link";

interface NavbarProps {
  showUserActions?: boolean;
}

export default function Navbar({ showUserActions = true }: NavbarProps) {
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

          {/* User Actions - Only show if user is logged in */}
          {showUserActions ? (
            <div className="flex items-center space-x-2">
              <ButtonProfile />
              <ButtonLogout />
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-slate-900 transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
