import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Umurage Wubwenge</h3>
            <p className="text-gray-400 mb-4">
              Preserving traditional African knowledge and wisdom for future generations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/wisdom" className="text-gray-400 hover:text-white transition-colors">
                  Wisdom Library
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/wisdom?category=proverbs" className="text-gray-400 hover:text-white transition-colors">
                  Proverbs
                </Link>
              </li>
              <li>
                <Link href="/wisdom?category=stories" className="text-gray-400 hover:text-white transition-colors">
                  Stories
                </Link>
              </li>
              <li>
                <Link href="/wisdom?category=marriage" className="text-gray-400 hover:text-white transition-colors">
                  Marriage Guidance
                </Link>
              </li>
              <li>
                <Link href="/wisdom?category=agriculture" className="text-gray-400 hover:text-white transition-colors">
                  Agriculture
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Kigali, Rwanda</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-400">
                <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>info@umurage.rw</span>
              </li>
              <li className="flex items-start space-x-2 text-gray-400">
                <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>+250 788 123 456</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Umurage Wubwenge. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Built with ❤️ for preserving African cultural heritage
          </p>
        </div>
      </div>
    </footer>
  );
}