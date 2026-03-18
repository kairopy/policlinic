import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { LogIn, AlertCircle, Cloud } from 'lucide-react';
import { isGoogleLinked } from '../../services/dataService';
import { useNotifications } from '../../context/NotificationContext';

const GOOGLE_CLIENT_ID = '397167111848-uatagrevtsjnhef1a2imt55vd5hf3v08.apps.googleusercontent.com';

export const GoogleLinkPortal: React.FC = () => {
  const { addNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if linked on mount and every few seconds (to handle cross-tab changes if any)
    const checkStatus = () => {
      const linked = isGoogleLinked();
      setIsVisible(!linked);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLinkGoogle = () => {
    if (!window.google) {
      addNotification('Error', 'Google SDK no cargado. Reintenta en unos segundos.', 'error');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.metadata.readonly',
      callback: (response: { access_token: string }) => {
        if (response.access_token) {
          localStorage.setItem('google_access_token', response.access_token);
          localStorage.setItem('google_connected', 'true');
          addNotification('Vinculación Exitosa', 'Cuenta de Google vinculada correctamente.', 'success');
          setIsVisible(false);
          // Small delay before reload to show notification or just reload
          setTimeout(() => window.location.reload(), 800);
        }
      },
    });
    client.requestAccessToken();
  };

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(10, 15, 30, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal Content */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, var(--color-primary), #0ea5e9)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '2rem',
            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)'
          }}
        >
          <Cloud size={40} color="white" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>
          Bienvenido a Policlinic
        </h2>
        
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          Para comenzar a organizar tus citas y pacientes, necesitas vincular tu cuenta de Google. Esto permitirá la sincronización con Google Calendar y Sheets.
        </p>

        <button
          className="btn btn-primary"
          onClick={handleLinkGoogle}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '16px',
            fontSize: '1.1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
            height: '56px'
          }}
        >
          <LogIn size={22} />
          Vincular con Google
        </button>

        <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
          <AlertCircle size={16} />
          <span>Acción requerida para continuar</span>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};
