import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Check, Trash2, User, Calendar, ClipboardList, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { globalSearch } from '../../services/dataService';
import type { SearchResult } from '../../services/dataService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './layout.css';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  
  // Notification Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search Logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        const results = await globalSearch(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (link: string) => {
    navigate(link);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'patient': return <User size={16} className="text-blue-500" />;
      case 'appointment': return <Calendar size={16} className="text-purple-500" />;
      case 'consultation': return <ClipboardList size={16} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <header className="top-header">
      <div className="header-search-wrapper" ref={searchRef}>
        <div className="header-search">
          {isSearching ? (
            <Loader2 size={18} className="animate-spin text-[var(--color-primary)]" />
          ) : (
            <Search size={18} color="var(--color-text-muted)" />
          )}
          <input 
            type="text" 
            placeholder={t('common.search')} 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
          />
        </div>

        {showSearchResults && (
          <div className="search-results-dropdown">
            {searchResults.length === 0 ? (
              <div className="search-no-results">
                No se encontraron resultados para "{searchTerm}"
              </div>
            ) : (
              <div className="search-results-list">
                {searchResults.map((result) => (
                  <div 
                    key={`${result.type}-${result.id}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(result.link)}
                  >
                    <div className="result-icon-wrapper">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="result-info">
                      <div className="result-title">{result.title}</div>
                      <div className="result-subtitle">{result.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-actions">
        <div className="notification-btn-wrapper" ref={dropdownRef}>
          <button 
            className="icon-btn" 
            aria-label="Notifications"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notificaciones</h3>
                {notifications.length > 0 && (
                  <button className="notification-clear" onClick={clearAll} title="Limpiar todas">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No tienes notificaciones nuevas</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.read ? 'unread' : ''}`}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className={`notification-icon ${notif.type}`} />
                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: es })}
                        </div>
                      </div>
                      {!notif.read && (
                        <Check size={14} color="var(--color-primary)" style={{ opacity: 0.5 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {unreadCount > 0 && (
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <button 
                    className="notification-clear" 
                    onClick={markAllAsRead}
                    style={{ width: '100%', padding: '0.5rem 0' }}
                  >
                    Marcar todas como leídas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
