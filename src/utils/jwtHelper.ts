import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../configs/config';

export class JwtHelper {
  static verifyToken(token: string): { user_id: Number } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY) as { user_id: Number };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}