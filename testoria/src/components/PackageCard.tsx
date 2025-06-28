import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import ButtonPayment from "./ButtonPayment";
import { PackageResponse } from "@/types/package";

export default function PackageCard({ package: pkg }: { package: PackageResponse }) {
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

  // Gunakan data statis atau dari data asli// Static value
  const questionCount = pkg.contents?.length || 50; // Static fallback

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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {questionCount}
              </div>
              <div className="text-xs text-gray-600">Soal</div>
            </div>
          </div>
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