import React from 'react';
import { Users, Calendar as CalendarIcon, Activity, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => (
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
      <span style={{ color: 'var(--color-text-muted)' }}>vs last month</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Welcome back, Dr. House. Here's your clinic overview for today.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Patients" value="1,248" icon={Users} trend="+12.5%" trendUp={true} />
        <StatCard title="Appointments Today" value="14" icon={CalendarIcon} trend="+2.4%" trendUp={true} />
        <StatCard title="Active Consultations" value="3" icon={Activity} trend="-4.1%" trendUp={false} />
        <StatCard title="Monthly Revenue" value="$24k" icon={TrendingUp} trend="+8.2%" trendUp={true} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Placeholder for Upcoming Appointments List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Appointments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="avatar" style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}>JS</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>John Smith {i}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>General Checkup</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 500 }}>{10 + i}:00 AM</div>
                  <div className="badge badge-warning">Pending</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder for Quick Actions or Tasks */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href='/appointments/new'}>+ New Appointment</button>
             <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>+ Register Patient</button>
           </div>
        </div>
      </div>
    </div>
  );
};
