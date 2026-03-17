import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { getPatients } from '../../services/dataService';
import type { Patient } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';

type SortField = 'id' | 'name' | 'phone' | 'lastVisit' | 'status';
type SortDirection = 'asc' | 'desc';

const SortIcon = ({ field, currentField, direction }: { field: SortField, currentField: SortField, direction: 'asc' | 'desc' }) => {
  if (currentField !== field) return null;
  return direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
};

export const PatientsList: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredPatients = patients
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
                    ID <SortIcon field="id" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t('patients.table.name')} <SortIcon field="name" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('phone')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t('patients.table.phone')} <SortIcon field="phone" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('lastVisit')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t('patients.table.lastVisit')} <SortIcon field="lastVisit" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {t('patients.table.status')} <SortIcon field="status" currentField={sortField} direction={sortDirection} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--color-primary)' }}>
                      <Loader2 size={32} className="animate-spin" />
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Cargando pacientes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    style={{ 
                      borderBottom: '1px solid var(--color-border)', 
                      transition: 'background-color var(--transition-fast)',
                      cursor: 'pointer'
                    }}
                    className="hover-row hover-bg"
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{patient.id}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {patient.name.split(' ').map((n: string) => n[0]).join('')}
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
                      {(() => {
                        let badgeClass = 'badge-muted';
                        let label = patient.status;
                        
                        switch(patient.status) {
                          case 'in_treatment':
                            badgeClass = 'badge-primary';
                            label = 'En Tratamiento';
                            break;
                          case 'medical_discharge':
                            badgeClass = 'badge-success';
                            label = 'Alta Médica';
                            break;
                          case 'maintenance':
                            badgeClass = 'badge-info';
                            label = 'Mantenimiento';
                            break;
                          case 'pending_control':
                            badgeClass = 'badge-warning';
                            label = 'Control Pendiente';
                            break;
                        }
                        
                        return (
                          <span className={`badge ${badgeClass}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))
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

