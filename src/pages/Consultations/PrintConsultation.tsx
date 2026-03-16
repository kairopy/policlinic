import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockConsultations, mockPatients } from '../../data/mockData';
import { FileText, ArrowLeft } from 'lucide-react';

export const PrintConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const consultRaw = mockConsultations.find(c => String(c.id) === id);
  const patient = consultRaw ? mockPatients.find(p => String(p.id) === consultRaw.patientId) : null;
  
  const consult = consultRaw ? {
    ...consultRaw,
    patientName: patient ? patient.name : 'Desconocido'
  } : null;

  useEffect(() => {
    if (consult) {
      // Trigger print automatically after a short delay for rendering
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [consult]);

  if (!consult) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Documento no encontrado</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ borderRadius: '10px' }}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', overflowY: 'auto' }}>
      
      {/* Top Banner with Print Controls (Hidden on print) */}
      <div className="no-print" style={{ width: '100%', maxWidth: '210mm', background: 'white', padding: '1rem 2rem', marginBottom: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => window.close()} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '10px', background: 'white', color: '#333', border: '1px solid #ccc' }}>
          <ArrowLeft size={18} /> Cerrar Pestaña
        </button>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}>
          <FileText size={18} /> Imprimir Documento
        </button>
      </div>

      {/* A4 Printable Sheet */}
      <div style={{ background: 'white', width: '210mm', height: 'auto', minHeight: '297mm', padding: '3.5rem', color: 'black', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', borderRadius: '4px' }} className="print-safe">
        
        {/* Document Header */}
        <div style={{ borderBottom: '3px solid #0066cc', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#0066cc' }}>LIC KARINA PODOLOGÍA</h1>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#4b5563' }}>Prescripción médica y resumen de visita</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#1f2937' }}>
            <div style={{ fontWeight: 700 }}>Fecha: {consult.date}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' }}>ID: {consult.id}</div>
          </div>
        </div>

        {/* Patient Header Section */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>PACIENTE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: '#1e293b' }}>{consult.patientName}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>MÉDICO TRATANTE</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: '#1e293b' }}>{consult.doctor}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TIPO DE CONSULTA</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>{consult.type}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>COSTO</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: '#0066cc' }}>{consult.cost ? `${consult.cost.toLocaleString('es-PY')} Gs` : 'N/A'}</div>
          </div>
        </div>

        {/* Document Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#1e293b' }}>SÍNTOMAS Y MOTIVO</h3>
            <div style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>
               {consult.symptoms || 'No registrado'}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#1e293b' }}>TRATAMIENTO APLICADO / PRESCRIPCIÓN</h3>
            <div style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>
               {consult.treatment || 'No registrado'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>RECOMENDACIONES</h3>
              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                 {consult.recommendations || 'Ninguna'}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>TIEMPO DE RECUPERACIÓN</h3>
              <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                 {consult.recoveryTime || 'Inmediato'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Signature */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem', marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Documento generado por software médico Lic Karina Podología.
           </div>
           <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #333', marginBottom: '0.5rem', height: '40px' }}></div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Firma del Médico</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{consult.doctor}</div>
           </div>
        </div>

      </div>

      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .print-safe { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .print-safe, .print-safe * { visibility: visible !important; }
          .print-safe { position: absolute !important; left: 0 !important; top: 0 !important; }
        }
      `}</style>
    </div>
  );
};
