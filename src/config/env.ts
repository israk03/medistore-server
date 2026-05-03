import 'dotenv/config';

const requiredEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val.trim();
};

const port = Number(process.env.PORT);

export const config = Object.freeze({
  port: Number.isNaN(port) ? 5000 : port,
  jwtSecret: requiredEnv('JWT_SECRET'),
  databaseUrl: requiredEnv('DATABASE_URL'),
  nodeEnv:
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development',
});