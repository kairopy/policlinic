import React, { useState } from 'react';
import { Search, FileText, Download, Eye, X } from 'lucide-react';
import { mockConsultations, mockPatients } from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import { DateRangePicker } from '../../components/ui/DateRangePicker';

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
  const [printingRecord, setPrintingRecord] = useState<typeof enrichedConsultations[0] | null>(null);

  const handleExport = () => {
    const headers = ['ID', 'Paciente', 'Fecha', 'Doctor', 'Tipo', 'Costo (Gs)', 'Síntomas', 'Tratamiento'];
    
    const rows = enrichedConsultations.map(c => [
      c.id,
      `"${c.patientName}"`,
      c.date,
      `"${c.doctor}"`,
      `"${c.type}"`,
      c.cost,
      `"${(c.symptoms || '').replace(/"/g, '""')}"`,
      `"${(c.treatment || '').replace(/"/g, '""')}"`
    ]);
    
    // Add UTF-8 BOM for Excel to read accents correctly, use Semicolon as separator for Spanish Excel
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historial_consultas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history-page-container" className="animate-fade-in" style={{ position: 'relative', padding: '1.5rem', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
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
             <DateRangePicker 
               startDate={startDate} 
               endDate={endDate} 
               onRangeChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
             />
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
                      <button className="icon-btn" onClick={() => { setViewingRecord(consult); document.getElementById('history-page-container')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ width: '36px', height: '36px', borderRadius: '8px' }} title="View Details">
                        <Eye size={17} />
                      </button>
                      <button className="icon-btn" onClick={() => window.open(`/print/consultation/${consult.id}`, '_blank')} style={{ width: '36px', height: '36px', borderRadius: '8px' }} title={t('history.export_doc') || 'Exportar Documento'}>
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
      </div>      {/* Absolute Inner-Page View details */}
      {viewingRecord && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', zIndex: 50, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'slide-up 0.2s ease-out' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '650px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => setViewingRecord(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 0.2s' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.recommendations') || 'Recomendaciones'}</h4>
                  <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem' }}>
                    {viewingRecord.recommendations || 'Ninguna'}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.recoveryTime') || 'Tiempo de Recuperación'}</h4>
                  <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem' }}>
                    {viewingRecord.recoveryTime || 'Inmediato'}
                  </div>
                </div>
              </div>

              {viewingRecord.notes && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{t('consultation.notes') || 'Notas Clínicas'}</h4>
                  <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '0.95rem', fontStyle: 'italic', borderLeft: '3px solid var(--color-primary)' }}>
                    {viewingRecord.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Document Modal */}
      {printingRecord && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ background: 'white', width: '210mm', height: 'auto', minHeight: '297mm', padding: '3rem', position: 'relative', color: 'black', fontFamily: 'Inter, sans-serif', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', borderRadius: '12px' }} className="print-safe">
            
            <div className="no-print" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => window.print()} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '10px' }}
              >
                <FileText size={18} /> Imprimir
              </button>
              <button 
                onClick={() => setPrintingRecord(null)} 
                className="btn btn-outline"
                style={{ cursor: 'pointer', borderRadius: '10px', padding: '0.6rem 1rem', background: 'white', color: '#333', border: '1px solid #ccc' }}
              >
                Cerrar
              </button>
            </div>

            {/* Document Header */}
            <div style={{ borderBottom: '3px solid var(--color-primary)', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>LIC KARINA PODOLOGÍA</h1>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#555' }}>Prescripción médica y resumen de visita</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#333' }}>
                <div style={{ fontWeight: 700 }}>Fecha: {printingRecord.date}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.2rem' }}>ID: {printingRecord.id}</div>
              </div>
            </div>

            {/* Patient Header Section */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>PACIENTE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: '#1e293b' }}>{printingRecord.patientName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>MÉDICO TRATANTE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: '#1e293b' }}>{printingRecord.doctor}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TIPO DE CONSULTA</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>{printingRecord.type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>COSTO</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem', color: 'var(--color-primary)' }}>{printingRecord.cost ? `${printingRecord.cost.toLocaleString('es-PY')} Gs` : 'N/A'}</div>
              </div>
            </div>

            {/* Document Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#1e293b' }}>SÍNTOMAS Y MOTIVO</h3>
                <div style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>
                   {printingRecord.symptoms || 'No registrado'}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#1e293b' }}>TRATAMIENTO APLICADO / PRESCRIPCIÓN</h3>
                <div style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6' }}>
                   {printingRecord.treatment || 'No registrado'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>RECOMENDACIONES</h3>
                  <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                     {printingRecord.recommendations || 'Ninguna'}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#1e293b' }}>TIEMPO DE RECUPERACIÓN</h3>
                  <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                     {printingRecord.recoveryTime || 'Inmediato'}
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
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{printingRecord.doctor}</div>
               </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .hover-row:hover {
          background-color: var(--color-background) !important;
          opacity: 0.95;
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-safe, .print-safe * { visibility: visible !important; }
          .print-safe { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; max-height: none !important; margin: 0 !important; box-shadow: none !important; border: none !important; z-index: 1000 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
