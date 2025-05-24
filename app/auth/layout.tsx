import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - EnglishMastery",
  description: "Sign in or create an account to start your English learning journey with EnglishMastery.",
  keywords: "login, register, sign in, sign up, English learning, language practice, account",
  openGraph: {
    title: "Authentication - EnglishMastery",
    description: "Sign in or create an account to start your English learning journey with EnglishMastery.",
    type: "website",
    locale: "en_US",
    url: "https://englishmastery.com/auth",
  },
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
