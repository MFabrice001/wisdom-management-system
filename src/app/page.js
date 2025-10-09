// src/app/page.js
import Link from 'next/link';
import { BookOpen, Users, Globe, Heart, TrendingUp, Award } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Digital Wisdom Library',
      description: 'Access thousands of traditional stories, proverbs, and advice from community elders',
      color: 'bg-green-500'
    },
    {
      icon: Users,
      title: 'Community Engagement',
      description: 'Connect generations through shared cultural knowledge and experiences',
      color: 'bg-blue-500'
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'Content available in Kinyarwanda, English, and French',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Preserve Culture',
      description: 'Help preserve African traditional knowledge for future generations',
      color: 'bg-red-500'
    },
    {
      icon: TrendingUp,
      title: 'Interactive Learning',
      description: 'Engage with content through comments, likes, and bookmarks',
      color: 'bg-yellow-500'
    },
    {
      icon: Award,
      title: 'Elder Recognition',
      description: 'Honor and celebrate knowledge keepers in our communities',
      color: 'bg-indigo-500'
    }
  ];

  const categories = [
    'Marriage Guidance',
    'Agriculture',
    'Conflict Resolution',
    'Health & Wellness',
    'Moral Conduct',
    'Traditional Ceremonies',
    'Proverbs',
    'Stories'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Umurage Wubwenge
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4">
              Community Wisdom Management System
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Preserving traditional African knowledge and wisdom for future generations. 
              Connect with elders, share stories, and keep our cultural heritage alive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/wisdom"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              >
                Explore Wisdom
              </Link>
              <Link 
                href="/register"
                className="bg-white hover:bg-gray-50 text-green-600 px-8 py-3 rounded-lg font-semibold border-2 border-green-600 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore by Category
            </h2>
            <p className="text-xl text-gray-600">
              Discover wisdom across different aspects of traditional life
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/wisdom?category=${category.toLowerCase().replace(/ /g, '-')}`}
                className="bg-white hover:bg-green-50 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
              >
                <p className="font-semibold text-gray-800">{category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Community Today
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Be part of preserving and sharing traditional wisdom. 
            Start exploring, contributing, and connecting with your cultural heritage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="bg-white hover:bg-gray-100 text-green-600 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Create Account
            </Link>
            <Link 
              href="/login"
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">1000+</p>
              <p className="text-gray-600">Wisdom Entries</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">500+</p>
              <p className="text-gray-600">Community Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">50+</p>
              <p className="text-gray-600">Elder Contributors</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}