import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Activity, 
  User, 
  PlusCircle,
  Loader2 
} from 'lucide-react';
import { getPatients, getConsultations } from '../../services/dataService';
import type { Patient, Consultation } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import { ConsultationDetailModal } from '../../components/consultation/ConsultationDetailModal';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewingConsultation, setViewingConsultation] = React.useState<Consultation | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const allPatients = await getPatients();
      const allConsultations = await getConsultations();
      
      const foundPatient = allPatients.find((p: Patient) => p.id === id);
      const patientConsultations = allConsultations.filter((c: Consultation) => c.patientId === id);
      
      setPatient(foundPatient || null);
      setConsultations(patientConsultations);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando expediente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-center animate-fade-in" style={{ height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <h2>{t('patients.notFound')}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/patients')}>{t('patients.backToCRM')}</button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_treatment': return 'badge-primary';
      case 'medical_discharge': return 'badge-success';
      case 'maintenance': return 'badge-info';
      case 'pending_control': return 'badge-warning';
      default: return 'badge-outline';
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate('/patients')} 
          style={{ marginBottom: '1rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={18} /> {t('patients.backToPatients')}
        </button>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700 }}>
                {patient.name.split(' ').map(n => n[0]).join('')}
             </div>
             <div>
               <h1 className="page-title" style={{ fontSize: '2.3rem', fontWeight: 800 }}>{patient.name}</h1>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                 <span style={{ fontWeight: 600 }}>{t('patients.id')}: <span style={{ color: 'var(--color-text-main)' }}>{patient.id}</span></span>
                 <span>•</span>
                 <span style={{ fontWeight: 600 }}>{t('patients.age')}: <span style={{ color: 'var(--color-text-main)' }}>{patient.age}</span></span>
                 <span>•</span>
                 <span className={`badge ${getStatusBadge(patient.status)}`} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                    {t(`consultation.statuses.${patient.status}`)}
                 </span>
               </div>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ borderRadius: '12px' }} onClick={() => navigate(`/patients/${id}/edit`)}>
              <Edit size={18} /> {t('patients.editProfile')}
            </button>
            <button className="btn btn-primary" style={{ borderRadius: '12px', boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)' }} onClick={() => navigate('/consultations/new')}>
              <PlusCircle size={18} /> {t('patients.newConsultation')}
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <User size={20} /> {t('patients.contactInfo')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('patients.phone')}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{patient.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{t('patients.email')}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{patient.email}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-primary)' }}>
              <Activity size={20} /> {t('patients.medicalSummary')}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, fontStyle: 'italic', backgroundColor: 'var(--color-background)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--color-primary)' }}>
              "Paciente con buena evolución. Se mantiene en control preventivo regular. Sin alergias reportadas."
            </p>
          </div>
        </div>

        {/* Clinical History */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '1rem' }}>
            <FileText size={22} color="var(--color-primary)" /> {t('patients.consultationHistory')}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {consultations.length > 0 ? consultations.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: '16px', padding: '1.5rem', transition: 'all 0.2s', background: 'var(--color-surface)' }} className="hover-lift">
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="badge badge-primary" style={{ fontWeight: 600 }}>{c.type}</div>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '1.1rem' }}>{c.date}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', padding: '4px 10px', borderRadius: '8px' }}>{c.doctor}</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {c.summary}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setViewingConsultation({ ...c, patientName: patient.name })}
                      >
                    {t('patients.viewDetails')}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontWeight: 600 }}
                    onClick={() => window.open(`/print/consultation/${c.id}`, '_blank')}
                  >
                    {t('patients.printReport')}
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                {t('patients.noConsultations')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {viewingConsultation && (
        <ConsultationDetailModal 
          consultation={viewingConsultation} 
          onClose={() => setViewingConsultation(null)} 
        />
      )}
    </div>
  );
};
