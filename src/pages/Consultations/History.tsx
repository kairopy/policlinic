import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { getConsultations, getPatients } from '../../services/dataService';
import type { Consultation, Patient } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { ConsultationDetailModal } from '../../components/consultation/ConsultationDetailModal';

type SortField = 'date' | 'patientName' | 'doctor' | 'type';

const SortIcon = ({ field, currentField, direction }: { field: SortField, currentField: SortField, direction: 'asc' | 'desc' }) => {
  if (currentField !== field) return null;
  return direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
};

export const ConsultationHistory: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewingRecord, setViewingRecord] = useState<Consultation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [consultData, patientData] = await Promise.all([
        getConsultations(),
        getPatients()
      ]);
      setConsultations(consultData);
      setPatients(patientData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const enrichedConsultations = useMemo(() => {
    return consultations.map(c => ({
      ...c,
      patientName: patients.find(p => p.id === c.patientId)?.name || 'Paciente Desconocido'
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
    }).sort((a, b) => {
      const aValue = (a[sortField] || '').toString();
      const bValue = (b[sortField] || '').toString();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [consultations, patients, searchTerm, startDate, endDate, sortField, sortDirection]);

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
    <div id="history-page-container" className="animate-fade-in" style={{ position: 'relative', padding: '1.5rem', height: '100%', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">{t('history.title')}</h1>
          <p className="page-description">{t('history.description')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> {t('history.export')}
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/consultations/new')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Nueva Consulta
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'var(--color-surface)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
           <div className="header-search" style={{ margin: 0, flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center' }}>
             <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '2rem' }} />
             <input 
               type="text" 
               placeholder={t('history.searchPlaceholder')} 
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
          {loading ? (
             <div className="flex-center" style={{ padding: '5rem' }}>
               <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
             </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th onClick={() => handleSort('date')} style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t('history.date')} <SortIcon field="date" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('patientName')} style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t('history.patient')} <SortIcon field="patientName" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('doctor')} style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t('history.doctor')} <SortIcon field="doctor" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th onClick={() => handleSort('type')} style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {t('history.type')} <SortIcon field="type" currentField={sortField} direction={sortDirection} />
                    </div>
                  </th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t('history.summary')}</th>
                </tr>
              </thead>
              <tbody>
                {enrichedConsultations.map(consult => (
                  <tr key={consult.id} onClick={() => setViewingRecord(consult)} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} className="hover-row">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{consult.date}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{consult.patientName}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{consult.doctor}</td>
                    <td style={{ padding: '1rem 1.5rem' }}><span className="badge badge-success">{consult.type}</span></td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{consult.summary}</td>
                  </tr>
                ))}
                {enrichedConsultations.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('history.noRecords')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {viewingRecord && (
        <ConsultationDetailModal consultation={viewingRecord} onClose={() => setViewingRecord(null)} />
      )}

      <style>{`
        .hover-row:hover { background-color: var(--color-background) !important; opacity: 0.95; }
        .hover-row { transition: background-color 0.2s; }
      `}</style>
    </div>
  );
};
