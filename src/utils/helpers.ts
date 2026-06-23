import type { PatientStatus, AppointmentStatus, DoctorStatus, InvoiceStatus } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string, includeTime = true): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  const optionsDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

  const datePart = isToday ? 'Today' : date.toLocaleDateString('en-US', optionsDate);
  const timePart = includeTime ? ` at ${date.toLocaleTimeString('en-US', optionsTime)}` : '';

  return `${datePart}${timePart}`;
};

export const getPatientStatusBadge = (status: PatientStatus): { className: string; label: string } => {
  switch (status) {
    case 'Admitted':
      return { className: 'badge badge-info', label: 'Admitted' };
    case 'Critical':
      return { className: 'badge badge-danger pulse-badge', label: 'Critical' };
    case 'Discharged':
      return { className: 'badge badge-success', label: 'Discharged' };
    case 'Outpatient':
      return { className: 'badge badge-warning', label: 'Outpatient' };
    default:
      return { className: 'badge badge-info', label: status };
  }
};

export const getAppointmentStatusBadge = (status: AppointmentStatus): { className: string; label: string } => {
  switch (status) {
    case 'Scheduled':
      return { className: 'badge badge-info', label: 'Scheduled' };
    case 'Completed':
      return { className: 'badge badge-success', label: 'Completed' };
    case 'Cancelled':
      return { className: 'badge badge-danger', label: 'Cancelled' };
    case 'No Show':
      return { className: 'badge badge-warning', label: 'No Show' };
    default:
      return { className: 'badge badge-info', label: status };
  }
};

export const getDoctorStatusBadge = (status: DoctorStatus): { className: string; label: string } => {
  switch (status) {
    case 'Available':
    case 'On Duty':
      return { className: 'badge badge-success', label: status };
    case 'In Surgery':
      return { className: 'badge badge-danger pulse-badge', label: 'In Surgery' };
    case 'Off Duty':
      return { className: 'badge badge-secondary', label: 'Off Duty' };
    case 'On Leave':
      return { className: 'badge badge-warning', label: 'On Leave' };
    default:
      return { className: 'badge badge-info', label: status };
  }
};

export const getInvoiceStatusBadge = (status: InvoiceStatus): { className: string; label: string } => {
  switch (status) {
    case 'Paid':
      return { className: 'badge badge-success', label: 'Paid' };
    case 'Unpaid':
      return { className: 'badge badge-warning', label: 'Unpaid' };
    case 'Overdue':
      return { className: 'badge badge-danger pulse-badge', label: 'Overdue' };
    case 'Draft':
      return { className: 'badge badge-secondary', label: 'Draft' };
    default:
      return { className: 'badge badge-info', label: status };
  }
};

export const generateUUID = (): string => {
  return 'idx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
