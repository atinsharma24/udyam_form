// Types for form fields and validation
export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  maxLength?: number;
  pattern?: string;
}

export interface ValidationRule {
  required: string;
  pattern: string;
  format: string;
}

export interface FormSchema {
  step1: FormField[];
  step2: FormField[];
  validation: {
    [key: string]: ValidationRule;
  };
}

// Form values interface
export interface FormValues {
  aadhaar: string;
  otp: string;
  pan: string;
}
