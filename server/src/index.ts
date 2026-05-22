import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import commodityRoutes from './routes/commodityRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import fieldReportRoutes from './routes/fieldReportRoutes';
import { aggregateApprovedFieldReports } from './controllers/fieldReportController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/commodities', commodityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/field-reports', fieldReportRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Agromonitor Jateng API is running',
    version: '1.0.0',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Schedule daily aggregation at 01:00 local time
  try {
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
