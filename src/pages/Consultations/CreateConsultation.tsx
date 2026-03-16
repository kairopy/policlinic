import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Image as ImageIcon, CheckCircle, UploadCloud, FileEdit, X, Calendar, Clock } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { mockAppointments, mockTemplates, mockConsultations, mockPatients } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

export const CreateConsultation: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

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
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const [consultDate, setConsultDate] = useState(now.toISOString().split('T')[0]);
  const [consultTime, setConsultTime] = useState(now.toTimeString().substring(0, 5));

  const today = new Date();
  const appointmentsToday = mockAppointments.filter(app => isSameDay(app.date, today));

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

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

  const handleTemplateClick = (template: typeof mockTemplates[0]) => {
    setSelectedTemplateId(template.id.toString());
    
    setFormData({
      symptoms: template.symptoms || '',
      treatment: template.treatment || '',
      recommendations: template.recommendations || '',
      recoveryTime: template.recoveryTime || '',
      notes: template.notes || '',
      cost: (template as { cost?: string }).cost || '',
    });
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
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: showPatientDropdown && !selectedPatient ? 50 : 1 }} ref={patientDropdownRef}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--color-primary)', borderRadius: '4px 0 0 4px' }}></div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Stethoscope size={16} color="var(--color-primary)" /> {t('consultation.patientSelection')} <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            
            <div style={{ position: 'relative' }}>
              {selectedPatient ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--color-primary-light)', borderRadius: '12px', border: '1px solid var(--color-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {selectedPatient.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.95rem' }}>{selectedPatient.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{selectedPatient.id}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedPatientId('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <input 
                  type="text"
                  placeholder={t('consultation.selectPatient') || "Buscar paciente..."}
                  value={patientSearch}
                  onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}
                  onFocus={() => setShowPatientDropdown(true)}
                  className="input-field"
                  style={{ borderRadius: '12px', padding: '0.85rem 1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', width: '100%' }}
                />
              )}

              {showPatientDropdown && !selectedPatient && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => { setSelectedPatientId(p.id); setShowPatientDropdown(false); setPatientSearch(''); }}
                        style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'background 0.2s' }}
                        className="hover-bg"
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>{p.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.id}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No se encontraron pacientes</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6', borderRadius: '4px 0 0 4px' }}></div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileEdit size={16} color="#8b5cf6" /> {t('consultation.templateSelection')}
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              {mockTemplates.map(template => {
                const isSelected = selectedTemplateId === template.id.toString();
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateClick(template)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #8b5cf6' : '1px solid var(--color-border)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-background)',
                      color: isSelected ? '#8b5cf6' : 'var(--color-text-main)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s'
                    }}
                  >
                    {template.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Date and Time Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--color-primary)" /> {t('consultation.date')}
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => dateInputRef.current?.showPicker()} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{consultDate}</span>
              </div>
              <input 
                ref={dateInputRef}
                type="date" 
                value={consultDate} 
                onChange={e => setConsultDate(e.target.value)} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#8b5cf6" /> {t('consultation.time')}
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => timeInputRef.current?.showPicker()} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              >
                <span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>{consultTime}</span>
              </div>
              <input 
                ref={timeInputRef}
                type="time" 
                value={consultTime} 
                onChange={e => setConsultTime(e.target.value)} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </div>
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
