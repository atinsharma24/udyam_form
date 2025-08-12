'use client';



import { useState } from 'react';
import dynamic from 'next/dynamic';

const UdyamForm = dynamic(() => import('@/components/UdyamForm'), { ssr: false });
import { FormValues } from '@/types/form';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    registrationId?: string;
  } | null>(null);

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: result.message,
          registrationId: result.registrationId
        });
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Registration failed'
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Udyam Registration Portal
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Register your MSME in just a few simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Complete registration in minutes with our streamlined process</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-500">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Secure & Safe</h3>
              <p className="text-gray-600">Your data is protected with industry-standard encryption</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get assistance anytime through our support channels</p>
            </div>
          </div>
        </div>
        
        {submitResult && (
          <div className={`mb-6 p-4 rounded-md ${
            submitResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{submitResult.message}</p>
            {submitResult.registrationId && (
              <p className="text-xs mt-1">Registration ID: {submitResult.registrationId}</p>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Begin Your Registration</h2>
          <UdyamForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </main>
  );
}
