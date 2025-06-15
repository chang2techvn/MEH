import type React from "react"
import Head from "next/head"

interface SEOMetaProps {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: "website" | "article"
  twitterCard?: "summary" | "summary_large_image"
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  articleSection?: string
  noIndex?: boolean
  noFollow?: boolean
  children?: React.ReactNode
}

export default function SEOMeta({
  title,
  description,
  canonical,
  ogImage = "https://englishmastery.com/api/og?title=EnglishMastery",
  ogType = "website",
  twitterCard = "summary_large_image",
  keywords = [],
  author = "EnglishMastery Team",
  publishedTime,
  modifiedTime,
  articleSection,
  noIndex = false,
  noFollow = false,
  children,
}: SEOMetaProps) {
  // Construct robots meta content
  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
    "max-snippet:-1",
    "max-image-preview:large",
    "max-video-preview:-1",
  ].join(", ")

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <meta name="author" content={author} />

      {/* Robots Meta Tag */}
      <meta name="robots" content={robotsContent} />

      {/* Canonical Link */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="EnglishMastery" />

      {/* Article Specific Open Graph Tags */}
      {ogType === "article" && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {ogType === "article" && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {ogType === "article" && articleSection && <meta property="article:section" content={articleSection} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@englishmastery" />

      {/* Additional Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="EnglishMastery" />
      <meta name="application-name" content="EnglishMastery" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#4f46e5" />
      <meta name="theme-color" content="#ffffff" />

      {/* Additional children elements */}
      {children}
    </Head>
  )
}
