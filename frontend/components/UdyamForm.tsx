'use client';



import { useState } from 'react';
import { FormValues } from '@/types/form';

interface Props {
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export default function UdyamForm({ onSubmit, isSubmitting = false }: Props) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<FormValues>({
    aadhaar: '',
    otp: '',
    pan: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidatingStep, setIsValidatingStep] = useState(false);

  // Validation patterns from our schema
  const patterns = {
    aadhaar: /^\d{12}$/,
    otp: /^\d{6}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  };

  // Error messages
  const errorMessages = {
    aadhaar: {
      required: 'Aadhaar number is required',
      pattern: 'Please enter a valid 12-digit Aadhaar number',
    },
    otp: {
      required: 'OTP is required',
      pattern: 'Please enter a valid 6-digit OTP',
    },
    pan: {
      required: 'PAN number is required',
      pattern: 'Please enter a valid PAN number',
    },
  };

  const handleChange = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [field]: field === 'pan' ? e.target.value.toUpperCase() : e.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.aadhaar) {
      newErrors.aadhaar = errorMessages.aadhaar.required;
    } else if (!patterns.aadhaar.test(values.aadhaar)) {
      newErrors.aadhaar = errorMessages.aadhaar.pattern;
    }
    
    if (!values.otp) {
      newErrors.otp = errorMessages.otp.required;
    } else if (!patterns.otp.test(values.otp)) {
      newErrors.otp = errorMessages.otp.pattern;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return false;
    
    // Validate with backend
    setIsValidatingStep(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/validate-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaar: values.aadhaar,
          otp: values.otp
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setErrors({ general: result.error || 'Validation failed' });
        return false;
      }
      
      return true;
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      return false;
    } finally {
      setIsValidatingStep(false);
    }
  };

  const validateStep2 = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.pan) {
      newErrors.pan = errorMessages.pan.required;
    } else if (!patterns.pan.test(values.pan)) {
      newErrors.pan = errorMessages.pan.pattern;
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return false;
    
    // Validate with backend
    setIsValidatingStep(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/validate-step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan: values.pan })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setErrors({ general: result.error || 'Validation failed' });
        return false;
      }
      
      return true;
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      return false;
    } finally {
      setIsValidatingStep(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await validateStep1();
      if (isValid) {
        setStep(2);
        setErrors({});
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateStep2();
    if (isValid) {
      await onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6">
      {/* Progress tracker */}
      <div className="flex items-center justify-center mb-8">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>

      {/* Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Aadhaar Verification</h3>
          
          <div>
            <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number *
            </label>
            <input
              type="text"
              id="aadhaar"
              value={values.aadhaar}
              onChange={handleChange('aadhaar')}
              maxLength={12}
              placeholder="Enter 12-digit Aadhaar number"
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${
                errors.aadhaar ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.aadhaar && (
              <p className="text-sm text-red-600 mt-1">{errors.aadhaar}</p>
            )}
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              OTP *
            </label>
            <input
              type="text"
              id="otp"
              value={values.otp}
              onChange={handleChange('otp')}
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${
                errors.otp ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.otp && (
              <p className="text-sm text-red-600 mt-1">{errors.otp}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isValidatingStep}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidatingStep ? 'Validating...' : 'Next'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 2: PAN Details</h3>
          
          <div>
            <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number *
            </label>
            <input
              type="text"
              id="pan"
              value={values.pan}
              onChange={handleChange('pan')}
              maxLength={10}
              placeholder="Enter PAN number (e.g., ABCDE1234F)"
              className={`mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 ${
                errors.pan ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.pan && (
              <p className="text-sm text-red-600 mt-1">{errors.pan}</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
              disabled={isValidatingStep || isSubmitting}
              className="w-1/2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isValidatingStep || isSubmitting}
              className="w-1/2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidatingStep ? 'Validating...' : isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
