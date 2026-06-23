import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, Clock, Calendar, CheckCircle, AlertTriangle, FileText, Info } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import './TopHeader.css';

export const TopHeader: React.FC = () => {
  const { currentView, currentUser, logs, stats } = useApp();
  const [time, setTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Hospital Operations';
      case 'patients': return 'Patient EMR Records';
      case 'appointments': return 'Appointment Scheduler';
      case 'doctors': return 'Clinical Staff Shifts';
      case 'billing': return 'Billing & Financial Ledger';
      default: return 'CarePulse Control Center';
    }
  };

  const getLogIcon = (category: string) => {
    switch (category) {
      case 'Patient': return <Info size={14} className="log-type-patient" />;
      case 'Appointment': return <Calendar size={14} className="log-type-appointment" />;
      case 'Billing': return <FileText size={14} className="log-type-billing" />;
      case 'System': return <CheckCircle size={14} className="log-type-system" />;
      default: return <AlertTriangle size={14} className="log-type-staff" />;
    }
  };

  return (
    <header className="top-header glass-panel">
      {/* Title Area */}
      <div className="header-title-sec">
        <h1 className="header-title">{getPageTitle()}</h1>
        <p className="header-subtitle">Enterprise Clinical Dashboard</p>
      </div>

      {/* Operations Search */}
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search EHR IDs, doctors, or billing claims..." className="search-input" />
      </div>

      {/* Meta Indicators */}
      <div className="header-meta">
        {/* Clock Node */}
        <div className="live-clock">
          <Clock className="clock-icon" size={16} />
          <span className="clock-time">{time}</span>
          <span className="clock-divider">|</span>
          <span className="clock-date">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Notifications Hub */}
        <div className="notifications-hub">
          <button 
            className={`icon-btn notifications-trigger ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications Panel"
          >
            <Bell size={20} />
            {stats && stats.appointmentsToday > 0 && <span className="notification-badge">{stats.appointmentsToday}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown glass-panel">
              <div className="dropdown-header">
                <h3>Clinical Alerts & Log Audits</h3>
                <span className="badge badge-info">{logs.length} Total</span>
              </div>
              <div className="dropdown-content">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="notification-item">
                    <div className="item-icon-wrapper">
                      {getLogIcon(log.category)}
                    </div>
                    <div className="item-details">
                      <div className="item-action-line">
                        <span className="item-action">{log.action}</span>
                        <span className="item-time">{formatDate(log.timestamp).split('at')[1]}</span>
                      </div>
                      <p className="item-detail-text">{log.detail}</p>
                      <span className="item-author">By: {log.user}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">
                <span>Recent system logs shown above</span>
              </div>
            </div>
          )}
        </div>

        {/* User Hub */}
        <div className="user-hub">
          <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-top" />
          <div className="user-status-dot pulse-badge" />
        </div>
      </div>
    </header>
  );
};
export default TopHeader;
