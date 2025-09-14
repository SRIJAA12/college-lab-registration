import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { MESSAGES, VALIDATION_RULES } from '../utils/constants';
import { apiHelpers } from '../api/axiosConfig';

interface FormStep {
  step: 'dob-verification' | 'password-reset';
}

const ForgotPassword: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep['step']>('dob-verification');
  const [formData, setFormData] = useState({
    email: '',
    dob: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  
  const { verifyDob, resetPassword } = useAuth();
  const navigate = useNavigate();

  const validateDobForm = (): boolean => {
    const errors: any = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 16 || age > 35) {
        errors.dob = 'Age must be between 16 and 35 years';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: any = {};

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.newPassword = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
    } else if (!VALIDATION_RULES.PASSWORD_PATTERN.test(formData.newPassword)) {
      errors.newPassword = 'Password must contain at least one letter and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    setError('');
    setSuccess('');
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDobVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDobForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await verifyDob(formData.email, formData.dob);
      
      if (token) {
        setResetToken(token);
        setCurrentStep('password-reset');
        setSuccess(MESSAGES.DOB_VERIFICATION_SUCCESS);
      } else {
        setError(MESSAGES.DOB_VERIFICATION_ERROR);
      }
    } catch (error: any) {
      if (apiHelpers.isNetworkError(error)) {
        setError(MESSAGES.NETWORK_ERROR);
      } else {
        setError(apiHelpers.getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await resetPassword(resetToken, formData.newPassword);
      
      if (success) {
        setSuccess(MESSAGES.PASSWORD_RESET_SUCCESS + ' Redirecting to login...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setError(MESSAGES.PASSWORD_RESET_ERROR);
      }
    } catch (error: any) {
      if (apiHelpers.isNetworkError(error)) {
        setError(MESSAGES.NETWORK_ERROR);
      } else {
        setError(apiHelpers.getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDobVerificationStep = () => (
    <>
      <div className="text-center mb-4">
        <i className="fas fa-user-check fa-3x text-info mb-3"></i>
        <h2 className="card-title text-dark fw-bold">Verify Identity</h2>
        <p className="text-muted">Enter your email and date of birth to verify your identity</p>
      </div>

      <form onSubmit={handleDobVerification} noValidate>
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">
            <i className="fas fa-envelope me-2"></i>Email Address
          </label>
          <input
            type="email"
            className={`form-control form-control-lg ${validationErrors.email ? 'is-invalid' : ''}`}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your registered email"
            autoComplete="email"
            disabled={loading}
          />
          {validationErrors.email && (
            <div className="invalid-feedback">
              {validationErrors.email}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="dob" className="form-label fw-semibold">
            <i className="fas fa-calendar-alt me-2"></i>Date of Birth
          </label>
          <input
            type="date"
            className={`form-control form-control-lg ${validationErrors.dob ? 'is-invalid' : ''}`}
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            disabled={loading}
          />
          {validationErrors.dob && (
            <div className="invalid-feedback">
              {validationErrors.dob}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-info btn-lg w-100 mb-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Verifying...
            </>
          ) : (
            <>
              <i className="fas fa-check me-2"></i>
              Verify Identity
            </>
          )}
        </button>
      </form>
    </>
  );

  const renderPasswordResetStep = () => (
    <>
      <div className="text-center mb-4">
        <i className="fas fa-key fa-3x text-warning mb-3"></i>
        <h2 className="card-title text-dark fw-bold">Reset Password</h2>
        <p className="text-muted">Enter your new password</p>
      </div>

      <form onSubmit={handlePasswordReset} noValidate>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label fw-semibold">
            <i className="fas fa-lock me-2"></i>New Password
          </label>
          <input
            type="password"
            className={`form-control form-control-lg ${validationErrors.newPassword ? 'is-invalid' : ''}`}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Enter new password"
            autoComplete="new-password"
            disabled={loading}
          />
          {validationErrors.newPassword && (
            <div className="invalid-feedback">
              {validationErrors.newPassword}
            </div>
          )}
          <div className="form-text">
            Password must be at least 6 characters and contain at least one letter and one number
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="form-label fw-semibold">
            <i className="fas fa-lock me-2"></i>Confirm New Password
          </label>
          <input
            type="password"
            className={`form-control form-control-lg ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your new password"
            autoComplete="new-password"
            disabled={loading}
          />
          {validationErrors.confirmPassword && (
            <div className="invalid-feedback">
              {validationErrors.confirmPassword}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="btn btn-warning btn-lg w-100 mb-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Resetting Password...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt me-2"></i>
              Reset Password
            </>
          )}
        </button>
      </form>
    </>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Progress indicator */}
                <div className="progress mb-4" style={{ height: '4px' }}>
                  <div 
                    className="progress-bar bg-info" 
                    style={{ width: currentStep === 'dob-verification' ? '50%' : '100%' }}
                  ></div>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                  </div>
                )}

                {currentStep === 'dob-verification' ? renderDobVerificationStep() : renderPasswordResetStep()}
                
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
