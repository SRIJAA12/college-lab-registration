import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { MESSAGES, VALIDATION_RULES, APP_CONFIG } from '../utils/constants';
import { apiHelpers } from '../api/axiosConfig';

// ✅ FIXED: Define proper interface for form data
interface LoginFormData {
  email: string;
  password: string;
}

// ✅ FIXED: Define proper interface for validation errors instead of any
interface ValidationErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined; // Allow dynamic field access
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // ✅ FIXED: Use proper interface instead of any
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'student' ? '/register-lab' : '/faculty-dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = (): boolean => {
    // ✅ FIXED: Use proper interface instead of any
    const errors: ValidationErrors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    setError('');
    if (validationErrors[name]) {
      // ✅ FIXED: Use proper type instead of any
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      
      if (!success) {
        setError(MESSAGES.LOGIN_ERROR);
      }
    } catch (error: unknown) { // ✅ FIXED: Use unknown instead of any
      if (apiHelpers.isNetworkError(error)) {
        setError(MESSAGES.NETWORK_ERROR);
      } else if (apiHelpers.isValidationError(error)) {
        const validationErrs = apiHelpers.getValidationErrors(error);
        // ✅ FIXED: Use proper interface instead of any
        const errObj: ValidationErrors = {};
        validationErrs.forEach((err: { field: string; message: string }) => {
          errObj[err.field] = err.message;
        });
        setValidationErrors(errObj);
      } else {
        setError(apiHelpers.getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                  <h2 className="card-title text-dark fw-bold">{APP_CONFIG.TITLE}</h2>
                  <p className="text-muted">Sign in to continue</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
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
                      placeholder="Enter your email"
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
                    <label htmlFor="password" className="form-label fw-semibold">
                      <i className="fas fa-lock me-2"></i>Password
                    </label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${validationErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    {validationErrors.password && (
                      <div className="invalid-feedback">
                        {validationErrors.password}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </form>
                
                <div className="text-center">
                  <Link to="/forgot-password" className="text-decoration-none">
                    <i className="fas fa-key me-1"></i>
                    Forgot Password? (Students Only)
                  </Link>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    {APP_CONFIG.TITLE} v{APP_CONFIG.VERSION}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
