import React, { useState } from 'react';
import { FileText, Plus, Save, Trash2, Edit } from 'lucide-react';

const mockTemplates = [
  { id: 1, title: 'General Checkup Notes', content: 'Patient presents for routine checkup.\nVitals:\n- BP:\n- HR:\n- Temp:\n\nNotes:\n' },
  { id: 2, title: 'Prescription Refill', content: 'Patient requesting refill for [Medication].\nCurrent dosage: [Dosage]\nSymptoms stable.' },
  { id: 3, title: 'Referral Letter', content: 'To whom it may concern,\n\nI am referring [Patient Name] for evaluation of [Condition].' },
];

export const Templates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Document Templates</h1>
          <p className="page-description">Manage standard forms and clinical note templates.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> New Template
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        
        {/* Template List */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--color-primary)" /> My Templates
            </h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {mockTemplates.map(template => (
              <div 
                key={template.id}
                onClick={() => { setSelectedTemplate(template); setIsEditing(false); }}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  backgroundColor: selectedTemplate.id === template.id ? 'var(--color-primary-light)' : 'transparent',
                  borderLeft: `3px solid ${selectedTemplate.id === template.id ? 'var(--color-primary)' : 'transparent'}`,
                  transition: 'background-color var(--transition-fast)'
                }}
              >
                <h4 style={{ color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>{template.title}</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {template.content.split('\n')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
           <div className="flex-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
             <h3 style={{ margin: 0 }}>
               {isEditing ? 'Editing Template' : selectedTemplate.title}
             </h3>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               {!isEditing ? (
                 <>
                   <button className="icon-btn" style={{ color: 'var(--color-primary)' }} onClick={() => setIsEditing(true)}>
                     <Edit size={18} />
                   </button>
                   <button className="icon-btn" style={{ color: 'var(--color-danger)' }}>
                     <Trash2 size={18} />
                   </button>
                 </>
               ) : (
                 <>
                   <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                   <button className="btn btn-primary" onClick={() => setIsEditing(false)}><Save size={18} /> Save Changes</button>
                 </>
               )}
             </div>
           </div>
           
           <div style={{ flex: 1, padding: '1.5rem', backgroundColor: isEditing ? 'var(--color-surface)' : 'var(--color-background)', overflowY: 'auto' }}>
             {isEditing ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                 <input 
                   className="input-field" 
                   defaultValue={selectedTemplate.title} 
                   style={{ fontSize: '1.25rem', fontWeight: 600 }}
                 />
                 <textarea 
                   className="input-field" 
                   defaultValue={selectedTemplate.content} 
                   style={{ flex: 1, fontFamily: 'monospace', resize: 'none', lineHeight: 1.6 }}
                 />
               </div>
             ) : (
               <div style={{ 
                 padding: '2rem', 
                 backgroundColor: 'white', 
                 border: '1px solid var(--color-border)', 
                 borderRadius: 'var(--radius-md)', 
                 minHeight: '100%',
                 fontFamily: 'serif',
                 lineHeight: 1.8,
                 whiteSpace: 'pre-wrap'
               }}>
                 {selectedTemplate.content}
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
