import React from 'react';
import ReactDOM from 'react-dom';
import { X, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Podograma } from './Podograma';
import type { Consultation } from '../../services/dataService';

interface ConsultationDetailModalProps {
  consultation: Consultation | null;
  onClose: () => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({ consultation, onClose }) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    if (consultation) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [consultation]);

  if (!consultation) return null;

  return ReactDOM.createPortal(
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'rgba(10, 15, 30, 0.4)', 
      backdropFilter: 'blur(12px)', 
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 10000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      animation: 'fadeIn 0.3s ease-out' 
    }}>
      <div 
        className="glass-panel premium-scrollbar" 
        style={{ 
          width: '100%', 
          maxWidth: '750px', 
          padding: '2.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2rem', 
          maxHeight: 'calc(100vh - 80px)', 
          overflowY: 'auto', 
          position: 'relative', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          borderRadius: '28px',
          background: 'var(--color-surface)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem', zIndex: 10 }}>
          <button 
            onClick={() => window.open(`/print/consultation/${consultation.id}`, '_blank')} 
            style={{ 
              background: 'var(--color-background)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '50%', 
              width: '38px', 
              height: '38px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              color: 'var(--color-primary)', 
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }} 
            className="hover-lift"
            title={t('patients.printReport') || 'Imprimir'}
          >
            <Printer size={18} />
          </button>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'var(--color-background)', 
              border: '1px solid var(--color-border)', 
              borderRadius: '50%', 
              width: '38px', 
              height: '38px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer', 
              color: 'var(--color-text-muted)', 
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }} 
            className="hover-lift"
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ paddingRight: '4rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            {t('consultation.detailsTitle') || 'Detalles de la Consulta'}
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Ficha médica correspondiente a la visita del {consultation.date}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem', 
          padding: '1.75rem', 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.05)' 
        }}>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>
              {t('history.patient') || 'PACIENTE'}:
            </strong> 
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-main)' }}>{consultation.patientName || consultation.patientId}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>
              {t('history.doctor') || 'MÉDICO'}:
            </strong> 
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-main)' }}>{consultation.doctor}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>
              {t('history.type') || 'TIPO'}:
            </strong> 
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-text-main)' }}>{consultation.type}</div>
          </div>
          <div>
            <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.4rem' }}>
              COSTO:
            </strong> 
            <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.25rem' }}>
              {consultation.cost ? `${consultation.cost.toLocaleString('es-PY')} Gs` : 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-main)' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
              {t('consultation.symptoms') || 'Síntomas y Motivo de Consulta'}
            </h4>
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '16px', color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              {consultation.symptoms || 'No registrado'}
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-main)' }}>
              <div style={{ width: '4px', height: '20px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
              {t('consultation.treatment') || 'Tratamiento Aplicado'}
            </h4>
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '16px', color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              {consultation.treatment || 'No registrado'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {t('consultation.recommendations') || 'Recomendaciones y Cuidado'}
              </h4>
              <div style={{ padding: '1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '16px', fontSize: '1rem', lineHeight: '1.6' }}>
                {consultation.recommendations || 'Ninguna'}
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {t('consultation.recoveryTime') || 'Tiempo de Recuperación Estimado'}
              </h4>
              <div style={{ padding: '1.25rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '16px', fontSize: '1rem', lineHeight: '1.6' }}>
                {consultation.recoveryTime || 'Inmediato'}
              </div>
            </div>
          </div>

          {consultation.notes && (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {t('consultation.notes') || 'Notas Clínicas (Privadas)'}
              </h4>
              <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '20px', fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-text-main)', borderLeft: '5px solid var(--color-primary)' }}>
                {consultation.notes}
              </div>
            </div>
          )}
          
          {consultation.podograma_data && (
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {t('consultation.podogramTitle') || 'Mapa Podológico (Podograma)'}
              </h4>
              <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '20px' }}>
                <Podograma data={consultation.podograma_data} readOnly />
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .premium-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .premium-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
    </div>,
    document.body
  );
};
