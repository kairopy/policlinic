import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { mockPatients } from '../../data/mockData';

type SortField = 'id' | 'name' | 'phone' | 'lastVisit' | 'status';
type SortDirection = 'asc' | 'desc';

export const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPatients = mockPatients
    .filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-description">Administra tu lista de pacientes y accede a sus expedientes clínicos.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>
          <Plus size={18} />
          Nuevo Paciente
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div className="header-search" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
             <Search size={18} color="var(--color-text-muted)" />
             <input 
               type="text" 
               placeholder="Buscar por nombre o ID..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <button className="btn btn-outline">
             <Filter size={18} /> Filtros
           </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                <th 
                  onClick={() => handleSort('id')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    ID <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Nombre <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('phone')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Contacto <SortIcon field="phone" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('lastVisit')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Última Visita <SortIcon field="lastVisit" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    Estado <SortIcon field="status" />
                  </div>
                </th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr 
                  key={patient.id} 
                  style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color var(--transition-fast)' }}
                  className="hover-row hover-bg"
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
                      {patient.status === 'Active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      style={{ padding: '0.5rem' }}
                      aria-label="Ver Paciente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No se encontraron pacientes que coincidan con la búsqueda.
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

