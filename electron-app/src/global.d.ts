// src/global.d.ts
// Global type definitions for College Lab Registration System

// Make this file a module by adding export
export {};

// Declare global Window interface extensions
declare global {
  interface Window {
    electronAPI?: {
      // System Information Methods
      getMachineId: () => Promise<string>;
      getSystemInfo: () => Promise<SystemInfo>;
      
      // App Control Methods
      minimizeApp: () => Promise<void>;
      registrationComplete: () => Promise<boolean>;
      restartApp: () => Promise<void>;
      
      // Dialog and Notification Methods
      showMessage: (options: MessageBoxOptions) => Promise<number>;
      
      // App Information Methods
      getAppVersion: () => Promise<string>;
      
      // Environment Properties
      isElectron: boolean;
      isDev: boolean;
      platform: string;
    };
    
    // Optional Node.js globals (should not exist with context isolation)
    require?: unknown;
    exports?: unknown;
    module?: unknown;
    
    // Optional development tools
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
  }

  // Extend NodeJS namespace for environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_API_URL?: string;
      PUBLIC_URL?: string;
    }
  }
}

// System Information Interface
export interface SystemInfo {
  platform: string;
  hostname: string;
  arch?: string;
  version?: string;
  memory?: string;
  cpuModel?: string;
  systemModel?: string;
  nodeVersion?: string;
  error?: string;
}

// Message Box Options Interface
export interface MessageBoxOptions {
  type: 'none' | 'info' | 'error' | 'question' | 'warning';
  title: string;
  message: string;
  buttons: string[];
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  rollNo?: string;
  department?: string;
  dob?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Registration Interface
export interface Registration {
  _id: string;
  userId: string;
  name: string;
  rollNo: string;
  labNo: string;
  systemNo: string;
  timestamp: string;
  machineId: string;
  systemInfo: SystemInfo;
  ipAddress?: string;
  sessionDuration?: number;
  status: 'active' | 'completed' | 'interrupted';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  formattedTimestamp?: string;
  formattedDuration?: string;
}

// Validation Error Interface
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: string | number;
}

// API Response Interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  timestamp?: string;
  path?: string;
  method?: string;
}

// Paginated Response Interface
export interface PaginatedResponse<T> extends ApiResponse<T> {
  registrations?: T[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Form Data Interfaces
export interface RegistrationFormData {
  rollNo: string;
  labNo: string;
  systemNo: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
  dob: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
  newPassword: string;
}

// Authentication Context Interface
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyDob: (email: string, dob: string) => Promise<string | null>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<boolean>;
}

// Lab Configuration Interface
export interface LabOption {
  value: string;
  label: string;
}

// Statistics Interfaces
export interface LabStats {
  labNo: string;
  totalRegistrations: number;
  uniqueStudents: number;
  activeRegistrations: number;
  lastUsed: string;
}

export interface SystemUtilization {
  systemNo: string;
  totalUsage: number;
  totalDuration: number;
  averageDuration: number;
  uniqueUsers: number;
  lastUsed: string;
}

export interface RegistrationStats {
  overview: {
    totalRegistrations: number;
    activeRegistrations: number;
    todayRegistrations: number;
    uniqueStudents: number;
  };
  labStats: LabStats[];
  topSystems: SystemUtilization[];
  hourlyUsage: Array<{
    hour: number;
    registrations: number;
  }>;
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Filter Interfaces
export interface RegistrationFilters {
  page?: number;
  limit?: number;
  labNo?: string;
  rollNo?: string;
  status?: 'active' | 'completed' | 'interrupted';
  startDate?: string;
  endDate?: string;
  systemNo?: string;
}

// Electron API Interface (for documentation)
export interface ElectronAPI {
  getMachineId: () => Promise<string>;
  getSystemInfo: () => Promise<SystemInfo>;
  minimizeApp: () => Promise<void>;
  registrationComplete: () => Promise<boolean>;
  showMessage: (options: MessageBoxOptions) => Promise<number>;
  restartApp: () => Promise<void>;
  getAppVersion: () => Promise<string>;
  isElectron: boolean;
  isDev: boolean;
  platform: string;
}

// Utility Type Definitions
export type UserRole = 'student' | 'faculty';
export type RegistrationStatus = 'active' | 'completed' | 'interrupted';
export type MessageType = 'none' | 'info' | 'error' | 'question' | 'warning';
export type Platform = 'win32' | 'darwin' | 'linux' | 'web';

// Lab System Types
export type LabNumber = 'Lab-1' | 'Lab-2' | 'Lab-3' | 'Lab-4' | 'Lab-5';
export type SystemNumber = string; // Format: PC-01, SYS-15, etc.

// Session Management
export interface SessionData {
  token: string;
  user: User;
  lastActivity: string;
  expiresAt: string;
}

// Error Types
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  field?: string;
  value?: unknown;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: UserRole;
  redirectTo?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Constants Types
export interface Constants {
  API_BASE_URL: string;
  LAB_OPTIONS: LabOption[];
  ROUTES: Record<string, string>;
  MESSAGES: Record<string, string>;
  LOCAL_STORAGE_KEYS: Record<string, string>;
  VALIDATION_RULES: Record<string, RegExp | number>;
  HTTP_STATUS: Record<string, number>;
  ERROR_CODES: Record<string, string>;
}
