import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  Patient, 
  Appointment, 
  Doctor, 
  Invoice, 
  ActivityLog, 
  SystemStats, 
  User, 
  VitalsReading, 
  Prescription,
  LabReportResult
} from '../types';
import { mockApi } from '../services/mockApi';

export type ViewType = 'dashboard' | 'patients' | 'appointments' | 'doctors' | 'billing';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  currentUser: User;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Data State
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  invoices: Invoice[];
  logs: ActivityLog[];
  stats: SystemStats | null;
  isLoading: boolean;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  
  // CRUD Actions
  refreshData: () => Promise<void>;
  registerPatient: (patientData: Omit<Patient, 'id' | 'medicalRecord'>) => Promise<void>;
  logVitals: (patientId: string, vitals: VitalsReading) => Promise<void>;
  addPrescription: (patientId: string, prescription: Omit<Prescription, 'id' | 'datePrescribed'>) => Promise<void>;
  scheduleAppointment: (aptData: Omit<Appointment, 'id'>) => Promise<boolean>;
  updateAptStatus: (id: string, status: Appointment['status'], notes?: string) => Promise<void>;
  changeDoctorStatus: (id: string, status: Doctor['status']) => Promise<void>;
  generateInvoice: (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => Promise<void>;
  settleInvoice: (id: string, status: Invoice['status'], claimStatus?: Invoice['insuranceClaim']['status']) => Promise<void>;
  addAllergy: (patientId: string, allergy: string) => Promise<void>;
  removeAllergy: (patientId: string, allergy: string) => Promise<void>;
  addDiagnosis: (patientId: string, diagnosis: string) => Promise<void>;
  removeDiagnosis: (patientId: string, diagnosis: string) => Promise<void>;
  orderLabReport: (patientId: string, testName: string, notes?: string) => Promise<void>;
  fillLabReport: (patientId: string, reportId: string, results: LabReportResult[], notes?: string) => Promise<void>;
  assignPatientBed: (patientId: string, bedNumber: string) => Promise<void>;
  releasePatientBed: (patientId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USER: User = {
  id: 'usr-admin',
  name: 'Chief Admin Sarah',
  email: 'admin.sarah@carepulse.com',
  role: 'Admin',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentUser] = useState<User>(DEFAULT_USER);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Data States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    addToast(`Switched to ${newTheme} theme`, 'info');
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [fetchedPatients, fetchedApts, fetchedDocs, fetchedInvoices, fetchedLogs, fetchedStats] = await Promise.all([
        mockApi.getPatients(),
        mockApi.getAppointments(),
        mockApi.getDoctors(),
        mockApi.getInvoices(),
        mockApi.getLogs(),
        mockApi.getStats()
      ]);
      
      setPatients(fetchedPatients);
      setAppointments(fetchedApts);
      setDoctors(fetchedDocs);
      setInvoices(fetchedInvoices);
      setLogs(fetchedLogs);
      setStats(fetchedStats);
    } catch (err: any) {
      addToast(err?.message || 'Failed to fetch hospital records.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  const registerPatient = async (patientData: Omit<Patient, 'id' | 'medicalRecord'>) => {
    setIsLoading(true);
    try {
      await mockApi.addPatient(patientData);
      addToast(`Patient "${patientData.name}" registered successfully.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Registration failed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const logVitals = async (patientId: string, vitals: VitalsReading) => {
    setIsLoading(true);
    try {
      await mockApi.updatePatientVitals(patientId, vitals);
      addToast('Patient vitals logged successfully.', 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to update vitals.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const addPrescription = async (patientId: string, prescription: Omit<Prescription, 'id' | 'datePrescribed'>) => {
    setIsLoading(true);
    try {
      await mockApi.prescribeMedication(patientId, prescription);
      addToast(`Prescription for ${prescription.drugName} logged.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to prescribe medication.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleAppointment = async (aptData: Omit<Appointment, 'id'>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await mockApi.bookAppointment(aptData);
      addToast(`Appointment booked with ${aptData.doctorName}.`, 'success');
      await refreshData();
      return true;
    } catch (err: any) {
      addToast(err?.message || 'Failed to book appointment.', 'danger');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAptStatus = async (id: string, status: Appointment['status'], notes?: string) => {
    setIsLoading(true);
    try {
      await mockApi.updateAppointmentStatus(id, status, notes);
      addToast(`Appointment is now marked as ${status}.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Status update failed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const changeDoctorStatus = async (id: string, status: Doctor['status']) => {
    try {
      await mockApi.updateDoctorStatus(id, status);
      addToast(`Doctor status changed to ${status}.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to change doctor shift.', 'danger');
    }
  };

  const generateInvoice = async (invoiceData: Omit<Invoice, 'id' | 'subtotal' | 'tax' | 'total'>) => {
    setIsLoading(true);
    try {
      await mockApi.createInvoice(invoiceData);
      addToast(`Invoice generated for ${invoiceData.patientName}.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Billing failed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const settleInvoice = async (id: string, status: Invoice['status'], claimStatus?: Invoice['insuranceClaim']['status']) => {
    setIsLoading(true);
    try {
      await mockApi.updateInvoiceStatus(id, status, claimStatus);
      addToast(`Invoice ${id} settled successfully.`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Invoice settlement failed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const addAllergy = async (patientId: string, allergy: string) => {
    setIsLoading(true);
    try {
      await mockApi.addPatientAllergy(patientId, allergy);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to add allergy.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const removeAllergy = async (patientId: string, allergy: string) => {
    setIsLoading(true);
    try {
      await mockApi.removePatientAllergy(patientId, allergy);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to remove allergy.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const addDiagnosis = async (patientId: string, diagnosis: string) => {
    setIsLoading(true);
    try {
      await mockApi.addPatientDiagnosis(patientId, diagnosis);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to add diagnosis.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const removeDiagnosis = async (patientId: string, diagnosis: string) => {
    setIsLoading(true);
    try {
      await mockApi.removePatientDiagnosis(patientId, diagnosis);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to remove diagnosis.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const orderLabReport = async (patientId: string, testName: string, notes?: string) => {
    setIsLoading(true);
    try {
      await mockApi.requestLabReport(patientId, testName, notes);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to order lab report.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const fillLabReport = async (patientId: string, reportId: string, results: LabReportResult[], notes?: string) => {
    setIsLoading(true);
    try {
      await mockApi.completeLabReport(patientId, reportId, results, notes);
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to complete lab report.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const assignPatientBed = async (patientId: string, bedNumber: string) => {
    setIsLoading(true);
    try {
      await mockApi.assignBed(patientId, bedNumber);
      addToast(`Patient bed assigned to "${bedNumber}".`, 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to assign bed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const releasePatientBed = async (patientId: string) => {
    setIsLoading(true);
    try {
      await mockApi.releaseBed(patientId);
      addToast('Patient bed released successfully.', 'success');
      await refreshData();
    } catch (err: any) {
      addToast(err?.message || 'Failed to release bed.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        theme,
        toggleTheme,
        patients,
        appointments,
        doctors,
        invoices,
        logs,
        stats,
        isLoading,
        toasts,
        addToast,
        removeToast,
        refreshData,
        registerPatient,
        logVitals,
        addPrescription,
        scheduleAppointment,
        updateAptStatus,
        changeDoctorStatus,
        generateInvoice,
        settleInvoice,
        addAllergy,
        removeAllergy,
        addDiagnosis,
        removeDiagnosis,
        orderLabReport,
        fillLabReport,
        assignPatientBed,
        releasePatientBed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
