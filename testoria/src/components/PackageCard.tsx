import { Clock, Eye, ShoppingCart, Award } from "lucide-react";

interface PackageCardProps {
  package: {
    _id: string;
    title: string;
    description: string;
    duration: number;
    categoryName?: string;
    creatorName?: string;
    isOwned?: boolean;
    price?: number;
    level?: "Beginner" | "Intermediate" | "Advanced";
  };
  userRole: "admin" | "creator" | "customer";
  onBuy?: (id: string) => void;
  onView?: (id: string) => void;
  viewMode?: "grid" | "list";
}

export default function PackageCard({
  package: pkg,
  userRole,
  onBuy,
  onView,
  viewMode = "grid",
}: PackageCardProps) {
  const formatPrice = (price?: number) =>
    !price
      ? "Free"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(price);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold">
          {pkg.categoryName}
        </span>
        {pkg.isOwned && (
          <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold flex items-center gap-1">
            <Award className="w-4 h-4" /> Owned
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
        {pkg.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm line-clamp-2">{pkg.description}</p>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {pkg.duration} min
        </div>
        <span className="font-medium text-gray-500">{pkg.creatorName}</span>
      </div>

      {/* Price */}
      <div className="text-base font-semibold text-blue-600">
        {formatPrice(pkg.price)}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onView?.(pkg._id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
        >
          <Eye className="w-4 h-4" /> Detail
        </button>
        {userRole === "customer" && !pkg.isOwned && (
          <button
            onClick={() => onBuy?.(pkg._id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold"
          >
            <ShoppingCart className="w-4 h-4" /> Enroll
          </button>
        )}
        {userRole === "customer" && pkg.isOwned && (
          <button
            onClick={() => onView?.(pkg._id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition font-semibold"
          >
            <Award className="w-4 h-4" /> Learn
          </button>
        )}
      </div>
    </div>
  );
}
