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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setViewingRecord(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-primary)' }}>{t('history.actions') || 'Detalles de Consulta'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><strong>{t('history.patient') || 'Patient'}:</strong> {viewingRecord.patientName}</div>
              <div><strong>{t('history.date') || 'Date'}:</strong> {viewingRecord.date}</div>
              <div><strong>{t('history.doctor') || 'Doctor'}:</strong> {viewingRecord.doctor}</div>
              <div><strong>{t('history.type') || 'Type'}:</strong> {viewingRecord.type}</div>
              <div><strong>{t('history.summary') || 'Summary'}:</strong> {viewingRecord.summary}</div>
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
