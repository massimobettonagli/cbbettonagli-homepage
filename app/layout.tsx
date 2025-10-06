// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../public/klaro.css";
import Navbar from "@/components/Navbar";
import InitSocket from "@/components/InitSocket";
import Footer from "@/components/Footer";
import WhatsAppHelp from "@/components/WhatsAppHelp";
import Script from "next/script";
import { Providers } from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CB Bettonagli | Produzione e vendita tubazioni industriali",
  description:
    "CB Bettonagli è specializzata nella produzione e vendita di tubi idraulici, raccordi e articoli tecnici per l'industria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable}>
      <head>
        {/* Google Maps Places API */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyDfBWKsc74KzqUIcD6JNZVJ5_8ppTdNaZ4&libraries=places`}
          strategy="beforeInteractive"
        />

        {/* Klaro + Google Analytics */}
        <Script src="/klaro-config.js" strategy="beforeInteractive" />
        <Script src="/klaro.js" strategy="beforeInteractive" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0C4Q5M9LT6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0C4Q5M9LT6', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <InitSocket />
          <main className="pt-0">{children}</main>
          <Footer year={new Date().getFullYear()} />
          <WhatsAppHelp />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Providers>
      </body>
    </html>
  );
}
