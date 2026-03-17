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

      </div>
    </div>
  );
};
