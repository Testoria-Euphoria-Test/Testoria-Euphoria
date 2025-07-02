import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavigationGuard from "@/components/NavigationGuard";
// import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TESTORIA - Euphoria Test",
  description: "Master your exam skills with Testoria",
  icons: {
    icon: "/testoria.svg",
    shortcut: "/testoria.svg",
    apple: "/testoria.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationGuard>
          {children}
        </NavigationGuard>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </body>
    </html>
  );
}
