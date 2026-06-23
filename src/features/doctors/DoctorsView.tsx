import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { DoctorStatus } from '../../types';
import { getDoctorStatusBadge } from '../../utils/helpers';
import { 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  Star, 
  Activity, 
  UserCheck
} from 'lucide-react';
import './DoctorsView.css';

export const DoctorsView: React.FC = () => {
  const { doctors, changeDoctorStatus } = useApp();
  const [filterDept, setFilterDept] = useState<string>('All');
  
  // Filter doctors
  const filteredDoctors = doctors.filter(d => {
    return filterDept === 'All' || d.department === filterDept;
  });

  const handleStatusToggle = async (id: string, newStatus: DoctorStatus) => {
    await changeDoctorStatus(id, newStatus);
  };

  // Compute roster stats
  const onDutyCount = doctors.filter(d => d.status === 'On Duty' || d.status === 'Available').length;
  const inSurgeryCount = doctors.filter(d => d.status === 'In Surgery').length;
  const coveragePercent = Math.round((onDutyCount / doctors.length) * 100);

  // Distinct departments
  const departments = ['All', ...Array.from(new Set(doctors.map(d => d.department)))];

  const getDocPhoto = (id: string) => {
    switch (id) {
      case 'doc-1': return 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150';
      case 'doc-2': return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
      case 'doc-3': return 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150';
      case 'doc-4': return 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150';
      case 'doc-5': return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150';
      default: return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150';
    }
  };

  return (
    <div className="doctors-view page-wrapper">
      {/* Roster overview widgets */}
      <div className="grid-4 roster-widgets">
        <div className="stats-card glass-panel flex-row roster-summary-card">
          <div className="widget-icon primary-glow"><Users size={20} /></div>
          <div className="widget-details">
            <span className="label">Total Roster</span>
            <span className="value">{doctors.length} MDs</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row roster-summary-card">
          <div className="widget-icon green-glow"><UserCheck size={20} /></div>
          <div className="widget-details">
            <span className="label">On Duty Now</span>
            <span className="value">{onDutyCount} Active</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row roster-summary-card">
          <div className="widget-icon danger-glow"><Activity size={20} /></div>
          <div className="widget-details">
            <span className="label">In Surgery</span>
            <span className="value">{inSurgeryCount} Active</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row roster-summary-card">
          <div className="widget-icon orange-glow"><Clock size={20} /></div>
          <div className="widget-details">
            <span className="label">Roster Coverage</span>
            <span className="value">{coveragePercent}% Staffed</span>
          </div>
        </div>
      </div>

      {/* filter bar */}
      <div className="roster-header glass-panel flex-between">
        <div className="flex-row gap-0-5">
          <span className="form-label font-bold text-highlight mr-1">Roster filter:</span>
          <div className="filter-tabs flex-row">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`filter-tab ${filterDept === dept ? 'active' : ''}`}
                onClick={() => setFilterDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
        <p className="roster-meta-subtitle">Change shifts status to update calendar slots conflict algorithms</p>
      </div>

      {/* Grid List */}
      <div className="grid-3 doctors-grid mt-2">
        {filteredDoctors.map((doc) => {
          const statusBadge = getDoctorStatusBadge(doc.status);
          return (
            <div key={doc.id} className="doctor-card glass-panel glass-panel-hover">
              <div className="card-top flex-row">
                <img src={getDocPhoto(doc.id)} alt={doc.name} className="doctor-avatar-card" />
                <div className="doc-meta">
                  <div className="doc-status-line flex-between">
                    <span className={statusBadge.className}>
                      <span className="badge-dot" />
                      {statusBadge.label}
                    </span>
                    <div className="rating-box flex-row">
                      <Star size={12} className="star-icon" fill="currentColor" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                  <h3 className="doc-name-card">{doc.name}</h3>
                  <span className="doc-specialty-card">{doc.specialization}</span>
                </div>
              </div>

              <div className="card-body-roster">
                <div className="roster-info-row flex-row">
                  <Clock size={14} />
                  <span>{doc.shiftHours}</span>
                </div>
                <div className="roster-info-row flex-row">
                  <Mail size={14} />
                  <span>{doc.email}</span>
                </div>
                <div className="roster-info-row flex-row">
                  <Phone size={14} />
                  <span>{doc.contact}</span>
                </div>
              </div>

              <div className="card-footer-roster">
                <span className="footer-label">Modify Duty Node Status:</span>
                <div className="status-selector-grid">
                  <button 
                    className={`status-btn btn-sm ${doc.status === 'Available' ? 'active available' : ''}`}
                    onClick={() => handleStatusToggle(doc.id, 'Available')}
                  >
                    Available
                  </button>
                  <button 
                    className={`status-btn btn-sm ${doc.status === 'In Surgery' ? 'active surgery' : ''}`}
                    onClick={() => handleStatusToggle(doc.id, 'In Surgery')}
                  >
                    Surgery
                  </button>
                  <button 
                    className={`status-btn btn-sm ${doc.status === 'Off Duty' ? 'active off-duty' : ''}`}
                    onClick={() => handleStatusToggle(doc.id, 'Off Duty')}
                  >
                    Off Duty
                  </button>
                  <button 
                    className={`status-btn btn-sm ${doc.status === 'On Leave' ? 'active leave' : ''}`}
                    onClick={() => handleStatusToggle(doc.id, 'On Leave')}
                  >
                    Leave
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DoctorsView;
