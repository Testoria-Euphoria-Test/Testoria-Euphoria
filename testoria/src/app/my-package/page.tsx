"use client";

// import MyPackage from "@/components/MyPackage";
// import Navbar from "@/components/Navbar";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { useEffect, useState } from "react";

export default function MyPackagePage() {
//  const [mypackages, setMyPackages] = useState([]);
//  const [loading, setLoading] = useState(true);
//     // const res = fetch("/api/packages/my-packages")
//     // .then(response => response.json())
//     useEffect(() => {
//       const fetchMyPackages = async () => {
//         try {
//           setLoading(true);

//           const response = await fetch("http://localhost:3000/api/payments", {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             credentials: "include",
//           });

//           if (!response.ok) {
//             throw new Error("Failed to fetch packages");
//           }


//           const data = await response.json();
          

//           console.log("Response data:", data);
//           if (data.success) {
//             setMyPackages(data.data || []);
//           } else {
//             throw new Error(data.message || "Failed to load packages");
//           }
//           console.log("Fetched packages:", data.data);
//         } catch (err) {
//           console.error("Error fetching packages:", err);
//           setError(err instanceof Error ? err.message : "An error occurred");
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchMyPackages();
//     }, []);


  return (<>ini halmaan my package</>)
//     <div>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//             <Link
//               href="/dashboard-customer"
//               className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5 mr-2" />
//               Back to Dashboard
//             </Link>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <MyPackage />
//         </div>
//       </div>
//     </div>
//   );
}
