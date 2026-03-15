import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight } from 'lucide-react';
import { mockPatients } from '../../data/mockData';

export const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">Patients CRM</h1>
          <p className="page-description">Manage your patient roster and access clinical records.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          New Patient
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div className="header-search" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
             <Search size={18} color="var(--color-text-muted)" />
             <input 
               type="text" 
               placeholder="Search by name or ID..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="btn btn-outline">
             <Filter size={18} /> Filters
           </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Contact</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Last Visit</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr 
                  key={patient.id} 
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color var(--transition-fast)' }}
                  className="hover-row"
                >
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{patient.id}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{patient.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <div>{patient.phone}</div>
                    <div>{patient.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{patient.lastVisit}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${patient.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      style={{ padding: '0.5rem' }}
                      aria-label="View Patient"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No patients found matching your search.
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
