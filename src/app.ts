import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { AuthRoutes } from './modules/Auth/auth.route';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cors());

// application routes
// app.use('/api/v1', router);

// Routes
app.use('/api/auth', AuthRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('MediStore server is running!');
});

export default app;
