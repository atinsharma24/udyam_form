import express from 'express';
import { PrismaClient } from '@prisma/client';
import { AadhaarSchema, PANSchema, OTPSchema, Step1Schema, Step2Schema, RegistrationSchema } from '../validation/schemas';

const router = express.Router();
const prisma = new PrismaClient();

// Validate Step 1 (Aadhaar + OTP)
router.post('/validate-step1', async (req, res) => {
  try {
    const validatedData = Step1Schema.parse(req.body);
    
    // Check if Aadhaar already exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { aadhaar: validatedData.aadhaar }
    });

    if (existingRegistration) {
      return res.status(400).json({
        error: 'Aadhaar number already registered'
      });
    }

    // In a real implementation, you would verify the OTP here
    // For now, we'll just validate the format
    res.json({
      success: true,
      message: 'Step 1 validation successful'
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Step 1 validation error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Validate Step 2 (PAN)
router.post('/validate-step2', async (req, res) => {
  try {
    const validatedData = Step2Schema.parse(req.body);
    
    // Check if PAN already exists
    const existingRegistration = await prisma.registration.findUnique({
      where: { pan: validatedData.pan }
    });

    if (existingRegistration) {
      return res.status(400).json({
        error: 'PAN number already registered'
      });
    }

    res.json({
      success: true,
      message: 'Step 2 validation successful'
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Step 2 validation error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Submit complete registration
router.post('/submit', async (req, res) => {
  try {
    const validatedData = RegistrationSchema.parse(req.body);
    
    // Check for existing registrations
    const [existingAadhaar, existingPAN] = await Promise.all([
      prisma.registration.findUnique({ where: { aadhaar: validatedData.aadhaar } }),
      prisma.registration.findUnique({ where: { pan: validatedData.pan } })
    ]);

    if (existingAadhaar) {
      return res.status(400).json({
        error: 'Aadhaar number already registered'
      });
    }

    if (existingPAN) {
      return res.status(400).json({
        error: 'PAN number already registered'
      });
    }

    // Create new registration
    const registration = await prisma.registration.create({
      data: {
        aadhaar: validatedData.aadhaar,
        pan: validatedData.pan
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      registrationId: registration.id
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Registration submission error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export { router as registrationRouter };