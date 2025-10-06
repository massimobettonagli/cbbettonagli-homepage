"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/prodotti", label: "PRODOTTI" },
  { href: "/chi-siamo", label: "CHI SIAMO" },
  { href: "/news", label: "NEWS" },
  { href: "/certificazioni", label: "CERTIFICAZIONI" },
  { href: "/downloads", label: "DOWNLOADS" },
  { href: "/contatti", label: "CONTATTI" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow">
      <nav className="flex items-center justify-between px-6 md:px-20 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-def-no-sfondo.png"
            alt="Logo"
            width={150}
            height={0}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <ul className="flex space-x-6 items-center">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={clsx(
                    "text-sm font-bold uppercase relative transition-colors duration-200 group",
                    pathname === link.href ? "text-[#C73A3A]" : "text-gray-700",
                    "hover:text-[#C73A3A]"
                  )}
                >
                  {link.label}
                  <span
                    className={clsx(
                      "absolute -bottom-1 left-0 h-[3px] bg-[#C73A3A] transition-all duration-300",
                      pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Area personale button */}
          <Link
            href="/login"
            className="bg-[#C73A3A] text-white text-sm font-bold uppercase py-2 px-4 rounded-lg shadow hover:bg-[#a72f2f] transition transform hover:-translate-y-0.5"
          >
            Area personale
          </Link>
        </div>

        {/* Socials */}
        <div className="flex space-x-4 mt-2 md:ml-6">
          <a
            href="https://www.facebook.com/cbbettonagli/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-[#C73A3A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 12.07C22 6.5 17.52 2 12 2S2 6.5 2 12.07c0 5.01 3.66 9.15 8.44 9.93v-7.03H8.1v-2.9h2.34V9.84c0-2.3 1.37-3.57 3.47-3.57.7 0 1.43.12 1.43.12v1.98h-.81c-1.27 0-1.67.79-1.67 1.6v1.91h2.84l-.45 2.9h-2.39v7.03C18.34 21.22 22 17.08 22 12.07z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/cbbettonaglisrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-[#C73A3A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.83-2.2 3.75-2.2 4 0 4.75 2.63 4.75 6v9h-4v-8c0-1.9-.03-4.3-2.65-4.3-2.66 0-3.07 2.08-3.07 4.18v8.12h-4V8z"/>
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@CBBettonaglisrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:scale-110 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 hover:text-[#C73A3A]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.6 3H4.4A1.4 1.4 0 003 4.4v15.2A1.4 1.4 0 004.4 21h15.2a1.4 1.4 0 001.4-1.4V4.4A1.4 1.4 0 0019.6 3zm-9.1 13.3V7.7L15.7 11l-5.2 3.6z"/>
            </svg>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-[#C73A3A]">
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow px-6 pt-4 pb-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "block text-sm font-bold uppercase transition-colors duration-200",
                pathname === link.href ? "text-[#C73A3A]" : "text-gray-700",
                "hover:text-[#C73A3A]"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile "Area personale" button */}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block bg-[#C73A3A] text-white text-sm font-bold uppercase text-center py-2 px-4 rounded-lg shadow hover:bg-[#a72f2f] transition transform hover:-translate-y-0.5"
          >
            Area personale
          </Link>
        </div>
      )}
    </header>
  );
}