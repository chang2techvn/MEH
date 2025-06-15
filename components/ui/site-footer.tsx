"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 pt-16 pb-8 border-t border-gray-100 dark:border-gray-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neo-mint to-purist-blue blur-sm opacity-70"></div>
                <BookOpen className="relative h-6 w-6 text-neo-mint dark:text-purist-blue" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neo-mint to-purist-blue">
                EnglishMastery
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Master English through our innovative 4-Skill Video Crucible methodology. Practice listening, speaking,
              reading, and writing in an engaging community.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
              >
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
              >
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
              >
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </motion.a>
              <motion.a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
              >
                <Youtube size={18} />
                <span className="sr-only">YouTube</span>
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -3 }}
                className="text-gray-500 hover:text-neo-mint dark:hover:text-purist-blue transition-colors"
              >
                <Linkedin size={18} />
                <span className="sr-only">LinkedIn</span>
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Challenges", href: "/challenges" },
                { name: "Community", href: "/community" },
                { name: "AI Learning Hub", href: "/resources" },
                { name: "Help Center", href: "/help" },
                { name: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-neo-mint dark:hover:text-purist-blue transition-colors relative group"
                  >
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neo-mint to-purist-blue group-hover:w-full transition-all duration-300"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-neo-mint dark:text-purist-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">support@englishmastery.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-neo-mint dark:text-purist-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-neo-mint dark:text-purist-blue flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  123 Learning Street
                  <br />
                  San Francisco, CA 94103
                  <br />
                  United States
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates, tips, and special offers.
            </p>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="pr-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8 bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                By subscribing, you agree to our{" "}
                <Link href="/privacy" className="underline hover:text-neo-mint dark:hover:text-purist-blue">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © {currentYear} EnglishMastery. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/privacy" className="hover:text-neo-mint dark:hover:text-purist-blue transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neo-mint dark:hover:text-purist-blue transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-neo-mint dark:hover:text-purist-blue transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
