"use client";

import MyPackage from "@/components/MyPackage";
import Navbar from "@/components/Navbar";
import { BookDashedIcon, BookOpen, CreditCard, FileText } from "lucide-react";
import Link from "next/link";

export default function MyPackagePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Navigation Section */}
        <div className="flex justify-center gap-4 mb-8 mt-4 bg-white ">
          <Link
            href="/dashboard-customer"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg  transition-all duration-300 font-medium border border-gray-200 shadow-sm"
          >
            <BookDashedIcon className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link
            href="/my-package"
            className="inline-flex items-center px-6 py-3  bg-blue-600 text-white rounded-lg  transition-all duration-300 font-medium border border-gray-200 shadow-sm"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            My-Paket
          </Link>
          <Link
            href="/payment-history"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg  transition-all duration-300 font-medium shadow-sm"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Riwayat Pembayaran
          </Link>
          <Link
            href="/tryout-history"
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg  transition-all duration-300 font-medium border border-gray-200 shadow-sm"
          >
            <FileText className="w-5 h-5 mr-2" />
            Riwayat Tryout
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MyPackage />
        </div>
      </div>
    </div>
  );
}
