import { Settings } from "lucide-react";
import Link from "next/link";
import ButtonLogout from "./ButtonLogout";
import Image from "next/image";
import ButtonProfile from "./ButtonProfile";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Image
              src="/testoria.svg"
              alt="Testoria Logo"
              width={80}
              height={80}
            />
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href="/settings"
              className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/10 hover:border-white/20"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <ButtonProfile />
            <ButtonLogout />
          </div>
        </div>
      </div>
    </nav>
  );
}
