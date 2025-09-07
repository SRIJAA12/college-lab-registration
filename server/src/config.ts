import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  port: process.env.PORT || 5000,
};
