import type { 
  Patient, 
  Appointment, 
  Doctor, 
  Invoice, 
  ActivityLog, 
  SystemStats,
  VitalsReading,
  Prescription,
  AppointmentStatus,
  DoctorStatus,
  InvoiceStatus,
  ClaimStatus,
  LabReport,
  LabReportResult,
  Ambulance,
  AmbulanceStatus,
  DispatchSeverity,
  Nurse,
  ClinicalDepartment
} from '../types';
import { generateUUID } from '../utils/helpers';

// Helper to simulate network latency
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// --- SEED DATA ---
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Chief Cardiologist',
    department: 'Cardiology',
    email: 's.jenkins@carepulse.com',
    contact: '+1 (555) 234-5678',
    status: 'On Duty',
    rating: 4.9,
    shiftHours: '08:00 AM - 04:00 PM',
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance',
    specialization: 'Senior Neurosurgeon',
    department: 'Neurology',
    email: 'm.vance@carepulse.com',
    contact: '+1 (555) 345-6789',
    status: 'In Surgery',
    rating: 4.8,
    shiftHours: '10:00 AM - 06:00 PM',
  },
  {
    id: 'doc-3',
    name: 'Dr. Elena Rostova',
    specialization: 'Consultant Pediatrician',
    department: 'Pediatrics',
    email: 'e.rostova@carepulse.com',
    contact: '+1 (555) 456-7890',
    status: 'Available',
    rating: 4.7,
    shiftHours: '09:00 AM - 05:00 PM',
  },
  {
    id: 'doc-4',
    name: 'Dr. David Kim',
    specialization: 'Orthopedic Specialist',
    department: 'Orthopedics',
    email: 'd.kim@carepulse.com',
    contact: '+1 (555) 567-8901',
    status: 'Off Duty',
    rating: 4.6,
    shiftHours: '02:00 PM - 10:00 PM',
  },
  {
    id: 'doc-5',
    name: 'Dr. Chloe Patel',
    specialization: 'Emergency Trauma Specialist',
    department: 'Emergency Medicine',
    email: 'c.patel@carepulse.com',
    contact: '+1 (555) 678-9012',
    status: 'On Duty',
    rating: 4.9,
    shiftHours: '12:00 PM - 08:00 PM',
  }
];

const INITIAL_NURSES: Nurse[] = [
  {
    id: 'nur-1',
    name: 'Nurse Jane Doe',
    role: 'Nurse',
    department: 'Emergency Medicine',
    email: 'j.doe@carepulse.com',
    contact: '+1 (555) 789-0123',
    status: 'On Duty',
    shiftHours: '07:00 AM - 03:00 PM',
  },
  {
    id: 'nur-2',
    name: 'Nurse David Smith',
    role: 'Nurse',
    department: 'Cardiology',
    email: 'd.smith@carepulse.com',
    contact: '+1 (555) 890-1234',
    status: 'On Duty',
    shiftHours: '03:00 PM - 11:00 PM',
  },
  {
    id: 'nur-3',
    name: 'Nurse Maria Garcia',
    role: 'Nurse',
    department: 'Pediatrics',
    email: 'm.garcia@carepulse.com',
    contact: '+1 (555) 901-2345',
    status: 'Available',
    shiftHours: '09:00 AM - 05:00 PM',
  },
  {
    id: 'nur-4',
    name: 'Nurse Alex Johnson',
    role: 'Nurse',
    department: 'Neurology',
    email: 'a.johnson@carepulse.com',
    contact: '+1 (555) 012-3456',
    status: 'Off Duty',
    shiftHours: '11:00 PM - 07:00 AM',
  }
];

const INITIAL_DEPARTMENTS: ClinicalDepartment[] = [
  {
    id: 'dept-1',
    name: 'Cardiology',
    code: 'CARD',
    headDoctorId: 'doc-1',
    headDoctorName: 'Dr. Sarah Jenkins',
    bedCapacity: 15,
    occupiedBeds: 6,
    activeAlert: 'Normal'
  },
  {
    id: 'dept-2',
    name: 'Neurology',
    code: 'NEUR',
    headDoctorId: 'doc-2',
    headDoctorName: 'Dr. Marcus Vance',
    bedCapacity: 10,
    occupiedBeds: 4,
    activeAlert: 'Normal'
  },
  {
    id: 'dept-3',
    name: 'Pediatrics',
    code: 'PED',
    headDoctorId: 'doc-3',
    headDoctorName: 'Dr. Elena Rostova',
    bedCapacity: 20,
    occupiedBeds: 8,
    activeAlert: 'Normal'
  },
  {
    id: 'dept-4',
    name: 'Orthopedics',
    code: 'ORTH',
    headDoctorId: 'doc-4',
    headDoctorName: 'Dr. David Kim',
    bedCapacity: 12,
    occupiedBeds: 5,
    activeAlert: 'Understaffed'
  },
  {
    id: 'dept-5',
    name: 'Emergency Medicine',
    code: 'ER',
    headDoctorId: 'doc-5',
    headDoctorName: 'Dr. Chloe Patel',
    bedCapacity: 25,
    occupiedBeds: 18,
    activeAlert: 'Critical Load'
  },
  {
    id: 'dept-6',
    name: 'Pathology Lab',
    code: 'PATH',
    headDoctorId: 'doc-1',
    headDoctorName: 'Dr. Sarah Jenkins',
    bedCapacity: 0,
    occupiedBeds: 0,
    activeAlert: 'Normal'
  }
];

