import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GoogleLinkPortal } from '../auth/GoogleLinkPortal';
import './layout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="layout-wrapper">
      <GoogleLinkPortal />
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container glass-panel" style={{ margin: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
