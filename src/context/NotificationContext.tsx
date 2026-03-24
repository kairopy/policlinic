import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
}

interface Toast {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const playNotificationSound = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    // First tone (A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0, audioCtx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.4);

    // Second tone (A6)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0, audioCtx.currentTime + 0.08);
    gain2.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.08);
    osc2.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio play failed, possibly due to autoplay restrictions", e);
  }
};

const getToastIcon = (type: NotificationType) => {
  switch (type) {
    case 'success': return <CheckCircle size={20} color="var(--color-success)" />;
    case 'warning': return <AlertCircle size={20} color="var(--color-warning)" />;
    case 'error': return <AlertCircle size={20} color="var(--color-danger)" />;
    default: return <Info size={20} color="var(--color-primary)" />;
  }
};

const getToastColor = (type: NotificationType) => {
  switch (type) {
    case 'success': return 'var(--color-success)';
    case 'warning': return 'var(--color-warning)';
    case 'error': return 'var(--color-danger)';
    default: return 'var(--color-primary)';
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: AppNotification) => ({ ...n, timestamp: new Date(n.timestamp) }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeToasts, setActiveToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newNotification: AppNotification = { id, title, message, type, timestamp: new Date(), read: false };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Play Sound
    playNotificationSound();

    // Spawn Toast
    setActiveToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== id));
    }, 4500); 
  };

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
      
      {/* Toast Portal - Rendered at the absolute top of the DOM */}
      {document.body && createPortal(
        <div style={{ position: 'fixed', top: '90px', right: '20px', zIndex: 9999999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
          {activeToasts.map(toast => (
            <div 
              key={toast.id} 
              className="glass-panel" 
              style={{ 
                width: '320px', 
                padding: '16px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                animation: 'slide-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
                borderLeft: `5px solid ${getToastColor(toast.type)}`,
                pointerEvents: 'auto'
              }}
            >
              <div style={{ paddingTop: '2px' }}>
                {getToastIcon(toast.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--color-text-main)', fontWeight: 600 }}>{toast.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }} className="hover:text-danger">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
