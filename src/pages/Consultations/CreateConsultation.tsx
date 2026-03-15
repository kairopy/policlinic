import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Image as ImageIcon, CheckCircle, UploadCloud, FileEdit } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { mockAppointments, mockTemplates, mockConsultations } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

export const CreateConsultation: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [formData, setFormData] = useState({
    symptoms: '',
    treatment: '',
    recommendations: '',
    recoveryTime: '',
    notes: ''
  });

  const now = new Date();
  const [consultDate, setConsultDate] = useState(now.toISOString().split('T')[0]);
  const [consultTime, setConsultTime] = useState(now.toTimeString().substring(0, 5));

  const today = new Date();
  const appointmentsToday = mockAppointments.filter(app => isSameDay(app.date, today));

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    
    if (templateId) {
      const template = mockTemplates.find(t => t.id === parseInt(templateId));
      if (template) {
        setFormData(prev => ({
          ...prev,
          notes: prev.notes ? `${prev.notes}\n\n${template.content}` : template.content
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    handleChange(e);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const newConsultation = {
      id: `C-${Math.floor(Math.random() * 10000)}`,
      patientId: selectedPatientId,
      date: consultDate,
      time: consultTime,
      doctor: 'Dr. Admin',
      summary: formData.symptoms.substring(0, 50) + '...',
      type: 'Consultation',
      status: 'Completed',
      cost: 120
    };
    
    mockConsultations.push(newConsultation);
    navigate('/dashboard');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 1rem 3rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--color-primary), #0ea5e9)', WebkitBackgroundClip: 'text', color: 'transparent', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Stethoscope size={36} color="var(--color-primary)" />
          {t('consultation.createTitle')}
        </h1>
        <p className="page-description" style={{ fontSize: '1.1rem' }}>{t('consultation.createDescription')}</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Controls: Patient & Template */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Patient Selection */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-primary)' }}></div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {t('consultation.patientSelection')} <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            {appointmentsToday.length > 0 ? (
              <select 
                className="input-field" 
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                style={{ borderRadius: '12px', padding: '0.85rem 1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
              >
                <option value="" disabled>{t('consultation.selectPatient')}</option>
                {appointmentsToday.map(app => (
                  <option key={app.id} value={app.patientId}>{app.title.split(' - ')[0]} ({app.type})</option>
                ))}
              </select>
            ) : (
              <div style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', color: 'var(--color-danger)', fontSize: '0.9rem', border: '1px dashed var(--color-danger)' }}>
                {t('consultation.noAppointmentsToday')}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }}></div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileEdit size={16} color="#8b5cf6" /> {t('consultation.templateSelection')}
            </label>
            <select 
              className="input-field"
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              style={{ borderRadius: '12px', padding: '0.85rem 1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
            >
              <option value="">{t('consultation.selectTemplate')}</option>
              {mockTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t('consultation.date')}</label>
            <input 
              type="date" 
              className="input-field" 
              value={consultDate} 
              onChange={e => setConsultDate(e.target.value)} 
              style={{ borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)' }} 
            />
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t('consultation.time')}</label>
            <input 
              type="time" 
              className="input-field" 
              value={consultTime} 
              onChange={e => setConsultTime(e.target.value)} 
              style={{ borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)' }} 
            />
          </div>
        </div>

        {/* Clinical Notes Grid */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.symptoms')}</label>
              <textarea 
                className="input-field" 
                name="symptoms"
                value={formData.symptoms}
                onChange={handleTextareaResize}
                placeholder={t('consultation.symptomsPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '100px', borderRadius: '12px', background: 'var(--color-background)' }} 
              />
            </div>
            
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.treatment')}</label>
              <textarea 
                className="input-field" 
                name="treatment"
                value={formData.treatment}
                onChange={handleTextareaResize}
                placeholder={t('consultation.treatmentPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '100px', borderRadius: '12px', background: 'var(--color-background)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recommendations')}</label>
              <textarea 
                className="input-field" 
                name="recommendations"
                value={formData.recommendations}
                onChange={handleTextareaResize}
                placeholder={t('consultation.recommendationsPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '100px', borderRadius: '12px', background: 'var(--color-background)' }} 
              />
            </div>
            
            <div>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recoveryTime')}</label>
              <input 
                type="text"
                className="input-field" 
                name="recoveryTime"
                value={formData.recoveryTime}
                onChange={(e) => setFormData(prev => ({ ...prev, recoveryTime: e.target.value }))}
                placeholder={t('consultation.recoveryTimePlaceholder')} 
                style={{ borderRadius: '12px', background: 'var(--color-background)' }} 
              />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.notes')}</label>
            <textarea 
              className="input-field" 
              name="notes"
              value={formData.notes}
              onChange={handleTextareaResize}
              placeholder={t('consultation.notesPlaceholder')} 
              style={{ resize: 'none', overflow: 'hidden', minHeight: '120px', borderRadius: '12px', background: 'var(--color-background)', fontFamily: 'var(--font-mono)' }} 
            />
          </div>
        </div>

        {/* Media Upload Dropzones (Before/After) */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <ImageIcon size={18} color="var(--color-primary)" /> {t('consultation.imagesTitle')}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {/* Before Img */}
            <div style={{ 
              border: '2px dashed var(--color-border)', 
              borderRadius: '16px', 
              padding: '2rem', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'linear-gradient(145deg, var(--color-background), var(--color-surface))'
            }} className="hover:border-primary">
              <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                <UploadCloud color="var(--color-text-muted)" size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.beforeImage')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG (Max 5MB)</div>
              </div>
            </div>

            {/* After Img */}
            <div style={{ 
              border: '2px dashed var(--color-border)', 
              borderRadius: '16px', 
              padding: '2rem', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'linear-gradient(145deg, var(--color-background), var(--color-surface))'
            }} className="hover:border-primary">
              <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                <UploadCloud color="var(--color-text-muted)" size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.afterImage')}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG (Max 5MB)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}>
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={!selectedPatientId || appointmentsToday.length === 0} style={{ borderRadius: '999px', padding: '0.75rem 2rem', boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)' }}>
            <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
            {t('consultation.submitBtn')}
          </button>
        </div>

      </form>
    </div>
  );
};
