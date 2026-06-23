import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ClinicalDepartment } from '../../types';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Mail, 
  Phone, 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp, 
  PlusCircle, 
  Building, 
  X,
  ArrowRightLeft
} from 'lucide-react';
import './StaffView.css';

export const StaffView: React.FC = () => {
  const { 
    doctors, 
    nurses, 
    departments, 
    registerDoctor, 
    registerNurse, 
    changeDoctorStatus, 
    changeNurseStatus, 
    transferStaffDepartment, 
    setDepartmentAlertLevel,
    addToast 
  } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Doctor' | 'Nurse'>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State for Onboarding
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [staffType, setStaffType] = useState<'Doctor' | 'Nurse'>('Doctor');
  
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    department: 'Cardiology',
    specialization: '',
    email: '',
    contact: '',
    shiftHours: '08:00 AM - 04:00 PM',
    status: 'Available' as any
  });



  // Statistics
  const totalStaff = doctors.length + nurses.length;
  const onDutyCount = doctors.filter(d => d.status === 'On Duty' || d.status === 'Available' || d.status === 'In Surgery').length +
                      nurses.filter(n => n.status === 'On Duty').length;
  const coveragePercent = totalStaff > 0 ? Math.round((onDutyCount / totalStaff) * 100) : 0;
  
  const totalBeds = departments.reduce((sum, d) => sum + d.bedCapacity, 0);
  const occupiedBeds = departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
  const hospitalOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  
  const criticalDeptsCount = departments.filter(d => d.activeAlert === 'Critical Load').length;

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name || !onboardForm.email || !onboardForm.contact || !onboardForm.specialization) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    if (staffType === 'Doctor') {
      await registerDoctor({
        name: onboardForm.name,
        specialization: onboardForm.specialization,
        department: onboardForm.department,
        email: onboardForm.email,
        contact: onboardForm.contact,
        status: onboardForm.status,
        rating: 5.0,
        shiftHours: onboardForm.shiftHours
      });
    } else {
      await registerNurse({
        name: onboardForm.name,
        department: onboardForm.department,
        email: onboardForm.email,
        contact: onboardForm.contact,
        status: onboardForm.status === 'In Surgery' ? 'On Duty' : onboardForm.status as any,
        shiftHours: onboardForm.shiftHours,
        specialization: onboardForm.specialization
      });
    }

    setShowOnboardModal(false);
    setOnboardForm({
      name: '',
      department: 'Cardiology',
      specialization: '',
      email: '',
      contact: '',
      shiftHours: '08:00 AM - 04:00 PM',
      status: 'Available'
    });
  };

  const handleStaffTransfer = async (staffId: string, role: 'Doctor' | 'Nurse', department: string) => {
    await transferStaffDepartment(staffId, role, department);
  };

  const handleDutyStatusChange = async (staffId: string, role: 'Doctor' | 'Nurse', newStatus: any) => {
    if (role === 'Doctor') {
      await changeDoctorStatus(staffId, newStatus);
    } else {
      await changeNurseStatus(staffId, newStatus);
    }
  };

  const handleAlertChange = async (deptId: string, alert: ClinicalDepartment['activeAlert']) => {
    await setDepartmentAlertLevel(deptId, alert);
  };

  // Combine Doctors and Nurses for unified directory
  const unifiedRoster = [
    ...doctors.map(d => ({ ...d, role: 'Doctor' as const })),
    ...nurses.map(n => ({ ...n, role: 'Nurse' as const, specialization: n.specialization || 'Registered Nurse' }))
  ];

  // Apply filters
  const filteredRoster = unifiedRoster.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.specialization.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || staff.role === roleFilter;
    const matchesDept = deptFilter === 'All' || staff.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || staff.status === statusFilter;
    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const getStaffAvatar = (staff: typeof unifiedRoster[0]) => {
    if (staff.image) return staff.image;
    
    // Fallback pictures
    if (staff.role === 'Doctor') {
      switch (staff.id) {
        case 'doc-1': return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150';
        case 'doc-2': return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
        case 'doc-3': return 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150';
        case 'doc-4': return 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150';
        case 'doc-5': return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150';
        default: return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
      }
    } else {
      switch (staff.id) {
        case 'nur-1': return 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=150';
        case 'nur-2': return 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=150';
        case 'nur-3': return 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150';
        case 'nur-4': return 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=150';
        default: return 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=150';
      }
    }
  };

  const getAlertBadgeClass = (alert: ClinicalDepartment['activeAlert']) => {
    switch (alert) {
      case 'Normal':
        return 'badge-success';
      case 'Understaffed':
        return 'badge-warning';
      case 'Critical Load':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getStaffStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'On Duty':
      case 'Available':
        return 'badge-success';
      case 'In Surgery':
        return 'badge-danger';
      case 'Off Duty':
        return 'badge-secondary';
      case 'On Leave':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };



  return (
    <div className="staff-view page-wrapper">
      {/* Metrics Widgets */}
      <div className="grid-4 staff-widgets">
        <div className="stats-card glass-panel flex-row staff-summary-card">
          <div className="widget-icon primary-glow"><Users size={20} /></div>
          <div className="widget-details">
            <span className="label">Total Roster</span>
            <span className="value">{totalStaff} Members</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row staff-summary-card">
          <div className="widget-icon green-glow"><CheckCircle size={20} /></div>
          <div className="widget-details">
            <span className="label">Coverage</span>
            <span className="value">{coveragePercent}% Staffed</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row staff-summary-card">
          <div className="widget-icon orange-glow"><TrendingUp size={20} /></div>
          <div className="widget-details">
            <span className="label">Bed Occupancy</span>
            <span className="value">{hospitalOccupancy}% ({occupiedBeds}/{totalBeds})</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row staff-summary-card">
          <div className="widget-icon danger-glow"><ShieldAlert size={20} /></div>
          <div className="widget-details">
            <span className="label">Critical Wards</span>
            <span className="value">{criticalDeptsCount} Alerts</span>
          </div>
        </div>
      </div>

      {/* Departments Roster Renders */}
      <div className="section-block">
        <div className="flex-between section-header mb-1">
          <div>
            <h2 className="section-title">Clinical Departments Grid</h2>
            <p className="section-desc">Manage bed loads, alert priorities, and view department medical leaders</p>
          </div>
        </div>

        <div className="grid-3 departments-grid">
          {departments.map((dept) => {
            const docCount = doctors.filter(d => d.department === dept.name).length;
            const nurseCount = nurses.filter(n => n.department === dept.name).length;
            const occupancyPct = dept.bedCapacity > 0 ? Math.round((dept.occupiedBeds / dept.bedCapacity) * 100) : 0;
            const alertBadge = getAlertBadgeClass(dept.activeAlert);

            return (
              <div key={dept.id} className="dept-card glass-panel flex-column gap-1">
                <div className="dept-card-header flex-between">
                  <div className="flex-row gap-0-5">
                    <Building size={16} className="text-primary" />
                    <span className="dept-name font-bold text-highlight">{dept.name}</span>
                  </div>
                  <span className="dept-code text-xs text-muted font-bold">{dept.code}</span>
                </div>

                <div className="dept-card-body flex-column gap-0-75">
                  <div className="leader-info flex-between text-xs">
                    <span className="text-secondary">Chief MD:</span>
                    <span className="font-bold text-highlight">{dept.headDoctorName}</span>
                  </div>

                  <div className="staff-metrics flex-between text-xs">
                    <span className="text-secondary">Staff Allocation:</span>
                    <span className="text-highlight font-bold">{docCount} Doctors | {nurseCount} Nurses</span>
                  </div>

                  {dept.bedCapacity > 0 ? (
                    <div className="bed-occupancy flex-column gap-0-25">
                      <div className="flex-between text-xs">
                        <span className="text-secondary">Beds Occupied:</span>
                        <span className="font-bold text-highlight">{dept.occupiedBeds}/{dept.bedCapacity} ({occupancyPct}%)</span>
                      </div>
                      <div className="progress-track-bg">
                        <div 
                          className="progress-track-fill" 
                          style={{ 
                            width: `${occupancyPct}%`, 
                            backgroundColor: occupancyPct > 80 ? 'var(--status-danger)' : occupancyPct > 50 ? 'var(--status-warning)' : 'var(--status-success)' 
                          }} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bed-occupancy flex-between text-xs py-0-25">
                      <span className="text-secondary">Beds Occupied:</span>
                      <span className="text-muted italic">Non-Residential Lab</span>
                    </div>
                  )}
                </div>

                <div className="dept-card-actions flex-between border-top-glow pt-0-75">
                  <div className="flex-row gap-0-5">
                    <span className="text-xs text-secondary">Alert:</span>
                    <span className={`badge ${alertBadge}`}>{dept.activeAlert}</span>
                  </div>

                  <select
                    className="form-select alert-select"
                    value={dept.activeAlert}
                    onChange={(e) => handleAlertChange(dept.id, e.target.value as any)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Understaffed">Understaffed</option>
                    <option value="Critical Load">Critical Load</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Directory Section */}
      <div className="section-block mt-3">
        <div className="roster-controls-panel glass-panel mb-1-5 flex-between flex-wrap gap-1">
          <div className="search-filter-box flex-row gap-1">
            <input
              type="text"
              placeholder="Search by name, role or ID..."
              className="form-input search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="form-select filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="All">All Roles</option>
              <option value="Doctor">Doctors</option>
              <option value="Nurse">Nurses</option>
            </select>

            <select
              className="form-select filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="On Duty">On Duty</option>
              <option value="Available">Available</option>
              <option value="In Surgery">In Surgery</option>
              <option value="Off Duty">Off Duty</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          <button 
            type="button" 
            className="btn btn-primary flex-row gap-0-5"
            onClick={() => setShowOnboardModal(true)}
          >
            <UserPlus size={16} /> Onboard New Staff
          </button>
        </div>

        <div className="grid-3 doctors-grid">
          {filteredRoster.map((staff) => {
            const statusBadge = getStaffStatusBadgeClass(staff.status);
            return (
              <div key={`${staff.role}-${staff.id}`} className="doctor-card glass-panel glass-panel-hover flex-column justify-between">
                <div className="card-top flex-row mb-0-75">
                  <img src={getStaffAvatar(staff)} alt={staff.name} className="doctor-avatar-card" />
                  <div className="doc-meta flex-column gap-0-25">
                    <div className="doc-status-line flex-between">
                      <span className={`badge ${statusBadge}`}>
                        <span className="badge-dot" />
                        {staff.status}
                      </span>
                      <span className={`badge text-xs font-bold ${staff.role === 'Doctor' ? 'badge-info' : 'badge-warning'}`}>
                        {staff.role}
                      </span>
                    </div>
                    <h3 className="doc-name-card">{staff.name}</h3>
                    <span className="doc-specialty-card text-primary text-xs font-bold">{staff.specialization}</span>
                  </div>
                </div>

                <div className="card-body-roster flex-column gap-0-5 text-xs text-secondary mt-0-5 mb-0-75">
                  <div className="roster-info-row flex-row gap-0-5">
                    <Building size={14} className="text-muted" />
                    <span><strong>Dept:</strong> {staff.department}</span>
                  </div>
                  <div className="roster-info-row flex-row gap-0-5">
                    <Clock size={14} className="text-muted" />
                    <span><strong>Shift:</strong> {staff.shiftHours}</span>
                  </div>
                  <div className="roster-info-row flex-row gap-0-5">
                    <Mail size={14} className="text-muted" />
                    <span>{staff.email}</span>
                  </div>
                  <div className="roster-info-row flex-row gap-0-5">
                    <Phone size={14} className="text-muted" />
                    <span>{staff.contact}</span>
                  </div>
                </div>

                <div className="card-footer-roster border-top-glow pt-0-75 flex-column gap-0-75">
                  <div className="flex-between gap-0-5">
                    <span className="text-xxs text-secondary uppercase font-bold">Duty Status:</span>
                    <select
                      className="form-select action-select"
                      value={staff.status}
                      onChange={(e) => handleDutyStatusChange(staff.id, staff.role, e.target.value)}
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="Available">Available</option>
                      {staff.role === 'Doctor' && <option value="In Surgery">In Surgery</option>}
                      <option value="Off Duty">Off Duty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div className="flex-between gap-0-5">
                    <span className="text-xxs text-secondary uppercase font-bold flex-row gap-0-25"><ArrowRightLeft size={10} /> Transfer Dept:</span>
                    <select
                      className="form-select action-select"
                      value={staff.department}
                      onChange={(e) => handleStaffTransfer(staff.id, staff.role, e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredRoster.length === 0 && (
            <div className="grid-span-all text-center py-3 text-secondary text-sm glass-panel">
              No staff members match the selected filters or search terms.
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboardModal && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel flex-column gap-1-5">
            <div className="modal-header flex-between">
              <h3>Onboard Clinical Staff Member</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setShowOnboardModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="modal-body flex-column gap-1">
              <div className="form-group">
                <label className="form-label">Roster Role *</label>
                <div className="toggle-role flex-row gap-1">
                  <button
                    type="button"
                    className={`btn btn-secondary flex-1 ${staffType === 'Doctor' ? 'btn-primary text-black' : ''}`}
                    onClick={() => {
                      setStaffType('Doctor');
                      setOnboardForm(prev => ({ ...prev, status: 'Available' }));
                    }}
                  >
                    Medical Doctor (MD)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-secondary flex-1 ${staffType === 'Nurse' ? 'btn-primary text-black' : ''}`}
                    onClick={() => {
                      setStaffType('Nurse');
                      setOnboardForm(prev => ({ ...prev, status: 'On Duty' }));
                    }}
                  >
                    Registered Nurse (RN)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton"
                  className="form-input"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Assigned Department *</label>
                  <select
                    className="form-select"
                    value={onboardForm.department}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, department: e.target.value }))}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization / Shift Role *</label>
                  <input
                    type="text"
                    required
                    placeholder={staffType === 'Doctor' ? "e.g. Pediatric Surgeon" : "e.g. ICU Duty Nurse"}
                    className="form-input"
                    value={onboardForm.specialization}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, specialization: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. a.pendelton@carepulse.com"
                    className="form-input"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 789-1234"
                    className="form-input"
                    value={onboardForm.contact}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, contact: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Shift Timing *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:00 AM - 04:00 PM"
                    className="form-input"
                    value={onboardForm.shiftHours}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, shiftHours: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Availability *</label>
                  <select
                    className="form-select"
                    value={onboardForm.status}
                    onChange={(e) => setOnboardForm(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Available">Available</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary full-width mt-1 flex-row gap-0-5 justify-center">
                <PlusCircle size={16} /> Complete Staff Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
