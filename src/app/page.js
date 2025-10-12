// src/app/page.js
import Link from 'next/link';
import { BookOpen, Users, Globe, Heart, TrendingUp, Award, Sparkles, ArrowRight } from 'lucide-react';
import PollWidget from '@/components/PollWidget';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Digital Wisdom Library',
      description: 'Access thousands of traditional stories, proverbs, and advice from community elders',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect generations through shared cultural knowledge and experiences',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Content available in Kinyarwanda, English, and French',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      icon: Heart,
      title: 'Preserve Culture',
      description: 'Help preserve African traditional knowledge for future generations',
      color: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      icon: TrendingUp,
      title: 'Interactive Learning',
      description: 'Engage with content through comments, likes, and bookmarks',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    },
    {
      icon: Award,
      title: 'Elder Recognition',
      description: 'Honor and celebrate knowledge keepers in our communities',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    }
  ];

  const categories = [
    { name: 'Marriage Guidance', icon: '💑', gradient: 'from-pink-500 to-rose-500' },
    { name: 'Agriculture', icon: '🌾', gradient: 'from-green-500 to-emerald-500' },
    { name: 'Conflict Resolution', icon: '🤝', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'Health & Wellness', icon: '🏥', gradient: 'from-red-500 to-orange-500' },
    { name: 'Moral Conduct', icon: '⚖️', gradient: 'from-purple-500 to-violet-500' },
    { name: 'Traditional Ceremonies', icon: '🎭', gradient: 'from-amber-500 to-yellow-500' },
    { name: 'Proverbs', icon: '💭', gradient: 'from-indigo-500 to-blue-500' },
    { name: 'Stories', icon: '📖', gradient: 'from-teal-500 to-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Sparkles className="w-4 h-4" />
                Preserving Our Heritage
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Umurage
                <span className="block text-green-600">Wubwenge</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
                Community Wisdom Management System
              </p>
              <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0">
                Preserving traditional African knowledge and wisdom for future generations. 
                Connect with elders, share stories, and keep our cultural heritage alive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/wisdom"
                  className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Explore Wisdom
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/register"
                  className="bg-white hover:bg-gray-50 text-green-600 px-8 py-4 rounded-xl font-semibold border-2 border-green-600 transition-all hover:shadow-lg"
                >
                  Join Community
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-green-600">1000+</p>
                  <p className="text-sm text-gray-600">Wisdom Entries</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">500+</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600">50+</p>
                  <p className="text-sm text-gray-600">Elders</p>
                </div>
              </div>
            </div>

            {/* Right Content - Poll Widget */}
            <div className="lg:pl-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Community Poll</h3>
                    <p className="text-sm text-gray-600">Share your voice</p>
                  </div>
                </div>
                <PollWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Umurage Wubwenge?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A digital platform bridging generations and preserving cultural wisdom
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-1"
                >
                  <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <BookOpen className="w-4 h-4" />
              Knowledge Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600">
              Discover wisdom across different aspects of traditional life
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/wisdom?category=${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-green-50 p-8 rounded-2xl text-center shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Users className="w-4 h-4" />
            Join the Movement
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Our Community Today
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Be part of preserving and sharing traditional wisdom. 
            Start exploring, contributing, and connecting with your cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="group bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="bg-green-800 hover:bg-green-900 text-white px-8 py-4 rounded-xl font-semibold transition-all border-2 border-white/20 hover:border-white/40"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>
      </section>

      {/* Testimonials / Community Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Heart className="w-4 h-4" />
              Community Impact
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Communities
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100">
              <div className="text-5xl font-bold text-green-600 mb-2">1000+</div>
              <p className="text-gray-700 font-semibold mb-2">Wisdom Entries</p>
              <p className="text-gray-600 text-sm">Stories, proverbs, and advice preserved for generations</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg border border-blue-100">
              <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-700 font-semibold mb-2">Community Members</p>
              <p className="text-gray-600 text-sm">Active users sharing and learning together</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl shadow-lg border border-purple-100">
              <div className="text-5xl font-bold text-purple-600 mb-2">50+</div>
              <p className="text-gray-700 font-semibold mb-2">Elder Contributors</p>
              <p className="text-gray-600 text-sm">Knowledge keepers honored and recognized</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}