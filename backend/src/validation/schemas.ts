import { z } from 'zod';

// Validation schemas for form data
export const AadhaarSchema = z.string()
  .length(12, 'Aadhaar number must be exactly 12 digits')
  .regex(/^\d+$/, 'Aadhaar number must contain only digits');

export const PANSchema = z.string()
  .length(10, 'PAN must be exactly 10 characters')
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format');

export const OTPSchema = z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

// Combined schema for Step 1
export const Step1Schema = z.object({
  aadhaar: AadhaarSchema,
  otp: OTPSchema,
});

// Combined schema for Step 2
export const Step2Schema = z.object({
  pan: PANSchema,
});

// Full registration schema
export const RegistrationSchema = Step1Schema.merge(Step2Schema);
