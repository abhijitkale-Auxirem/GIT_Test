export type UserRole = 'Admin' | 'Doctor' | 'Nurse' | 'Billing';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export type PatientStatus = 'Admitted' | 'Outpatient' | 'Discharged' | 'Critical';

export interface VitalsReading {
  date: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  temperature: number;
  oxygenSaturation: number;
}

export interface Prescription {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  datePrescribed: string;
  prescribedBy: string;
}

export interface LabReportResult {
  parameter: string;
  value: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

export interface LabReport {
  id: string;
  testName: string;
  dateRequested: string;
  dateCompleted?: string;
  status: 'Pending' | 'Completed';
  results?: LabReportResult[];
  notes?: string;
}

export interface MedicalRecord {
  diagnoses: string[];
  allergies: string[];
  vitalsHistory: VitalsReading[];
  prescriptions: Prescription[];
  labReports: LabReport[];
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email: string;
  bloodGroup: string;
  address: string;
  status: PatientStatus;
  lastVisit: string;
  medicalRecord: MedicalRecord;
  bedNumber?: string;
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  dateTime: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export type DoctorStatus = 'On Duty' | 'In Surgery' | 'Available' | 'Off Duty' | 'On Leave';

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  contact: string;
  status: DoctorStatus;
  rating: number;
  shiftHours: string;
  image?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export type ClaimStatus = 'N/A' | 'Pending' | 'Approved' | 'Denied';

export interface InsuranceClaim {
  provider: string;
  policyNumber: string;
  amountClaimed: number;
  status: ClaimStatus;
  notes?: string;
}

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  insuranceClaim: InsuranceClaim;
  status: InvoiceStatus;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'Patient' | 'Appointment' | 'Billing' | 'System' | 'Staff';
  action: string;
  detail: string;
  user: string;
}

export interface SystemStats {
  totalPatients: number;
  activeAdmissions: number;
  appointmentsToday: number;
  occupancyRate: number;
  revenueThisMonth: number;
  pendingClaims: number;
}

export type StaffRole = 'Doctor' | 'Nurse' | 'Support';

export interface Nurse {
  id: string;
  name: string;
  role: 'Nurse';
  department: string;
  specialization?: string;
  email: string;
  contact: string;
  status: 'On Duty' | 'Available' | 'Off Duty' | 'On Leave';
  shiftHours: string;
  image?: string;
}

export interface ClinicalDepartment {
  id: string;
  name: string;
  code: string;
  headDoctorId: string;
  headDoctorName: string;
  bedCapacity: number;
  occupiedBeds: number;
  activeAlert: 'Normal' | 'Understaffed' | 'Critical Load';
}

