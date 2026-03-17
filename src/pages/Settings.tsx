import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Monitor } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();

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
              onClick={() => setTheme('light')}
            >
               {t('settings.light')}
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTheme('dark')}
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

          <div style={{ marginLeft: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#34a853', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Google Sheets</span>
                {t('settings.sheetsId')}
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. 1BxiMVs0XRA5nFMdKvBdBAngmUULa-3idR0vLXU"
                defaultValue={localStorage.getItem('google_sheets_id') || ''}
                onChange={(e) => localStorage.setItem('google_sheets_id', e.target.value)}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                ID de la hoja donde se sincronizan los pacientes.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#4285f4', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Google Calendar</span>
                {t('settings.calendarId')}
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. primary o id-calendario@group.calendar.google.com"
                defaultValue={localStorage.getItem('google_calendar_id') || ''}
                onChange={(e) => localStorage.setItem('google_calendar_id', e.target.value)}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                ID del calendario para sincronizar las citas.
              </p>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#f04e23', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>n8n</span>
                {t('settings.webhookUrl')}
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ej. https://n8n.tu-instancia.com/webhook/..."
                defaultValue={localStorage.getItem('n8n_webhook_url') || ''}
                onChange={(e) => localStorage.setItem('n8n_webhook_url', e.target.value)}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                URL del webhook de n8n para procesar datos de Google Sheets y Calendar.
              </p>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              onClick={() => {
                const connected = localStorage.getItem('google_connected') === 'true';
                localStorage.setItem('google_connected', (!connected).toString());
                window.location.reload();
              }}
            >
              {localStorage.getItem('google_connected') === 'true' ? t('settings.googleDisconnected') : t('settings.connectGoogle')}
            </button>

            {localStorage.getItem('google_connected') === 'true' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                ✓ {t('settings.googleConnected')}
              </p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
