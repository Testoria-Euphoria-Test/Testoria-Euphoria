"use client";

import MyPackage from "@/components/MyPackage";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MyPackagePage() {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/dashboard-customer"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyPackage />
        </div>
      </div>
    </div>
  );
}
