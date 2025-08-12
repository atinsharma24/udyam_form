'use client';

import { motion } from 'framer-motion';

export const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center p-4"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Processing...</span>
  </motion.div>
);

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 border-l-4 border-red-500 p-4 mb-4"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-700 hover:text-red-600 underline focus:outline-none"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export const SuccessMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-green-50 border-l-4 border-green-500 p-4 mb-4"
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-green-700">{message}</p>
      </div>
    </div>
  </motion.div>
);
