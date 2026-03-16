import React, { useState } from 'react';
import { FileText, Plus, Save, Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { mockTemplates } from '../../data/mockData';

export const Templates: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editData, setEditData] = useState({ ...mockTemplates[0] });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = mockTemplates.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.symptoms && t.symptoms.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditClick = (template: typeof mockTemplates[0]) => {
    setEditData({ ...template });
    setView('edit');
  };

  const handleNewClick = () => {
    setEditData({
      id: Math.floor(Math.random() * 10000),
      title: 'Nueva Plantilla',
      symptoms: '',
      treatment: '',
      recommendations: '',
      recoveryTime: '',
      notes: '',
      cost: ''
    });
    setView('edit');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const index = mockTemplates.findIndex(t => t.id === editData.id);
    if (index !== -1) {
      mockTemplates[index] = { ...editData };
    } else {
      mockTemplates.push({ ...editData });
    }
    setView('list');
  };

  if (view === 'edit') {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setView('list')} style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight style={{ transform: 'rotate(180deg)' }} size={20} />
            </button>
            <input 
              type="text"
              name="title"
              value={editData.title} 
              onChange={handleInputChange}
              placeholder="Título de la Plantilla"
              style={{ 
                fontSize: '2rem', 
                fontWeight: 700, 
                border: 'none', 
                background: 'transparent', 
                color: 'var(--color-text-main)',
                outline: 'none',
                fontFamily: 'inherit',
                letterSpacing: '-0.02em',
                width: '100%',
                maxWidth: '500px'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setView('list')}>{t('templates.cancel')}</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> {t('templates.save')}
            </button>
          </div>
        </header>

        <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.symptoms')}</label>
              <textarea name="symptoms" value={editData.symptoms} onChange={handleInputChange} style={{ resize: 'none', minHeight: '120px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.treatment')}</label>
              <textarea name="treatment" value={editData.treatment} onChange={handleInputChange} style={{ resize: 'none', minHeight: '120px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recommendations')}</label>
              <textarea name="recommendations" value={editData.recommendations} onChange={handleInputChange} style={{ resize: 'none', minHeight: '120px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recoveryTime')}</label>
              <input type="text" name="recoveryTime" value={editData.recoveryTime} onChange={handleInputChange} style={{ borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.cost')}</label>
              <input type="text" name="cost" value={(editData as { cost?: string }).cost || ''} onChange={handleInputChange} placeholder="Ej. 50" style={{ borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.notes')}</label>
            <textarea name="notes" value={editData.notes} onChange={handleInputChange} style={{ resize: 'none', minHeight: '150px', borderRadius: '12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', padding: '0.75rem', color: 'var(--color-text-main)' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header flex-between">
        <div>
          <h1 className="page-title">{t('templates.title')}</h1>
          <p className="page-description">{t('templates.description')}</p>
        </div>
        <button className="btn btn-primary" onClick={handleNewClick} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> {t('templates.newTemplate')}
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px', display: 'flex', alignItems: 'center' }}>
          <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem' }} />
          <input 
            type="text" 
            placeholder={t('templates.myTemplates')} 
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem 0.75rem 2.75rem', 
              borderRadius: '12px', 
              border: '1px solid var(--color-border)', 
              background: 'var(--color-background)',
              color: 'var(--color-text-main)',
              outline: 'none',
            }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              className="glass-panel"
              onClick={() => handleEditClick(template)}
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{template.title}</h3>
                  {(template as { cost?: string }).cost && (
                    <span style={{ fontSize: '0.8rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                      ${(template as { cost?: string }).cost}
                    </span>
                  )}
                </div>
              </div>
              
              <p style={{ 
                margin: 0, 
                fontSize: '0.85rem', 
                color: 'var(--color-text-muted)', 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.5'
              }}>
                {template.symptoms || 'Sin descripción de síntomas'}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Editar <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No se encontraron plantillas.
          </div>
        )}
      </div>
      <style>{`
        .glass-panel:hover {
          border-color: var(--color-primary) !important;
        }
      `}</style>
    </div>
  );
};
