import React from 'react';
import { User, Phone, Mail, FileText } from 'lucide-react';

export const CreatePatient: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">Register Patient</h1>
        <p className="page-description">Add a new patient to your clinic's CRM.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <User size={16} /> Full Name
              </label>
              <input type="text" className="input-field" placeholder="E.g. John Doe" required />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> Age
              </label>
              <input type="number" className="input-field" placeholder="Years" required min={0} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Phone size={16} /> Phone Number
              </label>
              <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Mail size={16} /> Email Address
              </label>
              <input type="email" className="input-field" placeholder="patient@example.com" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Initial Medical Notes (Optional)</label>
            <textarea 
              className="input-field" 
              rows={4} 
              placeholder="Known allergies, background, or reason for registration..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>Cancel</button>
            <button type="button" className="btn btn-primary">Register Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
};
