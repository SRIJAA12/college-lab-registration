// src/types/index.ts

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

// Define specific error interface instead of using any
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: string | number;
}

// ✅ FIXED: Replace any with specific types
export interface ApiResponse<T = unknown> {  // Changed from T = any to T = unknown
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];  // ✅ Changed from any[] to ValidationError[]
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyDob: (email: string, dob: string) => Promise<string | null>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<boolean>;
}

export interface RegistrationFormData {
  rollNo: string;
  labNo: string;
  systemNo: string;
}

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

export interface MessageBoxOptions {
  type: 'none' | 'info' | 'error' | 'question' | 'warning';
  title: string;
  message: string;
  buttons: string[];
}

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

// Additional interfaces for better type safety
export interface RegistrationStats {
  overview: {
    totalRegistrations: number;
    activeRegistrations: number;
    todayRegistrations: number;
    uniqueStudents: number;
  };
  labStats: LabStats[];
  topSystems: SystemUtilization[];
  hourlyUsage: {
    hour: number;
    registrations: number;
  }[];
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

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

export interface LabOption {
  value: string;
  label: string;
}

// Export utility types
export type UserRole = 'student' | 'faculty';
export type RegistrationStatus = 'active' | 'completed' | 'interrupted';
export type MessageType = 'none' | 'info' | 'error' | 'question' | 'warning';
