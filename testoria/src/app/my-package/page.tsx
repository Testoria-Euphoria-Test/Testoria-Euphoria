"use client";

import MyPackage from "@/components/MyPackage";
import Navbar from "@/components/Navbar";
import { BookDashedIcon, BookOpen, CreditCard, FileText } from "lucide-react";
import Link from "next/link";

// Custom theme color
const themeColor = "bg-[#1e3a8a]";
const themeText = "text-[#1e3a8a]";
const themeBorder = "border-[#1e3a8a]";

export default function MyPackagePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Navigation Cards Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8  mb-16 relative z-10 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard-customer"
            className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:${themeBorder} hover:border-2 transition-all duration-200`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#e0e7ff] transition-colors">
              <BookDashedIcon className={themeText + " w-6 h-6"} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Dashboard</h3>
            <p className="text-gray-600 text-sm">Beranda Utama</p>
          </Link>

          <Link
            href="/my-package"
            className={`group bg-white rounded-lg shadow-sm border-2 ${themeBorder} p-6 text-center hover:shadow-md transition-all duration-200`}
          >
            <div className={`w-12 h-12 ${themeColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Paket</h3>
            <p className="text-gray-600 text-sm">Paket Saya</p>
          </Link>

          <Link
            href="/payment-history"
            className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:${themeBorder} hover:border-2 transition-all duration-200`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#e0e7ff] transition-colors">
              <CreditCard className={themeText + " w-6 h-6"} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Pembayaran</h3>
            <p className="text-gray-600 text-sm">Riwayat Transaksi</p>
          </Link>

          <Link
            href="/tryout-history"
            className={`group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md hover:${themeBorder} hover:border-2 transition-all duration-200`}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-[#e0e7ff] transition-colors">
              <FileText className={themeText + " w-6 h-6"} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tryout</h3>
            <p className="text-gray-600 text-sm">Riwayat Ujian</p>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Section Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${themeColor} rounded-lg flex items-center justify-center`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Paket Tryout Saya
                  </h2>
                  <p className="text-gray-600">
                    Kelola dan mulai tryout dari paket yang Anda miliki
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MyPackage Component Container */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <MyPackage />
        </div>
      </div>
    </div>
  );
}
