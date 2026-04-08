import React, { useState } from 'react';
import { FileText, Plus, Save, Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { mockTemplates } from '../../data/mockData';
import { SlidePanel } from '../../components/ui/SlidePanel';

export const Templates: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editData, setEditData] = useState({ ...mockTemplates[0] });
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotifications();

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
      id: String(Math.floor(Math.random() * 10000)),
      title: 'Nueva Plantilla',
      symptoms: '',
      treatment: '',
      recommendations: '',
      recoveryTime: '',
      notes: '',
      cost: 0
    });
    setView('edit');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ 
      ...prev, 
      [name]: name === 'cost' ? (Number(value) || 0) : value 
    }));
  };

  const handleSave = () => {
    const index = mockTemplates.findIndex(t => t.id === editData.id);
    if (index !== -1) {
      mockTemplates[index] = { ...editData };
      addNotification('Plantilla Actualizada', `La plantilla "${editData.title}" ha sido actualizada.`, 'success');
    } else {
      mockTemplates.push({ ...editData });
      addNotification('Plantilla Creada', `Nueva plantilla "${editData.title}" creada correctamente.`, 'success');
    }
    setView('list');
  };

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
              className="glass-panel template-card"
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
                  {template.cost && (
                    <span style={{ fontSize: '0.8rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {Number(template.cost).toLocaleString('es-PY')} Gs
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
        .template-card:hover {
          border-color: var(--color-primary) !important;
        }
      `}</style>

      {/* SlidePanel Edit/Create Modal */}
      <SlidePanel
        isOpen={view === 'edit'}
        onClose={() => setView('list')}
        title={editData.title}
        width="800px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Título de la Plantilla</label>
            <input 
              type="text"
              name="title"
              value={editData.title} 
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ej. Limpieza Profunda"
              style={{ borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.symptoms')}</label>
              <textarea className="input-field" name="symptoms" value={editData.symptoms} onChange={handleInputChange} style={{ resize: 'vertical', minHeight: '120px', borderRadius: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.treatment')}</label>
              <textarea className="input-field" name="treatment" value={editData.treatment} onChange={handleInputChange} style={{ resize: 'vertical', minHeight: '120px', borderRadius: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recommendations')}</label>
              <textarea className="input-field" name="recommendations" value={editData.recommendations} onChange={handleInputChange} style={{ resize: 'vertical', minHeight: '120px', borderRadius: '12px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.recoveryTime')}</label>
              <input className="input-field" type="text" name="recoveryTime" value={editData.recoveryTime} onChange={handleInputChange} style={{ borderRadius: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.cost')}</label>
              <input className="input-field" type="number" name="cost" value={editData.cost || ''} onChange={handleInputChange} placeholder="Ej. 150000" style={{ borderRadius: '12px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>{t('consultation.notes')}</label>
            <textarea className="input-field" name="notes" value={editData.notes} onChange={handleInputChange} style={{ resize: 'vertical', minHeight: '150px', borderRadius: '12px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn-outline" onClick={() => setView('list')} style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}>
              {t('templates.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleSave} style={{ borderRadius: '999px', padding: '0.75rem 2rem', boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> {t('templates.save')}
            </button>
          </div>
        </div>
      </SlidePanel>
    </div>
  );
};
