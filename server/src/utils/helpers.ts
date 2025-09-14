import jwt from 'jsonwebtoken';
import { Request } from 'express';

// Generate JWT token
export const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      userId,
      email,
      role
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRE || '24h',
      issuer: 'college-lab-system',
      audience: 'lab-users'
    }
  );
};

// Generate DOB verification token (shorter expiry)
export const verifyDobToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      userId,
      email,
      type: 'dob_verification'
    },
    jwtSecret,
    {
      expiresIn: '10m', // 10 minutes only
      issuer: 'college-lab-system',
      audience: 'password-reset'
    }
  );
};

// Get client IP address
export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const realIP = req.headers['x-real-ip'] as string;
  const remoteAddr = req.connection.remoteAddress;
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return remoteAddr || 'unknown';
};

// Validate machine ID format
export const isValidMachineId = (machineId: string): boolean => {
  if (!machineId || typeof machineId !== 'string') {
    return false;
  }
  
  // Machine ID should be a hex string or UUID-like format
  const machineIdRegex = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i;
  const hexRegex = /^[a-f0-9]{32,}$/i;
  
  return machineIdRegex.test(machineId) || hexRegex.test(machineId);
};

// Format duration in seconds to human readable
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 255); // Limit length
};

// Generate random password
export const generateRandomPassword = (length: number = 8): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

// Check if date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Get date range for period
export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;
  
  switch (period.toLowerCase()) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  return { startDate, endDate };
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate roll number format
export const isValidRollNumber = (rollNo: string): boolean => {
  const rollNoRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/;
  return rollNoRegex.test(rollNo.toUpperCase());
};

// Convert bytes to human readable format
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
