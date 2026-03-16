import React, { useState } from 'react';
import { Search, Filter, FileText, Download, Eye, X } from 'lucide-react';
import { mockConsultations, mockPatients } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';

export const ConsultationHistory: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Enrich consultations with patient names
  const enrichedConsultations = mockConsultations.map(c => ({
    ...c,
    patientName: mockPatients.find(p => p.id === c.patientId)?.name || 'Unknown Patient'
  })).filter(c => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.summary && c.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = 
      (!startDate || c.date >= startDate) &&
      (!endDate || c.date <= endDate);

    return matchesSearch && matchesDate;
  });

  const [viewingRecord, setViewingRecord] = useState<typeof enrichedConsultations[0] | null>(null);

  const handleExport = () => {
    alert('Exporting records to CSV... (Mock active)');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', height: '100%', boxSizing: 'border-box' }}>
      <header className="page-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">{t('history.title') || 'Consultation History'}</h1>
          <p className="page-description">{t('history.description') || 'Review past medical records and visit summaries.'}</p>
        </div>
        <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} /> {t('history.export') || 'Export Records'}
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
           <div className="header-search" style={{ margin: 0, flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center' }}>
             <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '2rem' }} />
             <input 
               type="text" 
               placeholder={t('history.searchPlaceholder') || 'Search by patient, doctor, or type...'} 
               className="search-input"
               style={{ width: '100%', paddingLeft: '2.5rem', borderRadius: '12px', background: 'var(--color-background)' }}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Filter size={18} color="var(--color-text-muted)" />
             <input 
               type="date" 
               value={startDate} 
               onChange={e => setStartDate(e.target.value)} 
               style={{ borderRadius: '10px', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-main)' }} 
             />
             <span style={{ color: 'var(--color-text-muted)' }}>—</span>
             <input 
               type="date" 
               value={endDate} 
               onChange={e => setEndDate(e.target.value)} 
               style={{ borderRadius: '10px', padding: '0.5rem', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-main)' }} 
             />
             {(startDate || endDate) && (
               <button className="icon-btn" onClick={() => { setStartDate(''); setEndDate(''); }} style={{ padding: '0.25rem' }}>
                 <X size={16} />
               </button>
             )}
           </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.date') || 'Date'}</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.patient') || 'Patient'}</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.doctor') || 'Doctor'}</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.type') || 'Type'}</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.summary') || 'Summary'}</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>{t('history.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {enrichedConsultations.map(consult => (
                <tr 
                  key={consult.id} 
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }}
                  className="hover-row"
                >
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{consult.date}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{consult.patientName}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{consult.doctor}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-success">{consult.type}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {consult.summary}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button className="icon-btn" onClick={() => setViewingRecord(consult)} style={{ width: '36px', height: '36px', borderRadius: '8px' }} title="View Details">
                        <Eye size={17} />
                      </button>
                      <button className="icon-btn" onClick={() => alert('View Document not configured')} style={{ width: '36px', height: '36px', borderRadius: '8px' }} title="View Document">
                        <FileText size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrichedConsultations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                     {t('history.noRecords') || 'No consultations found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View details */}
      {viewingRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button onClick={() => setViewingRecord(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 0.2s' }}>
              <X size={18} />
            </button>
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 0.5rem 0' }}>{t('history.actions') || 'Detalles de Consulta'}</h2>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Ficha médica correspondiente a la visita del {viewingRecord.date}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1.25rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div><strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('history.patient') || 'Paciente'}:</strong> <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{viewingRecord.patientName}</div></div>
              <div><strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('history.doctor') || 'Médico'}:</strong> <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{viewingRecord.doctor}</div></div>
              <div><strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t('history.type') || 'Tipo'}:</strong> <div style={{ marginTop: '0.2rem' }}><span className="badge badge-success">{viewingRecord.type}</span></div></div>
              <div><strong style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Costo:</strong> <div style={{ fontWeight: 600, marginTop: '0.2rem', color: 'var(--color-primary)' }}>{viewingRecord.cost ? `${viewingRecord.cost.toLocaleString('es-PY')} Gs` : 'N/A'}</div></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
                  <div style={{ width: '4px', height: '16px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
                  {t('consultation.symptoms') || 'Síntomas'}
                </h4>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {viewingRecord.symptoms || 'No registrado'}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
                  <div style={{ width: '4px', height: '16px', borderRadius: '4px', background: 'var(--color-primary)' }}></div>
                  {t('consultation.treatment') || 'Tratamiento'}
                </h4>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {viewingRecord.treatment || 'No registrado'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.recommendations') || 'Recomendaciones'}</h4>
                  <div style={{ padding: '0.75rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.9rem' }}>
                    {viewingRecord.recommendations || 'Ninguna'}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.recoveryTime') || 'Tiempo de Recuperación'}</h4>
                  <div style={{ padding: '0.75rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.9rem' }}>
                    {viewingRecord.recoveryTime || 'Inmediato'}
                  </div>
                </div>
              </div>

              {viewingRecord.notes && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.notes') || 'Notas Clínicas'}</h4>
                  <div style={{ padding: '0.75rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '10px', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '3px solid var(--color-primary)' }}>
                    {viewingRecord.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover {
          background-color: var(--color-background) !important;
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
};
