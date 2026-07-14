import React, { useState } from "react";
import { Image } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({ src, alt, className, fallbackSrc, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          {...props}
        />
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 gap-2 ${className}`}>
        <Image size={24} className="stroke-[1.5]" />
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
