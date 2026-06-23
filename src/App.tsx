import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import DashboardView from './features/dashboard/DashboardView';
import PatientsView from './features/patients/PatientsView';
import AppointmentsView from './features/appointments/AppointmentsView';
import DoctorsView from './features/doctors/DoctorsView';
import BillingView from './features/billing/BillingView';
import AmbulanceView from './features/ambulance/AmbulanceView';
import StaffView from './features/staff/StaffView';
import { HeartPulse, X } from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const { currentView, isLoading, toasts, removeToast } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'patients':
        return <PatientsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'doctors':
        return <DoctorsView />;
      case 'billing':
        return <BillingView />;
      case 'ambulance':
        return <AmbulanceView />;
      case 'staff':
        return <StaffView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="main-content">
        <TopHeader />
        
        {/* Core Router View */}
        <div className="view-content-portal">
          {renderActiveView()}
        </div>
      </div>

      {/* Global Clinical Loader Backdrop */}
      {isLoading && (
        <div className="global-loader-backdrop flex-row">
          <div className="loader-box glass-panel flex-row">
            <HeartPulse className="pulse-logo animate-pulse text-primary" size={24} />
            <div className="loader-text">
              <span className="loader-title">Syncing Clinical Registry...</span>
              <span className="loader-sub">Verifying integrity algorithms</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Notifications Node */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card glass-panel toast-${toast.type}`}>
            <div className="toast-accent" />
            <span className="toast-text">{toast.message}</span>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
