'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';

const PricingCard = ({ title, price, period, description, features, isPopular, buttonText, buttonLink }) => (
  <Card className={`relative ${isPopular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
          Most Popular
        </span>
      </div>
    )}
    <CardContent className="p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        {period && <span className="text-gray-600">/{period}</span>}
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={buttonLink} className="block">
        <Button
          variant={isPopular ? 'primary' : 'outline'}
          size="lg"
          className="w-full"
        >
          {buttonText}
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export default function PricingPage() {
  const plans = [
    {
      title: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with smart studying',
      features: [
        'Up to 3 subjects',
        'Basic study planner',
        'Progress tracking',
        '5 quizzes per month',
        'Limited AI recommendations',
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/register',
    },
    {
      title: 'Pro',
      price: '$9.99',
      period: 'month',
      description: 'Unlock your full learning potential',
      features: [
        'Unlimited subjects',
        'Advanced AI study planner',
        'Detailed analytics dashboard',
        'Unlimited quizzes',
        'Personalized AI recommendations',
        'Flashcards with spaced repetition',
        'Priority support',
      ],
      isPopular: true,
      buttonText: 'Start Pro Trial',
      buttonLink: '/register?plan=pro',
    },
    {
      title: 'Mentor',
      price: '$19.99',
      period: 'month',
      description: 'For teachers and tutors who want to help students excel',
      features: [
        'Everything in Pro',
        'Manage up to 50 students',
        'Create custom quizzes',
        'Student progress reports',
        'Announcement system',
        'Dedicated mentor dashboard',
        'Premium support',
      ],
      buttonText: 'Become a Mentor',
      buttonLink: '/register?role=mentor',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar currentPage="pricing" />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your learning journey. Start free and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PricingCard key={index} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
              },
              {
                q: 'Is there a free trial for Pro?',
                a: "Absolutely! Pro comes with a 14-day free trial. No credit card required to start.",
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and support for local payment methods in select regions.',
              },
              {
                q: 'Can I cancel anytime?',
                a: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
              },
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already achieving their goals with StudyFlow AI.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              </div>
              <span className="text-white font-semibold">StudyFlow AI</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © {new Date().getFullYear()} StudyFlow AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
