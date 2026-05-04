import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';
import { CategoryRoutes } from './modules/Category/category.route';
import { MedicineRoutes } from './modules/Medicine/medicine.route';
import { OrderRoutes } from './modules/Order/order.route';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
// app.use('/api/v1', router);

// Routes
app.use('/api/auth', AuthRoutes);
app.use('/api/categories', CategoryRoutes);
app.use('/api/medicines', MedicineRoutes);
app.use('/api/orders', OrderRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('MediStore server is running!');
});

export default app;
