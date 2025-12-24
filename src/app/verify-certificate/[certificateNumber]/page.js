'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award } from 'lucide-react';

export default function VerifyCertificate({ params }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/verify-certificate/${params.certificateNumber}`);
      const data = await res.json();
      
      if (res.ok) {
        setCertificate(data.certificate);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verification</h1>
            <p className="text-gray-600">Rwanda Wisdom Management System</p>
          </div>

          {error ? (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">Certificate Not Found</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-600 mb-6">Valid Certificate</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <div className="flex items-center mb-4">
                  <Award className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Certificate Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Recipient:</span>
                    <span className="ml-2 text-gray-900">{certificate?.user?.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Certificate Number:</span>
                    <span className="ml-2 text-gray-900">{certificate?.certificateNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Score:</span>
                    <span className="ml-2 text-gray-900">
                      {certificate?.quizAttempt?.score}/{certificate?.quizAttempt?.totalQuestions} 
                      ({certificate?.quizAttempt?.percentage?.toFixed(1)}%)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date Issued:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(certificate?.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Achievement:</span>
                    <span className="ml-2 text-gray-900">
                      Rwandan Wisdom Knowledge Quiz Completion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}