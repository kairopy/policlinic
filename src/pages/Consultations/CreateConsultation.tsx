import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Image as ImageIcon, CheckCircle, UploadCloud, FileEdit, X } from 'lucide-react';
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
    notes: '',
    cost: '',
  });

  const [beforeImage, setBeforeImage] = useState<string | undefined>(undefined);
  const [afterImage, setAfterImage] = useState<string | undefined>(undefined);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

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
        setFormData({
          symptoms: template.symptoms || '',
          treatment: template.treatment || '',
          recommendations: template.recommendations || '',
          recoveryTime: template.recoveryTime || '',
          notes: template.notes || '',
          cost: (template as { cost?: string }).cost || '',
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    handleChange(e);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'before') setBeforeImage(reader.result as string);
        else setAfterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') setBeforeImage(undefined);
    else setAfterImage(undefined);
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
      cost: Number(formData.cost) || 0,
      symptoms: formData.symptoms,
      treatment: formData.treatment,
      recommendations: formData.recommendations,
      recoveryTime: formData.recoveryTime,
      notes: formData.notes
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.symptoms')}</label>
              <textarea 
                className="input-field" 
                name="symptoms"
                value={formData.symptoms}
                onChange={handleTextareaResize}
                placeholder={t('consultation.symptomsPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', width: '100%' }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.treatment')}</label>
              <textarea 
                className="input-field" 
                name="treatment"
                value={formData.treatment}
                onChange={handleTextareaResize}
                placeholder={t('consultation.treatmentPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', width: '100%' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recommendations')}</label>
              <textarea 
                className="input-field" 
                name="recommendations"
                value={formData.recommendations}
                onChange={handleTextareaResize}
                placeholder={t('consultation.recommendationsPlaceholder')} 
                style={{ resize: 'none', overflow: 'hidden', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', width: '100%' }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recoveryTime')}</label>
              <input 
                type="text"
                className="input-field" 
                name="recoveryTime"
                value={formData.recoveryTime}
                onChange={handleChange}
                placeholder={t('consultation.recoveryTimePlaceholder')} 
                style={{ borderRadius: '12px', background: 'var(--color-background)', width: '100%' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.cost')}</label>
              <input 
                type="text"
                className="input-field" 
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Ej. $50" 
                style={{ borderRadius: '12px', background: 'var(--color-background)', width: '100%' }} 
              />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.notes')}</label>
            <textarea 
              className="input-field" 
              name="notes"
              value={formData.notes}
              onChange={handleTextareaResize}
              placeholder={t('consultation.notesPlaceholder')} 
              style={{ resize: 'none', overflow: 'hidden', minHeight: '100px', borderRadius: '12px', background: 'var(--color-background)', fontFamily: 'var(--font-mono)', width: '100%' }} 
            />
          </div>
        </div>

        {/* Media Upload Dropzones (Before/After) */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <ImageIcon size={18} color="var(--color-primary)" /> {t('consultation.imagesTitle')}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            
            {/* hidden inputs */}
            <input type="file" ref={beforeInputRef} onChange={e => handleImageChange(e, 'before')} accept="image/*" style={{ display: 'none' }} />
            <input type="file" ref={afterInputRef} onChange={e => handleImageChange(e, 'after')} accept="image/*" style={{ display: 'none' }} />

            {/* Before Img */}
            <div 
              onClick={() => !beforeImage && beforeInputRef.current?.click()}
              style={{ 
                border: '2px dashed var(--color-border)', 
                borderRadius: '16px', 
                padding: beforeImage ? '0' : '2rem', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                cursor: beforeImage ? 'default' : 'pointer',
                transition: 'all 0.2s',
                background: 'linear-gradient(145deg, var(--color-background), var(--color-surface))',
                minHeight: '200px',
                position: 'relative',
                overflow: 'hidden'
              }} className={!beforeImage ? "hover:border-primary" : ""}>
              
              {beforeImage ? (
                <>
                  <img src={beforeImage} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage('before'); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{t('consultation.beforeImage')}</div>
                </>
              ) : (
                <>
                  <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                    <UploadCloud color="var(--color-text-muted)" size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.beforeImage')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG (Max 5MB)</div>
                  </div>
                </>
              )}
            </div>

            {/* After Img */}
            <div 
              onClick={() => !afterImage && afterInputRef.current?.click()}
              style={{ 
                border: '2px dashed var(--color-border)', 
                borderRadius: '16px', 
                padding: afterImage ? '0' : '2rem', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                cursor: afterImage ? 'default' : 'pointer',
                transition: 'all 0.2s',
                background: 'linear-gradient(145deg, var(--color-background), var(--color-surface))',
                minHeight: '200px',
                position: 'relative',
                overflow: 'hidden'
              }} className={!afterImage ? "hover:border-primary" : ""}>
              
              {afterImage ? (
                <>
                  <img src={afterImage} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeImage('after'); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                    <X size={16} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>{t('consultation.afterImage')}</div>
                </>
              ) : (
                <>
                  <div style={{ padding: '1rem', background: 'var(--color-surface)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
                    <UploadCloud color="var(--color-text-muted)" size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.afterImage')}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>JPG, PNG (Max 5MB)</div>
                  </div>
                </>
              )}
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
