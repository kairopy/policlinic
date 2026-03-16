import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, Activity, TrendingUp } from 'lucide-react';
import { isSameDay, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { mockPatients, mockAppointments, mockConsultations } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

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
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="flex-between">
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{title}</span>
        <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        <span className={trendUp ? 'badge badge-success' : 'badge badge-danger'}>
          {trend}
        </span>
        <span style={{ color: 'var(--color-text-muted)' }}>{t('dashboard.vsLastMonth')}</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Logic Calculations
  const today = new Date();
  const currentMonthInterval = { start: startOfMonth(today), end: endOfMonth(today) };

  const totalPatients = mockPatients.length;
  const appointmentsToday = mockAppointments.filter(app => isSameDay(app.date, today));
  const activeConsultations = mockConsultations.filter(c => c.status === 'In Progress').length;
  const monthlyRevenue = mockConsultations
    .filter(c => isWithinInterval(new Date(c.date), currentMonthInterval))
    .reduce((sum, consult) => sum + (consult.cost || 0), 0);

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{t('dashboard.title')}</h1>
        <p className="page-description">{t('dashboard.description')}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title={t('dashboard.totalPatients')} value={totalPatients} icon={Users} trend="+12.5%" trendUp={true} />
        <StatCard title={t('dashboard.appointmentsToday')} value={appointmentsToday.length} icon={CalendarIcon} trend="+2.4%" trendUp={true} />
        <StatCard title={t('dashboard.activeConsultations')} value={activeConsultations} icon={Activity} trend="-4.1%" trendUp={false} />
        <StatCard title={t('dashboard.monthlyRevenue')} value={`${monthlyRevenue.toLocaleString('es-PY')} Gs.`} icon={TrendingUp} trend="+8.2%" trendUp={true} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{t('dashboard.upcomingAppointments')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointmentsToday.length > 0 ? appointmentsToday.map((app) => (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="avatar" style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}>
                    {app.title.split(' ')[0][0]}{app.title.split(' ')[1][0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{app.title.split(' - ')[0]}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{app.type}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 500 }}>{format(app.date, "hh:mm a")}</div>
                  <div className="badge badge-warning">{app.status}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                {t('dashboard.noMoreAppointments')}
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '1.5rem' }}>{t('dashboard.quickActions')}</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', boxShadow: '0 4px 12px -2px rgba(2, 132, 199, 0.4)' }} onClick={() => navigate('/consultations/new')}>
               {t('consultation.createTitle') === 'consultation.createTitle' ? 'Nueva Consulta' : t('consultation.createTitle')}
             </button>
             <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/appointments/new')}>{t('dashboard.newAppointment')}</button>
             <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/patients/new')}>{t('dashboard.registerPatient')}</button>
           </div>
        </div>
      </div>
    </div>
  );
};
