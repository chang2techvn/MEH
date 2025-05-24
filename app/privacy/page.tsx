"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Clock, User, Database, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/page-header"
import SiteFooter from "@/components/site-footer"
import MainHeader from "@/components/main-header"

export default function PrivacyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const lastUpdated = "May 1, 2025"

  const sections = [
    {
      id: "overview",
      label: "Overview",
      icon: Shield,
      content: (
        <div className="space-y-6">
          <p>
            At EnglishMastery, we take your privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you visit our website and use our English learning platform.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing and using our platform, you acknowledge that you
            have read, understood, and agree to be bound by all terms of this Privacy Policy. If you do not agree with
            our policies and practices, please do not use our platform.
          </p>
          <p>
            We may change our Privacy Policy from time to time. We encourage you to review the Privacy Policy whenever
            you access the platform to stay informed about our information practices and your choices.
          </p>
        </div>
      ),
    },
    {
      id: "collection",
      label: "Information Collection",
      icon: Database,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Information We Collect</h3>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Personal Information</h4>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Register for an account</li>
              <li>Complete your profile</li>
              <li>Subscribe to our services</li>
              <li>Participate in challenges and community activities</li>
              <li>Contact our support team</li>
              <li>Respond to surveys or promotions</li>
            </ul>
            <p>
              This information may include your name, email address, phone number, billing information, educational
              background, language proficiency, and learning goals.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Content and Learning Data</h4>
            <p>As you use our platform, we collect data related to your learning activities, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your responses to challenges (text, audio, and video submissions)</li>
              <li>Assessment results and feedback</li>
              <li>Progress tracking data</li>
              <li>Community contributions and interactions</li>
              <li>Time spent on different activities</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Automatically Collected Information</h4>
            <p>
              When you access our platform, we automatically collect certain information about your device and usage,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (browser type, operating system, device type)</li>
              <li>IP address and location information</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Referral sources</li>
              <li>Performance data and error logs</li>
            </ul>
            <p>
              We use cookies and similar tracking technologies to collect this information. You can control cookies
              through your browser settings, but disabling cookies may limit your ability to use certain features of our
              platform.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "usage",
      label: "Information Usage",
      icon: User,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">How We Use Your Information</h3>

          <p>We use the information we collect for various purposes, including:</p>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Providing and Improving Our Services</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delivering personalized learning experiences</li>
              <li>Processing and evaluating your challenge submissions</li>
              <li>Providing feedback and progress tracking</li>
              <li>Facilitating community interactions</li>
              <li>Managing your account and subscription</li>
              <li>Improving our platform's features and content</li>
              <li>Developing new products and services</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Communication</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sending important notices about your account or subscription</li>
              <li>Providing technical support and responding to inquiries</li>
              <li>Sending updates about new features or content</li>
              <li>Delivering newsletters, promotional materials, or educational resources (if you've opted in)</li>
              <li>Conducting surveys and collecting feedback</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Research and Analytics</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyzing usage patterns to improve user experience</li>
              <li>Conducting research on language learning effectiveness</li>
              <li>Generating aggregated, anonymized insights about learning behaviors</li>
              <li>Monitoring and enhancing platform performance</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Legal and Security Purposes</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Protecting our rights, privacy, safety, and property</li>
              <li>Detecting and preventing fraudulent or unauthorized activities</li>
              <li>Enforcing our Terms of Service and other agreements</li>
              <li>Complying with legal obligations and responding to legal requests</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "sharing",
      label: "Information Sharing",
      icon: Globe,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">How We Share Your Information</h3>

          <p>We may share your information in the following circumstances:</p>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">With Other Users</h4>
            <p>When you participate in community features, certain information may be visible to other users:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your profile information (name, photo, bio, language level)</li>
              <li>Content you post in community discussions</li>
              <li>Challenge responses you choose to share publicly</li>
              <li>Comments and feedback you provide to others</li>
            </ul>
            <p>You can control some of this sharing through your privacy settings.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">With Service Providers</h4>
            <p>We work with third-party service providers who perform services on our behalf, such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cloud hosting and storage providers</li>
              <li>Payment processors</li>
              <li>Analytics services</li>
              <li>Customer support tools</li>
              <li>Email and communication services</li>
              <li>AI and machine learning services for content evaluation</li>
            </ul>
            <p>
              These service providers are only authorized to use your information as necessary to provide services to us
              and are required to maintain the confidentiality and security of your data.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">For Business Transfers</h4>
            <p>
              If EnglishMastery is involved in a merger, acquisition, or sale of all or a portion of its assets, your
              information may be transferred as part of that transaction. We will notify you via email and/or a
              prominent notice on our platform of any change in ownership or uses of your information.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">For Legal Reasons</h4>
            <p>
              We may disclose your information if required to do so by law or in response to valid requests by public
              authorities (e.g., a court or government agency). We may also disclose your information to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enforce our Terms of Service and other agreements</li>
              <li>Protect and defend our rights or property</li>
              <li>Prevent or investigate possible wrongdoing in connection with our platform</li>
              <li>Protect the personal safety of our users or the public</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">With Your Consent</h4>
            <p>
              We may share your information with third parties when you have given us your consent to do so. For
              example, if you choose to participate in promotional activities or research studies conducted with
              partners.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      label: "Data Security",
      icon: Lock,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">How We Protect Your Information</h3>

          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal
            information. However, please understand that no method of transmission over the Internet or method of
            electronic storage is 100% secure.
          </p>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Security Measures</h4>
            <p>Our security practices include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Monitoring for suspicious activities</li>
              <li>Regular security training for our team</li>
              <li>Data minimization and retention policies</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Data Retention</h4>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is required or permitted by law. When determining how
              long to keep your data, we consider:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>How long we need the information to provide our services</li>
              <li>Whether you have an active account or subscription</li>
              <li>Whether the information is sensitive</li>
              <li>Our legal obligations</li>
            </ul>
            <p>When we no longer need your personal information, we will securely delete or anonymize it.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Your Responsibilities</h4>
            <p>
              While we work hard to protect your information, the security of your account also depends on you. We
              recommend that you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use a strong, unique password for your EnglishMastery account</li>
              <li>Never share your account credentials with others</li>
              <li>Log out of your account when using shared devices</li>
              <li>Keep your contact information up to date</li>
              <li>Report any suspicious activities related to your account</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "rights",
      label: "Your Rights",
      icon: User,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Your Privacy Rights</h3>

          <p>
            Depending on your location, you may have certain rights regarding your personal information. These may
            include:
          </p>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Access and Information</h4>
            <p>
              You have the right to access the personal information we hold about you and to receive information about
              how we use and share it.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Correction</h4>
            <p>
              You have the right to request that we correct inaccurate or incomplete personal information about you.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Deletion</h4>
            <p>
              You have the right to request that we delete your personal information in certain circumstances, such as
              when it is no longer necessary for the purposes for which it was collected.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Restriction and Objection</h4>
            <p>
              You have the right to request that we restrict the processing of your personal information or to object to
              our processing of your personal information in certain circumstances.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Data Portability</h4>
            <p>
              You have the right to receive your personal information in a structured, commonly used, and
              machine-readable format and to transmit that information to another controller.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Consent Withdrawal</h4>
            <p>
              If we process your personal information based on your consent, you have the right to withdraw your consent
              at any time. This will not affect the lawfulness of processing based on your consent before its
              withdrawal.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">How to Exercise Your Rights</h4>
            <p>
              You can exercise many of these rights directly through your account settings. For other requests, please
              contact us at privacy@englishmastery.com. We will respond to your request within the timeframe required by
              applicable law.
            </p>
            <p>
              Please note that we may need to verify your identity before processing your request, and in some cases, we
              may need to keep certain information for legitimate business or legal purposes.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "updates",
      label: "Policy Updates",
      icon: Clock,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4">Changes to This Privacy Policy</h3>

          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal
            requirements, and other factors. When we make changes, we will update the "Last Updated" date at the top of
            this policy and take other appropriate steps to notify you.
          </p>

          <p>
            We encourage you to periodically review this page for the latest information on our privacy practices. Your
            continued use of our platform after any changes to this Privacy Policy constitutes your acceptance of the
            updated policy.
          </p>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Notification of Changes</h4>
            <p>
              For significant changes to this Privacy Policy, we will provide a more prominent notice, which may
              include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email notifications to registered users</li>
              <li>Notifications within the platform</li>
              <li>Temporary banners or pop-ups on our website</li>
            </ul>
          </div>

          <div className="space-y-4 mt-8">
            <h4 className="text-lg font-medium">Contact Us</h4>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices,
              please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2">
              <p className="font-medium">EnglishMastery Privacy Team</p>
              <p>Email: privacy@englishmastery.com</p>
              <p>Address: 123 Learning Street, San Francisco, CA 94103, United States</p>
              <p>Phone: +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1">
        <PageHeader title="Privacy Policy" description={`Last updated: ${lastUpdated}`} />

        <section className="container py-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-neo-mint dark:text-purist-blue" />
                </div>
                <h2 className="text-xl font-semibold">Our Commitment to Privacy</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                At EnglishMastery, we value your privacy and are committed to protecting your personal information. This
                Privacy Policy explains how we collect, use, and safeguard your data when you use our platform. We've
                designed this policy to be clear and straightforward, but if you have any questions, please don't
                hesitate to contact us.
              </p>
            </div>

            <Tabs defaultValue="overview" className="mb-12">
              <TabsList className="flex flex-wrap justify-start mb-8 gap-2">
                {sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                    <section.icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {sections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                  >
                    {section.content}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                By using EnglishMastery, you agree to the terms outlined in this Privacy Policy.
              </p>
              <Button variant="outline" size="lg" asChild>
                <a href="/contact">Contact Our Privacy Team</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
