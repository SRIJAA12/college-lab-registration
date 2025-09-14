import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { registrationAPI, apiHelpers } from '../api/axiosConfig';
import { RegistrationFormData, SystemInfo } from '../types';
import { LAB_OPTIONS, MESSAGES, VALIDATION_RULES } from '../utils/constants';

const RegisterLab: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    rollNo: '',
    labNo: '',
    systemNo: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [machineId, setMachineId] = useState<string>('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(false);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    initializeSystemInfo();
  }, []);

  const initializeSystemInfo = async (): Promise<void> => {
    try {
      const electronAPI = window.electronAPI;
      if (electronAPI) {
        const [id, info] = await Promise.all([
          electronAPI.getMachineId(),
          electronAPI.getSystemInfo()
        ]);
        
        setMachineId(id);
        setSystemInfo(info);
        console.log('System initialized:', { id, info });
      } else {
        // Fallback for web browser
        setMachineId('web-browser-' + Date.now());
        setSystemInfo({
          platform: 'web',
          hostname: 'browser',
          arch: 'unknown'
        });
      }
    } catch (error) {
      console.error('Error getting system info:', error);
      setMachineId('unknown-' + Date.now());
      setSystemInfo({
        platform: 'unknown',
        hostname: 'unknown'
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.rollNo) {
      errors.rollNo = 'Roll number is required';
    } else if (!VALIDATION_RULES.ROLL_NUMBER_PATTERN.test(formData.rollNo.toUpperCase())) {
      errors.rollNo = 'Roll number format should be like CS21A001';
    }

    if (!formData.labNo) {
      errors.labNo = 'Lab selection is required';
    }

    if (!formData.systemNo) {
      errors.systemNo = 'System number is required';
    } else if (!VALIDATION_RULES.SYSTEM_NUMBER_PATTERN.test(formData.systemNo)) {
      errors.systemNo = 'System number should be in format like PC-01 or SYS-15';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
    
    // Clear errors when user starts typing
    setError('');
    setSuccess('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!machineId || !systemInfo) {
      setError('System information not available. Please refresh the application.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        rollNo: formData.rollNo.toUpperCase(),
        labNo: formData.labNo,
        systemNo: formData.systemNo.toUpperCase(),
        machineId: machineId.trim(),
        systemInfo: {
          ...systemInfo,
          memory: systemInfo.memory || 'N/A',
          cpuModel: systemInfo.cpuModel || 'N/A'
        },
        timestamp: new Date().toISOString()
      };

      console.log('Submitting registration:', registrationData);
      
      const response = await registrationAPI.create(registrationData);

      if (response.data.success) {
        setSuccess(MESSAGES.REGISTRATION_SUCCESS);
        setRegistrationComplete(true);
        setFormData({ rollNo: '', labNo: '', systemNo: '' });
        
        // Show success message and handle app behavior
        const electronAPI = window.electronAPI;
        if (electronAPI) {
          await electronAPI.registrationComplete();
          
          setTimeout(async () => {
            try {
              await electronAPI.showMessage({
                type: 'info',
                title: 'Registration Complete',
                message: 'Lab registration completed successfully! You can now access other applications.',
                buttons: ['OK']
              });
              
              await electronAPI.minimizeApp();
            } catch (error) {
              console.error('Error showing completion message:', error);
            }
          }, 2000);
        }
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      if (apiHelpers.isNetworkError(error)) {
        setError(MESSAGES.NETWORK_ERROR);
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string; message?: string; existingRegistration?: { labNo?: string } } } };
        
        if (axiosError.response?.status === 409) {
          const errorData = axiosError.response.data;
          if (errorData?.error === 'DUPLICATE_REGISTRATION') {
            setError(`You already have an active registration in ${errorData.existingRegistration?.labNo}. Please complete your current session first.`);
          } else if (errorData?.message?.includes('already in use')) {
            setError(`System ${formData.systemNo} in ${formData.labNo} is currently being used by another student.`);
          } else {
            setError(errorData?.message || 'Registration conflict occurred.');
          }
        } else if (apiHelpers.isValidationError(error)) {
          const validationErrs = apiHelpers.getValidationErrors(error);
          const errObj: Record<string, string> = {};
          validationErrs.forEach((err: { field: string; message: string }) => {
            errObj[err.field] = err.message;
          });
          setValidationErrors(errObj);
        } else {
          setError(apiHelpers.getErrorMessage(error));
        }
      } else {
        setError(MESSAGES.REGISTRATION_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">
            <i className="fas fa-desktop me-2"></i>
            Lab Registration System
          </span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              <i className="fas fa-user me-1"></i>
              Welcome, {user?.name}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center py-4">
                <h3 className="mb-0 fw-bold">
                  <i className="fas fa-clipboard-check me-2"></i>
                  Register Lab Usage
                </h3>
                <p className="mb-0 mt-2 opacity-75">
                  Complete this form to begin your lab session
                </p>
              </div>
              
              <div className="card-body p-4">
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    {registrationComplete && (
                      <div className="mt-2">
                        <small className="d-block">
                          <i className="fas fa-info-circle me-1"></i>
                          The application will minimize automatically in a few seconds.
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="rollNo" className="form-label fw-semibold">
                          <i className="fas fa-id-badge me-2"></i>Roll Number
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${validationErrors.rollNo ? 'is-invalid' : ''}`}
                          id="rollNo"
                          name="rollNo"
                          value={formData.rollNo}
                          onChange={handleInputChange}
                          placeholder="e.g., CS21A001"
                          disabled={loading || registrationComplete}
                        />
                        {validationErrors.rollNo && (
                          <div className="invalid-feedback">
                            {validationErrors.rollNo}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="labNo" className="form-label fw-semibold">
                          <i className="fas fa-building me-2"></i>Lab Number
                        </label>
                        <select
                          className={`form-select form-select-lg ${validationErrors.labNo ? 'is-invalid' : ''}`}
                          id="labNo"
                          name="labNo"
                          value={formData.labNo}
                          onChange={handleInputChange}
                          disabled={loading || registrationComplete}
                        >
                          <option value="">Select Lab</option>
                          {LAB_OPTIONS.map(lab => (
                            <option key={lab.value} value={lab.value}>
                              {lab.label}
                            </option>
                          ))}
                        </select>
                        {validationErrors.labNo && (
                          <div className="invalid-feedback">
                            {validationErrors.labNo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="systemNo" className="form-label fw-semibold">
                      <i className="fas fa-computer me-2"></i>System Number
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${validationErrors.systemNo ? 'is-invalid' : ''}`}
                      id="systemNo"
                      name="systemNo"
                      value={formData.systemNo}
                      onChange={handleInputChange}
                      placeholder="e.g., PC-01, SYS-15"
                      disabled={loading || registrationComplete}
                    />
                    {validationErrors.systemNo && (
                      <div className="invalid-feedback">
                        {validationErrors.systemNo}
                      </div>
                    )}
                  </div>

                  {/* System Information Display */}
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="fw-semibold mb-3">
                      <i className="fas fa-info-circle me-2"></i>System Information
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <small className="text-muted d-block">
                          <strong>Machine ID:</strong><br/>
                          <code className="text-primary">{machineId}</code>
                        </small>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">
                          <strong>Hostname:</strong><br/>
                          <code className="text-info">{systemInfo?.hostname || 'Loading...'}</code>
                        </small>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-md-6">
                        <small className="text-muted d-block">
                          <strong>Platform:</strong><br/>
                          <span className="badge bg-secondary">{systemInfo?.platform || 'Loading...'}</span>
                        </small>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">
                          <strong>Current Time:</strong><br/>
                          <span className="text-success">{new Date().toLocaleString()}</span>
                        </small>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading || registrationComplete}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering Lab Usage...
                      </>
                    ) : registrationComplete ? (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Registration Completed
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Register Lab Usage
                      </>
                    )}
                  </button>
                </form>

                {registrationComplete && (
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      You can now use other applications on this system
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLab;