const INITIAL_VITALS_1: VitalsReading[] = [
  { date: '2026-06-19T08:00:00Z', bpSystolic: 125, bpDiastolic: 82, pulseRate: 74, temperature: 98.4, oxygenSaturation: 98 },
  { date: '2026-06-20T08:00:00Z', bpSystolic: 122, bpDiastolic: 80, pulseRate: 72, temperature: 98.6, oxygenSaturation: 99 },
  { date: '2026-06-21T08:00:00Z', bpSystolic: 118, bpDiastolic: 79, pulseRate: 70, temperature: 98.5, oxygenSaturation: 99 },
  { date: '2026-06-22T08:00:00Z', bpSystolic: 120, bpDiastolic: 80, pulseRate: 72, temperature: 98.6, oxygenSaturation: 98 },
  { date: '2026-06-23T09:30:00Z', bpSystolic: 119, bpDiastolic: 78, pulseRate: 68, temperature: 98.2, oxygenSaturation: 99 },
];

const INITIAL_VITALS_2: VitalsReading[] = [
  { date: '2026-06-21T10:00:00Z', bpSystolic: 130, bpDiastolic: 85, pulseRate: 80, temperature: 99.1, oxygenSaturation: 97 },
  { date: '2026-06-22T10:00:00Z', bpSystolic: 128, bpDiastolic: 84, pulseRate: 78, temperature: 98.9, oxygenSaturation: 98 },
  { date: '2026-06-23T11:00:00Z', bpSystolic: 126, bpDiastolic: 82, pulseRate: 76, temperature: 98.7, oxygenSaturation: 98 },
];

