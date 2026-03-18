import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Image as ImageIcon, CheckCircle, UploadCloud, FileEdit, X, ChevronDown, Clock, Activity, Loader2 } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { SingleDatePicker } from '../../components/ui/SingleDatePicker';
import { getPatients, getAppointments, saveConsultation, getTemplates, updatePatientStatus } from '../../services/dataService';
import type { Patient, Appointment } from '../../services/dataService';

interface Template {
  id: string | number;
  title: string;
  symptoms?: string;
  treatment?: string;
  recommendations?: string;
  recoveryTime?: string;
  notes?: string;
  cost?: string;
}

interface CreateConsultationProps {
  onClose?: () => void;
}

export const CreateConsultation: React.FC<CreateConsultationProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patientStatus, setPatientStatus] = useState('in_treatment');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

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
  const appointmentsToday = appointments.filter((app: Appointment) => isSameDay(new Date(app.date), today));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [p, a, tpl] = await Promise.all([
        getPatients(),
        getAppointments(),
        getTemplates()
      ]);
      setPatients(p);
      setAppointments(a);
      setTemplates(tpl);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const statuses = [
    { id: 'in_treatment', label: t('consultation.statuses.in_treatment'), color: 'var(--color-primary)' },
    { id: 'medical_discharge', label: t('consultation.statuses.medical_discharge'), color: 'var(--color-success)' },
    { id: 'maintenance', label: t('consultation.statuses.maintenance'), color: 'var(--color-info, #0ea5e9)' },
    { id: 'pending_control', label: t('consultation.statuses.pending_control'), color: 'var(--color-warning)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    const newConsultation = {
      id: `C-${Math.floor(Math.random() * 10000)}`,
      patientId: selectedPatientId,
      date: consultDate,
      time: consultTime,
      doctor: 'Dr. Admin',
      summary: formData.symptoms.substring(0, 50) + '...',
      type: t('consultation.type'),
      status: 'Completed',
      cost: Number(formData.cost) || 0,
      symptoms: formData.symptoms,
      treatment: formData.treatment,
      recommendations: formData.recommendations,
      recoveryTime: formData.recoveryTime,
      notes: formData.notes
    };
    
    await updatePatientStatus(selectedPatientId, patientStatus);
    await saveConsultation(newConsultation);

    addNotification('Consulta Registrada', 'La evaluación clínica ha sido guardada en el historial del paciente.', 'success');
    
    if (onClose) {
      onClose();
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={48} className="animate-spin" color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)' }}>Preparando consulta...</p>
      </div>
    );
  }

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
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: showPatientDropdown ? 50 : 1 }} ref={patientDropdownRef}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {t('consultation.patientSelection')} <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowPatientDropdown(!showPatientDropdown)} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                className="hover-border-primary"
              >
                <span style={{ color: selectedPatientId ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  {patients.find((p: Patient) => p.id === selectedPatientId)?.name || t('consultation.selectPatient')}
                </span>
                <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: showPatientDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>

              {showPatientDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '280px', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'slide-up 0.2s ease-out' }}>
                  {/* Search Bar */}
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border-light)', background: 'var(--color-surface)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <input 
                      type="text" 
                      placeholder="Buscar paciente..." 
                      value={patientSearch}
                      onChange={e => setPatientSearch(e.target.value)}
                      style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--color-border)', width: '100%', fontSize: '0.9rem', background: 'var(--color-background)', outline: 'none', transition: 'all 0.2s' }}
                      onClick={e => e.stopPropagation()} 
                      className="hover-border-primary"
                    />
                  </div>

                  {/* Options List */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {patients
                      .filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                      .map((p: Patient) => (
                        <div 
                          key={p.id} 
                          onClick={() => { setSelectedPatientId(p.id); setShowPatientDropdown(false); setPatientSearch(''); }}
                          style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="hover-bg"
                        >
                          <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {p.id}</div>
                        </div>
                      ))}
                    {patients.filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Sin resultados
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: showTemplateDropdown ? 50 : 1 }} ref={templateDropdownRef}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileEdit size={16} color="#8b5cf6" /> {t('consultation.templateSelection')}
            </label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                className="hover-border-violet"
              >
                <span style={{ color: selectedTemplateId ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  {templates.find((t: Template) => t.id.toString() === selectedTemplateId)?.title || t('consultation.selectTemplate')}
                </span>
                <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: showTemplateDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>

              {showTemplateDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                  <div 
                    onClick={() => { setSelectedTemplateId(''); setShowTemplateDropdown(false); setFormData({ symptoms: '', treatment: '', recommendations: '', recoveryTime: '', notes: '', cost: '' }); }}
                    style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}
                  >
                    {t('consultation.selectTemplate')}
                  </div>
                  {templates.map((template: Template) => (
                    <div 
                      key={template.id} 
                      onClick={() => { 
                        setSelectedTemplateId(template.id.toString()); 
                        setShowTemplateDropdown(false); 
                        setFormData({
                          symptoms: template.symptoms || '',
                          treatment: template.treatment || '',
                          recommendations: template.recommendations || '',
                          recoveryTime: template.recoveryTime || '',
                          notes: template.notes || '',
                          cost: (template as { cost?: string }).cost || '',
                        });
                      }}
                      style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                      className="hover-bg"
                    >
                      <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{template.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date, Time & Status Configuration */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 5 }}>
          
          {/* Date Selector */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: 2 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{t('consultation.date')}</label>
            <SingleDatePicker date={consultDate} onChange={setConsultDate} />
          </div>

          {/* Time Selector */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: showTimePicker ? 50 : 1 }} ref={timeDropdownRef}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{t('consultation.time')}</label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowTimePicker(!showTimePicker)} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', width: '100%' }}
                className="hover-border-primary"
              >
                <Clock size={18} color="var(--color-primary)" />
                <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 500 }}>{consultTime}</span>
              </div>

              {showTimePicker && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto', animation: 'slide-up 0.2s ease-out' }}>
                  {["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"].map(time => (
                    <div 
                      key={time} 
                      onClick={() => { setConsultTime(time); setShowTimePicker(false); }}
                      style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', color: 'var(--color-text-main)' }}
                      className="hover-bg"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Selector */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'visible', zIndex: showStatusDropdown ? 50 : 1 }} ref={statusDropdownRef}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>{t('consultation.patientStatus')}</label>
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowStatusDropdown(!showStatusDropdown)} 
                style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}
                className="hover-border-primary"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Activity size={18} color={statuses.find(s => s.id === patientStatus)?.color} />
                  <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 500 }}>
                    {statuses.find(s => s.id === patientStatus)?.label}
                  </span>
                </div>
                <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: showStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>

              {showStatusDropdown && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', overflow: 'hidden', animation: 'slide-up 0.2s ease-out' }}>
                  {statuses.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => { setPatientStatus(s.id); setShowStatusDropdown(false); }}
                      style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      className="hover-bg"
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }}></div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: patientStatus === s.id ? 600 : 400 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
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
          <button type="button" className="btn btn-outline" onClick={() => onClose ? onClose() : navigate(-1)} style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}>
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
