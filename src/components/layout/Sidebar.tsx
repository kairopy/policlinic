import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar as CalendarIcon,
  FileText,
  Settings,
  Activity,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './layout.css';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/patients', icon: Users, label: t('sidebar.patients') },
    { to: '/appointments', icon: CalendarIcon, label: t('sidebar.appointments') },
    { to: '/consultations', icon: Activity, label: t('sidebar.history') },
    { to: '/templates', icon: FileText, label: t('sidebar.templates') },
    { to: '/settings', icon: Settings, label: t('sidebar.settings') },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity color="var(--color-primary)" size={28} />
        <h2>Policlinic</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
