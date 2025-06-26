"use client";

import { handleLogout } from "@/action";

export default function ButtonLogout() {
  return (
    <button
      onClick={handleLogout}
      style={{ fontSize: "0.9rem" }}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg  cursor-pointer"
    >
      {" "}
      Logout{" "}
    </button>
  );
}
