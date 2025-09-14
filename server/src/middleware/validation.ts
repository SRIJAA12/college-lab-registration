import { body, param, query } from 'express-validator';

// Auth validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const verifyDobValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('dob')
    .isISO8601()
    .withMessage('Please provide a valid date of birth in YYYY-MM-DD format')
];

export const resetPasswordValidation = [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
    .withMessage('Password must be at least 6 characters and contain at least one letter and one number')
];

export const facultyResetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid student email address'),
  body('newPassword')
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
    .withMessage('Password must be at least 6 characters and contain at least one letter and one number')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
    .withMessage('New password must be at least 6 characters and contain at least one letter and one number')
];

// Registration validation rules
export const createRegistrationValidation = [
  body('rollNo')
    .matches(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{3,4}$/)
    .withMessage('Roll number format should be like CS21A001'),
  body('labNo')
    .isIn(['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Lab-5'])
    .withMessage('Invalid lab number'),
  body('systemNo')
    .matches(/^[A-Z]{2,4}-\d{1,3}$/i)
    .withMessage('System number should be in format like PC-01 or SYS-15'),
  body('machineId')
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('Valid machine ID is required'),
  body('systemInfo.platform')
    .isIn(['win32', 'darwin', 'linux', 'web'])
    .withMessage('Invalid platform'),
  body('systemInfo.hostname')
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage('Hostname is required and must be less than 255 characters')
];

export const endSessionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid registration ID'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Query validation for filters
export const getRegistrationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('labNo')
    .optional()
    .isIn(['Lab-1', 'Lab-2', 'Lab-3', 'Lab-4', 'Lab-5'])
    .withMessage('Invalid lab number'),
  query('status')
    .optional()
    .isIn(['active', 'completed', 'interrupted'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format')
];
