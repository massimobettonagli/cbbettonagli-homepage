"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Link from "next/link";

export default function WhatsAppHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {open ? (
        <div className="bg-white shadow-xl rounded-xl p-4 w-[90vw] max-w-xs border border-gray-200 relative sm:w-80">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>
          <h4 className="text-lg font-semibold mb-1 text-[#C73A3A]">
            Hai bisogno di aiuto?
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            Scrivici in WhatsApp per ricevere assistenza
          </p>
          <Link
            href="https://wa.me/390363382586"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-[#25D366] text-white py-2 rounded-lg hover:bg-[#1ebe5d] transition"
          >
            Scrivici su WhatsApp
          </Link>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#1ebe5d] transition flex items-center justify-center"
          aria-label="Apri supporto WhatsApp"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}