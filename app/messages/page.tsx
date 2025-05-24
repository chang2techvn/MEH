import type { Metadata } from "next"
import MessagesInterface from "@/components/messages/messages-interface"

export const metadata: Metadata = {
  title: "Messages | English Mastery",
  description: "Chat with your language partners and teachers to improve your English skills",
  openGraph: {
    title: "Messages | English Mastery",
    description: "Chat with your language partners and teachers to improve your English skills",
    images: [{ url: "/images/messages-og.png", width: 1200, height: 630 }],
  },
}

export default function MessagesPage() {
  return <MessagesInterface />
}
