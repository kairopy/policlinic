import React from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CreateAppointment: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">{t('appointments.createTitle')}</h1>
        <p className="page-description">{t('appointments.createDescription')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <User size={16} /> {t('appointments.patientSelection')}
              </label>
              <select className="input-field" defaultValue="">
                <option value="" disabled>{t('appointments.selectPatient')}</option>
                <option value="PT-1001">John Doe</option>
                <option value="PT-1002">Jane Smith</option>
                <option value="PT-1003">Robert Johnson</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> {t('appointments.apptType')}
              </label>
              <select className="input-field" defaultValue="checkup">
                <option value="checkup">{t('appointments.general')}</option>
                <option value="followup">{t('appointments.followup')}</option>
                <option value="specialist">{t('appointments.specialist')}</option>
                <option value="emergency">{t('appointments.emergency')}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Calendar size={16} /> {t('appointments.date')}
              </label>
              <input type="date" className="input-field" />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Clock size={16} /> {t('appointments.time')}
              </label>
              <input type="time" className="input-field" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('appointments.notes')}</label>
            <textarea 
              className="input-field" 
              rows={4} 
              placeholder={t('appointments.notesPlaceholder')}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary">{t('appointments.submitBtn')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
