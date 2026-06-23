import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './DashboardView.css';

export const DashboardView: React.FC = () => {
  const { 
    stats, 
    logs, 
    doctors, 
    patients, 
    registerPatient, 
    scheduleAppointment, 
    addToast,
    assignPatientBed,
    releasePatientBed
  } = useApp();
  
  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAptModal, setShowAptModal] = useState(false);
  
  // Bed Allocation State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBedForAssign, setSelectedBedForAssign] = useState<string | null>(null);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState<string | null>(null);
  const [patientIdForAssign, setPatientIdForAssign] = useState('');
  const [bedIdForAssign, setBedIdForAssign] = useState('');

  const HOSPITAL_BEDS = [
    { id: 'ICU-201', ward: 'ICU', label: 'ICU Bed 201' },
    { id: 'ICU-202', ward: 'ICU', label: 'ICU Bed 202' },
    { id: 'ICU-203', ward: 'ICU', label: 'ICU Bed 203' },
    { id: 'ICU-204', ward: 'ICU', label: 'ICU Bed 204' },
    { id: 'ER-101', ward: 'ER', label: 'ER Bed 101' },
    { id: 'ER-102', ward: 'ER', label: 'ER Bed 102' },
    { id: 'ER-103', ward: 'ER', label: 'ER Bed 103' },
    { id: 'ER-104', ward: 'ER', label: 'ER Bed 104' },
    { id: 'GEN-301', ward: 'Gen Ward', label: 'Gen Ward Bed 301' },
    { id: 'GEN-302', ward: 'Gen Ward', label: 'Gen Ward Bed 302' },
    { id: 'GEN-303', ward: 'Gen Ward', label: 'Gen Ward Bed 303' },
    { id: 'GEN-304', ward: 'Gen Ward', label: 'Gen Ward Bed 304' },
  ];

  const getPatientForBed = (bedId: string) => {
    return patients.find(p => p.bedNumber === bedId);
  };

  const handleOpenAssignModal = (bedId: string | null, patientId: string | null) => {
    setSelectedBedForAssign(bedId);
    setSelectedPatientForAssign(patientId);
    setBedIdForAssign(bedId || '');
    setPatientIdForAssign(patientId || '');
    setShowAssignModal(true);
  };

  const handleReleaseBed = async (patientId: string) => {
    await releasePatientBed(patientId);
  };

  const handleAssignBedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPatientId = selectedPatientForAssign || patientIdForAssign;
    const finalBedId = selectedBedForAssign || bedIdForAssign;

    if (!finalPatientId || !finalBedId) {
      addToast('Patient and Bed are both required for allocation.', 'warning');
      return;
    }

    await assignPatientBed(finalPatientId, finalBedId);
    setShowAssignModal(false);
    setSelectedBedForAssign(null);
    setSelectedPatientForAssign(null);
    setBedIdForAssign('');
    setPatientIdForAssign('');
  };
  
  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contact: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    status: 'Outpatient' as 'Admitted' | 'Outpatient' | 'Critical'
  });

  const [aptForm, setAptForm] = useState({
    patientId: '',
    doctorId: '',
    dateTime: '',
    reason: ''
  });

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.age || !patientForm.contact) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }
    await registerPatient({
      name: patientForm.name,
      age: parseInt(patientForm.age),
      gender: patientForm.gender,
      contact: patientForm.contact,
      email: patientForm.email || `${patientForm.name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      bloodGroup: patientForm.bloodGroup,
      address: patientForm.address,
      status: patientForm.status,
      lastVisit: new Date().toISOString()
    });
    setShowPatientModal(false);
    setPatientForm({
      name: '',
      age: '',
      gender: 'Male',
      contact: '',
      email: '',
      bloodGroup: 'O+',
      address: '',
      status: 'Outpatient'
    });
  };

  const handleAptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptForm.patientId || !aptForm.doctorId || !aptForm.dateTime || !aptForm.reason) {
      addToast('Please fill out all booking fields.', 'warning');
      return;
    }

    const patient = patients.find(p => p.id === aptForm.patientId);
    const doctor = doctors.find(d => d.id === aptForm.doctorId);

    if (!patient || !doctor) {
      addToast('Invalid patient or doctor selection.', 'danger');
      return;
    }

    const success = await scheduleAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      dateTime: new Date(aptForm.dateTime).toISOString(),
      reason: aptForm.reason,
      status: 'Scheduled'
    });

    if (success) {
      setShowAptModal(false);
      setAptForm({
        patientId: '',
        doctorId: '',
        dateTime: '',
        reason: ''
      });
    }
  };

  return (
    <div className="dashboard-view page-wrapper">
      {/* Welcome banner */}
      <div className="welcome-banner glass-panel">
        <div className="welcome-text">
          <h2>Clinical Node Status: Online</h2>
          <p>Welcome back, Administrator. Real-time patient triage and analytics telemetry are running normally.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={() => setShowPatientModal(true)}>
            <UserPlus size={16} /> Register Patient
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAptModal(true)}>
            <Calendar size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid-4 stats-grid">
        <div className="stats-card glass-panel glass-panel-hover">
          <div className="card-header flex-between">
            <span className="card-title">Total Active Patients</span>
            <div className="card-icon-wrapper cyan-glow">
              <Users size={20} />
            </div>
          </div>
          <div className="card-body">
            <span className="card-value">{stats?.totalPatients || 0}</span>
            <div className="card-trend flex-row text-success">
              <TrendingUp size={14} />
              <span>+4 registered this week</span>
            </div>
          </div>
        </div>

        <div className="stats-card glass-panel glass-panel-hover">
          <div className="card-header flex-between">
            <span className="card-title">Active Admissions</span>
            <div className="card-icon-wrapper indigo-glow">
              <Activity size={20} />
            </div>
          </div>
          <div className="card-body">
            <span className="card-value">{stats?.activeAdmissions || 0}</span>
            <div className="card-trend flex-row">
              <span className="occupancy-indicator">Bed Occupancy: {stats?.occupancyRate || 0}%</span>
            </div>
          </div>
        </div>

        <div className="stats-card glass-panel glass-panel-hover">
          <div className="card-header flex-between">
            <span className="card-title">Appointments Today</span>
            <div className="card-icon-wrapper orange-glow">
              <Calendar size={20} />
            </div>
          </div>
          <div className="card-body">
            <span className="card-value">{stats?.appointmentsToday || 0}</span>
            <div className="card-trend flex-row text-warning">
              <span>{stats?.appointmentsToday && stats.appointmentsToday > 0 ? 'Urgent consults pending' : 'Zero queue bottlenecks'}</span>
            </div>
          </div>
        </div>

        <div className="stats-card glass-panel glass-panel-hover">
          <div className="card-header flex-between">
            <span className="card-title">Billing Revenue (Paid)</span>
            <div className="card-icon-wrapper green-glow">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="card-body">
            <span className="card-value">{formatCurrency(stats?.revenueThisMonth || 0)}</span>
            <div className="card-trend flex-row text-success">
              <span>{stats?.pendingClaims || 0} pending claims</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Department Ratios */}
      <div className="grid-3 dashboard-charts">
        <div className="chart-panel glass-panel grid-span-2">
          <div className="panel-header flex-between">
            <div>
              <h3>Patient Intake Trends</h3>
              <p className="panel-desc">Daily triage admissions vs outpatient walk-ins</p>
            </div>
            <div className="chart-legend flex-row">
              <span className="legend-dot checkin-dot">Admissions</span>
              <span className="legend-dot walkin-dot">Outpatients</span>
            </div>
          </div>
          <div className="panel-body chart-svg-container">
            {/* Custom Responsive SVG Chart */}
            <svg viewBox="0 0 600 240" className="analytics-svg">
              <defs>
                <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="walkinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="570" y2="30" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="80" x2="570" y2="80" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="130" x2="570" y2="130" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="180" x2="570" y2="180" stroke="rgba(255,255,255,0.05)" />
              <line x1="40" y1="210" x2="570" y2="210" stroke="rgba(255,255,255,0.1)" />

              {/* Y Axis Labels */}
              <text x="15" y="34" fill="#64748b" fontSize="10">80</text>
              <text x="15" y="84" fill="#64748b" fontSize="10">50</text>
              <text x="15" y="134" fill="#64748b" fontSize="10">30</text>
              <text x="15" y="184" fill="#64748b" fontSize="10">10</text>

              {/* X Axis Labels */}
              <text x="50" y="230" fill="#64748b" fontSize="10">Mon</text>
              <text x="136" y="230" fill="#64748b" fontSize="10">Tue</text>
              <text x="222" y="230" fill="#64748b" fontSize="10">Wed</text>
              <text x="308" y="230" fill="#64748b" fontSize="10">Thu</text>
              <text x="394" y="230" fill="#64748b" fontSize="10">Fri</text>
              <text x="480" y="230" fill="#64748b" fontSize="10">Sat</text>
              <text x="566" y="230" fill="#64748b" fontSize="10">Sun</text>

              {/* Admission Path */}
              <path d="M 50,150 Q 136,110 222,170 T 308,80 T 394,60 T 480,120 T 566,90 L 566,210 L 50,210 Z" fill="url(#admissionGrad)" />
              <path d="M 50,150 Q 136,110 222,170 T 308,80 T 394,60 T 480,120 T 566,90" fill="none" stroke="#0ea5e9" strokeWidth="3" />

              {/* Walk-in Path */}
              <path d="M 50,190 Q 136,160 222,120 T 308,130 T 394,110 T 480,170 T 566,160 L 566,210 L 50,210 Z" fill="url(#walkinGrad)" />
              <path d="M 50,190 Q 136,160 222,120 T 308,130 T 394,110 T 480,170 T 566,160" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="4 2" />

              {/* Dots on paths */}
              <circle cx="308" cy="80" r="4" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="394" cy="60" r="4" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="394" cy="110" r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <div className="chart-panel glass-panel">
          <div className="panel-header">
            <h3>Department Occupancy</h3>
            <p className="panel-desc">Active patient allocations</p>
          </div>
          <div className="panel-body occupancy-progress-list">
            <div className="progress-item">
              <div className="progress-details flex-between">
                <span>Emergency Medicine</span>
                <span>85%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar danger-bar" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div className="progress-item">
              <div className="progress-details flex-between">
                <span>Cardiology Ward</span>
                <span>68%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar primary-bar" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-details flex-between">
                <span>Neurology ICU</span>
                <span>92%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar critical-bar" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-details flex-between">
                <span>General Pediatrics</span>
                <span>40%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar success-bar" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bed Occupancy Grid Section */}
      <div className="bed-occupancy-section glass-panel mt-2">
        <div className="panel-header">
          <h3>Interactive Ward Bed Grid</h3>
          <p className="panel-desc">Real-time room occupancy and patient placement telemetry</p>
        </div>
        <div className="panel-body mt-1">
          <div className="wards-grid flex-row gap-1">
            {['ICU', 'ER', 'Gen Ward'].map(wardName => {
              const wardBeds = HOSPITAL_BEDS.filter(b => b.ward === wardName);
              return (
                <div key={wardName} className="ward-column flex-column flex-grow">
                  <h4 className="ward-title font-bold text-highlight mb-0-5">{wardName} Department</h4>
                  <div className="beds-layout flex-column gap-0-5">
                    {wardBeds.map(bed => {
                      const occupant = getPatientForBed(bed.id);
                      return (
                        <div 
                          key={bed.id} 
                          className={`bed-card glass-panel-hover flex-column gap-0-5 ${occupant ? 'occupied' : 'vacant'} ${wardName.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="bed-header flex-between">
                            <span className="bed-id font-bold text-highlight">{bed.id}</span>
                            <span className={`bed-status-badge ${occupant ? 'occupied' : 'vacant'}`}>
                              {occupant ? 'Occupied' : 'Vacant'}
                            </span>
                          </div>
                          
                          {occupant ? (
                            <div className="bed-occupant-info flex-column gap-0-25">
                              <div className="occupant-name font-bold text-highlight text-xs">{occupant.name}</div>
                              <div className="occupant-meta flex-between text-xs text-secondary">
                                <span>{occupant.age} yrs / {occupant.gender}</span>
                                <span className="blood-group text-primary font-bold">{occupant.bloodGroup}</span>
                              </div>
                              <div className="occupant-status mt-0-25 flex-between">
                                <span className={`triage-badge badge-${occupant.status.toLowerCase()}`}>{occupant.status}</span>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-xs px-0-5"
                                  onClick={() => handleReleaseBed(occupant.id)}
                                >
                                  Release
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bed-vacant-info flex-column">
                              <span className="vacant-text text-muted text-xs mb-0-5">Available for Triage</span>
                              <button 
                                type="button" 
                                className="btn btn-secondary btn-xs full-width"
                                onClick={() => handleOpenAssignModal(bed.id, null)}
                              >
                                Allocate Bed
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Log and ER Triage waitlist */}
      <div className="grid-2 dashboard-bottom">
        {/* Recent Audit Logs */}
        <div className="dashboard-card glass-panel">
          <div className="panel-header flex-between">
            <div>
              <h3>Operations Audit Ledger</h3>
              <p className="panel-desc">Real-time trace logs of clinical tasks</p>
            </div>
          </div>
          <div className="panel-body logs-list">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="log-row flex-row">
                <div className="log-timestamp">{formatDate(log.timestamp).split('at')[1]}</div>
                <div className="log-details">
                  <span className="log-action">{log.action}</span>
                  <span className="log-detail-desc">{log.detail}</span>
                </div>
                <span className="log-user">{log.user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ER Triage Placement Waitlist */}
        <div className="dashboard-card glass-panel">
          <div className="panel-header">
            <h3>ER Triage Placement Queue</h3>
            <p className="panel-desc">Admitted and critical care patients awaiting bed assignment</p>
          </div>
          <div className="panel-body waitlist-content">
            <div className="waitlist-items-list flex-column gap-0-5">
              {patients.filter(p => p.status === 'Admitted' || p.status === 'Critical').map(p => {
                return (
                  <div key={p.id} className="waitlist-item flex-between glass-panel p-0-5 border-color-glow">
                    <div className="waitlist-pat-details flex-column">
                      <span className="pat-name font-bold text-highlight text-xs">{p.name}</span>
                      <span className="pat-meta text-muted text-xs">{p.age} yrs / {p.gender} | Blood: {p.bloodGroup}</span>
                      <div className="pat-badges flex-row gap-0-5 mt-0-25">
                        <span className={`triage-badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                        {p.bedNumber ? (
                          <span className="triage-badge badge-success font-bold text-xs">Bed: {p.bedNumber}</span>
                        ) : (
                          <span className="triage-badge badge-danger font-bold text-xs flex-row gap-0-25">
                            <AlertTriangle size={10} /> Waitlisted
                          </span>
                        )}
                      </div>
                    </div>
                    {!p.bedNumber && (
                      <button 
                        type="button" 
                        className="btn btn-primary btn-sm px-0-5"
                        onClick={() => handleOpenAssignModal(null, p.id)}
                      >
                        Assign Bed
                      </button>
                    )}
                  </div>
                );
              })}
              {patients.filter(p => p.status === 'Admitted' || p.status === 'Critical').length === 0 && (
                <div className="empty-waitlist-fallback text-center py-2 text-muted text-xs">
                  No active admissions in queue. All patients placed.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Register Patient */}
      {showPatientModal && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Register New Patient Intake</h3>
              <button className="close-modal" onClick={() => setShowPatientModal(false)}>×</button>
            </div>
            <form onSubmit={handlePatientSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" className="form-input" required 
                    value={patientForm.name} onChange={(e) => setPatientForm({...patientForm, name: e.target.value})} 
                  />
                </div>
                <div className="form-group-row grid-2">
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input 
                      type="number" className="form-input" required 
                      value={patientForm.age} onChange={(e) => setPatientForm({...patientForm, age: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select 
                      className="form-select" required
                      value={patientForm.gender} onChange={(e) => setPatientForm({...patientForm, gender: e.target.value as any})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input 
                    type="tel" className="form-input" required placeholder="+1 (555) 000-0000"
                    value={patientForm.contact} onChange={(e) => setPatientForm({...patientForm, contact: e.target.value})} 
                  />
                </div>
                <div className="form-group-row grid-2">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select 
                      className="form-select"
                      value={patientForm.bloodGroup} onChange={(e) => setPatientForm({...patientForm, bloodGroup: e.target.value})}
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Triage Status</label>
                    <select 
                      className="form-select"
                      value={patientForm.status} onChange={(e) => setPatientForm({...patientForm, status: e.target.value as any})}
                    >
                      <option value="Outpatient">Outpatient</option>
                      <option value="Admitted">Admitted (Inpatient)</option>
                      <option value="Critical">Critical Care</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Permanent Address</label>
                  <input 
                    type="text" className="form-input" 
                    value={patientForm.address} onChange={(e) => setPatientForm({...patientForm, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPatientModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Book Appointment */}
      {showAptModal && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Schedule New Appointment Slot</h3>
              <button className="close-modal" onClick={() => setShowAptModal(false)}>×</button>
            </div>
            <form onSubmit={handleAptSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select Registered Patient *</label>
                  <select 
                    className="form-select" required
                    value={aptForm.patientId} onChange={(e) => setAptForm({...aptForm, patientId: e.target.value})}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Roster Doctor *</label>
                  <select 
                    className="form-select" required
                    value={aptForm.doctorId} onChange={(e) => setAptForm({...aptForm, doctorId: e.target.value})}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization} - {d.status})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Schedule Date & Time *</label>
                  <input 
                    type="datetime-local" className="form-input" required
                    value={aptForm.dateTime} onChange={(e) => setAptForm({...aptForm, dateTime: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason for Consultation *</label>
                  <input 
                    type="text" className="form-input" required placeholder="e.g. Checkup, Lab report review"
                    value={aptForm.reason} onChange={(e) => setAptForm({...aptForm, reason: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAptModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Time-Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Assign Bed Allocation */}
      {showAssignModal && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Allocate Clinical Bed Space</h3>
              <button className="close-modal" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <form onSubmit={handleAssignBedSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Patient *</label>
                  {selectedPatientForAssign ? (
                    <div className="static-form-val font-bold text-highlight">
                      {patients.find(p => p.id === selectedPatientForAssign)?.name} (ID: {selectedPatientForAssign})
                    </div>
                  ) : (
                    <select 
                      className="form-select" required
                      value={patientIdForAssign} onChange={e => setPatientIdForAssign(e.target.value)}
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients
                        .filter(p => (p.status === 'Admitted' || p.status === 'Critical') && !p.bedNumber)
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.status} - ID: {p.id})</option>
                        ))
                      }
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Bed Space *</label>
                  {selectedBedForAssign ? (
                    <div className="static-form-val font-bold text-highlight">
                      {HOSPITAL_BEDS.find(b => b.id === selectedBedForAssign)?.label} (ID: {selectedBedForAssign})
                    </div>
                  ) : (
                    <select 
                      className="form-select" required
                      value={bedIdForAssign} onChange={e => setBedIdForAssign(e.target.value)}
                    >
                      <option value="">-- Choose Bed --</option>
                      {HOSPITAL_BEDS
                        .filter(b => !patients.some(p => p.bedNumber === b.id))
                        .map(b => (
                          <option key={b.id} value={b.id}>{b.label} ({b.ward})</option>
                        ))
                      }
                    </select>
                  )}
                </div>
              </div>
              <div className="modal-footer flex-row mt-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Authorize Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardView;
