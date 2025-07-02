"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const handleLogout = async () => {
  console.log("Server action: handleLogout called");

  const cookieStore = await cookies();

  // Delete all authentication-related cookies
  cookieStore.delete("Authorization");
  cookieStore.delete("x-user-id");
  cookieStore.delete("x-user-role");
  cookieStore.delete("user-role");

  console.log("Server action: Cookies deleted, redirecting to /");
  redirect("/");
};
