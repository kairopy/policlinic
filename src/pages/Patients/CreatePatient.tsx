import React from 'react';
import { User, Phone, Mail, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CreatePatient: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">{t('patients.createTitle')}</h1>
        <p className="page-description">{t('patients.createDescription')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <User size={16} /> {t('patients.fullName')}
              </label>
              <input type="text" className="input-field" placeholder={t('patients.namePlaceholder')} required />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> {t('patients.age')}
              </label>
              <input type="number" className="input-field" placeholder={t('patients.agePlaceholder')} required min={0} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Phone size={16} /> {t('patients.phone')}
              </label>
              <input type="tel" className="input-field" placeholder={t('patients.phonePlaceholder')} />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Mail size={16} /> {t('patients.email')}
              </label>
              <input type="email" className="input-field" placeholder={t('patients.emailPlaceholder')} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('patients.notes')}</label>
            <textarea 
              className="input-field" 
              rows={4} 
              placeholder={t('patients.notesPlaceholder')}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary">{t('patients.submitBtn')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
