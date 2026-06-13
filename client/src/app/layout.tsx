import type { Metadata } from "next";
import { Rajdhani, Space_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Agromonitor Jateng - Sistem Monitoring & Visualisasi Harga",
  description: "Dashboard analisis pasar harga komoditas pertanian di Jawa Tengah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rajdhani.variable} ${spaceMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                borderRadius: '0',
                border: '2px solid #000',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                fontFamily: 'var(--font-space-mono)',
                fontWeight: 'bold',
              },
              success: {
                iconTheme: {
                  primary: '#00E676',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#D32F2F',
                  secondary: '#fff',
                },
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
