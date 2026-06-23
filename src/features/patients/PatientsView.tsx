import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { VitalsReading, PatientStatus } from '../../types';
import { 
  getPatientStatusBadge, 
  formatDate
} from '../../utils/helpers';
import { 
  Search, 
  Plus, 
  Activity, 
  PlusCircle, 
  FileSpreadsheet, 
  UserPlus, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import './PatientsView.css';

export const PatientsView: React.FC = () => {
  const { 
    patients, 
    doctors, 
    registerPatient, 
    logVitals, 
    addPrescription, 
    addToast,
    addAllergy,
    removeAllergy,
    addDiagnosis,
    removeDiagnosis,
    orderLabReport,
    fillLabReport
  } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Phase 2 Clinical State
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [showAddLab, setShowAddLab] = useState(false);
  const [labTestName, setLabTestName] = useState('');
  const [labNotes, setLabNotes] = useState('');

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newAllergy) return;
    await addAllergy(selectedPatientId, newAllergy);
    setNewAllergy('');
    setShowAddAllergy(false);
  };

  const handleAddDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newDiagnosis) return;
    await addDiagnosis(selectedPatientId, newDiagnosis);
    setNewDiagnosis('');
    setShowAddDiagnosis(false);
  };

  const handleRequestLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !labTestName) return;
    await orderLabReport(selectedPatientId, labTestName, labNotes);
    setShowAddLab(false);
    setLabTestName('');
    setLabNotes('');
  };

  const handleMockCompleteLab = async (reportId: string, testName: string) => {
    if (!selectedPatientId) return;
    
    let results: any[] = [];
    let notes = 'Diagnostics analysis signed off by Pathology Lab.';
    
    if (testName.toLowerCase().includes('blood') || testName.toLowerCase().includes('cbc')) {
      results = [
        { parameter: 'White Blood Cell (WBC)', value: '7.1', referenceRange: '4.5 - 11.0 ×10^3/µL', status: 'Normal' },
        { parameter: 'Red Blood Cell (RBC)', value: '5.1', referenceRange: '4.3 - 5.9 ×10^6/µL', status: 'Normal' },
        { parameter: 'Hemoglobin', value: '14.8', referenceRange: '13.5 - 17.5 g/dL', status: 'Normal' },
        { parameter: 'Platelets', value: '265', referenceRange: '150 - 450 ×10^3/µL', status: 'Normal' }
      ];
      notes = 'CBC parameters are within standard limits.';
    } else if (testName.toLowerCase().includes('lipid') || testName.toLowerCase().includes('cholesterol')) {
      results = [
        { parameter: 'Total Cholesterol', value: '240', referenceRange: '< 200 mg/dL', status: 'High' },
        { parameter: 'Triglycerides', value: '195', referenceRange: '< 150 mg/dL', status: 'High' },
        { parameter: 'HDL Cholesterol', value: '35', referenceRange: '> 40 mg/dL', status: 'Low' },
        { parameter: 'LDL Cholesterol', value: '166', referenceRange: '< 100 mg/dL', status: 'High' }
      ];
      notes = 'Patient exhibits hypercholesterolemia. Suggest cardiology review.';
    } else {
      results = [
        { parameter: 'General Screen', value: 'Negative', referenceRange: 'Negative', status: 'Normal' }
      ];
      notes = 'General screening results indicate no acute pathogens or anomalies.';
    }

    await fillLabReport(selectedPatientId, reportId, results, notes);
  };
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modal & Drawer State
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  
  // Log Vitals Form State
  const [vitalsForm, setVitalsForm] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    pulseRate: '',
    temperature: '',
    oxygenSaturation: ''
  });

  // Prescription Form State
  const [rxForm, setRxForm] = useState({
    drugName: '',
    dosage: '',
    frequency: 'Once Daily',
    duration: '',
    instructions: '',
    prescribedBy: ''
  });

  // Patient Registration Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    contact: '',
    email: '',
    bloodGroup: 'O+',
    address: '',
    status: 'Outpatient' as PatientStatus
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientForm.name || !patientForm.age || !patientForm.contact) {
      addToast('Name, Age, and Contact are required.', 'warning');
      return;
    }
    await registerPatient({
      ...patientForm,
      age: parseInt(patientForm.age),
      lastVisit: new Date().toISOString()
    });
    setShowAddPatient(false);
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

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    
    const sys = parseInt(vitalsForm.bpSystolic);
    const dia = parseInt(vitalsForm.bpDiastolic);
    const pulse = parseInt(vitalsForm.pulseRate);
    const temp = parseFloat(vitalsForm.temperature);
    const o2 = parseInt(vitalsForm.oxygenSaturation);

    if (!sys || !dia || !pulse || !temp || !o2) {
      addToast('All vital fields must be valid numbers.', 'warning');
      return;
    }

    await logVitals(selectedPatientId, {
      date: new Date().toISOString(),
      bpSystolic: sys,
      bpDiastolic: dia,
      pulseRate: pulse,
      temperature: temp,
      oxygenSaturation: o2
    });

    setVitalsForm({
      bpSystolic: '',
      bpDiastolic: '',
      pulseRate: '',
      temperature: '',
      oxygenSaturation: ''
    });
  };

  const handleAddRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    if (!rxForm.drugName || !rxForm.dosage || !rxForm.prescribedBy) {
      addToast('Drug Name, Dosage, and Prescribing Physician are required.', 'warning');
      return;
    }

    await addPrescription(selectedPatientId, {
      drugName: rxForm.drugName,
      dosage: rxForm.dosage,
      frequency: rxForm.frequency,
      duration: rxForm.duration,
      instructions: rxForm.instructions,
      prescribedBy: rxForm.prescribedBy
    });

    setShowAddPrescription(false);
    setRxForm({
      drugName: '',
      dosage: '',
      frequency: 'Once Daily',
      duration: '',
      instructions: '',
      prescribedBy: ''
    });
  };

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.contact.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Render vitals chart (custom SVGs)
  const renderVitalsChart = (vitals: VitalsReading[]) => {
    if (vitals.length < 2) {
      return (
        <div className="empty-chart-fallback flex-row">
          <Activity size={16} /> <span>Waiting for further logging cycles to project curves...</span>
        </div>
      );
    }

    // Limit to last 5
    const dataset = vitals.slice(-5);
    const pointsCount = dataset.length;
    const maxVal = Math.max(...dataset.map(v => v.bpSystolic), 140);
    const minVal = Math.min(...dataset.map(v => v.bpDiastolic), 60);
    const range = maxVal - minVal;
    
    const width = 360;
    const height = 120;
    const padding = 15;

    // Calculate chart coordinate mappings
    const getCoords = (index: number, val: number) => {
      const x = padding + (index * (width - 2 * padding)) / (pointsCount - 1);
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return { x, y };
    };

    // Build SVG path strings
    let systolicPath = '';
    let diastolicPath = '';

    dataset.forEach((v, index) => {
      const sysCoords = getCoords(index, v.bpSystolic);
      const diaCoords = getCoords(index, v.bpDiastolic);
      
      if (index === 0) {
        systolicPath = `M ${sysCoords.x},${sysCoords.y}`;
        diastolicPath = `M ${diaCoords.x},${diaCoords.y}`;
      } else {
        systolicPath += ` L ${sysCoords.x},${sysCoords.y}`;
        diastolicPath += ` L ${diaCoords.x},${diaCoords.y}`;
      }
    });

    return (
      <div className="vitals-chart-wrapper">
        <div className="chart-meta flex-between">
          <span className="chart-label font-bold text-highlight">Blood Pressure Trends</span>
          <div className="chart-legends flex-row">
            <span className="legend-dot sys-legend">SYS (mmHg)</span>
            <span className="legend-dot dia-legend">DIA (mmHg)</span>
          </div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="vitals-chart-svg">
          {/* Background grid line */}
          <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" />
          
          {/* Systolic Line */}
          <path d={systolicPath} fill="none" stroke="#ef4444" strokeWidth="2" />
          {dataset.map((v, i) => {
            const coords = getCoords(i, v.bpSystolic);
            return <circle key={`s-${i}`} cx={coords.x} cy={coords.y} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />;
          })}

          {/* Diastolic Line */}
          <path d={diastolicPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
          {dataset.map((v, i) => {
            const coords = getCoords(i, v.bpDiastolic);
            return <circle key={`d-${i}`} cx={coords.x} cy={coords.y} r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />;
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="patients-view page-wrapper">
      <div className="view-grid">
        {/* Main List Column */}
        <div className={`list-column ${selectedPatientId ? 'drawer-open' : ''}`}>
          {/* Search Control Block */}
          <div className="index-controls glass-panel">
            <div className="flex-between header-row">
              <h3>Patient Master Index</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddPatient(true)}>
                <UserPlus size={14} /> Intake Patient
              </button>
            </div>
            
            <div className="filter-row flex-row">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" placeholder="Search by name, ID, or phone..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input search-control"
                />
              </div>

              <select 
                className="form-select filter-control"
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Triage Categories</option>
                <option value="Admitted">Admitted</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Critical">Critical Care</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          {/* Table index */}
          <div className="table-wrapper glass-panel">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Identification</th>
                    <th>Demographics</th>
                    <th>Contact Info</th>
                    <th>Triage Category</th>
                    <th>Latest Vitals</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const statusBadge = getPatientStatusBadge(patient.status);
                    const latestVitals = patient.medicalRecord.vitalsHistory.slice(-1)[0];
                    return (
                      <tr 
                        key={patient.id} 
                        className={selectedPatientId === patient.id ? 'active-row' : ''}
                        onClick={() => setSelectedPatientId(patient.id)}
                      >
                        <td>
                          <div className="pat-meta-cell">
                            <span className="pat-name font-bold">{patient.name}</span>
                            <span className="pat-id">ID: {patient.id}</span>
                          </div>
                        </td>
                        <td>
                          <span className="pat-demographics">{patient.age} yrs / {patient.gender}</span>
                          <span className="pat-blood">Blood: {patient.bloodGroup}</span>
                        </td>
                        <td>
                          <span className="pat-contact">{patient.contact}</span>
                          <span className="pat-email">{patient.email}</span>
                        </td>
                        <td>
                          <span className={statusBadge.className}>
                            <span className="badge-dot" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td>
                          {latestVitals ? (
                            <div className="vitals-summary-cell">
                              <span className="vitals-bp">{latestVitals.bpSystolic}/{latestVitals.bpDiastolic} mmHg</span>
                              <span className="vitals-temp">{latestVitals.temperature}°F / {latestVitals.pulseRate} bpm</span>
                            </div>
                          ) : (
                            <span className="text-muted">Unrecorded</span>
                          )}
                        </td>
                        <td>
                          <button className="icon-btn btn-sm" aria-label="Open EMR">
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-table-cell">
                        No patient records match the filter configurations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* EMR Details Side Drawer */}
        {selectedPatient && (
          <div className="emr-drawer glass-panel">
            <div className="drawer-header flex-between">
              <div>
                <h2>Electronic Medical Record (EMR)</h2>
                <span className="emr-ref">Master Reference ID: {selectedPatient.id}</span>
              </div>
              <button className="close-modal" onClick={() => setSelectedPatientId(null)}>×</button>
            </div>

            <div className="drawer-body">
              {/* Patient Core Summary Card */}
              <div className="emr-profile-card">
                <div className="profile-top flex-between">
                  <div>
                    <h3>{selectedPatient.name}</h3>
                    <p className="pat-core-demographics">{selectedPatient.age} years | {selectedPatient.gender} | Blood: {selectedPatient.bloodGroup}</p>
                  </div>
                  <span className={getPatientStatusBadge(selectedPatient.status).className}>
                    {selectedPatient.status}
                  </span>
                </div>
                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="label">Contact</span>
                    <span className="value">{selectedPatient.contact}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Registered Email</span>
                    <span className="value">{selectedPatient.email}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="label">Home Address</span>
                    <span className="value">{selectedPatient.address || 'Unrecorded'}</span>
                  </div>
                  {/* Allergies and Diagnoses */}
                 <div className="conditions-section">
                   <div className="clinical-tags">
                     <div className="flex-between">
                       <span className="tags-label">Contraindications / Allergies:</span>
                       <button className="text-link-btn" onClick={() => setShowAddAllergy(!showAddAllergy)}>
                         {showAddAllergy ? 'Cancel' : '+ Add'}
                       </button>
                     </div>
                     {showAddAllergy && (
                       <form onSubmit={handleAddAllergy} className="tag-inline-form flex-row mt-1">
                         <input 
                           type="text" className="form-input form-input-xs flex-grow" placeholder="e.g. Latex" required
                           value={newAllergy} onChange={e => setNewAllergy(e.target.value)} 
                         />
                         <button type="submit" className="btn btn-secondary btn-sm flex-row px-0-5"><Plus size={12} /></button>
                       </form>
                     )}
                     <div className="tags-list mt-1">
                       {selectedPatient.medicalRecord.allergies.length > 0 ? (
                         selectedPatient.medicalRecord.allergies.map((a, i) => (
                           <span key={i} className="tag tag-danger flex-row">
                             <AlertTriangle size={10} /> {a}
                             <button type="button" className="tag-delete-btn" onClick={() => removeAllergy(selectedPatient.id, a)}>×</button>
                           </span>
                         ))
                       ) : (
                         <span className="text-muted text-xs">No known drug allergies (NKDA)</span>
                       )}
                     </div>
                   </div>
                   
                   <div className="clinical-tags mt-2">
                     <div className="flex-between">
                       <span className="tags-label">Active Diagnostics:</span>
                       <button className="text-link-btn" onClick={() => setShowAddDiagnosis(!showAddDiagnosis)}>
                         {showAddDiagnosis ? 'Cancel' : '+ Add'}
                       </button>
                     </div>
                     {showAddDiagnosis && (
                       <form onSubmit={handleAddDiagnosis} className="tag-inline-form flex-row mt-1">
                         <input 
                           type="text" className="form-input form-input-xs flex-grow" placeholder="e.g. Essential Hypertension" required
                           value={newDiagnosis} onChange={e => setNewDiagnosis(e.target.value)} 
                         />
                         <button type="submit" className="btn btn-secondary btn-sm flex-row px-0-5"><Plus size={12} /></button>
                       </form>
                     )}
                     <div className="tags-list mt-1">
                       {selectedPatient.medicalRecord.diagnoses.length > 0 ? (
                         selectedPatient.medicalRecord.diagnoses.map((d, i) => (
                           <span key={i} className="tag tag-info flex-row">
                             {d}
                             <button type="button" className="tag-delete-btn" onClick={() => removeDiagnosis(selectedPatient.id, d)}>×</button>
                           </span>
                         ))
                       ) : (
                         <span className="text-muted text-xs">No chronic conditions flagged.</span>
                       )}
                     </div>
                   </div>
                 </div>
                </div>
              </div>

              {/* Vitals History & Trends */}
              <div className="emr-section">
                <h4 className="section-title flex-row"><Activity size={16} /> Clinical Vitals Timeline</h4>
                
                {renderVitalsChart(selectedPatient.medicalRecord.vitalsHistory)}

                {/* Vitals Logging Form */}
                <form className="vitals-logging-form" onSubmit={handleLogVitals}>
                  <div className="vitals-grid">
                    <div className="form-group">
                      <label className="form-label">BP Sys</label>
                      <input 
                        type="number" className="form-input form-input-sm" required placeholder="e.g. 120"
                        value={vitalsForm.bpSystolic} onChange={(e) => setVitalsForm({...vitalsForm, bpSystolic: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">BP Dia</label>
                      <input 
                        type="number" className="form-input form-input-sm" required placeholder="e.g. 80"
                        value={vitalsForm.bpDiastolic} onChange={(e) => setVitalsForm({...vitalsForm, bpDiastolic: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pulse (bpm)</label>
                      <input 
                        type="number" className="form-input form-input-sm" required placeholder="72"
                        value={vitalsForm.pulseRate} onChange={(e) => setVitalsForm({...vitalsForm, pulseRate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Temp (°F)</label>
                      <input 
                        type="number" step="0.1" className="form-input form-input-sm" required placeholder="98.6"
                        value={vitalsForm.temperature} onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SpO2 (%)</label>
                      <input 
                        type="number" className="form-input form-input-sm" required placeholder="99"
                        value={vitalsForm.oxygenSaturation} onChange={(e) => setVitalsForm({...vitalsForm, oxygenSaturation: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-secondary btn-sm full-width mt-1">
                    <Plus size={12} /> Log Vitals Node
                  </button>
                </form>
              </div>

              {/* Active Prescriptions */}
              <div className="emr-section">
                <div className="flex-between section-header">
                  <h4 className="section-title flex-row"><FileSpreadsheet size={16} /> Active Drug Prescriptions</h4>
                  <button 
                    type="button" className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddPrescription(!showAddPrescription)}
                  >
                    {showAddPrescription ? 'Cancel' : 'Add Medication'}
                  </button>
                </div>

                {showAddPrescription && (
                  <form className="prescription-entry-form" onSubmit={handleAddRx}>
                    <div className="form-group">
                      <label className="form-label">Drug & Concentration *</label>
                      <input 
                        type="text" className="form-input" placeholder="e.g. Amoxicillin 500mg" required
                        value={rxForm.drugName} onChange={(e) => setRxForm({...rxForm, drugName: e.target.value})}
                      />
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Dosage Vol *</label>
                        <input 
                          type="text" className="form-input" placeholder="1 tablet" required
                          value={rxForm.dosage} onChange={(e) => setRxForm({...rxForm, dosage: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rhythm frequency *</label>
                        <select 
                          className="form-select"
                          value={rxForm.frequency} onChange={(e) => setRxForm({...rxForm, frequency: e.target.value})}
                        >
                          <option value="Once Daily">Once Daily</option>
                          <option value="Twice Daily">Twice Daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Every 4-6 hours (PRN)">Every 4-6 hours (PRN)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Duration *</label>
                        <input 
                          type="text" className="form-input" placeholder="7 days" required
                          value={rxForm.duration} onChange={(e) => setRxForm({...rxForm, duration: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Prescribing MD *</label>
                        <select 
                          className="form-select" required
                          value={rxForm.prescribedBy} onChange={(e) => setRxForm({...rxForm, prescribedBy: e.target.value})}
                        >
                          <option value="">-- Choose MD --</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Special instructions</label>
                      <input 
                        type="text" className="form-input" placeholder="Take with food, avoid alcohol..."
                        value={rxForm.instructions} onChange={(e) => setRxForm({...rxForm, instructions: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm full-width mt-1">
                      <PlusCircle size={12} /> Dispatch Script Order
                    </button>
                  </form>
                )}

                <div className="prescription-list mt-1">
                  {selectedPatient.medicalRecord.prescriptions.length > 0 ? (
                    selectedPatient.medicalRecord.prescriptions.map((rx) => (
                      <div key={rx.id} className="rx-item">
                        <div className="rx-top flex-between">
                          <span className="rx-name font-bold text-highlight">{rx.drugName}</span>
                          <span className="rx-duration">{rx.duration}</span>
                        </div>
                        <div className="rx-body">
                          <p className="rx-instructions">{rx.dosage} - {rx.frequency}. {rx.instructions}</p>
                          <div className="rx-meta flex-between mt-1">
                            <span className="rx-doctor">MD: {rx.prescribedBy}</span>
                            <span className="rx-date">{formatDate(rx.datePrescribed, false)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-rx-fallback text-center py-1">
                      <span className="text-muted text-xs">No active scripts dispatched.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lab Reports Section */}
              <div className="emr-section">
                <div className="flex-between section-header">
                  <h4 className="section-title flex-row"><FileSpreadsheet size={16} /> Lab Reports & Imaging</h4>
                  <button 
                    type="button" className="btn btn-secondary btn-sm"
                    onClick={() => setShowAddLab(!showAddLab)}
                  >
                    {showAddLab ? 'Cancel' : 'Order Lab Test'}
                  </button>
                </div>

                {showAddLab && (
                  <form className="prescription-entry-form" onSubmit={handleRequestLab}>
                    <div className="form-group">
                      <label className="form-label">Test Name *</label>
                      <input 
                        type="text" className="form-input" placeholder="e.g. Lipid Panel, Complete Blood Count" required
                        value={labTestName} onChange={(e) => setLabTestName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ordering Notes / Symptoms</label>
                      <input 
                        type="text" className="form-input" placeholder="Routine checkup, screening, check lipid ratios..."
                        value={labNotes} onChange={(e) => setLabNotes(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm full-width mt-1">
                      Order Diagnostic Panel
                    </button>
                  </form>
                )}

                <div className="lab-reports-list mt-1">
                  {selectedPatient.medicalRecord.labReports && selectedPatient.medicalRecord.labReports.length > 0 ? (
                    selectedPatient.medicalRecord.labReports.map((report) => (
                      <div key={report.id} className={`lab-report-card ${report.status.toLowerCase()}`}>
                        <div className="report-header flex-between">
                          <span className="report-name font-bold text-highlight">{report.testName}</span>
                          <span className={`badge ${report.status === 'Completed' ? 'badge-success' : 'badge-info'}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="report-body mt-1">
                          <p className="report-notes"><strong>Notes:</strong> {report.notes}</p>
                          <div className="report-meta flex-between mt-1 text-xs">
                            <span>Requested: {formatDate(report.dateRequested, false)}</span>
                            {report.dateCompleted && <span>Completed: {formatDate(report.dateCompleted, false)}</span>}
                          </div>

                          {report.status === 'Completed' && report.results && (
                            <div className="report-results-table mt-1">
                              <table className="mini-results-table">
                                <thead>
                                  <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Ref Range</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.results.map((r, rIdx) => (
                                    <tr key={rIdx} className={r.status.toLowerCase()}>
                                      <td>{r.parameter}</td>
                                      <td className="font-bold">{r.value}</td>
                                      <td>{r.referenceRange}</td>
                                      <td>
                                        <span className={`result-tag ${r.status.toLowerCase()}`}>
                                          {r.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {report.status === 'Pending' && (
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm full-width mt-1"
                              onClick={() => handleMockCompleteLab(report.id, report.testName)}
                            >
                              Simulate Lab Analysis Completion
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-rx-fallback text-center py-1">
                      <span className="text-muted text-xs">No diagnostics panels requested.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intake Modal Overlay */}
      {showAddPatient && (
        <div className="modal-overlay flex-row">
          <div className="modal-content glass-panel">
            <div className="modal-header flex-between">
              <h3>Register New Patient Index</h3>
              <button className="close-modal" onClick={() => setShowAddPatient(false)}>×</button>
            </div>
            <form onSubmit={handleRegisterPatient}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" className="form-input" required 
                    value={patientForm.name} onChange={(e) => setPatientForm({...patientForm, name: e.target.value})} 
                  />
                </div>
                <div className="grid-2">
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
                    type="tel" className="form-input" placeholder="+1 (555) 123-4567" required
                    value={patientForm.contact} onChange={(e) => setPatientForm({...patientForm, contact: e.target.value})} 
                  />
                </div>
                <div className="grid-2">
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
                    <label className="form-label">Triage Allocation</label>
                    <select 
                      className="form-select"
                      value={patientForm.status} onChange={(e) => setPatientForm({...patientForm, status: e.target.value as any})}
                    >
                      <option value="Outpatient">Outpatient</option>
                      <option value="Admitted">Admitted</option>
                      <option value="Critical">Critical Care</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input 
                    type="text" className="form-input" 
                    value={patientForm.address} onChange={(e) => setPatientForm({...patientForm, address: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer flex-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddPatient(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientsView;