const INITIAL_VITALS_3: VitalsReading[] = [
  { date: '2026-06-22T14:00:00Z', bpSystolic: 145, bpDiastolic: 95, pulseRate: 92, temperature: 101.2, oxygenSaturation: 94 },
  { date: '2026-06-22T20:00:00Z', bpSystolic: 140, bpDiastolic: 90, pulseRate: 88, temperature: 100.5, oxygenSaturation: 95 },
  { date: '2026-06-23T06:00:00Z', bpSystolic: 135, bpDiastolic: 88, pulseRate: 84, temperature: 99.8, oxygenSaturation: 96 },
  { date: '2026-06-23T12:00:00Z', bpSystolic: 138, bpDiastolic: 89, pulseRate: 86, temperature: 99.9, oxygenSaturation: 96 },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'John Doe',
    age: 54,
    gender: 'Male',
    contact: '+1 (555) 123-4567',
    email: 'johndoe@email.com',
    bloodGroup: 'O+',
    address: '123 Pine St, Metro City, NY 10001',
    status: 'Admitted',
    lastVisit: '2026-06-23T09:30:00Z',
    bedNumber: 'ER-102',
    medicalRecord: {
      diagnoses: ['Essential Hypertension', 'Type 2 Diabetes Mellitus', 'Mild Hypercholesterolemia'],
      allergies: ['Penicillin', 'Peanuts'],
      vitalsHistory: INITIAL_VITALS_1,
      prescriptions: [
        {
          id: 'rx-1',
          drugName: 'Lisinopril 10mg',
          dosage: '10mg',
          frequency: 'Once Daily',
          duration: '3 Months',
          instructions: 'Take in the morning with water.',
          datePrescribed: '2026-06-20T08:00:00Z',
          prescribedBy: 'Dr. Sarah Jenkins'
        },
        {
          id: 'rx-2',
          drugName: 'Metformin 500mg',
          dosage: '500mg',
          frequency: 'Twice Daily',
          duration: '6 Months',
          instructions: 'Take with meals (breakfast and dinner).',
          datePrescribed: '2026-06-20T08:00:00Z',
          prescribedBy: 'Dr. Sarah Jenkins'
        }
      ],
      labReports: [
        {
          id: 'lab-1',
          testName: 'Complete Blood Count (CBC)',
          dateRequested: '2026-06-21T08:00:00Z',
          dateCompleted: '2026-06-21T14:00:00Z',
          status: 'Completed',
          results: [
            { parameter: 'White Blood Cell (WBC)', value: '6.8', referenceRange: '4.5 - 11.0 ×10^3/µL', status: 'Normal' },
            { parameter: 'Red Blood Cell (RBC)', value: '4.8', referenceRange: '4.3 - 5.9 ×10^6/µL', status: 'Normal' },
            { parameter: 'Hemoglobin', value: '14.2', referenceRange: '13.5 - 17.5 g/dL', status: 'Normal' },
            { parameter: 'Platelets', value: '250', referenceRange: '150 - 450 ×10^3/µL', status: 'Normal' }
          ],
          notes: 'All CBC parameters are within standard reference intervals.'
        },
        {
          id: 'lab-2',
          testName: 'Lipid Panel Screen',
          dateRequested: '2026-06-22T08:00:00Z',
          dateCompleted: '2026-06-22T16:00:00Z',
          status: 'Completed',
          results: [
            { parameter: 'Total Cholesterol', value: '225', referenceRange: '< 200 mg/dL', status: 'High' },
            { parameter: 'Triglycerides', value: '180', referenceRange: '< 150 mg/dL', status: 'High' },
            { parameter: 'HDL Cholesterol', value: '38', referenceRange: '> 40 mg/dL', status: 'Low' },
            { parameter: 'LDL Cholesterol', value: '151', referenceRange: '< 100 mg/dL', status: 'High' }
          ],
          notes: 'Patient exhibits hypercholesterolemia. Dietary modifications and drug therapy review recommended.'
        }
      ]
    }
  },
  {
    id: 'pat-2',
    name: 'Jane Smith',
    age: 29,
    gender: 'Female',
    contact: '+1 (555) 789-0123',
    email: 'janesmith@email.com',
    bloodGroup: 'A-',
    address: '456 Oak Ave, Greenwood, NJ 07430',
    status: 'Outpatient',
    lastVisit: '2026-06-23T11:00:00Z',
    medicalRecord: {
      diagnoses: ['Acute Pharyngitis', 'Seasonal Allergy Rhinopathy'],
      allergies: ['Sulfonamides'],
      vitalsHistory: INITIAL_VITALS_2,
      prescriptions: [
        {
          id: 'rx-3',
          drugName: 'Amoxicillin 500mg',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 Days',
          instructions: 'Complete full course. Take after food.',
          datePrescribed: '2026-06-23T11:00:00Z',
          prescribedBy: 'Dr. Elena Rostova'
        }
      ],
      labReports: [
        {
          id: 'lab-3',
          testName: 'Rapid Strep Antigen Test',
          dateRequested: '2026-06-23T11:00:00Z',
          dateCompleted: '2026-06-23T11:15:00Z',
          status: 'Completed',
          results: [
            { parameter: 'Streptococcus Group A', value: 'Positive', referenceRange: 'Negative', status: 'High' }
          ],
          notes: 'Positive for Group A Strep. Commencing antibiotic script course.'
        }
      ]
    }
  },
  {
    id: 'pat-3',
    name: 'Robert Chen',
    age: 42,
    gender: 'Male',
    contact: '+1 (555) 890-1234',
    email: 'rchen@techcorp.com',
    bloodGroup: 'B+',
    address: '789 Maple Rd, Metropolis, NY 10022',
    status: 'Critical',
    lastVisit: '2026-06-23T12:00:00Z',
    bedNumber: 'ICU-201',
    medicalRecord: {
      diagnoses: ['Traumatic Rib Fracture', 'Mild Pneumothorax (Resolving)'],
      allergies: [],
      vitalsHistory: INITIAL_VITALS_3,
      prescriptions: [
        {
          id: 'rx-4',
          drugName: 'Acetaminophen 325mg',
          dosage: '2 tablets',
          frequency: 'Every 6 hours as needed',
          duration: '10 Days',
          instructions: 'Do not exceed 4000mg/day. Watch for liver safety.',
          datePrescribed: '2026-06-22T14:30:00Z',
          prescribedBy: 'Dr. Chloe Patel'
        }
      ],
      labReports: [
        {
          id: 'lab-4',
          testName: 'Chest X-Ray Digital',
          dateRequested: '2026-06-22T14:15:00Z',
          dateCompleted: '2026-06-22T14:45:00Z',
          status: 'Completed',
          results: [
            { parameter: 'Rib Fractures', value: 'Present (4th, 5th left)', referenceRange: 'Absent', status: 'High' },
            { parameter: 'Pneumothorax Volume', value: '5%', referenceRange: 'Absent', status: 'High' }
          ],
          notes: 'Fractures of the left 4th and 5th ribs. Small apical pneumothorax observed, currently stable.'
        }
      ]
    }
  },
  {
    id: 'pat-4',
    name: 'Emily Davis',
    age: 68,
    gender: 'Female',
    contact: '+1 (555) 901-2345',
    email: 'emilydavis@home.net',
    bloodGroup: 'AB+',
    address: '321 Elm Dr, Riverdale, NY 10471',
    status: 'Discharged',
    lastVisit: '2026-06-18T14:00:00Z',
    medicalRecord: {
      diagnoses: ['Post-op Knee Replacement Recovering'],
      allergies: ['Codeine', 'Contrast Media'],
      vitalsHistory: [
        { date: '2026-06-18T08:00:00Z', bpSystolic: 120, bpDiastolic: 75, pulseRate: 68, temperature: 98.4, oxygenSaturation: 99 }
      ],
      prescriptions: [],
      labReports: []
    }
  },
  {
    id: 'pat-5',
    name: 'Michael Johnson',
    age: 35,
    gender: 'Male',
    contact: '+1 (555) 321-7654',
    email: 'mjohnson@buildcorp.com',
    bloodGroup: 'O-',
    address: '987 Cedar Dr, Highlands, NJ 07732',
    status: 'Outpatient',
    lastVisit: '2026-06-21T15:30:00Z',
    medicalRecord: {
      diagnoses: ['Lumbar Muscle Strain'],
      allergies: [],
      vitalsHistory: [
        { date: '2026-06-21T15:30:00Z', bpSystolic: 115, bpDiastolic: 75, pulseRate: 72, temperature: 98.6, oxygenSaturation: 99 }
      ],
      prescriptions: [],
      labReports: []
    }
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'John Doe',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Jenkins',
    department: 'Cardiology',
    dateTime: '2026-06-23T09:30:00Z',
    reason: 'Hypertension follow-up consultation',
    status: 'Completed',
    notes: 'Vitals stable. Continuing current prescription of Lisinopril. Refills approved.'
  },
  {
    id: 'apt-2',
    patientId: 'pat-2',
    patientName: 'Jane Smith',
    doctorId: 'doc-3',
    doctorName: 'Dr. Elena Rostova',
    department: 'Pediatrics',
    dateTime: '2026-06-23T11:00:00Z',
    reason: 'Severe throat irritation and fever',
    status: 'Completed',
    notes: 'Diagnosed with pharyngitis. Prescribed Amoxicillin for 7 days.'
  },
  {
    id: 'apt-3',
    patientId: 'pat-3',
    patientName: 'Robert Chen',
    doctorId: 'doc-5',
    doctorName: 'Dr. Chloe Patel',
    department: 'Emergency Medicine',
    dateTime: '2026-06-23T12:00:00Z',
    reason: 'Post-trauma pain management and vitals check',
    status: 'Scheduled',
    notes: 'Admitted, monitor vitals closely. Watch for respiratory distress.'
  },
  {
    id: 'apt-4',
    patientId: 'pat-5',
    patientName: 'Michael Johnson',
    doctorId: 'doc-4',
    doctorName: 'Dr. David Kim',
    department: 'Orthopedics',
    dateTime: '2026-06-24T10:00:00Z',
    reason: 'Lumbar spine physical check-up',
    status: 'Scheduled'
  },
  {
    id: 'apt-5',
    patientId: 'pat-4',
    patientName: 'Emily Davis',
    doctorId: 'doc-4',
    doctorName: 'Dr. David Kim',
    department: 'Orthopedics',
    dateTime: '2026-06-24T11:30:00Z',
    reason: 'Post-op knee check and physical rehab assessment',
    status: 'Scheduled'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    patientId: 'pat-1',
    patientName: 'John Doe',
    date: '2026-06-20T10:00:00Z',
    dueDate: '2026-07-20T10:00:00Z',
    items: [
      { description: 'Cardiology Specialist Consultation', quantity: 1, unitPrice: 150 },
      { description: 'Electrocardiogram (ECG/EKG)', quantity: 1, unitPrice: 200 },
      { description: 'Complete Blood Count (CBC) Panel', quantity: 1, unitPrice: 75 }
    ],
    subtotal: 425,
    tax: 34,
    discount: 50,
    total: 409,
    insuranceClaim: {
      provider: 'Aetna Premium Healthcare',
      policyNumber: 'AET-8839210-JD',
      amountClaimed: 350,
      status: 'Approved',
      notes: 'Paid via direct provider billing.'
    },
    status: 'Paid'
  },
  {
    id: 'inv-2',
    patientId: 'pat-2',
    patientName: 'Jane Smith',
    date: '2026-06-23T12:00:00Z',
    dueDate: '2026-07-23T12:00:00Z',
    items: [
      { description: 'Outpatient Pediatric Consultation', quantity: 1, unitPrice: 120 },
      { description: 'Rapid Strep Antigen Test', quantity: 1, unitPrice: 45 }
    ],
    subtotal: 165,
    tax: 13.2,
    discount: 0,
    total: 178.2,
    insuranceClaim: {
      provider: 'Cigna Health',
      policyNumber: 'CIG-99381-JS',
      amountClaimed: 130,
      status: 'Pending'
    },
    status: 'Unpaid'
  },
  {
    id: 'inv-3',
    patientId: 'pat-3',
    patientName: 'Robert Chen',
    date: '2026-06-22T18:00:00Z',
    dueDate: '2026-07-22T18:00:00Z',
    items: [
      { description: 'Emergency Room Intensive Care Bed (24h)', quantity: 1, unitPrice: 1200 },
      { description: 'Chest X-Ray Digital Imaging', quantity: 2, unitPrice: 180 },
      { description: 'IV Fluid Therapy and Analgesics Admin', quantity: 1, unitPrice: 350 },
      { description: 'Trauma Specialist Diagnostics Fee', quantity: 1, unitPrice: 500 }
    ],
    subtotal: 2410,
    tax: 192.8,
    discount: 200,
    total: 2402.8,
    insuranceClaim: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-1102931-RC',
      amountClaimed: 2000,
      status: 'Pending'
    },
    status: 'Unpaid'
  },
  {
    id: 'inv-4',
    patientId: 'pat-4',
    patientName: 'Emily Davis',
    date: '2026-06-18T16:00:00Z',
    dueDate: '2026-07-18T16:00:00Z',
    items: [
      { description: 'Total Knee Replacement Surgery Package', quantity: 1, unitPrice: 15000 },
      { description: 'Inpatient Ward Recovery Stay (4 Days)', quantity: 4, unitPrice: 600 },
      { description: 'Physical Therapy Rehab (Post-Op In-Hospital)', quantity: 3, unitPrice: 150 }
    ],
    subtotal: 17850,
    tax: 1428,
    discount: 1000,
    total: 18278,
    insuranceClaim: {
      provider: 'UnitedHealthcare',
      policyNumber: 'UHC-44029321-ED',
      amountClaimed: 15000,
      status: 'Approved',
      notes: 'Approved under catastrophic cover clause.'
    },
    status: 'Paid'
  }
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-23T08:10:00Z',
    category: 'System',
    action: 'Database Initialized',
    detail: 'CarePulse core modules successfully initialized from seed profiles.',
    user: 'System Admin'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-23T09:35:00Z',
    category: 'Appointment',
    action: 'Appointment Completed',
    detail: 'Dr. Sarah Jenkins completed consulting patient John Doe.',
    user: 'Dr. Sarah Jenkins'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-23T11:15:00Z',
    category: 'Patient',
    action: 'Prescription Added',
    detail: 'Amoxicillin prescribed to patient Jane Smith.',
    user: 'Dr. Elena Rostova'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-23T12:05:00Z',
    category: 'Billing',
    action: 'Invoice Created',
    detail: 'New invoice inv-2 of $178.20 generated for Jane Smith.',
    user: 'Nurse Receptionist'
  }
];

