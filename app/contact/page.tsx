"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PageHeader from "@/components/page-header"
import SiteFooter from "@/components/site-footer"
import MainHeader from "@/components/main-header"

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would send the form data to your backend
    console.log("Form submitted:", formData)
    setFormSubmitted(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "",
      })
    }, 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, inquiryType: value }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Our support team will get back to you within 24 hours.",
      contact: "support@englishmastery.com",
      action: "Send an email",
      link: "mailto:support@englishmastery.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our customer service team.",
      contact: "+1 (555) 123-4567",
      action: "Make a call",
      link: "tel:+15551234567",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support agents in real-time.",
      contact: "Available 24/7",
      action: "Start a chat",
      link: "#chat",
    },
    {
      icon: Clock,
      title: "Support Hours",
      description: "Our team is available during these hours:",
      contact: "Monday-Friday: 9AM-6PM EST\nSaturday: 10AM-4PM EST\nSunday: Closed",
      action: "Check status",
      link: "#hours",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1">
        <PageHeader
          title="Contact Us"
          description="Have questions or need assistance? We're here to help you with any inquiries about our English learning platform."
        />

        <section className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 rounded-full flex items-center justify-center mb-4">
                          <method.icon className="h-6 w-6 text-neo-mint dark:text-purist-blue" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{method.description}</p>
                        <p className="text-sm font-medium whitespace-pre-line mb-4">{method.contact}</p>
                        <a
                          href={method.link}
                          className="text-sm font-medium text-neo-mint dark:text-purist-blue hover:underline inline-flex items-center"
                        >
                          {method.action}
                          <Send className="h-3 w-3 ml-1" />
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Our Location</h3>
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-neo-mint dark:text-purist-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      123 Learning Street
                      <br />
                      San Francisco, CA 94103
                      <br />
                      United States
                    </p>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50470.95397618613!2d-122.43913217412364!3d37.75890609860146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  {formSubmitted ? (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-neo-mint to-purist-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for reaching out. We'll get back to you as soon as possible.
                      </p>
                      <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                        Send another message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">Inquiry Type</Label>
                        <Select value={formData.inquiryType} onValueChange={handleSelectChange} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Question</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Subscription</SelectItem>
                            <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          placeholder="How can we help you?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Please provide details about your inquiry..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white"
                      >
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
