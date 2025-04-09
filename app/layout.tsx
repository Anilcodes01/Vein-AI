'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./providers";
import Appbar from "../components/Landing/Appbar";
import { usePathname } from "next/navigation";
import { DashboardProvider } from "@/contexts/DashboardContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  const showAppbar = pathname !== "/auth/login" && pathname !== "/auth/register";

  return (
    <html lang="en" className="overflow-y-auto hide-scrollbar">
      <head>
        <link rel="icon" href="/logo-veinai.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-y-auto hide-scrollbar antialiased`}
      >
        <Provider>
        <div className="fixed top-0 w-full ">
        {showAppbar && <Appbar />}
        </div>
        <DashboardProvider>
          {children}
        </DashboardProvider>
        </Provider>
      </body>
    </html>
  );
}
