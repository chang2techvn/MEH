import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/profile.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ChatProvider } from "@/contexts/chat-context-realtime"
import ChatWindowsManager from "@/components/messages/chat-windows-manager"
import MinimizedChatBar from "@/components/messages/minimized-chat-bar"
import { ThemeProvider } from "@/contexts/theme-context"
import { ChallengeProvider } from "@/contexts/challenge-context"
import { CommunityProvider } from "@/contexts/community-context"
import { ResourcesProvider } from "@/contexts/resources-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { AdminProvider } from "@/contexts/admin-context"
import Script from "next/script"
import ServiceWorkerRegistration from "@/components/service-worker-registration"
import { ScrollToTopButton } from "@/components/ui/scroll-to-top-button"
import ServiceInitializer from "@/components/service-initializer"


// Tối ưu font loading - Inter font for modern UI
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: "EnglishMastery - 4-Skill Video Learning Platform",
  description:
    "Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking, reading, and writing in an engaging community.",
  keywords:
    "English learning, language practice, video learning, speaking practice, writing practice, English community",
  openGraph: {
    title: "EnglishMastery - 4-Skill Video Learning Platform",
    description: "Master English through our innovative 4-Skill Video Crucible methodology",
    type: "website",
    locale: "en_US",
    url: "https://englishmastery.com",
    images: [
      {
        url: "https://englishmastery.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EnglishMastery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EnglishMastery - 4-Skill Video Learning Platform",
    description: "Master English through our innovative 4-Skill Video Crucible methodology",
    images: ["https://englishmastery.com/twitter-image.jpg"],
  },
  metadataBase: new URL("https://englishmastery.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "https://englishmastery.com",
      es: "https://es.englishmastery.com",
    },
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
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
    yahoo: "yahoo-verification-code",
    other: {
      me: ["support@englishmastery.com"],
    },
  },
  category: "education",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking, reading, and writing in an engaging community."
        />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        <meta name="referrer" content="no-referrer-when-downgrade" />

        {/* Preconnect to domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* FontAwesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

        {/* Preload critical assets */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/hero-bg.webp" as="image" />

        {/* PWA assets */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />

        {/* Preload critical CSS */}
        <link rel="preload" href="/_next/static/css/app.css" as="style" />
      </head>
      <body suppressHydrationWarning className={inter.className}>        <AuthProvider>
          <ThemeProvider>
            <ChallengeProvider>
              <CommunityProvider>
                <ResourcesProvider>
                  <ProfileProvider>
                    <AdminProvider>
                      <ChatProvider>
                    <ServiceInitializer />
                    <div className="flex min-h-screen flex-col">
                      {children}
                      <ChatWindowsManager />
                      <MinimizedChatBar />
                      <ScrollToTopButton showOnMobileOnly={true} threshold={500} />
                    </div>
                    <Toaster />

                  </ChatProvider>
                </AdminProvider>
              </ProfileProvider>
            </ResourcesProvider>
          </CommunityProvider>
            </ChallengeProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* Structured data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EnglishMastery",
              url: "https://englishmastery.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://englishmastery.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Organization schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "EnglishMastery",
              url: "https://englishmastery.com",
              logo: "https://englishmastery.com/logo.png",
              sameAs: [
                "https://facebook.com/englishmastery",
                "https://twitter.com/englishmastery",
                "https://instagram.com/englishmastery",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-555-5555",
                contactType: "customer service",
                email: "support@englishmastery.com",
                availableLanguage: ["English", "Spanish"],
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
