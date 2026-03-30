import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, User, FileText, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SingleDatePicker } from '../../components/ui/SingleDatePicker';
import { mockPatients } from '../../data/mockData';

export const CreateAppointment: React.FC = () => {
  const { t } = useLanguage();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  const [selectedApptType, setSelectedApptType] = useState('checkup');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const now = new Date();
  const [consultDate, setConsultDate] = useState(now.toISOString().split('T')[0]);
  const [consultTime, setConsultTime] = useState(now.toTimeString().substring(0, 5));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(event.target as Node)) {
        setShowPatientDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">{t('appointments.createTitle')}</h1>
        <p className="page-description">{t('appointments.createDescription')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Patient Selection */}
            <div className="input-group" style={{ position: 'relative', overflow: 'visible', zIndex: showPatientDropdown ? 50 : 2 }} ref={patientDropdownRef}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <User size={16} /> {t('appointments.patientSelection')}
              </label>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowPatientDropdown(!showPatientDropdown)} 
                  style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', width: '100%' }}
                  className="hover-border-primary"
                >
                  <span style={{ color: selectedPatientId ? 'var(--color-text-main)' : 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    {mockPatients.find(p => p.id === selectedPatientId)?.name || t('appointments.selectPatient')}
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
                      {mockPatients
                        .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase()))
                        .map(patient => (
                          <div 
                            key={patient.id} 
                            onClick={() => { setSelectedPatientId(patient.id); setShowPatientDropdown(false); setPatientSearch(''); }}
                            style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                            className="hover-bg"
                          >
                            <div style={{ fontWeight: 500, color: 'var(--color-text-main)', fontSize: '0.9rem' }}>{patient.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {patient.id}</div>
                          </div>
                        ))}
                      {mockPatients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                          Sin resultados
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Type */}
            <div className="input-group" style={{ position: 'relative', overflow: 'visible', zIndex: showTypeDropdown ? 50 : 1 }} ref={typeDropdownRef}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <FileText size={16} /> {t('appointments.apptType')}
              </label>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)} 
                  style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', width: '100%' }}
                  className="hover-border-primary"
                >
                  <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                    {selectedApptType === 'checkup' && t('appointments.general')}
                    {selectedApptType === 'followup' && t('appointments.followup')}
                    {selectedApptType === 'specialist' && t('appointments.specialist')}
                    {selectedApptType === 'emergency' && t('appointments.emergency')}
                  </span>
                  <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {showTypeDropdown && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto', animation: 'slide-up 0.2s ease-out' }}>
                    {[
                      { value: 'checkup', label: t('appointments.general') },
                      { value: 'followup', label: t('appointments.followup') },
                      { value: 'specialist', label: t('appointments.specialist') },
                      { value: 'emergency', label: t('appointments.emergency') }
                    ].map(type => (
                      <div 
                        key={type.value} 
                        onClick={() => { setSelectedApptType(type.value); setShowTypeDropdown(false); }}
                        style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--color-border-light)', cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.9rem', color: 'var(--color-text-main)' }}
                        className="hover-bg"
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date and Time Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', position: 'relative', zIndex: 5 }}>
            
            {/* Date Selector */}
            <div className="input-group" style={{ position: 'relative', overflow: 'visible', zIndex: 2 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <Calendar size={16} /> {t('appointments.date')}
              </label>
              <SingleDatePicker date={consultDate} onChange={setConsultDate} />
            </div>

            {/* Time Selector */}
            <div className="input-group" style={{ position: 'relative', overflow: 'visible', zIndex: showTimePicker ? 50 : 1 }} ref={timeDropdownRef}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                 <Clock size={16} /> {t('appointments.time')}
              </label>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowTimePicker(!showTimePicker)} 
                  style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', width: '100%' }}
                  className="hover-border-primary"
                >
                  <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 500 }}>{consultTime}</span>
                  <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: showTimePicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>

                {showTimePicker && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '12px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto', animation: 'slide-up 0.2s ease-out' }}>
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
