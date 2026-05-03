import { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload extends JwtPayload {
  id: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export {};