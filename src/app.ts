import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';
import { CategoryRoutes } from './modules/Category/category.route';
import { MedicineRoutes } from './modules/Medicine/medicine.route';
import { OrderRoutes } from './modules/Order/order.route';
import { SellerRoutes } from './modules/Seller/seller.route';
import { AdminRoutes } from './modules/Admin/admin.route';
import { ReviewsRoutes } from './modules/Reviews/reviews.route';
import { config } from './config/env';

const app: Application = express();

// parsers
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// application routes
// app.use('/api/v1', router);

// Routes
app.use('/api/auth', AuthRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/medicines', MedicineRoutes);
app.use('/api/orders', OrderRoutes);
app.use('/api/seller', SellerRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/reviews', ReviewsRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('MediStore server is running!');
});

// ── 404 handler for unknown routes ────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
