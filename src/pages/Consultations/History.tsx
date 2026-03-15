import React, { useState } from 'react';
import { Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { mockConsultations, mockPatients } from '../../data/mockData';

export const ConsultationHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Enrich consultations with patient names
  const enrichedConsultations = mockConsultations.map(c => ({
    ...c,
    patientName: mockPatients.find(p => p.id === c.patientId)?.name || 'Unknown Patient'
  })).filter(c => 
    c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.doctor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">Consultation History</h1>
          <p className="page-description">Review past medical records and visit summaries.</p>
        </div>
        <button className="btn btn-outline">
          <Download size={18} /> Export Records
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div className="header-search" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
             <Search size={18} color="var(--color-text-muted)" />
             <input 
               type="text" 
               placeholder="Search by patient, doctor, or type..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="btn btn-outline">
             <Filter size={18} /> Date Range
           </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Patient</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Doctor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Summary Fragment</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrichedConsultations.map(consult => (
                <tr 
                  key={consult.id} 
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color var(--transition-fast)' }}
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
                      <button className="icon-btn" style={{ width: '32px', height: '32px' }} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button className="icon-btn" style={{ width: '32px', height: '32px' }} title="View Document">
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrichedConsultations.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                     No consultations found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .hover-row:hover {
          background-color: var(--color-primary-light);
        }
      `}</style>
    </div>
  );
};
