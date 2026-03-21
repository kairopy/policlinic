import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, Clock } from 'lucide-react';
import { isSameDay, startOfMonth, endOfMonth, isWithinInterval, subMonths, format, parseISO } from 'date-fns';
import { getPatients, getAppointments, getConsultations } from '../services/dataService';
import type { Patient, Appointment, Consultation } from '../services/dataService';
import { useLanguage } from '../context/LanguageContext';
import { SlidePanel } from '../components/ui/SlidePanel';
import { PatientForm } from './Patients/PatientForm';
import { CreateAppointment } from './Appointments/CreateAppointment';
import { CreateConsultation } from './Consultations/CreateConsultation';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => {
  const { t } = useLanguage();
  return (
    <div className="glass-panel hover-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s' }}>
      <div className="flex-between">
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{title}</span>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2px',
          color: trendUp ? 'var(--color-success)' : 'var(--color-danger)',
          backgroundColor: trendUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '2px 8px',
          borderRadius: '99px',
          fontWeight: 600
        }}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
        <span style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.vsLastMonth')}</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewConsultation, setShowNewConsultation] = useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [p, a, c] = await Promise.all([
      getPatients(),
      getAppointments(),
      getConsultations()
    ]);
    setPatients(p);
    setAppointments(a);
    setConsultations(c);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Logic Calculations (Based on March 2026 as current)
  const today = new Date('2026-03-16');
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);
  
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: '+0%', up: true };
    const diff = ((current - previous) / previous) * 100;
    return { 
      trend: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`, 
      up: diff >= 0 
    };
  };

  // 1. Total Patients Trend
  const totalPatientsCount = patients.length;
  const patientsLastMonth = patients.filter(p => {
    const created = p.createdAt ? new Date(p.createdAt) : new Date('2023-01-01');
    return created <= lastMonthEnd;
  }).length;
  const patientTrend = calculateTrend(totalPatientsCount, patientsLastMonth);

  // 2. Appointments Today vs Same day last month
  const appointmentsToday = appointments.filter(app => isSameDay(new Date(app.date), today));
  const sameDayLastMonth = subMonths(today, 1);
  const appointmentsLastMonthSameDay = appointments.filter(app => isSameDay(new Date(app.date), sameDayLastMonth));
  const appointmentTrend = calculateTrend(appointmentsToday.length, appointmentsLastMonthSameDay.length);

  // 3. Active Consultations (Total Month vs Previous Month)
  const currentMonthConsults = consultations.filter(c => isWithinInterval(parseISO(c.date), { start: currentMonthStart, end: currentMonthEnd }));
  const lastMonthConsults = consultations.filter(c => isWithinInterval(parseISO(c.date), { start: lastMonthStart, end: lastMonthEnd }));
  const consultTrend = calculateTrend(currentMonthConsults.length, lastMonthConsults.length);

  // 4. Monthly Revenue (Total Month vs Previous Month)
  const monthlyRevenue = currentMonthConsults.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
  const lastMonthRevenue = lastMonthConsults.reduce((sum, c) => sum + (Number(c.cost) || 0), 0);
  const revenueTrend = calculateTrend(monthlyRevenue, lastMonthRevenue);

  // Recent Patients (Last 4)
  const recentPatients = [...patients].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 4);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 size={48} className="animate-spin" color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)' }}>Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header className="page-header">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <p className="page-description">{t('dashboard.description')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title={t('dashboard.totalPatients')} value={totalPatientsCount} icon={Users} trend={patientTrend.trend} trendUp={patientTrend.up} />
        <StatCard title={t('dashboard.appointmentsToday')} value={appointmentsToday.length} icon={CalendarIcon} trend={appointmentTrend.trend} trendUp={appointmentTrend.up} />
        <StatCard title={t('dashboard.activeConsultations')} value={currentMonthConsults.length} icon={Activity} trend={consultTrend.trend} trendUp={consultTrend.up} />
        <StatCard title={t('dashboard.monthlyRevenue')} value={`${monthlyRevenue.toLocaleString('es-PY')} Gs`} icon={TrendingUp} trend={revenueTrend.trend} trendUp={revenueTrend.up} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Appointments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{t('dashboard.upcomingAppointments')}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/appointments')}>{t('dashboard.viewAll')}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appointmentsToday.length > 0 ? appointmentsToday.map((app) => (
                <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700 }}>
                      {app.title.split(' ')[0][0]}{app.title.split(' ')[1][0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{app.title.split(' - ')[0]}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{app.type}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-main)' }}>
                      <Clock size={14} color="var(--color-primary)" />
                      {format(new Date(app.date), "hh:mm a")}
                    </div>
                    <div className="badge badge-warning" style={{ marginTop: '0.25rem' }}>{app.status}</div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                  {t('dashboard.noMoreAppointments')}
                </div>
              )}
            </div>
          </div>

          {/* New Section: Recent Patients to fill space */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{t('dashboard.recentPatients')}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/patients')}>{t('dashboard.viewAll')}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {recentPatients.map(patient => (
                <div key={patient.id} onClick={() => navigate(`/patients/${patient.id}`)} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--color-surface)' }} className="hover-bg">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {patient.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                     <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{patient.name}</span>
                   </div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                     {patient.id} • {t(`consultation.statuses.${patient.status}`)}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
             <h3 style={{ marginBottom: '1.5rem' }}>{t('dashboard.quickActions')}</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: '12px', fontSize: '1rem', boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)' }} onClick={() => setShowNewConsultation(true)}>
                 {t('consultation.createTitle')}
               </button>
               <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: '12px' }} onClick={() => setShowNewAppointment(true)}>{t('dashboard.newAppointment')}</button>
               <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', borderRadius: '12px' }} onClick={() => setShowNewPatient(true)}>{t('dashboard.registerPatient')}</button>
             </div>
          </div>

          {/* Activity Placeholder or additional info */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary), #0ea5e9)', color: 'white', border: 'none' }}>
             <h4 style={{ margin: '0 0 0.5rem 0', opacity: 0.9 }}>Consejo del día</h4>
             <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.5, opacity: 0.8 }}>
               Recuerda completar las notas clínicas de las consultas pendientes para mantener el historial al día.
             </p>
          </div>
        </div>
      </div>

      {/* SlidePanel Modals */}
      <SlidePanel
        isOpen={showNewPatient}
        onClose={() => setShowNewPatient(false)}
        title="Nuevo Paciente"
      >
        <PatientForm
          mode="create"
          onClose={() => setShowNewPatient(false)}
          onSaved={fetchData}
        />
      </SlidePanel>

      <SlidePanel
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        title="Nueva Cita"
      >
        <CreateAppointment 
          onClose={() => setShowNewAppointment(false)} 
          onSaved={fetchData} 
        />
      </SlidePanel>

      <SlidePanel
        isOpen={showNewConsultation}
        onClose={() => setShowNewConsultation(false)}
        title="Nueva Consulta"
        width="900px"
      >
        <CreateConsultation 
          onClose={() => {
            setShowNewConsultation(false);
            fetchData();
          }} 
        />
      </SlidePanel>

    </div>
  );
};
