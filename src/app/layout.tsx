import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { HydrationProvider } from "@/components/HydrationProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CUZBSI Admin Panel",
  description: "Bank Syariah Indonesia (BSI) Transaction Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </HydrationProvider>
      </body>
    </html>
  );
}
