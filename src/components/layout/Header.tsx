import React from 'react';
import { Search, Bell } from 'lucide-react';
import './layout.css';

export const Header: React.FC = () => {
  return (
    <header className="top-header">
      <div className="header-search">
        <Search size={18} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search patients, appointments..." 
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        
        <div className="user-profile">
          <div className="avatar">Dr.</div>
          <div className="user-info">
            <span className="user-name">Dr. House</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
