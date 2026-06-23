import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ViewType } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  HeartPulse, 
  ShieldCheck,
  Sun,
  Moon,
  Truck,
  Network
} from 'lucide-react';
import './Sidebar.css';

interface NavigationItem {
  view: ViewType;
  label: string;
  icon: React.ComponentType<any>;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, theme, toggleTheme } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: NavigationItem[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'patients', label: 'Patient EMR', icon: Users },
    { view: 'appointments', label: 'Appointments', icon: Calendar },
    { view: 'doctors', label: 'Doctors Shifts', icon: Activity },
    { view: 'billing', label: 'Billing & Claims', icon: DollarSign },
    { view: 'ambulance', label: 'Emergency Fleet', icon: Truck },
    { view: 'staff', label: 'Staff & Depts', icon: Network },
  ];

  return (
    <aside className={`sidebar glass-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <HeartPulse className="pulse-logo" />
          {!isCollapsed && <span className="brand-name">CarePulse<span className="brand-sub">Enterprise</span></span>}
        </div>
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Roster Badge */}
      {!isCollapsed && (
        <div className="admin-status-box">
          <ShieldCheck size={14} className="status-icon" />
          <div className="status-details">
            <span className="status-title">Security Node Active</span>
            <span className="status-subtitle">Level: {currentUser.role}</span>
          </div>
        </div>
      )}

      {/* Navigation Roster */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentView(item.view)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {isActive && !isCollapsed && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Theme Toggle */}
      <div className="sidebar-footer">
        <button className="theme-toggle nav-link" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        
        <div className="sidebar-user">
          <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
          {!isCollapsed && (
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-email">{currentUser.email}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
