import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { Settings as SettingsIcon, Monitor, LogIn, LogOut, CheckCircle } from 'lucide-react';

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '397167111848-uatagrevtsjnhef1a2imt55vd5hf3v08.apps.googleusercontent.com';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { addNotification } = useNotifications();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <header className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SettingsIcon size={28} /> {t('settings.title')}
        </h1>
        <p className="page-description">{t('settings.description')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
              <Monitor size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('settings.themePreference')}</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginLeft: '3rem' }}>
            <button 
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setTheme('light');
                addNotification('Tema Actualizado', 'El tema claro ha sido aplicado.', 'info');
              }}
            >
               {t('settings.light')}
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setTheme('dark');
                addNotification('Tema Actualizado', 'El tema oscuro ha sido aplicado.', 'info');
              }}
            >
               {t('settings.dark')}
            </button>
          </div>
        </section>

        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
              <SettingsIcon size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('settings.integrations')}</h3>
          </div>

          <div style={{ marginLeft: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>
              La aplicación se sincroniza automáticamente con tu Google Sheets ("Lic Karina Pacientes") y Google Calendar.
            </p>

            <button 
              className={`btn ${localStorage.getItem('google_access_token') ? 'btn-outline' : 'btn-primary'}`}
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => {
                const token = localStorage.getItem('google_access_token');
                if (token) {
                  localStorage.removeItem('google_access_token');
                  localStorage.removeItem('google_connected');
                  localStorage.removeItem('google_sheets_id');
                  addNotification('Desvinculado', 'Cuenta de Google desconectada.', 'warning');
                  setTimeout(() => window.location.reload(), 500);
                } else {
                  const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.metadata.readonly',
                    callback: (response: { access_token: string }) => {
                      if (response.access_token) {
                        localStorage.setItem('google_access_token', response.access_token);
                        localStorage.setItem('google_connected', 'true');
                        addNotification('Vinculación Exitosa', 'Cuenta de Google vinculada correctamente.', 'success');
                        setTimeout(() => window.location.reload(), 500);
                      }
                    },
                  });
                  client.requestAccessToken();
                }
              }}
            >
              {localStorage.getItem('google_access_token') ? <LogOut size={18} /> : <LogIn size={18} />}
              {localStorage.getItem('google_access_token') ? t('settings.googleDisconnected') : t('settings.connectGoogle')}
            </button>

            {localStorage.getItem('google_access_token') && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                <CheckCircle size={16} /> {t('settings.googleConnected')}
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
