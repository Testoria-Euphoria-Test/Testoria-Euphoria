import {  User, Settings } from "lucide-react";
import Link from "next/link";
import ButtonLogout from "./ButtonLogout";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Testoria</h1>
          </div>
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="" className="p-2 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </Link>
            <Link href="" className="p-2 rounded-lg hover:bg-gray-100">
              <User className="w-5 h-5" />
            </Link>
            <ButtonLogout />
          </div>
        </div>
      </div>
    </nav>
  );
}
