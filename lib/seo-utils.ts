/**
 * Utility functions for SEO optimization
 */

import type { Metadata } from "next"

/**
 * Generate structured data for a page
 */
export function generateStructuredData(data: {
  type:
    | "Article"
    | "Course"
    | "FAQPage"
    | "Organization"
    | "Person"
    | "Product"
    | "WebPage"
    | "BreadcrumbList"
    | "Event"
    | "VideoObject"
  name: string
  description: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: {
    name: string
    url?: string
  }
  [key: string]: any
}) {
  const structuredData: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": data.type,
  }

  // Add common properties
  if (data.name) structuredData.name = data.name
  if (data.description) structuredData.description = data.description
  if (data.url) structuredData.url = data.url
  if (data.image) structuredData.image = data.image

  // Add type-specific properties
  if (data.type === "Article" || data.type === "Course") {
    if (data.datePublished) structuredData.datePublished = data.datePublished
    if (data.dateModified) structuredData.dateModified = data.dateModified
    if (data.author) {
      structuredData.author = {
        "@type": "Person",
        name: data.author.name,
      }
      if (data.author.url) structuredData.author.url = data.author.url
    }
  }

  // Add any additional properties
  Object.keys(data).forEach((key) => {
    if (!["type", "name", "description", "url", "image", "datePublished", "dateModified", "author"].includes(key)) {
      structuredData[key] = data[key]
    }
  })

  return JSON.stringify(structuredData)
}

/**
 * Generate metadata for a page
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  locale = "en_US",
  siteName = "EnglishMastery",
  twitterHandle = "@englishmastery",
  publishedTime,
  modifiedTime,
  authors,
  alternateLocales = [],
  category,
  tags = [],
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
  locale?: string
  siteName?: string
  twitterHandle?: string
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  alternateLocales?: { locale: string; url: string }[]
  category?: string
  tags?: string[]
}): Metadata {
  // Base metadata
  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(", "),
    authors: authors?.map((author) => ({ name: author })),
    category,
    openGraph: {
      title,
      description,
      type: type as "website" | "article" | "book" | "profile",
      locale,
      siteName,
      ...(url ? { url } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterHandle ? { creator: twitterHandle } : {}),
      ...(image ? { images: [image] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }

  // Add article specific metadata
  if (type === "article") {
    if (metadata.openGraph) {
      // Create a correctly typed article OpenGraph object
      const articleOpenGraph = {
        ...metadata.openGraph,
        type: "article" as const,
      }

      // Add article-specific properties using type assertion
      const extendedOg = articleOpenGraph as any
      if (publishedTime) extendedOg.publishedTime = publishedTime
      if (modifiedTime) extendedOg.modifiedTime = modifiedTime
      if (authors?.length) extendedOg.authors = authors.map(author => ({ name: author }))
      if (tags?.length) extendedOg.tags = tags

      // Replace the original openGraph with the article-specific one
      metadata.openGraph = articleOpenGraph
    }
  }

  // Add alternate languages
  if (alternateLocales.length > 0 && metadata.alternates) {
    const languages: Record<string, string> = {}
    alternateLocales.forEach(({ locale, url }) => {
      languages[locale] = url
    })
    metadata.alternates.languages = languages
  }

  return metadata
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://englishmastery.com"
  return `${baseUrl}${path}`
}

/**
 * Generate alternate language links
 */
export function getAlternateLanguageLinks(
  path: string,
  languages: { code: string; path: string }[],
): { [key: string]: string } {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://englishmastery.com"
  const links: { [key: string]: string } = {}

  languages.forEach((lang) => {
    links[lang.code] = `${baseUrl}${lang.path}${path}`
  })

  return links
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]): string {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return JSON.stringify(breadcrumbData)
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(questions: { question: string; answer: string }[]): string {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }

  return JSON.stringify(faqData)
}

/**
 * Generate video structured data
 */
export function generateVideoStructuredData({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration: string // ISO 8601 format, e.g. "PT1M33S" for 1 minute 33 seconds
  contentUrl: string
  embedUrl?: string
}): string {
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: name,
    description: description,
    thumbnailUrl: thumbnailUrl,
    uploadDate: uploadDate,
    duration: duration,
    contentUrl: contentUrl,
    ...(embedUrl ? { embedUrl: embedUrl } : {}),
  }

  return JSON.stringify(videoData)
}

/**
 * Generate course structured data
 */
export function generateCourseStructuredData({
  name,
  description,
  provider,
  url,
  image,
}: {
  name: string
  description: string
  provider: string
  url: string
  image?: string
}): string {
  const courseData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: name,
    description: description,
    provider: {
      "@type": "Organization",
      name: provider,
      sameAs: "https://englishmastery.com",
    },
    url: url,
    ...(image ? { image: image } : {}),
  }

  return JSON.stringify(courseData)
}
