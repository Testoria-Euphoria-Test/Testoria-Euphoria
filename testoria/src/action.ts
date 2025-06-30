"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const handleLogout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("Authorization");
  cookieStore.delete("x-user-id");
  cookieStore.delete("x-user-role");
  cookieStore.delete("user-role");

  redirect("/login");
};
