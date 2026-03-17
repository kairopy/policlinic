import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, FileText, ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getPatients, savePatient } from '../../services/dataService';

// Define Patient interface (assuming it's not globally defined or imported elsewhere)
interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  notes?: string;
  lastVisit: string;
  status: 'in_treatment' | 'pending_control' | 'completed';
  createdAt: string;
}

export const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0, // Changed to number as per Partial<Patient>
    phone: '',
    email: '',
    notes: '',
    status: 'pending_control' // Added status
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchPatient = async () => {
        const patients = await getPatients();
        const patient = patients.find((p: any) => p.id === id); 
        if (patient) {
          setFormData({
            name: patient.name,
            age: patient.age, // Changed to number
            phone: patient.phone,
            email: patient.email,
            notes: patient.notes || '', // Ensure notes is set if available
            status: patient.status as Patient['status']
          });
        }
      };
      fetchPatient();
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData: Patient = {
      id: isEdit ? id || '' : `PT-${Date.now()}`,
      name: formData.name || '',
      age: formData.age || 0,
      phone: formData.phone || '',
      email: formData.email || '',
      notes: formData.notes || '',
      lastVisit: new Date().toISOString().split('T')[0],
      status: (formData.status as Patient['status']) || 'in_treatment', // Use existing status or default
      createdAt: new Date().toISOString().split('T')[0]
    };

    await savePatient(patientData as Patient); // Cast to Patient as all required fields are now present
    navigate(isEdit ? `/patients/${id}` : '/patients');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate(-1)} 
          style={{ marginBottom: '1rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> {t('common.cancel')}
        </button>
        <h1 className="page-title">{isEdit ? t('patients.editTitle') : t('patients.createTitle')}</h1>
        <p className="page-description">{isEdit ? t('patients.editDescription') : t('patients.createDescription')}</p>
      </header>

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                 <User size={18} color="var(--color-primary)" /> {t('patients.fullName')}
              </label>
              <input 
                name="name"
                type="text" 
                className="input-field" 
                placeholder={t('patients.namePlaceholder')} 
                value={formData.name || ''}
                onChange={handleChange}
                required 
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                 <FileText size={18} color="var(--color-primary)" /> {t('patients.age')}
              </label>
              <input 
                name="age"
                type="number" 
                className="input-field" 
                placeholder={t('patients.agePlaceholder')} 
                value={formData.age}
                onChange={handleChange}
                required 
                min={0} 
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                 <Phone size={18} color="var(--color-primary)" /> {t('patients.phone')}
              </label>
              <input 
                name="phone"
                type="tel" 
                className="input-field" 
                placeholder={t('patients.phonePlaceholder')} 
                value={formData.phone}
                onChange={handleChange}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                 <Mail size={18} color="var(--color-primary)" /> {t('patients.email')}
              </label>
              <input 
                name="email"
                type="email" 
                className="input-field" 
                placeholder={t('patients.emailPlaceholder')} 
                value={formData.email}
                onChange={handleChange}
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" style={{ fontWeight: 600 }}>{t('patients.notes')}</label>
            <textarea 
              name="notes"
              className="input-field" 
              rows={5} 
              placeholder={t('patients.notesPlaceholder')}
              value={formData.notes}
              onChange={handleChange}
              style={{ resize: 'vertical', borderRadius: '16px', padding: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} style={{ borderRadius: '12px', padding: '0.75rem 1.5rem' }}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '12px', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)' }}>
              <Save size={18} /> {isEdit ? t('patients.updateBtn') : t('patients.submitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
