import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import commodityRoutes from './routes/commodityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import fieldReportRoutes from './routes/fieldReportRoutes';
import profileRoutes from './routes/profileRoutes';
import authRoutes from './routes/authRoutes';
import { aggregateApprovedFieldReports } from './controllers/fieldReportController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api/commodities', commodityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/field-reports', fieldReportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Agromonitor Jateng API is running',
    version: '1.0.0',
  });
});

// JSON 404 fallback so clients never receive an HTML error page from API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// JSON error handler for malformed payloads and unexpected failures
app.use((error: unknown, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled API error:', error);
  if (res.headersSent) {
    return next(error as Error);
  }

  res.status(500).json({
    success: false,
    message: 'Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Run aggregation once at startup immediately, then schedule daily at 01:00 local time
  try {
    (async () => {
      try {
        console.log('Running aggregation job at startup');
        await aggregateApprovedFieldReports();
      } catch (e) {
        console.error('Startup aggregation failed', e);
      }
    })();

    const scheduleDailyAt = (hour: number, minute = 0) => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(hour, minute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const msUntilNext = next.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          console.log('Running scheduled aggregation job');
          await aggregateApprovedFieldReports();
        } catch (e) {
          console.error('Scheduled aggregation failed', e);
        }
        // after first run, run every 24h
        setInterval(async () => {
          try {
            console.log('Running scheduled aggregation job (interval)');
            await aggregateApprovedFieldReports();
          } catch (e) {
            console.error('Scheduled aggregation failed', e);
          }
        }, 24 * 60 * 60 * 1000);
      }, msUntilNext);
    };

    scheduleDailyAt(1, 0);
  } catch (e) {
    console.error('Failed to schedule daily aggregation', e);
  }
});
// Trigger nodemon reload

