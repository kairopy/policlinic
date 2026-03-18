import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './layout.css';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
