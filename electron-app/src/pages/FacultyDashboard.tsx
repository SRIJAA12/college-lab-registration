import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from 'react';
import { useAuth } from '../components/AuthProvider';
import { registrationAPI, authAPI, apiHelpers } from '../api/axiosConfig';
import type { Registration } from '../types';
import { LAB_OPTIONS } from '../utils/constants';

// ✅ FIXED: Proper interface definitions matching actual API responses
interface FilterState {
  page: number;
  limit: number;
  labNo: string;
  rollNo: string;
  status: string;
  startDate: string;
  endDate: string;
  systemNo: string;
}

interface StatsState {
  totalRegistrations: number;
  todayRegistrations: number;
  activeRegistrations: number;
  uniqueStudents: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface PasswordResetData {
  email: string;
  newPassword: string;
}

// ✅ FIXED: API response interfaces matching backend structure
interface RegistrationsApiResponse {
  success: boolean;
  registrations: Registration[];
  pagination: PaginationData;
}

interface StatsApiResponse {
  success: boolean;
  stats: {
    overview: StatsState;
  };
}

const FacultyDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 50,
    labNo: '',
    rollNo: '',
    status: '',
    startDate: '',
    endDate: '',
    systemNo: ''
  });
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [stats, setStats] = useState<StatsState>({
    totalRegistrations: 0,
    todayRegistrations: 0,
    activeRegistrations: 0,
    uniqueStudents: 0
  });
  const [resetPasswordData, setResetPasswordData] = useState<PasswordResetData>({
    email: '',
    newPassword: ''
  });
  const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showEndSessionModal, setShowEndSessionModal] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { user, logout } = useAuth();

  // ✅ FIXED: Proper async function with error handling
  const fetchRegistrations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Clean and prepare parameters
      const cleanParams: Record<string, string | number> = {};
      
      // Only include non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== 0) {
          cleanParams[key] = value;
        }
      });

      const response = await registrationAPI.getAll(cleanParams);
      const data = response as RegistrationsApiResponse;
      
      if (data?.success) {
        setRegistrations(data.registrations || []);
        setPagination(data.pagination || null);
      } else {
        setError('Failed to fetch registrations');
      }
    } catch (error: unknown) {
      console.error('Error fetching registrations:', error);
      if (apiHelpers?.getErrorMessage) {
        setError(apiHelpers.getErrorMessage(error));
      } else {
        setError('Failed to fetch registrations');
      }
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.limit,
    filters.labNo,
    filters.rollNo,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.systemNo
  ]);

  // ✅ FIXED: Proper stats fetching
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const response = await registrationAPI.getStats('today');
      const data = response as StatsApiResponse;
      
      if (data?.success && data.stats?.overview) {
        setStats(data.stats.overview);
      }
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
      // Don't set error for stats - it's not critical
    }
  }, []);

  // ✅ FIXED: useEffect with proper dependencies
  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [fetchRegistrations, fetchStats]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number): void => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = (): void => {
    setFilters({
      page: 1,
      limit: 50,
      labNo: '',
      rollNo: '',
      status: '',
      startDate: '',
      endDate: '',
      systemNo: ''
    });
  };

  const exportToCSV = async (): Promise<void> => {
    try {
      // Prepare export parameters
      const exportParams: Record<string, string | number> = {
        format: 'csv',
        limit: 5000
      };
      
      // Add non-empty filters (excluding page for export)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && key !== 'page') {
          exportParams[key] = value;
        }
      });
      
      const response = await registrationAPI.export(exportParams);
      
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `lab-registrations-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setSuccess('Data exported successfully!');
      } else {
        setError('Failed to export data');
      }
    } catch (error: unknown) {
      console.error('Export error:', error);
      if (apiHelpers?.getErrorMessage) {
        setError(apiHelpers.getErrorMessage(error));
      } else {
        setError('Failed to export data');
      }
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!resetPasswordData.email || !resetPasswordData.newPassword) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await authAPI.facultyResetPassword(resetPasswordData.email, resetPasswordData.newPassword);
      setSuccess('Student password reset successfully!');
      setResetPasswordData({ email: '', newPassword: '' });
      setShowPasswordReset(false);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      if (apiHelpers?.getErrorMessage) {
        setError(apiHelpers.getErrorMessage(error));
      } else {
        setError('Failed to reset password');
      }
    }
  };

  const handleEndSession = async (): Promise<void> => {
    if (!selectedRegistration) return;

    try {
      await registrationAPI.endSession(selectedRegistration._id, sessionNotes);
      setSuccess('Session ended successfully!');
      setShowEndSessionModal(false);
      setSelectedRegistration(null);
      setSessionNotes('');
      await fetchRegistrations(); // Refresh data
    } catch (error: unknown) {
      console.error('End session error:', error);
      if (apiHelpers?.getErrorMessage) {
        setError(apiHelpers.getErrorMessage(error));
      } else {
        setError('Failed to end session');
      }
    }
  };

  const openEndSessionModal = (registration: Registration): void => {
    setSelectedRegistration(registration);
    setShowEndSessionModal(true);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            <i className="fas fa-chalkboard-teacher me-2"></i>
            Faculty Dashboard
          </span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              <i className="fas fa-user-tie me-1"></i>
              Welcome, {user?.name || 'User'}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Alert Messages */}
      {error && (
        <div className="container-fluid mt-3">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        </div>
      )}

      {success && (
        <div className="container-fluid mt-3">
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
          </div>
        </div>
      )}

      <div className="container-fluid mt-4">
        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card bg-primary text-white h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-clipboard-list fa-2x me-3"></i>
                  <div>
                    <h6 className="card-title">Total Registrations</h6>
                    <h3 className="mb-0">{stats.totalRegistrations}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card bg-success text-white h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-calendar-day fa-2x me-3"></i>
                  <div>
                    <h6 className="card-title">Today's Registrations</h6>
                    <h3 className="mb-0">{stats.todayRegistrations}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card bg-warning text-white h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-clock fa-2x me-3"></i>
                  <div>
                    <h6 className="card-title">Active Sessions</h6>
                    <h3 className="mb-0">{stats.activeRegistrations}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-6">
            <div className="card bg-info text-white h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <i className="fas fa-users fa-2x me-3"></i>
                  <div>
                    <h6 className="card-title">Unique Students</h6>
                    <h3 className="mb-0">{stats.uniqueStudents}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-xl-3 col-lg-4">
            <div className="card mb-4">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-filter me-2"></i>Filters & Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Lab Number</label>
                  <select
                    className="form-select"
                    name="labNo"
                    value={filters.labNo}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Labs</option>
                    {LAB_OPTIONS.map(lab => (
                      <option key={lab.value} value={lab.value}>
                        {lab.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="interrupted">Interrupted</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Roll Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="rollNo"
                    value={filters.rollNo}
                    onChange={handleFilterChange}
                    placeholder="Search by roll no"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">System Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="systemNo"
                    value={filters.systemNo}
                    onChange={handleFilterChange}
                    placeholder="Search by system no"
                  />
                </div>

                <button
                  className="btn btn-success w-100 mb-2"
                  onClick={exportToCSV}
                  disabled={loading}
                >
                  <i className="fas fa-file-csv me-2"></i>
                  Export to CSV
                </button>
                
                <button
                  className="btn btn-outline-secondary w-100 mb-3"
                  onClick={clearFilters}
                >
                  <i className="fas fa-eraser me-2"></i>
                  Clear Filters
                </button>
                
                <button
                  className="btn btn-warning w-100"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                >
                  <i className="fas fa-key me-2"></i>
                  Reset Student Password
                </button>
              </div>
            </div>

            {/* Password Reset Form */}
            {showPasswordReset && (
              <div className="card">
                <div className="card-header bg-warning">
                  <h6 className="mb-0">
                    <i className="fas fa-user-edit me-2"></i>
                    Reset Student Password
                  </h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                      <label className="form-label">Student Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={resetPasswordData.email}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setResetPasswordData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        placeholder="student@college.edu"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={resetPasswordData.newPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setResetPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      <i className="fas fa-save me-2"></i>
                      Reset Password
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="col-xl-9 col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-table me-2"></i>
                  Lab Registrations
                </h5>
                <span className="badge bg-primary fs-6">
                  {pagination?.totalRecords || 0} total records
                </span>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading registrations...</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No registrations found</h5>
                    <p className="text-muted">Try adjusting your filters or date range</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Student</th>
                            <th>Roll No</th>
                            <th>Lab</th>
                            <th>System</th>
                            <th>Login Time</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((registration) => (
                            <tr key={registration._id}>
                              <td className="fw-semibold">{registration.name}</td>
                              <td>
                                <code className="text-primary">{registration.rollNo}</code>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {registration.labNo}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {registration.systemNo}
                                </span>
                              </td>
                              <td>
                                <small>{new Date(registration.timestamp).toLocaleString()}</small>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {registration.formattedDuration || '0s'}
                                </small>
                              </td>
                              <td>
                                <span className={`badge ${
                                  registration.status === 'active' ? 'bg-success' :
                                  registration.status === 'completed' ? 'bg-primary' :
                                  'bg-danger'
                                }`}>
                                  {registration.status}
                                </span>
                              </td>
                              <td>
                                {registration.status === 'active' && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => openEndSessionModal(registration)}
                                    title="End Session"
                                  >
                                    <i className="fas fa-stop"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <nav className="mt-4">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.currentPage - 1)}
                              disabled={!pagination.hasPrevPage}
                            >
                              Previous
                            </button>
                          </li>
                          
                          {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                            const pageNum = Math.max(1, pagination.currentPage - 2) + index;
                            if (pageNum <= pagination.totalPages) {
                              return (
                                <li
                                  key={pageNum}
                                  className={`page-item ${pageNum === pagination.currentPage ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNum)}
                                  >
                                    {pageNum}
                                  </button>
                                </li>
                              );
                            }
                            return null;
                          })}
                          
                          <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.currentPage + 1)}
                              disabled={!pagination.hasNextPage}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndSessionModal && selectedRegistration && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">End Lab Session</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEndSessionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Student:</strong> {selectedRegistration.name} ({selectedRegistration.rollNo})<br/>
                  <strong>Lab:</strong> {selectedRegistration.labNo}<br/>
                  <strong>System:</strong> {selectedRegistration.systemNo}<br/>
                  <strong>Start Time:</strong> {new Date(selectedRegistration.timestamp).toLocaleString()}
                </p>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={sessionNotes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSessionNotes(e.target.value)}
                    placeholder="Add any notes about this session..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEndSessionModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleEndSession}
                >
                  <i className="fas fa-stop me-2"></i>
                  End Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
