import express from 'express';
import {
  loginUser,
  verifyToken,
  verifyDob,
  resetPasswordWithToken,
  facultyResetPassword,
  getUserProfile,
  updateProfile,
  changePassword
} from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import {
  loginValidation,
  verifyDobValidation,
  resetPasswordValidation,
  facultyResetPasswordValidation,
  changePasswordValidation
} from '../middleware/validation';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, loginUser);

// @route   GET /api/auth/verify
// @desc    Verify token and get user info
// @access  Private
router.get('/verify', authenticateToken, verifyToken);

// @route   POST /api/auth/verify-dob
// @desc    Verify DOB for password reset
// @access  Public
router.post('/verify-dob', verifyDobValidation, verifyDob);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public (with valid reset token)
router.post('/reset-password', resetPasswordValidation, resetPasswordWithToken);

// @route   POST /api/auth/faculty-reset-password
// @desc    Faculty reset student password
// @access  Private (Faculty only)
router.post('/faculty-reset-password', authenticateToken, authorizeRole('faculty'), facultyResetPasswordValidation, facultyResetPassword);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   POST /api/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authenticateToken, changePasswordValidation, changePassword);

export default router;
