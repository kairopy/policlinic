import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, FileText, ArrowLeft, Save, MapPin, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { getPatients, savePatient, updatePatient } from '../../services/dataService';
import { sanitizeGoogleMapsUrl } from '../../services/geocoding';
import type { Patient } from '../../services/dataService';

interface PatientFormProps {
  /** When provided, the form runs in modal mode (no page navigation). */
  onClose?: () => void;
  /** In modal edit mode, pass the patient ID to pre-populate the form. */
  editPatientId?: string;
  /** 'create' | 'edit'. If omitted, derived from the URL param. */
  mode?: 'create' | 'edit';
  /** Called after a successful save so the parent can refresh its data. */
  onSaved?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onClose,
  editPatientId,
  mode,
  onSaved,
}) => {
  // Standalone page mode reads params from URL; modal mode uses props
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  const isModalMode = Boolean(onClose);
  const id = editPatientId ?? params.id;
  const isEdit = mode === 'edit' || (mode === undefined && Boolean(id));

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    phone: '',
    email: '',
    notes: '',
    location: '',
    status: 'pending_control',
  });
  // Preserve original read-only fields so they are not overwritten on save
  const originalRef = React.useRef<{ createdAt: string; lastVisit: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && id) {
      const fetchPatient = async () => {
        const patients = await getPatients();
        const patient = patients.find((p: Patient) => p.id === id);
        if (patient) {
          originalRef.current = { createdAt: patient.createdAt, lastVisit: patient.lastVisit };
          setFormData({
            name: patient.name,
            age: patient.age,
            phone: patient.phone,
            email: patient.email,
            notes: patient.notes || '',
            location: patient.location || '',
            status: patient.status as Patient['status'],
          });
        }
      };
      fetchPatient();
    }
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: Partial<Patient>) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const patientData: Patient = {
        id: isEdit ? id || '' : `PT-${Date.now()}`,
        name: formData.name || '',
        age: formData.age || 0,
        phone: formData.phone || '',
        email: formData.email || '',
        notes: formData.notes || '',
        location: formData.location || '',
        // Preserve original dates when editing; set today only for new patients
        lastVisit: isEdit && originalRef.current ? originalRef.current.lastVisit : new Date().toISOString().split('T')[0],
        status: (formData.status as Patient['status']) || 'in_treatment',
        createdAt: isEdit && originalRef.current ? originalRef.current.createdAt : new Date().toISOString().split('T')[0],
      };

      if (isEdit) {
        await updatePatient(patientData);
        addNotification('Paciente Actualizado', `Los datos de ${patientData.name} han sido actualizados.`, 'success');
      } else {
        await savePatient(patientData);
        addNotification('Paciente Creado', `El paciente ${patientData.name} ha sido registrado exitosamente.`, 'success');
      }

      onSaved?.();

      if (isModalMode) {
        onClose!();
      } else {
        navigate(isEdit ? `/patients/${id}` : '/patients');
      }
    } catch (err) {
      console.error('Error al guardar paciente:', err);
      setError('Ocurrió un error al guardar. Por favor intente de nuevo.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isModalMode) onClose!();
    else navigate(-1);
  };

  return (
    <div className={isModalMode ? '' : 'animate-fade-in'} style={isModalMode ? {} : { maxWidth: '800px', margin: '0 auto' }}>
      {/* Page-mode header (hidden in modal since SlidePanel provides the header) */}
      {!isModalMode && (
        <header className="page-header">
          <button
            className="btn btn-ghost"
            onClick={handleCancel}
            style={{ marginBottom: '1rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={18} /> {t('common.cancel')}
          </button>
          <h1 className="page-title">{isEdit ? t('patients.editTitle') : t('patients.createTitle')}</h1>
          <p className="page-description">{isEdit ? t('patients.editDescription') : t('patients.createDescription')}</p>
        </header>
      )}

      <div className={isModalMode ? '' : 'glass-panel'} style={isModalMode ? {} : { padding: '2.5rem', borderRadius: '24px' }}>
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
              rows={4}
              placeholder={t('patients.notesPlaceholder')}
              value={formData.notes}
              onChange={handleChange}
              style={{ resize: 'vertical', borderRadius: '16px', padding: '1rem' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
              <MapPin size={18} color="var(--color-primary)" /> Ubicación (Google Maps)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="location"
                type="text"
                className="input-field"
                placeholder="Pega aquí el link de Google Maps o escribe la dirección"
                value={formData.location || ''}
                onChange={handleChange}
                style={{ borderRadius: '12px', paddingRight: formData.location ? '3rem' : '1rem' }}
              />
              {formData.location && sanitizeGoogleMapsUrl(formData.location) && (
                <a
                  href={sanitizeGoogleMapsUrl(formData.location) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver en Google Maps"
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-primary)', display: 'flex', alignItems: 'center'
                  }}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
              Ejemplo: copia el enlace desde Google Maps → Compartir → Copiar enlace
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', flexDirection: 'column', alignItems: 'flex-end' }}>
            {error && (
              <p style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={handleCancel} style={{ borderRadius: '12px', padding: '0.75rem 1.5rem' }}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ borderRadius: '12px', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)', opacity: saving ? 0.7 : 1 }}>
                <Save size={18} /> {saving ? 'Guardando...' : (isEdit ? t('patients.updateBtn') : t('patients.submitBtn'))}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
