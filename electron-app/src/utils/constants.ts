export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const LAB_OPTIONS = [
  { value: 'Lab-1', label: 'Computer Lab 1' },
  { value: 'Lab-2', label: 'Computer Lab 2' },
  { value: 'Lab-3', label: 'Computer Lab 3' },
  { value: 'Lab-4', label: 'Computer Lab 4' },
  { value: 'Lab-5', label: 'Computer Lab 5' }
];

export const SYSTEM_NUMBER_PATTERN = /^[A-Z]{2,4}-\d{1,3}$/i;
export const ROLL_NUMBER_PATTERN = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/;

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  REGISTER_LAB: '/register-lab',
  FACULTY_DASHBOARD: '/faculty-dashboard'
};

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_ERROR: 'Invalid email or password',
  REGISTRATION_SUCCESS: 'Lab registration completed successfully!',
  REGISTRATION_ERROR: 'Failed to register. Please try again.',
  DOB_VERIFICATION_SUCCESS: 'Date of birth verified successfully!',
  DOB_VERIFICATION_ERROR: 'Invalid email or date of birth',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  PASSWORD_RESET_ERROR: 'Failed to reset password. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SYSTEM_ERROR: 'System error occurred. Please try again.'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'lab_registration_token',
  USER: 'lab_registration_user',
  LAST_LOGIN: 'lab_registration_last_login'
};

export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  EMAIL_PATTERN: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  ROLL_NUMBER_PATTERN: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/,
  SYSTEM_NUMBER_PATTERN: /^[A-Z]{2,4}-\d{1,3}$/i
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const ERROR_CODES = {
  MISSING_TOKEN: 'MISSING_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  DUPLICATE_REGISTRATION: 'DUPLICATE_REGISTRATION',
  SYSTEM_IN_USE: 'SYSTEM_IN_USE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

export const APP_CONFIG = {
  TITLE: 'College Lab Registration System',
  VERSION: '1.0.0',
  AUTHOR: 'College IT Department',
  SUPPORT_EMAIL: 'support@college.edu'
};
