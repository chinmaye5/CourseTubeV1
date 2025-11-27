'use client';

import React from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import {
  Play,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#1c1d1f]">
      {/* Navigation */}
      <header className="bg-[#2d2f31] border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="CourseTube Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">CourseTube</span>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Log in
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
                >
                  Sign up
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                >
                  My Courses
                </Link>
                <Link
                  href="/courses"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg font-semibold"
                >
                  Course Player
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9 border-2 border-purple-500"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20"></div>

        <div className="container mx-auto px-6 py-24 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full mb-8 font-medium text-sm backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Transform YouTube into Your Classroom
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Learn Smarter with
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                YouTube Courses
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Track your progress, navigate chapters effortlessly, and turn any YouTube video into a structured learning experience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/courses"
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 font-semibold text-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Learning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-[#2d2f31] border border-gray-700 text-white rounded-xl hover:bg-gray-800 hover:border-purple-500 transition-all font-semibold text-lg"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-gray-400">Free Forever</div>
              </div>
              <div className="text-center border-x border-gray-700">
                <div className="text-3xl font-bold text-white mb-2">∞</div>
                <div className="text-sm text-gray-400">Unlimited Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-gray-400">Access Anytime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Learn
          </h2>
          <p className="text-xl text-gray-400">
            Powerful features to enhance your learning experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-purple-500 transition-all hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Progress Tracking</h3>
            <p className="text-gray-400 leading-relaxed">
              Automatically track your learning progress with chapter completion detection and persistent storage across sessions.
            </p>
            <div className="mt-6 flex items-center gap-2 text-purple-400 font-semibold">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Chapter Navigation</h3>
            <p className="text-gray-400 leading-relaxed">
              Jump between chapters instantly with intelligent timestamp mapping and seamless YouTube integration.
            </p>
            <div className="mt-6 flex items-center gap-2 text-blue-400 font-semibold">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-green-500 transition-all hover:shadow-2xl hover:shadow-green-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Smart Learning</h3>
            <p className="text-gray-400 leading-relaxed">
              AI-powered chapter extraction and personalized learning paths to help you master any subject faster.
            </p>
            <div className="mt-6 flex items-center gap-2 text-green-400 font-semibold">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-yellow-500 transition-all hover:shadow-2xl hover:shadow-yellow-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Resume Anytime</h3>
            <p className="text-gray-400 leading-relaxed">
              Pick up exactly where you left off with automatic progress saving and cross-device synchronization.
            </p>
            <div className="mt-6 flex items-center gap-2 text-yellow-400 font-semibold">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-green-500 transition-all hover:shadow-2xl hover:shadow-green-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Smart Notes</h3>
            <p className="text-gray-400 leading-relaxed">
              Capture insights, timestamped notes, and key takeaways while you watch. Your notes automatically sync with video chapters for contextual learning.
            </p>
            <div className="mt-6 flex items-center gap-2 text-green-400 font-semibold">
              <span>Start noting</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 bg-[#2d2f31] rounded-2xl border border-gray-700 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Analytics Dashboard</h3>
            <p className="text-gray-400 leading-relaxed">
              Visualize your learning journey with comprehensive stats, charts, and insights about your progress.
            </p>
            <div className="mt-6 flex items-center gap-2 text-indigo-400 font-semibold">
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center overflow-hidden shadow-2xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of learners who are already using CourseTube to achieve their goals.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-2xl font-bold text-lg"
            >
              <Play className="w-5 h-5 text-black" />
              <h1 className='text-black'>Get Started Free</h1>
              <ArrowRight className="w-5 h-5 text-black" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-[#2d2f31] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="CourseTube Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">CourseTube</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">© 2025 CourseTube. All rights reserved.</p>
              <p className="text-sm text-gray-500">Chinmaye HG</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}