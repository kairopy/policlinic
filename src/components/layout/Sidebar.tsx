import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar as CalendarIcon,
  FileText,
  Settings,
  Activity,
  LayoutDashboard,
  Navigation,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './layout.css';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/patients', icon: Users, label: t('sidebar.patients') },
    { to: '/appointments', icon: CalendarIcon, label: t('sidebar.appointments') },
    { to: '/routes', icon: Navigation, label: 'Rutas' },
    { to: '/analytics', icon: PieChart, label: 'Analíticas' },
    { to: '/consultations', icon: Activity, label: t('sidebar.history') },
    { to: '/templates', icon: FileText, label: t('sidebar.templates') },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Activity className="logo-icon" />
        <span className="brand-name">Ariel Céspedes<br /><small style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 400 }}>Fisioterapia a Domicilio</small></span>
      </div>

      <nav className="nav-menu">
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

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>{t('sidebar.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
};
