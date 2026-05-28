import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Competitor Intelligence Dashboard",
  description: "AI-powered competitor tracking and insights",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground flex`}
      >
        <Sidebar />
        <main className="flex-1 overflow-x-hidden relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -z-10 w-[800px] h-[600px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/30 to-transparent blur-[100px] rounded-full mix-blend-screen transform translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="p-8 pb-20 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
