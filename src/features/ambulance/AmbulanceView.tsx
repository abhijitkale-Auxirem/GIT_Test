import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { DispatchSeverity, AmbulanceStatus } from '../../types';
import { 
  Truck, 
  AlertTriangle, 
  PlusCircle, 
  Clock, 
  User, 
  MapPin, 
  Activity, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import './AmbulanceView.css';

export const AmbulanceView: React.FC = () => {
  const { 
    ambulances, 
    patients, 
    dispatchUnit, 
    stepAmbulanceProgress, 
    setAmbulanceStatus,
    addToast 
  } = useApp();

  // Dispatch Form State
  const [selectedAmbId, setSelectedAmbId] = useState('');
  const [selectedPatId, setSelectedPatId] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [dispatchSeverity, setDispatchSeverity] = useState<DispatchSeverity>('Urgent');

  // Stats
  const totalFleet = ambulances.length;
  const availableCount = ambulances.filter(a => a.status === 'Available').length;
  const dispatchedCount = ambulances.filter(a => a.status === 'Dispatched').length;
  const maintenanceCount = ambulances.filter(a => a.status === 'Maintenance').length;

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmbId || !selectedPatId || !incidentLocation) {
      addToast('Please fill out all dispatch requirements.', 'warning');
      return;
    }

    await dispatchUnit(selectedAmbId, selectedPatId, incidentLocation, dispatchSeverity);
    
    // Reset Form
    setSelectedAmbId('');
    setSelectedPatId('');
    setIncidentLocation('');
    setDispatchSeverity('Urgent');
  };

  const handleStepProgress = async (ambId: string) => {
    await stepAmbulanceProgress(ambId);
  };

  const handleStatusChange = async (ambId: string, status: AmbulanceStatus) => {
    await setAmbulanceStatus(ambId, status);
  };

  const getAmbulanceStatusBadge = (status: AmbulanceStatus) => {
    switch (status) {
      case 'Available':
        return { label: 'Available', className: 'badge badge-success' };
      case 'Dispatched':
        return { label: 'Dispatched', className: 'badge badge-danger animate-pulse-glow' };
      case 'Maintenance':
        return { label: 'Maintenance', className: 'badge badge-warning' };
      case 'Off Duty':
        return { label: 'Off Duty', className: 'badge badge-secondary' };
      default:
        return { label: status, className: 'badge badge-secondary' };
    }
  };

  const getSeverityBadge = (severity: DispatchSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'badge-danger';
      case 'Urgent':
        return 'badge-warning';
      case 'Routine':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getCheckpointClass = (progress: number, step: number) => {
    if (progress === step) return 'checkpoint active';
    if (progress > step) return 'checkpoint passed';
    return 'checkpoint pending';
  };

  const getProgressPercentage = (progress: number) => {
    return (progress / 4) * 100;
  };

  const availableAmbulances = ambulances.filter(a => a.status === 'Available');

  return (
    <div className="ambulance-view page-wrapper">
      {/* Fleet Summary Metrics */}
      <div className="grid-4 fleet-widgets">
        <div className="stats-card glass-panel flex-row fleet-summary-card">
          <div className="widget-icon primary-glow"><Truck size={20} /></div>
          <div className="widget-details">
            <span className="label">Total Dispatch Fleet</span>
            <span className="value">{totalFleet} Vehicles</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row fleet-summary-card">
          <div className="widget-icon green-glow"><CheckCircle size={20} /></div>
          <div className="widget-details">
            <span className="label">Units Available</span>
            <span className="value">{availableCount} Active</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row fleet-summary-card">
          <div className="widget-icon danger-glow"><ShieldAlert size={20} /></div>
          <div className="widget-details">
            <span className="label">Units Dispatched</span>
            <span className="value">{dispatchedCount} Transit</span>
          </div>
        </div>

        <div className="stats-card glass-panel flex-row fleet-summary-card">
          <div className="widget-icon orange-glow"><AlertTriangle size={20} /></div>
          <div className="widget-details">
            <span className="label">In Maintenance</span>
            <span className="value">{maintenanceCount} Vehicles</span>
          </div>
        </div>
      </div>

      <div className="grid-3 ambulance-layout">
        {/* Fleet Roster Column */}
        <div className="fleet-column glass-panel">
          <div className="panel-header">
            <h3>Active Fleet Dispatch Roster</h3>
            <p className="panel-desc">Paramedic teams and shift availability status</p>
          </div>
          <div className="panel-body fleet-items mt-1 flex-column gap-1">
            {ambulances.map((amb) => {
              const badge = getAmbulanceStatusBadge(amb.status);
              return (
                <div key={amb.id} className="fleet-item-card glass-panel flex-column gap-0-5">
                  <div className="fleet-card-top flex-between">
                    <span className="vehicle-id font-bold text-highlight">{amb.vehicleNumber}</span>
                    <span className={badge.className}>{badge.label}</span>
                  </div>
                  <div className="crew-details flex-column text-xs text-secondary gap-0-25">
                    <div className="flex-row gap-0-5"><strong>Driver:</strong> {amb.driverName}</div>
                    <div className="flex-row gap-0-5"><strong>Paramedic:</strong> {amb.paramedicName}</div>
                  </div>
                  <div className="fleet-actions flex-between mt-0-25 border-top-glow pt-0-5">
                    <span className="text-muted text-xs">Set Status:</span>
                    <select 
                      className="form-select status-select"
                      value={amb.status} 
                      disabled={amb.status === 'Dispatched'}
                      onChange={(e) => handleStatusChange(amb.id, e.target.value as any)}
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Off Duty">Off Duty</option>
                      {amb.status === 'Dispatched' && <option value="Dispatched">Dispatched</option>}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dispatch Console & Telemetry tracker */}
        <div className="grid-span-2 flex-column gap-1-5">
          {/* Dispatch Form Panel */}
          <div className="dispatch-panel glass-panel">
            <div className="panel-header">
              <h3>Dispatches Coordinator Console</h3>
              <p className="panel-desc">Authorize emergency ambulance transit routing</p>
            </div>
            <form onSubmit={handleDispatchSubmit} className="panel-body mt-1">
              <div className="form-grid">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Select Available Vehicle *</label>
                    <select 
                      className="form-select" required
                      value={selectedAmbId} onChange={(e) => setSelectedAmbId(e.target.value)}
                    >
                      <option value="">-- Choose Ambulance --</option>
                      {availableAmbulances.map(a => (
                        <option key={a.id} value={a.id}>{a.vehicleNumber} (Crew: {a.driverName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Incoming Patient *</label>
                    <select 
                      className="form-select" required
                      value={selectedPatId} onChange={(e) => setSelectedPatId(e.target.value)}
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-3 mt-0-5">
                  <div className="form-group grid-span-2">
                    <label className="form-label">Incident Pick-Up Address *</label>
                    <div className="address-input-wrapper">
                      <MapPin size={14} className="address-icon" />
                      <input 
                        type="text" className="form-input address-input" required 
                        placeholder="e.g. 5th Ave / Broadway Intersection"
                        value={incidentLocation} onChange={(e) => setIncidentLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Triage Severity *</label>
                    <select 
                      className="form-select" required
                      value={dispatchSeverity} onChange={(e) => setDispatchSeverity(e.target.value as any)}
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary full-width mt-1 flex-row gap-0-5 justify-center">
                  <PlusCircle size={16} /> Authorize Emergency Dispatch
                </button>
              </div>
            </form>
          </div>

          {/* Active Dispatches Telemetry */}
          <div className="telemetry-panel glass-panel">
            <div className="panel-header">
              <h3>Real-Time Dispatch Telemetry</h3>
              <p className="panel-desc">Live tracker status showing patient transit updates</p>
            </div>
            <div className="panel-body telemetry-list mt-1 flex-column gap-1">
              {ambulances.filter(a => a.status === 'Dispatched').map((amb) => {
                const progress = amb.progress ?? 0;
                return (
                  <div key={amb.id} className="telemetry-card glass-panel flex-column gap-1">
                    <div className="telemetry-card-header flex-between">
                      <div className="vehicle-info flex-row gap-0-5">
                        <span className="vehicle-plate font-bold text-highlight">{amb.vehicleNumber}</span>
                        <span className={`triage-badge ${getSeverityBadge(amb.severity || 'Routine')}`}>{amb.severity}</span>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm flex-row gap-0-25"
                        onClick={() => handleStepProgress(amb.id)}
                      >
                        <Activity size={12} /> {progress < 4 ? 'Advance Checkpoint' : 'Decommission/Release'}
                      </button>
                    </div>

                    <div className="telemetry-details grid-3 text-xs text-secondary">
                      <div className="flex-row gap-0-25"><User size={12} /> <strong>Patient:</strong> {amb.patientName}</div>
                      <div className="flex-row gap-0-25"><MapPin size={12} /> <strong>Location:</strong> {amb.location}</div>
                      <div className="flex-row gap-0-25"><Clock size={12} /> <strong>Active Crew:</strong> {amb.paramedicName}</div>
                    </div>

                    {/* Progress tracking line */}
                    <div className="progress-timeline-wrapper flex-column gap-0-5 mt-0-5">
                      <div className="progress-track-bg">
                        <div className="progress-track-fill" style={{ width: `${getProgressPercentage(progress)}%` }} />
                      </div>
                      <div className="checkpoints-row flex-between text-xs font-bold text-muted">
                        <span className={getCheckpointClass(progress, 0)}>Dispatched</span>
                        <span className={getCheckpointClass(progress, 1)}>En Route</span>
                        <span className={getCheckpointClass(progress, 2)}>On Scene</span>
                        <span className={getCheckpointClass(progress, 3)}>In Transit</span>
                        <span className={getCheckpointClass(progress, 4)}>Arrived</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {ambulances.filter(a => a.status === 'Dispatched').length === 0 && (
                <div className="empty-telemetry text-center py-2 text-muted text-xs">
                  No active dispatches. All vehicles at station or maintenance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AmbulanceView;
