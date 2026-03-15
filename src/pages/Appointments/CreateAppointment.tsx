import React from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';

export const CreateAppointment: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header">
        <h1 className="page-title">Schedule Appointment</h1>
        <p className="page-description">Book a new consultation for an existing or new patient.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <User size={16} /> Patient Selection
              </label>
              <select className="input-field" defaultValue="">
                <option value="" disabled>Select a patient...</option>
                <option value="PT-1001">John Doe</option>
                <option value="PT-1002">Jane Smith</option>
                <option value="PT-1003">Robert Johnson</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> Appointment Type
              </label>
              <select className="input-field" defaultValue="checkup">
                <option value="checkup">General Checkup</option>
                <option value="followup">Follow-up</option>
                <option value="specialist">Specialist Consultation</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Calendar size={16} /> Date
              </label>
              <input type="date" className="input-field" />
            </div>

            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Clock size={16} /> Time
              </label>
              <input type="time" className="input-field" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notes for Doctor (Optional)</label>
            <textarea 
              className="input-field" 
              rows={4} 
              placeholder="Any specific symptoms or reasons for the visit..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>Cancel</button>
            <button type="button" className="btn btn-primary">Confirm Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
