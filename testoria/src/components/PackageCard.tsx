"use client";

import { Clock, Eye, ShoppingCart, Award } from "lucide-react";
import { memo, useCallback } from "react";
import type { FC } from "react";

interface Package {
  _id: string;
  title: string;
  description: string;
  duration: number;
  categoryName?: string;
  creatorName?: string;
  isOwned?: boolean;
  price?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
}

interface PackageCardProps {
  package: Package;
  userRole: "admin" | "creator" | "customer";
  onBuy?: (id: string) => void;
  onView?: (id: string) => void;
  viewMode?: "grid" | "list";
}

const PackageCard: FC<PackageCardProps> = memo(
  ({ package: pkg, userRole, onBuy, onView = "grid" }) => {
    // Memoized price formatter
    const formatPrice = useCallback((price?: number): string => {
      if (!price) return "Free";

      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price);
    }, []);

    // Memoized event handlers
    const handleView = useCallback(() => {
      onView?.(pkg._id);
    }, [onView, pkg._id]);

    const handleBuy = useCallback(() => {
      onBuy?.(pkg._id);
    }, [onBuy, pkg._id]);

    return (
      <article
        className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4"
        role="article"
        aria-labelledby={`package-title-${pkg._id}`}
      >
        {/* Header */}
        <header className="flex items-center justify-between">
          {pkg.categoryName && (
            <span
              className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold"
              aria-label={`Category: ${pkg.categoryName}`}
            >
              {pkg.categoryName}
            </span>
          )}
          {pkg.isOwned && (
            <span
              className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold flex items-center gap-1"
              aria-label="Package owned"
            >
              <Award className="w-4 h-4" aria-hidden="true" />
              Owned
            </span>
          )}
        </header>

        {/* Title */}
        <h3
          id={`package-title-${pkg._id}`}
          className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
        >
          {pkg.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
          {pkg.description}
        </p>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div
            className="flex items-center gap-1"
            aria-label={`Duration: ${pkg.duration} minutes`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{pkg.duration} min</span>
          </div>
          {pkg.creatorName && (
            <span
              className="font-medium text-gray-500"
              aria-label={`Creator: ${pkg.creatorName}`}
            >
              {pkg.creatorName}
            </span>
          )}
        </div>

        {/* Price */}
        <div
          className="text-lg font-bold text-blue-600"
          aria-label={`Price: ${formatPrice(pkg.price)}`}
        >
          {formatPrice(pkg.price)}
        </div>

        {/* Actions */}
        <footer className="flex gap-2 mt-auto">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            aria-label={`View details for ${pkg.title}`}
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            Detail
          </button>

          {userRole === "customer" && !pkg.isOwned && (
            <button
              onClick={handleBuy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-semibold"
              aria-label={`Enroll in ${pkg.title}`}
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              Enroll
            </button>
          )}

          {userRole === "customer" && pkg.isOwned && (
            <button
              onClick={handleView}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-semibold"
              aria-label={`Start learning ${pkg.title}`}
            >
              <Award className="w-4 h-4" aria-hidden="true" />
              Learn
            </button>
          )}
        </footer>
      </article>
    );
  }
);

PackageCard.displayName = "PackageCard";

export default PackageCard;
export type { PackageCardProps, Package };
