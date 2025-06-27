// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   User,
//   GraduationCap,
//   Award,
//   Save,
//   Plus,
//   Trash2,
//   ArrowLeft,
// } from "lucide-react";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: "admin" | "customer" | "creator";
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface EditFormData {
//   name: string;
//   email: string;
//   phone: string;
//   location: string;
//   dateOfBirth: string;
//   education: string;
//   bio: string;
//   certificates: string[];
//   currentPassword: string;
//   newPassword: string;
//   confirmPassword: string;
// }

// export default function EditProfilePage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) 
  


//   // Initialize data when component mounts
//   useEffect(() => {
//     const initializeData = async () => {
//       try {
//         const resolvedParams = await params;
//         setUserId(resolvedParams.id);

//         // Simulate API call delay
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // In real app, fetch user data based on resolvedParams.id
//         const { user, profile, additionalInfo } = mockUserData;

//         setFormData({
//           name: user.name,
//           email: user.email,
//           phone: additionalInfo.phone,
//           location: additionalInfo.location,
//           dateOfBirth: additionalInfo.dateOfBirth,
//           education: profile.education,
//           bio: profile.bio,
//           certificates: [...profile.certificates],
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         });

//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error loading profile data:", error);
//         setIsLoading(false);
//       }
//     };

//     initializeData();
//   }, [params]);

//   // Form validation
//   const validateForm = useCallback((): boolean => {
//     const newErrors: Partial<EditFormData> = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [formData]);

//   // Handle form input changes
//   const handleInputChange = useCallback(
//     (field: keyof EditFormData, value: string) => {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: value,
//       }));

//       // Clear error when user starts typing
//       if (errors[field]) {
//         setErrors((prev) => ({
//           ...prev,
//           [field]: undefined,
//         }));
//       }
//     },
//     [errors]
//   );

//   // Handle certificate management
//   const handleAddCertificate = useCallback(() => {
//     if (
//       newCertificate.trim() &&
//       !formData.certificates.includes(newCertificate.trim())
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         certificates: [...prev.certificates, newCertificate.trim()],
//       }));
//       setNewCertificate("");
//     }
//   }, [newCertificate, formData.certificates]);

//   const handleRemoveCertificate = useCallback((index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       certificates: prev.certificates.filter((_, i) => i !== index),
//     }));
//   }, []);

//   // Handle form submission
//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();

//       if (!validateForm()) {
//         return;
//       }

//       setIsSaving(true);

//       try {
//         // Simulate API call
//         await new Promise((resolve) => setTimeout(resolve, 2000));

//         console.log("Saving profile data:", {
//           userId,
//           formData,
//         });

//         // In real app, make API calls to update user and profile
//         // await updateUser(userId, { name: formData.name, email: formData.email });
//         // await updateProfile(userId, { education: formData.education, bio: formData.bio, certificates: formData.certificates });

//         // Show success message and redirect
//         alert("Profile updated successfully!");
//         router.push("/profile");
//       } catch (error) {
//         console.error("Error updating profile:", error);
//         alert("Failed to update profile. Please try again.");
//       } finally {
//         setIsSaving(false);
//       }
//     },
//     [validateForm, userId, formData, router]
//   );

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded mb-4"></div>
//             <div className="space-y-3">
//               <div className="h-4 bg-gray-200 rounded"></div>
//               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//               <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           </div>
//           <p className="text-center text-gray-600 mt-4">
//             Loading profile data...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-4xl mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <button
//                 onClick={() => router.back()}
//                 className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//               </button>
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">
//                   Edit Profile
//                 </h1>
//                 <p className="text-gray-600 mt-1">
//                   Update your personal information and preferences
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* Personal Information */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
//               <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               Personal Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange("name", e.target.value)}
//                   className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                     errors.name ? "border-red-500" : "border-gray-200"
//                   }`}
//                   placeholder="Enter your full name"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-sm mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange("email", e.target.value)}
//                   className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
//                     errors.email ? "border-red-500" : "border-gray-200"
//                   }`}
//                   placeholder="Enter your email address"
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => handleInputChange("phone", e.target.value)}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                   placeholder="Enter your phone number"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Location
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.location}
//                   onChange={(e) =>
//                     handleInputChange("location", e.target.value)
//                   }
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                   placeholder="Enter your location"
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Date of Birth
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.dateOfBirth}
//                   onChange={(e) =>
//                     handleInputChange("dateOfBirth", e.target.value)
//                   }
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Education & Bio */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
//               <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
//                 <GraduationCap className="w-5 h-5 text-white" />
//               </div>
//               Education & Biography
//             </h2>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Education Background
//                 </label>
//                 <textarea
//                   value={formData.education}
//                   onChange={(e) =>
//                     handleInputChange("education", e.target.value)
//                   }
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
//                   rows={3}
//                   placeholder="Describe your educational background"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                   Biography
//                 </label>
//                 <textarea
//                   value={formData.bio}
//                   onChange={(e) => handleInputChange("bio", e.target.value)}
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
//                   rows={5}
//                   placeholder="Tell us about yourself, your experience, and expertise"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Certificates */}
//           <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
//               <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
//                 <Award className="w-5 h-5 text-white" />
//               </div>
//               Certifications
//             </h2>

//             <div className="space-y-4">
//               {formData.certificates.map((cert, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100"
//                 >
//                   <div className="flex items-center">
//                     <Award className="w-5 h-5 text-yellow-600 mr-3" />
//                     <span className="text-gray-700 font-medium">{cert}</span>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => handleRemoveCertificate(index)}
//                     className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}

//               <div className="flex space-x-3">
//                 <input
//                   type="text"
//                   value={newCertificate}
//                   onChange={(e) => setNewCertificate(e.target.value)}
//                   placeholder="Add new certificate..."
//                   className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       handleAddCertificate();
//                     }
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddCertificate}
//                   className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all shadow-lg flex items-center font-semibold"
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-end">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold order-2 sm:order-1"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSaving}
//               className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
//             >
//               {isSaving ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save className="w-5 h-5 mr-2" />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
