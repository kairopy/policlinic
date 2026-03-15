import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, Activity } from 'lucide-react';
import { mockPatients, mockConsultations } from '../../data/mockData';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const patient = mockPatients.find(p => p.id === id);
  const consultations = mockConsultations.filter(c => c.patientId === id);

  if (!patient) {
    return (
      <div className="flex-center animate-fade-in" style={{ height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <h2>Patient Not Found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/patients')}>Back to CRM</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate('/patients')} 
          style={{ marginBottom: '1rem', padding: '0.5rem 0' }}
        >
          <ArrowLeft size={18} /> Back to Patients
        </button>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
             <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                {patient.name.split(' ').map(n => n[0]).join('')}
             </div>
             <div>
               <h1 className="page-title" style={{ fontSize: '2rem' }}>{patient.name}</h1>
               <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                 <span>ID: {patient.id}</span>
                 <span>Age: {patient.age}</span>
                 <span className={`badge ${patient.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {patient.status}
                 </span>
               </div>
             </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline"><Edit size={18} /> Edit Profile</button>
            <button className="btn btn-primary"><PlusCalendarIcon size={18} /> New Consultation</button>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserIcon size={18} color="var(--color-primary)" /> Contact Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Phone</span>
                <span style={{ fontWeight: 500 }}>{patient.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
                <span style={{ fontWeight: 500 }}>{patient.email}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--color-primary)" /> Medical Summary
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
              No critical alerts. Routine checkups are consistently attended.
            </p>
          </div>
        </div>

        {/* Clinical History */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--color-primary)" /> Consultation History
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {consultations.length > 0 ? consultations.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="badge badge-success">{c.type}</div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{c.date}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{c.doctor}</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                  {c.summary}
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>View Details</button>
                  <button className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Print Report</button>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-md)' }}>
                No prior consultations found for this patient.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper internal icons to keep imports clean
const PlusCalendarIcon = ({size}: {size:number}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>;
const UserIcon = ({size, color}: {size:number, color:string}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
