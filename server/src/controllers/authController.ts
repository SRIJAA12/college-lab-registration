import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { generateToken, verifyDobToken } from '../utils/helpers';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      token,
      user: userResponse,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify token and get user info
// @route   GET /api/auth/verify
// @access  Private
export const verifyToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: user.toJSON(),
      message: 'Token verified successfully'
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

// @desc    Verify DOB for password reset
// @route   POST /api/auth/verify-dob
// @access  Public
export const verifyDob = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, dob } = req.body;

    // Find student user only
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      role: 'student', 
      isActive: true 
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
      return;
    }

    // Verify DOB
    const userDob = new Date(user.dob!);
    const providedDob = new Date(dob);
    
    // Compare dates (ignore time)
    if (userDob.toDateString() !== providedDob.toDateString()) {
      res.status(401).json({
        success: false,
        message: 'Invalid date of birth'
      });
      return;
    }

    // Generate a temporary token for password reset
    const resetToken = verifyDobToken(user._id.toString(), user.email);

    res.json({
      success: true,
      resetToken,
      message: 'Date of birth verified successfully'
    });
  } catch (error: any) {
    console.error('DOB verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during DOB verification'
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public (with valid reset token)
export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { resetToken, newPassword } = req.body;

    // Verify reset token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, jwtSecret) as any;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Faculty reset student password
// @route   POST /api/auth/faculty-reset-password
// @access  Private (Faculty only)
export const facultyResetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    // Check if current user is faculty
    if (req.user?.role !== 'faculty') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Faculty role required.'
      });
      return;
    }

    const { email, newPassword } = req.body;

    // Find student
    const student = await User.findOne({ 
      email: email.toLowerCase(), 
      role: 'student', 
      isActive: true 
    });

    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
      return;
    }

    // Update student password
    student.password = newPassword;
    await student.save();

    res.json({
      success: true,
      message: `Password reset successfully for student ${student.name}`,
      studentInfo: {
        name: student.name,
        email: student.email,
        rollNo: student.rollNo
      }
    });
  } catch (error: any) {
    console.error('Faculty password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: user.toJSON(),
      message: 'Profile retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const user = req.user;
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const { name, department } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (department) user.department = department;

    await user.save();

    res.json({
      success: true,
      user: user.toJSON(),
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};
