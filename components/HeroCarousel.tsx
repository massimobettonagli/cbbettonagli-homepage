"use client";

import Image from "next/image";
import { useEffect, useState } from "react";


export default function HeroCarousel({ images, title }: { images: string[], title?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images[currentIndex];

  if (!images || images.length === 0) {
    return (
      <section className="relative h-screen w-full flex items-center justify-center bg-gray-300">
        <p className="text-gray-700 text-xl">Nessuna immagine hero disponibile</p>
      </section>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 h-full w-full">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`Hero ${currentIndex}`}
            fill
            className="object-cover object-center transition-opacity duration-1000 ease-in-out"
            priority
          />
        ) : (
          <div className="bg-red-300 w-full h-full flex items-center justify-center">
            <p className="text-white">Errore: immagine non valida</p>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="bg-white/70 px-8 py-6 rounded-xl shadow-xl">
          {title && (
  <h1 className="text-5xl font-bold text-[#C73A3A] text-center">{title}</h1>
)}
        </div>
      </div>

      <div className="absolute bottom-6 w-full flex justify-center gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
              index === currentIndex ? "bg-white" : "bg-transparent"
            }`}
            aria-label={`Vai alla slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}