const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: 'amb-1',
    vehicleNumber: 'AMB-911',
    driverName: 'Frank Callahan',
    paramedicName: "Sarah O'Connor",
    status: 'Available',
  },
  {
    id: 'amb-2',
    vehicleNumber: 'AMB-912',
    driverName: 'John Miller',
    paramedicName: 'Emily Watson',
    status: 'Dispatched',
    location: '456 Main St, Downtown',
    patientId: 'pat-5',
    patientName: 'Michael Johnson',
    severity: 'Urgent',
    progress: 1, // En Route
  },
  {
    id: 'amb-3',
    vehicleNumber: 'AMB-913',
    driverName: 'Carl Lawson',
    paramedicName: 'Robert Vance',
    status: 'Available',
  },
  {
    id: 'amb-4',
    vehicleNumber: 'AMB-914',
    driverName: 'Mark Ronson',
    paramedicName: 'Jenny Lind',
    status: 'Maintenance',
  }
];

// --- STORAGE MANAGER ---
class LocalDB {
  private static get<T>(key: string, initial: T[]): T[] {
    const data = localStorage.getItem(`carepulse_${key}`);
    if (!data) {
      localStorage.setItem(`carepulse_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private static set<T>(key: string, data: T[]): void {
    localStorage.setItem(`carepulse_${key}`, JSON.stringify(data));
  }

  static getPatients() { return this.get<Patient>('patients', INITIAL_PATIENTS); }
  static setPatients(data: Patient[]) { this.set('patients', data); }

  static getAppointments() { return this.get<Appointment>('appointments', INITIAL_APPOINTMENTS); }
  static setAppointments(data: Appointment[]) { this.set('appointments', data); }

  static getDoctors() { return this.get<Doctor>('doctors', INITIAL_DOCTORS); }
  static setDoctors(data: Doctor[]) { this.set('doctors', data); }

  static getNurses() { return this.get<Nurse>('nurses', INITIAL_NURSES); }
  static setNurses(data: Nurse[]) { this.set('nurses', data); }

  static getDepartments() { return this.get<ClinicalDepartment>('departments', INITIAL_DEPARTMENTS); }
  static setDepartments(data: ClinicalDepartment[]) { this.set('departments', data); }

  static getInvoices() { return this.get<Invoice>('invoices', INITIAL_INVOICES); }
  static setInvoices(data: Invoice[]) { this.set('invoices', data); }

  static getLogs() { return this.get<ActivityLog>('logs', INITIAL_LOGS); }
  static setLogs(data: ActivityLog[]) { this.set('logs', data); }

  static getAmbulances() { return this.get<Ambulance>('ambulances', INITIAL_AMBULANCES); }
  static setAmbulances(data: Ambulance[]) { this.set('ambulances', data); }
}

// --- API METHODS ---
export const mockApi = {
  // Stats
  async getStats(): Promise<SystemStats> {
    await delay(400);
    const patients = LocalDB.getPatients();
    const appointments = LocalDB.getAppointments();
    const invoices = LocalDB.getInvoices();

    const activeAdmissions = patients.filter(p => p.status === 'Admitted' || p.status === 'Critical').length;
    
    // Appointments today
    const todayStr = new Date().toDateString();
    const appointmentsToday = appointments.filter(a => {
      const aptDate = new Date(a.dateTime);
      return aptDate.toDateString() === todayStr && a.status === 'Scheduled';
    }).length;

    // Occupancy (assuming 100 beds total)
    const occupancyRate = Math.min(100, Math.round((activeAdmissions / 100) * 100));

    // Revenue this month (Paid invoices)
    const revenueThisMonth = invoices
      .filter(i => i.status === 'Paid')
      .reduce((sum, current) => sum + current.total, 0);

    // Pending Insurance Claims
    const pendingClaims = invoices.filter(i => i.insuranceClaim.status === 'Pending').length;

    return {
      totalPatients: patients.length,
      activeAdmissions,
      appointmentsToday,
      occupancyRate,
      revenueThisMonth,
      pendingClaims
    };
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    await delay(500);
    return LocalDB.getPatients();
  },

  async getPatientById(id: string): Promise<Patient | undefined> {
    await delay(300);
    const patients = LocalDB.getPatients();
    return patients.find(p => p.id === id);
  },

  async addPatient(patientData: Omit<Patient, 'id' | 'medicalRecord'>): Promise<Patient> {
    await delay(600);
    const patients = LocalDB.getPatients();
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${generateUUID().substring(0, 5)}`,
      medicalRecord: {
        diagnoses: [],
        allergies: [],
        vitalsHistory: [
          {
            date: new Date().toISOString(),
            bpSystolic: 120,
            bpDiastolic: 80,
            pulseRate: 72,
            temperature: 98.6,
            oxygenSaturation: 99
          }
        ],
        prescriptions: [],
        labReports: []
      }
    };
    patients.unshift(newPatient);
    LocalDB.setPatients(patients);

    // Log Activity
    this.addLog('Patient', 'Patient Registered', `Registered patient record for ${newPatient.name}.`, 'Admin Coordinator');

    return newPatient;
  },

  async updatePatientVitals(id: string, vitals: VitalsReading): Promise<Patient> {
    await delay(400);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index].medicalRecord.vitalsHistory.push(vitals);
    patients[index].lastVisit = vitals.date;
    LocalDB.setPatients(patients);

    this.addLog('Patient', 'Vitals Logged', `Recorded new vitals reading for patient ${patients[index].name}.`, 'Nurse Staff');
    return patients[index];
  },

