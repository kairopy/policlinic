import React from 'react';
import { X, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Consultation } from '../../services/dataService';

interface ConsultationDetailModalProps {
  consultation: Consultation | null;
  onClose: () => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ consultation, onClose }) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!consultation) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <div className="glass-panel premium-scrollbar" style={{ width: '90%', maxWidth: '700px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--color-border)', borderRadius: '24px' }}>
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => window.open(`/print/consultation/${consultation.id}`, '_blank')} 
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-primary)', transition: 'all 0.2s' }} 
            className="hover-lift"
            title={t('patients.printReport')}
          >
            <Printer size={18} />
          </button>
          <button 
            onClick={onClose} 
            style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 0.2s' }} 
            className="hover-lift"
          >
            <X size={20} />
          </button>
        </div>
        
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{t('consultation.detailsTitle') || 'Detalles de Consulta'}</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Ficha médica correspondiente a la visita del {consultation.date}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', padding: '1.5rem', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('history.patient')}:</strong> 
            <div style={{ fontWeight: 700, marginTop: '0.3rem', fontSize: '1.1rem' }}>{consultation.patientName || consultation.patientId}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('history.doctor')}:</strong> 
            <div style={{ fontWeight: 700, marginTop: '0.3rem', fontSize: '1.1rem' }}>{consultation.doctor}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('history.type')}:</strong> 
            <div style={{ fontWeight: 700, marginTop: '0.3rem', fontSize: '1.1rem' }}>{consultation.type}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Costo:</strong> 
            <div style={{ fontWeight: 800, marginTop: '0.3rem', color: 'var(--color-primary)', fontSize: '1.1rem' }}>{consultation.cost ? `${consultation.cost.toLocaleString('es-PY')} Gs` : 'N/A'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-text-main)' }}>
              <div style={{ width: '4px', height: '18px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
              {t('consultation.symptoms')}
            </h4>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '1rem', lineHeight: '1.6' }}>
              {consultation.symptoms || 'No registrado'}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-text-main)' }}>
              <div style={{ width: '4px', height: '18px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
              {t('consultation.treatment')}
            </h4>
            <div style={{ padding: '1rem 1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-main)', fontSize: '1rem', lineHeight: '1.6' }}>
              {consultation.treatment || 'No registrado'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{t('consultation.recommendations')}</h4>
              <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {consultation.recommendations || 'Ninguna'}
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{t('consultation.recoveryTime')}</h4>
              <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {consultation.recoveryTime || 'Inmediato'}
              </div>
            </div>
          </div>

          {consultation.notes && (
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{t('consultation.notes')}</h4>
              <div style={{ padding: '1.25rem', background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-light)', borderRadius: '16px', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--color-primary-dark)', borderLeft: '4px solid var(--color-primary)' }}>
                {consultation.notes}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .premium-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }
        /* Firefox */
        .premium-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
      `}</style>
    </div>
  );
};
