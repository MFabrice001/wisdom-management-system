'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, Shield, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('USER');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Check if user role matches selected role
        const response = await fetch('/api/user/check-role');
        const data = await response.json();
        
        if (selectedRole === 'ADMIN' && data.role !== 'ADMIN') {
          setError('You do not have admin privileges');
          await signIn('credentials', { redirect: false }); // Sign out
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/wisdom');
        }
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to access your wisdom library</p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">Select Login Type</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole('USER')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'USER'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-300 hover:border-green-300'
              }`}
            >
              <UserIcon className={`w-8 h-8 mx-auto mb-2 ${
                selectedRole === 'USER' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                selectedRole === 'USER' ? 'text-green-600' : 'text-gray-600'
              }`}>
                User Login
              </p>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedRole === 'ADMIN'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <Shield className={`w-8 h-8 mx-auto mb-2 ${
                selectedRole === 'ADMIN' ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <p className={`text-sm font-medium ${
                selectedRole === 'ADMIN' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Admin Login
              </p>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black placeholder-gray-400"
                  placeholder="john@example.com"
                  disabled={loading}
                  style={{ color: 'black' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-black placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={loading}
                  style={{ color: 'black', WebkitTextFillColor: 'black' }}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                selectedRole === 'ADMIN'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
              } text-white`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  {selectedRole === 'ADMIN' ? <Shield className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'User'}</span>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}