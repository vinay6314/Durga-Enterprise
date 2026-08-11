import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Welcome / Root Landing Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Durga Enterprise — Mini ERP + CRM Operations Portal',
    version: '1.0.0',
    repository: 'https://github.com/vinay6314/Durga-Enterprise.git',
    endpoints: {
      health: '/health',
      apiBase: '/api',
      authLogin: '/api/auth/login',
      customers: '/api/customers',
      products: '/api/products',
      salesChallans: '/api/challans',
    },
    timestamp: new Date(),
  });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Durga Enterprise Operations API', timestamp: new Date() });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Durga Enterprise Backend running on http://localhost:${config.port}`);
});
