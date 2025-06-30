"use client";

import Link from "next/link";
import { Clock, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import ButtonPayment from "./ButtonPayment";
import { PackageResponse } from "@/types/package";
import { useState, useEffect } from "react";

// Extended package type for display with populated fields
interface PackageCardProps {
  package: PackageResponse & {
    categoryName?: string;
    creatorName?: string;
  };
}

export default function PackageCard({ package: pkg }: PackageCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get images array, fallback to empty array if not available
  const images = pkg.images && pkg.images.length > 0 ? pkg.images : [];
  const hasImages = images.length > 0;

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
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  const questionCount = pkg.contents?.length || 50; // Static fallback

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  //buatkan logic jika package isPublished adlah true, maka tampilkan namun jika false, maka paket tidak ditampilkan
  if (!pkg.isPublished) {
    return null; // Tidak menampilkan paket yang tidak dipublikasikan
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 max-w-sm">
      <div className="relative">
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
            {pkg.categoryName || "Try Out"}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-10">
          {pkg.price === 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
              GRATIS
            </span>
          )}
        </div>

        <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg overflow-hidden relative">
          {hasImages ? (
            // Image Slideshow
            <div className="relative w-full h-full">
              {/* Current Image */}
              <div className="relative w-full h-full">
                <img
                  src={images[currentImageIndex]}
                  alt={`${pkg.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                {/* Loading overlay */}
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {/* Error fallback */}
                {imageError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {questionCount}
                      </div>
                      <div className="text-xs text-gray-600">Soal</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Arrows (only show if more than 1 image) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Dots Indicator (only show if more than 1 image) */}
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white shadow-lg"
                          : "bg-white bg-opacity-50 hover:bg-opacity-75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Default Display (no images available)
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {questionCount}
                </div>
                <div className="text-xs text-gray-600">Soal</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold text-blue-600 mb-1">
          {pkg.creatorName || "Testoria"}
        </div>

        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight">
          {pkg.title}
        </h3>

        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDuration(pkg.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-blue-600">
            {formatPrice(pkg.price)}
          </div>
        </div>

        <div className="flex gap-2">
          <ButtonPayment
            packageId={pkg._id}
            packagePrice={pkg.price} // Optional: to show "Free" for price 0
          />
          <Link href={`/packages/${pkg._id}`} className="flex-1">
            <button className="w-full bg-blue-400 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              Detail Paket
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}