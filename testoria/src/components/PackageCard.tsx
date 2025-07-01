"use client";

import Link from "next/link";
import {  BookOpen, Star, Heart, Link2 } from "lucide-react";
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
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-50 ">
        <div className="aspect-[4/3] w-full">
          {hasImages && !imageError ? (
            <img
              src={images[currentImageIndex]}
              alt={pkg.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex">
          <span className="bg-blue-900 text-white text-xs px-4 py-1 rounded-full font-semibold shadow">
            {pkg.categoryName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4 flex-1 flex flex-col">
        {/* Title & Location */}
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-blue-900 leading-tight">
            {pkg.title}
          </h3>
        </div>

        {/* Price */}
        <div className="flex justify-between gap-2 mb-2">
          <span className="text-l font-bold text-blue-900 p-2 bg-blue-100 rounded-2xl">
            {formatPrice(pkg.price)}
          </span>
          {pkg.averageRating && pkg.averageRating > 0 && (
            <span className="flex items-center gap-1 ml-2 bg-blue-50 px-2 py-1 rounded-full text-blue-900 text-xs font-semibold">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              {pkg.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Description (max 20 words) */}
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
          {pkg.description
            .split(" ")
            .slice(0, 7)
            .join(" ")}
          {pkg.description.split(" ").length > 20 ? "..." : ""}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2 " />

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 mb-2 mt-4">
          <div>
            <span className="font-semibold text-blue-900">Soal :</span>
            <div className="text-blue-900 font-bold">{pkg.contents.length} butir </div>
          </div>
          <div>
            <span className="font-semibold text-blue-900">Durasi :</span>
            <div className="text-blue-900 font-bold">{pkg.duration} menit</div>
          </div>
          <div>
            <span className="font-semibold text-blue-900">Creator :</span>
            <div className="text-blue-900 font-bold">{pkg.creatorName}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <div className="flex-1">
            <ButtonPayment packageId={pkg._id} packagePrice={pkg.price} />
          </div>
          <Link href={`/packages/${pkg._id}`} className="flex-1">
            <button className="w-full bg-blue-900 text-white font-semibold py-3 rounded-2xl hover:bg-blue-800 transition-all duration-300">
              Detail
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

