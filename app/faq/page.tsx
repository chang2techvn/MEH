"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PageHeader from "@/components/ui/page-header"
import SiteFooter from "@/components/ui/site-footer"
import MainHeader from "@/components/ui/main-header"

export default function FAQPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const faqCategories = [
    {
      id: "general",
      label: "General",
      faqs: [
        {
          question: "What is EnglishMastery?",
          answer:
            "EnglishMastery is an innovative online platform designed to help learners master English through our unique 4-Skill Video Crucible methodology. Our approach integrates listening, speaking, reading, and writing practice through engaging video-based challenges and a supportive community environment.",
        },
        {
          question: "How is EnglishMastery different from other language learning platforms?",
          answer:
            "Unlike traditional language learning apps that focus on vocabulary and grammar in isolation, EnglishMastery provides a comprehensive approach that develops all four language skills simultaneously. Our video-based challenges simulate real-world language use, and our AI-powered feedback system gives personalized guidance on your speaking and writing. Additionally, our community features allow you to practice with other learners and receive peer feedback.",
        },
        {
          question: "Who can benefit from using EnglishMastery?",
          answer:
            "EnglishMastery is designed for intermediate to advanced English learners who want to improve their practical language skills. It's particularly beneficial for professionals who need English for work, students preparing for exams like IELTS or TOEFL, and anyone looking to gain confidence in real-world English communication.",
        },
        {
          question: "Is EnglishMastery available on mobile devices?",
          answer:
            "Yes, EnglishMastery is fully responsive and works on smartphones, tablets, and desktop computers. While we don't currently have native mobile apps, our web application is optimized for mobile use, allowing you to practice your English skills anytime, anywhere.",
        },
        {
          question: "Do I need any special equipment to use EnglishMastery?",
          answer:
            "You'll need a device with internet access, a microphone for speaking exercises, and speakers or headphones for listening activities. A webcam is optional but can enhance your experience for certain interactive features. Most modern smartphones, tablets, and computers already have these capabilities built-in.",
        },
      ],
    },
    {
      id: "account",
      label: "Account & Subscription",
      faqs: [
        {
          question: "How do I create an account?",
          answer:
            "Creating an account is simple. Click on the 'Register' button in the top right corner of the homepage, fill in your details, and verify your email address. You can then set up your profile and start exploring the platform.",
        },
        {
          question: "What subscription plans do you offer?",
          answer:
            "We offer several subscription tiers to meet different needs and budgets. Our Basic plan provides access to core features, while our Premium plan includes advanced AI feedback, unlimited challenge attempts, and priority support. We also offer special rates for students and educational institutions. Visit our Pricing page for current plans and pricing details.",
        },
        {
          question: "Can I cancel my subscription at any time?",
          answer:
            "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. We don't offer refunds for partial subscription periods, but you're welcome to use the platform until your subscription expires.",
        },
        {
          question: "Is there a free trial available?",
          answer:
            "Yes, we offer a 7-day free trial of our Premium features for new users. This gives you full access to all platform features so you can experience the benefits before committing to a subscription. No credit card is required to start your free trial.",
        },
        {
          question: "How can I update my payment information?",
          answer:
            "You can update your payment information in the 'Billing' section of your account settings. We accept major credit cards and PayPal for subscription payments.",
        },
      ],
    },
    {
      id: "challenges",
      label: "Video Challenges",
      faqs: [
        {
          question: "How do the video challenges work?",
          answer:
            "Our video challenges are based on authentic content and follow a structured approach. First, you watch a video and complete listening comprehension activities. Then, you record your spoken response to questions about the video. Next, you read related materials and write a response. Finally, you receive AI feedback on your performance and can compare your answers with model responses.",
        },
        {
          question: "How often are new challenges added?",
          answer:
            "We add new video challenges weekly, covering a variety of topics, difficulty levels, and English varieties (American, British, Australian, etc.). Premium subscribers get early access to new challenges.",
        },
        {
          question: "Can I retry challenges I've already completed?",
          answer:
            "Yes, you can retry challenges as many times as you want to track your improvement over time. Premium subscribers have unlimited attempts, while Basic subscribers have a limited number of attempts per challenge.",
        },
        {
          question: "How is my performance evaluated?",
          answer:
            "Your performance is evaluated through a combination of AI analysis and, for some challenges, peer review. Our AI system assesses factors like pronunciation, grammar, vocabulary usage, and content relevance. You receive detailed feedback with specific suggestions for improvement.",
        },
        {
          question: "Are the videos suitable for all proficiency levels?",
          answer:
            "We offer challenges at different difficulty levels, from intermediate (B1) to advanced (C2). Each challenge is clearly labeled with its CEFR level, so you can choose content that matches your current abilities while gradually pushing yourself to improve.",
        },
      ],
    },
    {
      id: "community",
      label: "Community Features",
      faqs: [
        {
          question: "How can I interact with other learners?",
          answer:
            "Our community section offers several ways to interact: you can join discussion groups based on interests or learning goals, participate in forum discussions about language topics, share your challenge responses for peer feedback, and find language exchange partners for practice conversations.",
        },
        {
          question: "Are there any community guidelines I should follow?",
          answer:
            "Yes, we have community guidelines to ensure a respectful and supportive learning environment. These include being respectful to other learners, providing constructive feedback, not sharing inappropriate content, and respecting intellectual property rights. You can find our complete guidelines in the Community section.",
        },
        {
          question: "How can I find language exchange partners?",
          answer:
            "In the Community section, you can browse profiles of other learners who are interested in language exchange. You can filter by native language, learning goals, and availability. Once you find potential partners, you can send connection requests and arrange practice sessions.",
        },
        {
          question: "Can I create my own discussion groups?",
          answer:
            "Premium subscribers can create and moderate their own discussion groups around specific topics, interests, or learning goals. Basic subscribers can join existing groups but cannot create new ones.",
        },
        {
          question: "How do I report inappropriate content or behavior?",
          answer:
            "If you encounter content or behavior that violates our community guidelines, you can report it by clicking the 'Report' button available on posts, comments, and user profiles. Our moderation team reviews all reports and takes appropriate action.",
        },
      ],
    },
    {
      id: "technical",
      label: "Technical Support",
      faqs: [
        {
          question: "What should I do if videos won't play?",
          answer:
            "If videos aren't playing, first check your internet connection. Then try refreshing the page, clearing your browser cache, or using a different browser. Make sure your browser is updated to the latest version. If problems persist, check our system status page or contact support.",
        },
        {
          question: "How can I troubleshoot microphone issues?",
          answer:
            "If your microphone isn't working, first ensure it's properly connected and not muted. Check your browser settings to confirm that you've granted microphone permissions to EnglishMastery. Try using a different browser or device to isolate the issue. Our Help Center has a detailed guide on troubleshooting audio recording problems.",
        },
        {
          question: "Is my data secure on EnglishMastery?",
          answer:
            "Yes, we take data security seriously. We use industry-standard encryption for all data transmission and storage. Your personal information is never shared with third parties without your consent. You can review our complete Privacy Policy for more details on how we protect and use your data.",
        },
        {
          question: "Which browsers are supported?",
          answer:
            "EnglishMastery works best on recent versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for optimal performance and security.",
        },
        {
          question: "How can I contact technical support?",
          answer:
            "You can reach our technical support team through the Help Center or by emailing support@englishmastery.com. Premium subscribers have access to priority support with faster response times. Before contacting support, check our Help Center for solutions to common issues.",
        },
      ],
    },
  ]

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery
    ? faqCategories
        .map((category) => ({
          ...category,
          faqs: category.faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.faqs.length > 0)
    : faqCategories

  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1">
        <PageHeader
          title="Frequently Asked Questions"
          description="Find answers to common questions about EnglishMastery and how to make the most of our platform."
          centered
        />

        <section className="container py-8">
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for answers..."
                className="pl-10 py-6 text-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredFAQs.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue={filteredFAQs[0].id} className="mb-12">
                <TabsList className="flex flex-wrap justify-center mb-8">
                  {filteredFAQs.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="px-6">
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {filteredFAQs.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                      <Accordion type="single" collapsible className="space-y-4">
                        {category.faqs.map((faq, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <AccordionItem
                              value={`item-${index}`}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center text-left">
                                  <span className="font-medium text-lg">{faq.question}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                              </AccordionContent>
                            </AccordionItem>
                          </motion.div>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-12 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  We couldn't find any FAQs matching your search query.
                </p>
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear search
                </Button>
              </motion.div>
            </div>
          )}
        </section>

        <section className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 mt-12">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                If you couldn't find the answer you were looking for, our support team is ready to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-gradient-to-r from-neo-mint to-purist-blue hover:from-neo-mint/90 hover:to-purist-blue/90 text-white"
                  size="lg"
                  asChild
                >
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/help">Browse Help Center</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
