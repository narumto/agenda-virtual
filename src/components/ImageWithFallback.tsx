"use client";

import { useState } from "react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=600&q=80";

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Reset error state if the src prop changes
  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={error || !src ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
}
