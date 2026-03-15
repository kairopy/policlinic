import React, { useState } from 'react';
import { FileText, Plus, Save, Trash2, Edit, Bold, Italic, List, AlignLeft, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockTemplates } from '../../data/mockData';

export const Templates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...mockTemplates[0] });
  const { t } = useLanguage();

  const handleSelectTemplate = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
    setEditData({ ...template });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setEditData({ ...selectedTemplate });
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewClick = () => {
    setIsEditing(true);
    setEditData({
      id: Math.floor(Math.random() * 10000),
      title: 'Nueva Plantilla',
      symptoms: '',
      treatment: '',
      recommendations: '',
      recoveryTime: '',
      notes: ''
    });
  };

  const handleSave = () => {
    // Mutate local mock array for visual persistence
    const index = mockTemplates.findIndex(t => t.id === editData.id);
    if (index !== -1) {
      mockTemplates[index] = { ...editData };
    } else {
      mockTemplates.push({ ...editData });
    }
    setSelectedTemplate({ ...editData });
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem', boxSizing: 'border-box' }}>
      
      {/* Dynamic Header */}
      <header className="page-header flex-between" style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, var(--color-primary), #0ea5e9)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            {t('templates.title')}
          </h1>
          <p className="page-description" style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>{t('templates.description')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewClick} style={{ boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4)', borderRadius: '999px', padding: '0.75rem 1.5rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          <Plus size={18} /> {t('templates.newTemplate')}
        </button>
      </header>

      {/* Main Layout: 30% List / 70% Floating Document */}
      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden', padding: '0 1rem 1rem' }}>
        
        {/* Left Column: Glassmorphic List Panel */}
        <aside style={{ 
          width: '320px', 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-glass)',
          overflow: 'hidden'
        }}>
          {/* Search/Filter Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder={t('templates.myTemplates')} 
                style={{ 
                  width: '100%', 
                  padding: '0.75rem 1rem 0.75rem 2.5rem', 
                  borderRadius: '999px', 
                  border: '1px solid var(--color-border)', 
                  background: 'var(--color-background)',
                  color: 'var(--color-text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {mockTemplates.map(template => {
                const isSelected = selectedTemplate.id === template.id;
                return (
                  <div 
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? 'white' : 'var(--color-text-main)',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'translateX(4px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <FileText size={16} opacity={isSelected ? 1 : 0.6} />
                      <h4 style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{template.title}</h4>
                    </div>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.8rem', 
                      color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      paddingLeft: '2.25rem'
                    }}>
                      {template.symptoms || t('consultation.symptoms')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: The "Floating A4 Editor" */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start',
          overflowY: 'auto',
          paddingBottom: '2rem'
        }}>
          
          <div style={{
            width: '100%',
            maxWidth: '850px',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: '80vh',
            transition: 'all 0.4s ease'
          }}>
             
             {/* Styled Toolbar */}
             <div style={{ 
               padding: '1rem 1.5rem', 
               borderBottom: '1px solid var(--color-border)', 
               background: 'var(--color-background)',
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center'
             }}>
               
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Bold"><Bold size={16} /></button>
                 <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Italic"><Italic size={16} /></button>
                 <div style={{ width: '1px', background: 'var(--color-border)', margin: '0 0.25rem' }}></div>
                 <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '8px' }} title="List"><List size={16} /></button>
                 <button className="icon-btn" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Align"><AlignLeft size={16} /></button>
               </div>

               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {!isEditing ? (
                   <>
                     <button className="btn btn-outline" style={{ borderRadius: '999px', padding: '0.4rem 1rem' }} onClick={handleEditClick}>
                       <Edit size={16} style={{ marginRight: '0.25rem' }} /> Editar
                     </button>
                     <button className="icon-btn" style={{ color: 'var(--color-danger)' }}>
                       <Trash2 size={18} />
                     </button>
                   </>
                 ) : (
                   <>
                     <button className="btn btn-outline" style={{ borderRadius: '999px', padding: '0.4rem 1rem' }} onClick={() => setIsEditing(false)}>{t('templates.cancel')}</button>
                     <button className="btn btn-primary" style={{ borderRadius: '999px', padding: '0.4rem 1rem' }} onClick={handleSave}><Save size={16} style={{ marginRight: '0.25rem' }}/> {t('templates.save')}</button>
                   </>
                 )}
               </div>
             </div>
             
             {/* Document Body */}
             <div style={{ flex: 1, padding: '3rem 4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {isEditing ? (
                 <>
                   <div style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                     <label className="form-label" style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Título de la Plantilla</label>
                     <input 
                       type="text"
                       name="title"
                       value={editData.title} 
                       onChange={handleInputChange}
                       style={{ 
                         fontSize: '2rem', 
                         fontWeight: 700, 
                         border: 'none', 
                         background: 'transparent', 
                         color: 'var(--color-text-main)',
                         outline: 'none',
                         fontFamily: 'inherit',
                         letterSpacing: '-0.02em',
                         width: '100%'
                       }}
                     />
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.symptoms')}</label>
                       <textarea name="symptoms" value={editData.symptoms} onChange={handleInputChange} style={{ resize: 'none', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.treatment')}</label>
                       <textarea name="treatment" value={editData.treatment} onChange={handleInputChange} style={{ resize: 'none', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
                     </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recommendations')}</label>
                       <textarea name="recommendations" value={editData.recommendations} onChange={handleInputChange} style={{ resize: 'none', minHeight: '80px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                       <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recoveryTime')}</label>
                       <input type="text" name="recoveryTime" value={editData.recoveryTime} onChange={handleInputChange} style={{ borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
                     </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.notes')}</label>
                     <textarea name="notes" value={editData.notes} onChange={handleInputChange} style={{ resize: 'none', minHeight: '120px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
                   </div>
                 </>
               ) : (
                 <>
                   <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--color-text-main)', letterSpacing: '-0.02em', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
                     {selectedTemplate.title}
                   </h2>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {[
                       { label: t('consultation.symptoms'), value: selectedTemplate.symptoms },
                       { label: t('consultation.treatment'), value: selectedTemplate.treatment },
                       { label: t('consultation.recommendations'), value: selectedTemplate.recommendations },
                       { label: t('consultation.recoveryTime'), value: selectedTemplate.recoveryTime },
                       { label: t('consultation.notes'), value: selectedTemplate.notes }
                     ].map((item, idx) => (
                       <div key={idx} style={{ background: 'var(--color-background)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                         <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                           {item.label}
                         </div>
                         <div style={{ color: 'var(--color-text-main)', fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                           {item.value || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Sin datos</span>}
                         </div>
                       </div>
                     ))}
                   </div>
                 </>
               )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};
