"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc: string
}

export default function ImageWithFallback({ src, alt, fallbackSrc, ...rest }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [loading, setLoading] = useState(true)

  return (
    <div className="relative">
      {loading && <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[inherit]" />}
      <Image
        {...rest}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onError={() => {
          setImgSrc(fallbackSrc)
        }}
        onLoad={() => setLoading(false)}
        className={`${rest.className || ""} ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      />
    </div>
  )
}
