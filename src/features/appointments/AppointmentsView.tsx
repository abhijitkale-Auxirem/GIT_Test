import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Appointment, AppointmentStatus } from '../../types';
import { getAppointmentStatusBadge, formatDate } from '../../utils/helpers';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  Plus, 
  Check, 
  X, 
  Slash,
  AlertCircle,
  FileText
} from 'lucide-react';
import './AppointmentsView.css';

export const AppointmentsView: React.FC = () => {
  const { 
    appointments, 
    doctors, 
    patients, 
    scheduleAppointment, 
    updateAptStatus, 
    addToast 
  } = useApp();

  const [filterDept, setFilterDept] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showBookModal, setShowBookModal] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [currentWeekRef, setCurrentWeekRef] = useState<Date>(new Date('2026-06-23T12:00:00Z'));

  // Notes Modal state
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [consultNotes, setConsultNotes] = useState('');

  // Form State
  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    dateTime: '',
    reason: '',
    notes: ''
  });

  const getWeekDays = (refDate: Date) => {
    const currentDay = refDate.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekRef);
    prev.setDate(currentWeekRef.getDate() - 7);
    setCurrentWeekRef(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekRef);
    next.setDate(currentWeekRef.getDate() + 7);
    setCurrentWeekRef(next);
  };

  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const formatHourLabel = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayH).padStart(2, '0')}:00 ${ampm}`;
  };

  const getAptsForSlot = (day: Date, hour: number) => {
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      const sameDay = aptDate.getFullYear() === day.getFullYear() &&
                      aptDate.getMonth() === day.getMonth() &&
                      aptDate.getDate() === day.getDate();
      const sameHour = aptDate.getHours() === hour;
      return sameDay && sameHour;
    });
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.dateTime || !form.reason) {
      addToast('All fields marked with * are required.', 'warning');
      return;
    }

    const patient = patients.find(p => p.id === form.patientId);
    const doctor = doctors.find(d => d.id === form.doctorId);

    if (!patient || !doctor) {
      addToast('Selected patient or doctor not found.', 'danger');
      return;
    }

    const success = await scheduleAppointment({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department,
      dateTime: new Date(form.dateTime).toISOString(),
      reason: form.reason,
      status: 'Scheduled',
      notes: form.notes
    });

    if (success) {
      setShowBookModal(false);
      setForm({
        patientId: '',
        doctorId: '',
        dateTime: '',
        reason: '',
        notes: ''
      });
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    if (status === 'Completed') {
      setEditingAptId(id);
      setConsultNotes('');
    } else {
      await updateAptStatus(id, status);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingAptId) return;
    await updateAptStatus(editingAptId, 'Completed', consultNotes);
    setEditingAptId(null);
    setConsultNotes('');
  };

  // Filters
  const filteredAppointments = appointments.filter(a => {
    const matchesDept = filterDept === 'All' || a.department === filterDept;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesDept && matchesStatus;
  });

  // Get distinct departments from doctor roster
  const departments = ['All', ...Array.from(new Set(doctors.map(d => d.department)))];

  // Group appointments by date for chronological presentation
  const groupedApts = filteredAppointments.reduce((acc, apt) => {
    const dateStr = new Date(apt.dateTime).toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="appointments-view page-wrapper">
      {/* Search and Filters panel */}
      <div className="scheduler-header glass-panel flex-between">
        <div className="filter-controls flex-row">
          <div className="filter-group flex-column">
            <label className="form-label">View Mode</label>
            <div className="toggle-buttons flex-row">
              <button 
                type="button" 
                className={`btn btn-sm toggle-btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('timeline')}
              >
                List
              </button>
              <button 
                type="button" 
                className={`btn btn-sm toggle-btn ${viewMode === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode('matrix')}
              >
                Weekly Matrix
              </button>
            </div>
          </div>

          <div className="filter-group flex-column">
            <label className="form-label">Clinical Dept</label>
            <select 
              className="form-select filter-select"
              value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group flex-column">
            <label className="form-label">Appointment Status</label>
            <select 
              className="form-select filter-select"
              value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
          <Plus size={16} /> Schedule Consult
        </button>
      </div>

      {/* Roster & Timetable layout */}
      <div className="grid-3 scheduler-layout">
        {/* Active Schedule Timelines or Weekly Matrix Grid */}
        <div className="schedule-timeline grid-span-2 glass-panel">
          {viewMode === 'timeline' ? (
            <>
              <div className="panel-header">
                <h3>Consultation Roster Log</h3>
                <p className="panel-desc">Chronological queue of patient appointments</p>
              </div>
              <div className="panel-body timeline-content">
                {Object.keys(groupedApts).length > 0 ? (
                  Object.entries(groupedApts).map(([date, apts]) => (
                    <div key={date} className="timeline-date-group">
                      <h4 className="timeline-date flex-row">
                        <CalendarIcon size={14} /> {date}
                      </h4>
                      <div className="timeline-items">
                        {apts.map((apt) => {
                          const statusBadge = getAppointmentStatusBadge(apt.status);
                          return (
                            <div key={apt.id} className={`apt-timeline-card ${apt.status.toLowerCase()}`}>
                              <div className="apt-card-top flex-between">
                                <div className="apt-time flex-row">
                                  <Clock size={12} />
                                  <span>{formatDate(apt.dateTime).split('at')[1]}</span>
                                </div>
                                <span className={statusBadge.className}>
                                  <span className="badge-dot" />
                                  {statusBadge.label}
                                </span>
                              </div>
                              
                              <div className="apt-card-details">
                                <div className="detail-row flex-row">
                                  <User size={14} className="detail-icon" />
                                  <span className="font-bold text-highlight">{apt.patientName}</span>
                                  <span className="pat-id-tag">ID: {apt.patientId}</span>
                                </div>
                                <div className="detail-row flex-row">
                                  <Stethoscope size={14} className="detail-icon" />
                                  <span>{apt.doctorName} ({apt.department})</span>
                                </div>
                                <div className="detail-row flex-row reason-row">
                                  <FileText size={14} className="detail-icon" />
                                  <p className="apt-reason">"{apt.reason}"</p>
                                </div>
                                
                                {apt.notes && (
                                  <div className="clinical-notes-box">
                                    <span className="notes-label">Consultation Notes:</span>
                                    <p className="notes-text">{apt.notes}</p>
                                  </div>
                                )}
                              </div>

                              {apt.status === 'Scheduled' && (
                                <div className="apt-card-actions flex-row">
                                  <button 
                                    className="btn btn-secondary btn-sm flex-row"
                                    onClick={() => handleStatusChange(apt.id, 'Completed')}
                                  >
                                    <Check size={12} className="text-success" /> Complete Consult
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm flex-row"
                                    onClick={() => handleStatusChange(apt.id, 'Cancelled')}
                                  >
                                    <X size={12} className="text-danger" /> Cancel
                                  </button>
                                  <button 
                                    className="btn btn-secondary btn-sm flex-row"
                                    onClick={() => handleStatusChange(apt.id, 'No Show')}
                                  >
                                    <Slash size={12} className="text-warning" /> No Show
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-scheduler-fallback text-center py-2">
                    <AlertCircle size={24} className="text-muted mb-1" />
                    <p>No appointments match the search filters.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="panel-header">
                <h3>Weekly Schedule Matrix</h3>
                <p className="panel-desc">Visual timeblock overlay grid mapping active shifts</p>
              </div>
              <div className="panel-body matrix-content mt-1">
                <div className="matrix-navigation flex-between mb-1">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrevWeek}>&larr; Prev Week</button>
                  <span className="current-week-label font-bold text-highlight text-xs">
                    Week of {formatDate(getWeekDays(currentWeekRef)[0].toISOString(), false)} - {formatDate(getWeekDays(currentWeekRef)[6].toISOString(), false)}
                  </span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleNextWeek}>Next Week &rarr;</button>
                </div>
                <div className="matrix-grid-scroll">
                  <table className="matrix-grid-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        {getWeekDays(currentWeekRef).map((day, idx) => (
                          <th key={idx} className={day.toDateString() === new Date().toDateString() ? 'today-column-header' : ''}>
                            <div className="day-name">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                            <div className="day-date">{day.getDate()} {day.toLocaleDateString(undefined, { month: 'short' })}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map(hour => (
                        <tr key={hour}>
                          <td className="time-col font-bold">{formatHourLabel(hour)}</td>
                          {getWeekDays(currentWeekRef).map((day, dayIdx) => {
                            const slotApts = getAptsForSlot(day, hour);
                            return (
                              <td key={dayIdx} className="grid-cell">
                                {slotApts.map(apt => {
                                  return (
                                    <div 
                                      key={apt.id} 
                                      className={`matrix-apt-card ${apt.status.toLowerCase()}`}
                                      onClick={() => {
                                        addToast(`Consult: ${apt.patientName} (${apt.doctorName})`, 'info');
                                      }}
                                    >
                                      <div className="matrix-apt-time font-bold">{formatDate(apt.dateTime).split('at')[1]}</div>
                                      <div className="matrix-apt-patient">{apt.patientName}</div>
                                      <div className="matrix-apt-doctor">{apt.doctorName}</div>
                                    </div>
                                  );
                                })}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Doctors availability roster panel */}
        <div className="doctor-status-sidebar glass-panel">
          <div className="panel-header">
            <h3>Clinic Triage Staff</h3>
            <p className="panel-desc">Active roster and shifts availability</p>
          </div>
          <div className="panel-body doctors-mini-list">
            {doctors.map(doc => {
              return (
                <div key={doc.id} className="doc-mini-card flex-row">
                  <div className="doc-avatar-wrapper">
                    <img src={doc.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100'} alt={doc.name} className="doc-avatar-mini" />
                    <div className={`doc-status-dot ${doc.status.toLowerCase().replace(/\s+/g, '-')}`} />
                  </div>
                  <div className="doc-mini-details">
                    <span className="doc-name font-bold text-highlight">{doc.name}</span>
                    <span className="doc-specialty">{doc.specialization}</span>
                    <span className="doc-shift">Shift: {doc.shiftHours}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: Book Consultation */}
      {showBookModal && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Schedule Clinical Consultation</h3>
              <button className="close-modal" onClick={() => setShowBookModal(false)}>×</button>
            </div>
            <form onSubmit={handleBookAppointment}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Select Patient Record *</label>
                  <select 
                    className="form-select" required
                    value={form.patientId} onChange={(e) => setForm({...form, patientId: e.target.value})}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Clinic Doctor *</label>
                  <select 
                    className="form-select" required
                    value={form.doctorId} onChange={(e) => setForm({...form, doctorId: e.target.value})}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization} - {d.status})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Date & Time *</label>
                  <input 
                    type="datetime-local" className="form-input" required
                    value={form.dateTime} onChange={(e) => setForm({...form, dateTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason for Consultation *</label>
                  <input 
                    type="text" className="form-input" required placeholder="e.g. Triage review, monthly checkup"
                    value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pre-Consultation Intake Notes</label>
                  <textarea 
                    className="form-textarea" rows={3} placeholder="Patient details, custom requests..."
                    value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Lock Roster Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Complete Consult Notes input */}
      {editingAptId && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Log Consultation Notes</h3>
              <button className="close-modal" onClick={() => setEditingAptId(null)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Provide doctor observations, findings, and prescriptions *</label>
                <textarea 
                  className="form-textarea" rows={5} required placeholder="Heart rate, diagnostics, follow-up instructions..."
                  value={consultNotes} onChange={(e) => setConsultNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer flex-row">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingAptId(null)}>Discard</button>
              <button type="button" className="btn btn-primary animate-pulse" onClick={handleSaveNotes}>
                Complete & Log Consult
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppointmentsView;
