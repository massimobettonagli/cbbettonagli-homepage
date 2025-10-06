"use client";

import Image from "next/image";

type Partner = {
  _id: string;
  name: string;
  logoUrl: string;
  website: string;
};


export default function PartnerGrid({ partners }: { partners: Partner[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {partners.map((partner) => (
        <a
          key={partner._id}
          href={partner.website}
          target="_blank"
          rel="noopener noreferrer"
          className="h-24 bg-white shadow rounded-xl flex items-center justify-center overflow-hidden px-4 transition-transform duration-300 hover:scale-105"
        >
          {partner.logoUrl ? (
            <div className="relative w-full h-16 flex items-center justify-center">
              <Image
                src={partner.logoUrl}
                alt={partner.name}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <span className="text-sm text-gray-500">{partner.name}</span>
          )}
        </a>
      ))}
    </div>
  );
}