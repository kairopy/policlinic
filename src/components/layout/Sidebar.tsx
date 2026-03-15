import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  History, 
  FileText, 
  Settings,
  Activity
} from 'lucide-react';
import './layout.css';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/patients', label: 'Patients', icon: Users },
  { path: '/appointments', label: 'Appointments', icon: Calendar },
  { path: '/consultations', label: 'History', icon: History },
  { path: '/templates', label: 'Templates', icon: FileText },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Activity className="logo-icon" />
        <span className="brand-name">Policlinic App</span>
      </div>
      
      <nav className="nav-menu">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '0.75rem 0' }}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
