import React, { useState, useMemo } from 'react';
import type { Patient, Appointment, Consultation } from '../../services/dataService';
import { usePatients } from '../../hooks/queries/usePatients';
import { useConsultations } from '../../hooks/queries/useConsultations';
import { useAppointments } from '../../hooks/queries/useAppointments';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Calendar as CalendarIcon, DollarSign, Activity, Users, Loader2, RefreshCw } from 'lucide-react';
import { format, subDays, startOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type Timeframe = 'thisMonth' | 'last30Days' | 'lastYear' | 'allTime';

export const AnalyticsPage: React.FC = () => {
  const { data: patients = [], isLoading: loadingP, refetch: refetchP, isFetching: fetchP } = usePatients();
  const { data: consultations = [], isLoading: loadingC, refetch: refetchC, isFetching: fetchC } = useConsultations();
  const { data: appointments = [], isLoading: loadingA, refetch: refetchA, isFetching: fetchA } = useAppointments();
  
  const loading = loadingP || loadingC || loadingA;
  const isSyncing = fetchP || fetchC || fetchA;
  
  const [timeframe, setTimeframe] = useState<Timeframe>('last30Days');
  const [activeTab, setActiveTab] = useState<'general' | 'financial' | 'clinical' | 'operational'>('general');

  const fetchData = async () => {
    refetchP();
    refetchC();
    refetchA();
  };

  const dateInterval = useMemo(() => {
    const today = new Date();
    switch (timeframe) {
      case 'thisMonth':
        return { start: startOfMonth(today), end: today };
      case 'last30Days':
        return { start: subDays(today, 30), end: today };
      case 'lastYear':
        return { start: subDays(today, 365), end: today };
      case 'allTime':
        return { start: new Date(2000, 0, 1), end: today };
      default:
        return { start: subDays(today, 30), end: today };
    }
  }, [timeframe]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter(c => {
      try {
        const d = parseISO(c.date);
        return isWithinInterval(d, dateInterval);
      } catch { return false; }
    });
  }, [consultations, dateInterval]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      try {
        const d = new Date(a.date);
        return isWithinInterval(d, dateInterval);
      } catch { return false; }
    });
  }, [appointments, dateInterval]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (!p.createdAt) return false;
      try {
        const d = new Date(p.createdAt);
        return isWithinInterval(d, dateInterval);
      } catch { return false; }
    });
  }, [patients, dateInterval]);

  // KPIs
  const totalRevenue = useMemo(() => filteredConsultations.reduce((acc, c) => acc + (Number(c.cost) || 0), 0), [filteredConsultations]);
  const avgTicket = filteredConsultations.length > 0 ? totalRevenue / filteredConsultations.length : 0;
  
  const maxTicket = useMemo(() => {
    return filteredConsultations.reduce((max, c) => Math.max(max, Number(c.cost) || 0), 0);
  }, [filteredConsultations]);

  const altaMedicaCount = useMemo(() => {
    return filteredPatients.filter(p => p.status === 'Alta Médica').length;
  }, [filteredPatients]);

  const confirmedAppointments = useMemo(() => {
    return filteredAppointments.filter(a => a.status === 'Confirmada' || a.status === 'Atendida').length;
  }, [filteredAppointments]);

  const canceledAppointments = useMemo(() => {
    return filteredAppointments.filter(a => a.status === 'Cancelada' || a.status === 'No Asistió').length;
  }, [filteredAppointments]);
  
  // Charts Data
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredConsultations.forEach(c => {
      const day = format(parseISO(c.date), 'dd MMM', { locale: es });
      map.set(day, (map.get(day) || 0) + (Number(c.cost) || 0));
    });
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
  }, [filteredConsultations]);

  const treatmentsData = useMemo(() => {
    const map = new Map<string, number>();
    filteredConsultations.forEach(c => {
      // Assuming c.summary has the treatment kind or diagnosis
      const t = c.summary || 'General';
      map.set(t, (map.get(t) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredConsultations]);

  const appointmentStatusData = useMemo(() => {
    const map = new Map<string, number>();
    filteredAppointments.forEach(a => {
      const s = a.status || 'Pendiente';
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredAppointments]);

  const templateUsageData = useMemo(() => {
    const map = new Map<string, number>();
    filteredConsultations.forEach(c => {
      let type = c.type && c.type.trim() !== '' ? c.type : 'Personalizada';
      if (type.toLowerCase() === 'regular' || type.toLowerCase() === 'general') {
        type = 'Personalizada';
      }
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredConsultations]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={48} className="animate-spin" color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)' }}>Procesando grandes volúmenes de datos...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Analíticas Avanzadas</h1>
          <p className="page-description">Centro de inteligencia y métricas en tiempo real</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Sincronizar
          </button>
          
          <div style={{ display: 'flex', background: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {(
              [
                { id: 'thisMonth', label: 'Mes' },
                { id: 'last30Days', label: '30 Días' },
                { id: 'lastYear', label: '1 Año' },
                { id: 'allTime', label: 'Total' }
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                style={{
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: timeframe === opt.id ? 600 : 500,
                  color: timeframe === opt.id ? 'white' : 'var(--color-text-muted)',
                  background: timeframe === opt.id ? 'var(--color-primary)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: timeframe === opt.id ? '0 2px 8px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        {(['general', 'financial', 'clinical', 'operational'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'general' ? 'General' : tab === 'financial' ? 'Finanzas' : tab === 'clinical' ? 'Clínica' : 'Operaciones'}
          </button>
        ))}
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Ingresos Brutos</span>
                <DollarSign size={20} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{totalRevenue.toLocaleString('es-PY')} Gs</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Ticket Med. {Math.round(avgTicket).toLocaleString('es-PY')} Gs
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Consultas Realizadas</span>
                <Activity size={20} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{filteredConsultations.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Nuevos Pacientes</span>
                <Users size={20} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{filteredPatients.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Citas Programadas</span>
                <CalendarIcon size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{filteredAppointments.length}</div>
            </div>
          </>
        )}

        {/* TAB: FINANCIAL */}
        {activeTab === 'financial' && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Facturación Total</span>
                <DollarSign size={20} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{totalRevenue.toLocaleString('es-PY')} Gs</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Ticket Promedio</span>
                <Activity size={20} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{Math.round(avgTicket).toLocaleString('es-PY')} Gs</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Consulta Más Alta</span>
                <DollarSign size={20} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{maxTicket.toLocaleString('es-PY')} Gs</div>
            </div>
          </>
        )}

        {/* TAB: CLINICAL */}
        {activeTab === 'clinical' && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Consultas Clínicas</span>
                <Activity size={20} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{filteredConsultations.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Diagnóstico Principal</span>
                <Activity size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {treatmentsData.length > 0 ? treatmentsData[0].name : 'N/A'}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Altas Médicas</span>
                <Users size={20} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{altaMedicaCount}</div>
            </div>
          </>
        )}

        {/* TAB: OPERATIONAL */}
        {activeTab === 'operational' && (
          <>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Total Programado</span>
                <CalendarIcon size={20} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{filteredAppointments.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Asistencias Confirmadas</span>
                <Users size={20} color="var(--color-success)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{confirmedAppointments}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                {filteredAppointments.length > 0 ? Math.round((confirmedAppointments / filteredAppointments.length) * 100) : 0}% de retención
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Inasistencias / Canceladas</span>
                <Activity size={20} color="var(--color-danger)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '1rem' }}>{canceledAppointments}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-danger)', marginTop: '0.5rem' }}>
                {filteredAppointments.length > 0 ? Math.round((canceledAppointments / filteredAppointments.length) * 100) : 0}% de fuga
              </div>
            </div>
          </>
        )}
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* REVENUE CHART */}
        {(activeTab === 'general' || activeTab === 'financial') && (
          <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Evolución de Ingresos</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--color-text-main)' }}
                    formatter={(value: number) => [`${value.toLocaleString('es-PY')} Gs`, 'Ingreso']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-primary)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TOP TREATMENTS */}
        {(activeTab === 'general' || activeTab === 'clinical') && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Diagnósticos más frecuentes</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={treatmentsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--color-text-muted)" fontSize={12} width={100} />
                  <Tooltip cursor={{ fill: 'var(--color-border)', opacity: 0.4 }} contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
                    {treatmentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* APPOINTMENT STATUS */}
        {(activeTab === 'general' || activeTab === 'operational') && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Estado de Citas</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {appointmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TEMPLATE USAGE PIECHART */}
        {(activeTab === 'general' || activeTab === 'clinical') && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Uso de Plantillas</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={templateUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {templateUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
