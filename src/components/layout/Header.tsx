import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './layout.css';

export const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="top-header">
      <div className="header-search">
        <Search size={18} color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder={t('common.search')} 
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        

      </div>
    </header>
  );
};
