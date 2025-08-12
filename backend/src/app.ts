import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { registrationRouter } from './routes/registration';

const app = express();
const prisma = new PrismaClient();

// CORS configuration
app.use(cors({
  origin: [
    'https://udyam-form-81jfjj7i2-atinsharma24s-projects.vercel.app',
    'http://localhost:3000' // For local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api', registrationRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, prisma };
