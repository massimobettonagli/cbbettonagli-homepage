"use client";

export default function Footer({ year }: { year: number }) {
  return (
    <footer className="bg-gray-900 text-white text-center py-6">
      <p className="text-sm space-y-1">
        &copy; {year} CBBETTONAGLI. Tutti i diritti riservati.
      </p>
      <div className="text-sm mt-2 space-x-4">
        <a href="/privacy-policy" className="underline hover:text-gray-300">
          Privacy Policy
        </a>
        <a href="/cookie-policy" className="underline hover:text-gray-300">
          Cookie Policy
        </a>
      </div>
    </footer>
  );
}