"use client";

import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import ButtonPayment from "./ButtonPayment";
import { PackageResponse } from "@/types/package";
import { useState, useEffect } from "react";

// Extended package type for display with populated fields
interface PackageCardProps {
  package: PackageResponse;
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get images array, fallback to empty array if not available
  const images = pkg.images && pkg.images.length > 0 ? pkg.images : [];
  const hasImages = images.length > 0;
  console.log("Package debug:", {
    id: pkg._id,
    title: pkg.title,
    averageRating: pkg.averageRating,
    ratings: pkg.ratings,
  });

  // Auto-slide functionality
  useEffect(() => {
    if (!hasImages || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [hasImages, images.length]);

  const formatPrice = (price: number) => {
    if (price === 0) return "GRATIS";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}j ${minutes}m` : `${hours}j`;
    }
    return `${duration}m`;
  };

  const questionCount = pkg.contents?.length || 50; 

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  //buatkan logic jika package isPublished adlah true, maka tampilkan namun jika false, maka paket tidak ditampilkan
  if (!pkg.isPublished) {
    return null; // Tidak menampilkan paket yang tidak dipublikasikan
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 max-w-xs w-full mx-auto overflow-hidden flex flex-col">
      {/* Gambar dan badge */}
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          {hasImages && !imageError ? (
            <img
              src={images[currentImageIndex]}
              alt={pkg.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <BookOpen className="w-16 h-16 text-blue-400" />
            </div>
          )}
        </div>
        {/* Badge status */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
            {(pkg as any).categoryName || "Category"}
          </span>
        </div>
        {/* Badge gratis */}
        {pkg.price === 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
              GRATIS
            </span>
          </div>
        )}
        {/* Ikon aksi (opsional, contoh: favorit/tautan) */}
        <div className="absolute top-3 right-12 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
            <span>⭐️</span>
            <span>
              {pkg.averageRating ? pkg.averageRating.toFixed(1) : "0.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Konten utama */}
      <div className="flex flex-col gap-2 px-5 pt-4 pb-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {pkg.title}
          </h3>
          <div className="text-base font-bold text-blue-600 text-right min-w-[80px]">
            {formatPrice(pkg.price)}
          </div>
        </div>
        <div className="text-xs text-gray-500 mb-2 truncate">
          {(pkg as any).creatorName || "Creator"}
        </div>
        <div className="text-sm text-gray-600 mb-3 line-clamp-2">
          {pkg.description}
        </div>
        {/* Info ringkas */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <BookOpen className="w-4 h-4" />
            <span>{questionCount}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(pkg.duration)}</span>
          </div>
        </div>
        {/* Tombol aksi */}
        <div className="flex gap-2 mt-2">
          <ButtonPayment packageId={pkg._id} packagePrice={pkg.price} />
          <Link href={`/packages/${pkg._id}`} className="flex-1">
            <button className="w-full bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow">
              Detail Paket
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
