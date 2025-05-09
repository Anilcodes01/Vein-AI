
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; 
import Appbar from "../components/Landing/Appbar";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { NutritionProvider } from '@/contexts/NutritionContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Vein - Your personal health assistant',
  description: 'Your personal health assistant',
  icons: {
    icon: '/logot.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-auto hide-scrollbar">
      <head>
        <link rel="icon" href="/logot.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-y-auto hide-scrollbar antialiased`}
      >
        <Providers>
          <div className="fixed top-0 w-full z-50">
            <Appbar />
          </div>
          <DashboardProvider>
          <NutritionProvider>
          <main className="pt-16"> 
              {children}
            </main>
          </NutritionProvider>
           
          </DashboardProvider>
        </Providers>
      </body>
    </html>
  );
}