  async prescribeMedication(id: string, prescriptionData: Omit<Prescription, 'id' | 'datePrescribed'>): Promise<Patient> {
    await delay(500);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    const prescription: Prescription = {
      ...prescriptionData,
      id: `rx-${generateUUID().substring(0, 5)}`,
      datePrescribed: new Date().toISOString()
    };

    patients[index].medicalRecord.prescriptions.push(prescription);
    LocalDB.setPatients(patients);

    this.addLog('Patient', 'Prescription Added', `Prescribed ${prescription.drugName} to patient ${patients[index].name}.`, prescription.prescribedBy);
    return patients[index];
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    await delay(500);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index] = { ...patients[index], ...updates };
    LocalDB.setPatients(patients);

    this.addLog('Patient', 'Record Updated', `Updated core profile details for ${patients[index].name}.`, 'Admin Coordinator');
    return patients[index];
  },

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    await delay(500);
    return LocalDB.getAppointments();
  },

  async bookAppointment(aptData: Omit<Appointment, 'id'>): Promise<Appointment> {
    await delay(700);
    const appointments = LocalDB.getAppointments();
    
    // Check doctor shift availability and schedule conflicts
    const doctorApts = appointments.filter(a => a.doctorId === aptData.doctorId && a.status === 'Scheduled');
    const hasConflict = doctorApts.some(a => {
      const existingTime = new Date(a.dateTime).getTime();
      const requestedTime = new Date(aptData.dateTime).getTime();
      // Assume appointments take 30 minutes (1800000ms)
      return Math.abs(existingTime - requestedTime) < 1800000;
    });

    if (hasConflict) {
      throw new Error(`Time slot conflict: Doctor ${aptData.doctorName} is already booked around this time.`);
    }

    const newAppointment: Appointment = {
      ...aptData,
      id: `apt-${generateUUID().substring(0, 5)}`,
    };

    appointments.unshift(newAppointment);
    LocalDB.setAppointments(appointments);

    this.addLog('Appointment', 'Appointment Scheduled', `Booked appointment for ${newAppointment.patientName} with ${newAppointment.doctorName}.`, 'Nurse Receptionist');
    
    return newAppointment;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string): Promise<Appointment> {
    await delay(450);
    const appointments = LocalDB.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    appointments[index].status = status;
    if (notes) appointments[index].notes = notes;
    LocalDB.setAppointments(appointments);

    this.addLog('Appointment', 'Appointment Modified', `Status updated to ${status} for appointment ${id}.`, 'Admin Staff');
    return appointments[index];
  },

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    await delay(400);
    return LocalDB.getDoctors();
  },

  async updateDoctorStatus(id: string, status: DoctorStatus): Promise<Doctor> {
    await delay(300);
    const doctors = LocalDB.getDoctors();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Doctor not found');

    doctors[index].status = status;
    LocalDB.setDoctors(doctors);

    this.addLog('Staff', 'Shift Status Updated', `Dr. ${doctors[index].name} set to ${status}.`, 'Chief Roster');
    return doctors[index];
  },

  // Billing & Invoices
  async getInvoices(): Promise<Invoice[]> {
    await delay(500);
    return LocalDB.getInvoices();
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>): Promise<Invoice> {
    await delay(600);
    const invoices = LocalDB.getInvoices();
    
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% Tax
    const total = Math.round((subtotal + tax - invoiceData.discount) * 100) / 100;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${generateUUID().substring(0, 5)}`,
      subtotal,
      tax,
      total
    };

    invoices.unshift(newInvoice);
    LocalDB.setInvoices(invoices);

    this.addLog('Billing', 'Invoice Generated', `Created billing invoice for ${newInvoice.patientName} totaling ${total}.`, 'Billing Clerk');
    return newInvoice;
  },

  async updateInvoiceStatus(id: string, status: InvoiceStatus, claimStatus?: ClaimStatus): Promise<Invoice> {
    await delay(400);
    const invoices = LocalDB.getInvoices();
    const index = invoices.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Invoice not found');

    invoices[index].status = status;
    if (claimStatus) {
      invoices[index].insuranceClaim.status = claimStatus;
    }
    LocalDB.setInvoices(invoices);

    this.addLog('Billing', 'Invoice Updated', `Status updated to ${status} for invoice ${id}.`, 'Billing Manager');
    return invoices[index];
  },

  async addPatientAllergy(id: string, allergy: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    if (!patients[index].medicalRecord.allergies.includes(allergy)) {
      patients[index].medicalRecord.allergies.push(allergy);
      LocalDB.setPatients(patients);
      this.addLog('Patient', 'Allergy Added', `Added allergy flag "${allergy}" to patient ${patients[index].name}.`, 'Clinical Nurse');
    }
    return patients[index];
  },

  async removePatientAllergy(id: string, allergy: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index].medicalRecord.allergies = patients[index].medicalRecord.allergies.filter(a => a !== allergy);
    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Allergy Removed', `Removed allergy flag "${allergy}" from patient ${patients[index].name}.`, 'Clinical Nurse');
    return patients[index];
  },

  async addPatientDiagnosis(id: string, diagnosis: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    if (!patients[index].medicalRecord.diagnoses.includes(diagnosis)) {
      patients[index].medicalRecord.diagnoses.push(diagnosis);
      LocalDB.setPatients(patients);
      this.addLog('Patient', 'Diagnosis Added', `Added active diagnosis "${diagnosis}" to patient ${patients[index].name}.`, 'Attending Physician');
    }
    return patients[index];
  },

  async removePatientDiagnosis(id: string, diagnosis: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index].medicalRecord.diagnoses = patients[index].medicalRecord.diagnoses.filter(d => d !== diagnosis);
    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Diagnosis Removed', `Cleared active diagnosis "${diagnosis}" from patient ${patients[index].name}.`, 'Attending Physician');
    return patients[index];
  },

  async requestLabReport(id: string, testName: string, notes?: string): Promise<Patient> {
    await delay(400);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    const newReport: LabReport = {
      id: `lab-${generateUUID().substring(0, 5)}`,
      testName,
      dateRequested: new Date().toISOString(),
      status: 'Pending',
      notes: notes || 'Pending pathology lab analysis.'
    };

    patients[index].medicalRecord.labReports.unshift(newReport);
    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Lab Test Requested', `Requested "${testName}" diagnostics for ${patients[index].name}.`, 'Attending Physician');
    return patients[index];
  },

  async completeLabReport(id: string, reportId: string, results: LabReportResult[], notes?: string): Promise<Patient> {
    await delay(500);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    const rIdx = patients[index].medicalRecord.labReports.findIndex(r => r.id === reportId);
    if (rIdx === -1) throw new Error('Lab report not found');

    patients[index].medicalRecord.labReports[rIdx] = {
      ...patients[index].medicalRecord.labReports[rIdx],
      status: 'Completed',
      dateCompleted: new Date().toISOString(),
      results,
      notes: notes || 'Pathology report signed off.'
    };

    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Lab Test Completed', `Results uploaded for "${patients[index].medicalRecord.labReports[rIdx].testName}" - Patient ${patients[index].name}.`, 'Pathologist Lab');
    return patients[index];
  },

  async assignBed(id: string, bedNumber: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    patients[index].bedNumber = bedNumber;
    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Bed Assigned', `Assigned bed "${bedNumber}" to patient ${patients[index].name}.`, 'Attending Physician');
    return patients[index];
  },

  async releaseBed(id: string): Promise<Patient> {
    await delay(300);
    const patients = LocalDB.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Patient not found');

    const previousBed = patients[index].bedNumber;
    patients[index].bedNumber = undefined;
    LocalDB.setPatients(patients);
    this.addLog('Patient', 'Bed Released', `Released bed "${previousBed}" from patient ${patients[index].name}.`, 'Attending Physician');
    return patients[index];
  },

  // Ambulances
  async getAmbulances(): Promise<Ambulance[]> {
    await delay(400);
    return LocalDB.getAmbulances();
  },

  async dispatchAmbulance(ambulanceId: string, patientId: string, patientName: string, location: string, severity: DispatchSeverity): Promise<Ambulance> {
    await delay(400);
    const ambulances = LocalDB.getAmbulances();
    const index = ambulances.findIndex(a => a.id === ambulanceId);
    if (index === -1) throw new Error('Ambulance not found');

    ambulances[index] = {
      ...ambulances[index],
      status: 'Dispatched',
      location,
      patientId,
      patientName,
      severity,
      progress: 0, // Dispatched
    };

    LocalDB.setAmbulances(ambulances);
    this.addLog('System', 'Ambulance Dispatched', `Dispatched ${ambulances[index].vehicleNumber} to ${location} for patient ${patientName}.`, 'Emergency Dispatcher');
    return ambulances[index];
  },

  async updateAmbulanceProgress(ambulanceId: string): Promise<Ambulance> {
    await delay(300);
    const ambulances = LocalDB.getAmbulances();
    const index = ambulances.findIndex(a => a.id === ambulanceId);
    if (index === -1) throw new Error('Ambulance not found');

    const currentProgress = ambulances[index].progress ?? 0;
    if (currentProgress < 4) {
      const nextProgress = currentProgress + 1;
      ambulances[index].progress = nextProgress;
      
      let progressText = 'En Route';
      if (nextProgress === 2) progressText = 'On Scene';
      if (nextProgress === 3) progressText = 'In Transit';
      if (nextProgress === 4) progressText = 'Arrived at Clinic';

      this.addLog('System', 'Transit Checkpoint', `Ambulance ${ambulances[index].vehicleNumber} updated status: ${progressText}.`, 'Transit GPS Tracker');
    } else {
      // Arrived -> Release back to Available
      ambulances[index] = {
        id: ambulances[index].id,
        vehicleNumber: ambulances[index].vehicleNumber,
        driverName: ambulances[index].driverName,
        paramedicName: ambulances[index].paramedicName,
        status: 'Available'
      };
      this.addLog('System', 'Ambulance Released', `Ambulance ${ambulances[index].vehicleNumber} is now available back at station.`, 'Emergency Dispatcher');
    }

    LocalDB.setAmbulances(ambulances);
    return ambulances[index];
  },

  async updateAmbulanceStatus(ambulanceId: string, status: AmbulanceStatus): Promise<Ambulance> {
    await delay(300);
    const ambulances = LocalDB.getAmbulances();
    const index = ambulances.findIndex(a => a.id === ambulanceId);
    if (index === -1) throw new Error('Ambulance not found');

    ambulances[index] = {
      ...ambulances[index],
      status
    };
    if (status !== 'Dispatched') {
      ambulances[index].location = undefined;
      ambulances[index].patientId = undefined;
      ambulances[index].patientName = undefined;
      ambulances[index].severity = undefined;
      ambulances[index].progress = undefined;
    }

    LocalDB.setAmbulances(ambulances);
    this.addLog('System', 'Ambulance Status Updated', `Ambulance ${ambulances[index].vehicleNumber} status changed to ${status}.`, 'Emergency Dispatcher');
    return ambulances[index];
  },

  // Doctor Department Assignment
  async updateDoctorDepartment(id: string, department: string): Promise<Doctor> {
    await delay(300);
    const doctors = LocalDB.getDoctors();
    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Doctor not found');
    
    doctors[index].department = department;
    LocalDB.setDoctors(doctors);
    this.addLog('Staff', 'Department Transfer', `Transferred Doctor ${doctors[index].name} to department: ${department}.`, 'Medical Director');
    return doctors[index];
  },

  async addDoctor(doctorData: Omit<Doctor, 'id'>): Promise<Doctor> {
    await delay(500);
    const doctors = LocalDB.getDoctors();
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${generateUUID().substring(0, 5)}`
    };
    doctors.push(newDoctor);
    LocalDB.setDoctors(doctors);
    this.addLog('Staff', 'Staff Registered', `Registered Doctor ${newDoctor.name} in department ${newDoctor.department}.`, 'HR Department');
    return newDoctor;
  },

  // Nurses API
  async getNurses(): Promise<Nurse[]> {
    await delay(400);
    return LocalDB.getNurses();
  },

  async addNurse(nurseData: Omit<Nurse, 'id' | 'role'>): Promise<Nurse> {
    await delay(500);
    const nurses = LocalDB.getNurses();
    const newNurse: Nurse = {
      ...nurseData,
      id: `nur-${generateUUID().substring(0, 5)}`,
      role: 'Nurse'
    };
    nurses.push(newNurse);
    LocalDB.setNurses(nurses);
    this.addLog('Staff', 'Staff Registered', `Registered Nurse ${newNurse.name} in department ${newNurse.department}.`, 'HR Department');
    return newNurse;
  },

  async updateNurseStatus(id: string, status: Nurse['status']): Promise<Nurse> {
    await delay(300);
    const nurses = LocalDB.getNurses();
    const index = nurses.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Nurse not found');

    nurses[index].status = status;
    LocalDB.setNurses(nurses);
    this.addLog('Staff', 'Shift Updated', `Updated Nurse ${nurses[index].name} shift status to ${status}.`, 'Shift Coordinator');
    return nurses[index];
  },

  async updateNurseDepartment(id: string, department: string): Promise<Nurse> {
    await delay(300);
    const nurses = LocalDB.getNurses();
    const index = nurses.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Nurse not found');

    nurses[index].department = department;
    LocalDB.setNurses(nurses);
    this.addLog('Staff', 'Department Transfer', `Transferred Nurse ${nurses[index].name} to department: ${department}.`, 'Medical Director');
    return nurses[index];
  },

  // Clinical Departments API
  async getDepartments(): Promise<ClinicalDepartment[]> {
    await delay(300);
    return LocalDB.getDepartments();
  },

  async updateDepartmentAlert(id: string, alertLevel: ClinicalDepartment['activeAlert']): Promise<ClinicalDepartment> {
    await delay(300);
    const departments = LocalDB.getDepartments();
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Department not found');

    departments[index].activeAlert = alertLevel;
    LocalDB.setDepartments(departments);
    this.addLog('System', 'Department Alert', `Updated department "${departments[index].name}" alert state to ${alertLevel}.`, 'System Dashboard');
    return departments[index];
  },

  // Audit Logs
  async getLogs(): Promise<ActivityLog[]> {
    await delay(300);
    return LocalDB.getLogs();
  },

  // Helper sync method to push activity logs
  addLog(category: ActivityLog['category'], action: string, detail: string, user: string): void {
    const logs = LocalDB.getLogs();
    const newLog: ActivityLog = {
      id: `log-${generateUUID().substring(0, 5)}`,
      timestamp: new Date().toISOString(),
      category,
      action,
      detail,
      user
    };
    logs.unshift(newLog);
    // Keep max 50 log items in storage
    if (logs.length > 50) logs.pop();
    LocalDB.setLogs(logs);
  }
};
