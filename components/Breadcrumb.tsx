"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname() ?? ""; // ✅ fallback a stringa vuota

  // Splitta il path e rimuove vuoti
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="text-sm text-gray-500 px-6 md:px-20 pt-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="hover:text-[#C73A3A]">
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;
          return (
            <li key={href} className="flex items-center space-x-2">
              <span className="mx-1">/</span>
              {isLast ? (
                <span className="text-gray-700 font-medium">{segment}</span>
              ) : (
                <Link href={href} className="hover:text-[#C73A3A]">
                  {segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
