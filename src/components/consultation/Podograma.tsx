import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, MapPin, AlertCircle, Droplet, Activity, Trash2, Type } from 'lucide-react';
import './Podograma.css';
export interface MarkerData {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'callus' | 'wart' | 'ulcer' | 'fungus' | 'ingrown' | 'other';
  notes: string;
}

export interface PodogramState {
  imageUrl: string | null; // base64 or null for default template
  markers: MarkerData[];
}

interface PodogramaProps {
  data?: string; // JSON serialized PodogramState
  onChange?: (data: string) => void;
  readOnly?: boolean;
}

export const MarkerTypes = [
  { type: 'callus', label: 'Callo / Hiperqueratosis', color: '#eab308', icon: <MapPin size={16} /> },
  { type: 'wart', label: 'Verruga / Papiloma', color: '#ef4444', icon: <AlertCircle size={16} /> },
  { type: 'ulcer', label: 'Úlcera / Herida', color: '#b91c1c', icon: <Droplet size={16} /> },
  { type: 'fungus', label: 'Hongo / Micosis', color: '#10b981', icon: <Activity size={16} /> },
  { type: 'ingrown', label: 'Uña Encarnada', color: '#f97316', icon: <Activity size={16} /> },
  { type: 'other', label: 'Otro / Nota', color: '#3b82f6', icon: <Type size={16} /> },
] as const;

export const Podograma: React.FC<PodogramaProps> = ({ data, onChange, readOnly = false }) => {
  const [state, setState] = useState<PodogramState>({ imageUrl: null, markers: [] });
  const [selectedTool, setSelectedTool] = useState<MarkerData['type']>('callus');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize from props
  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setState({
          imageUrl: parsed.imageUrl || null,
          markers: Array.isArray(parsed.markers) ? parsed.markers : []
        });
      } catch (e) {
        console.error("Failed to parse podogram data", e);
      }
    }
  }, [data]);

  // Sync back to parent
  useEffect(() => {
    if (!readOnly && onChange) {
      onChange(JSON.stringify(state));
    }
  }, [state, readOnly, onChange]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setState(prev => ({ ...prev, imageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    if (readOnly) return;
    setState(prev => ({ ...prev, imageUrl: null }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    // If clicking on an existing marker, don't create a new one (handled by stopPropagation on marker)
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: MarkerData = {
      id: Date.now().toString(),
      x,
      y,
      type: selectedTool,
      notes: ''
    };

    setState(prev => ({
      ...prev,
      markers: [...prev.markers, newMarker]
    }));
    setActiveMarkerId(newMarker.id);
  };

  const updateMarkerNotes = (id: string, notes: string) => {
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      markers: prev.markers.map(m => m.id === id ? { ...m, notes } : m)
    }));
  };

  const deleteMarker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setState(prev => ({
      ...prev,
      markers: prev.markers.filter(m => m.id !== id)
    }));
    if (activeMarkerId === id) setActiveMarkerId(null);
  };

  // Simple drag implementation (optional enhancement: add true drag-and-drop)
  
  return (
    <div className="podograma-wrapper">
      {!readOnly && (
        <div className="podograma-toolbar glass-panel">
          <div className="toolbar-section">
            <span className="toolbar-label">Herramienta:</span>
            <div className="tool-buttons">
              {MarkerTypes.map(tool => (
                <button
                  key={tool.type}
                  className={`tool-btn ${selectedTool === tool.type ? 'active' : ''}`}
                  onClick={() => setSelectedTool(tool.type)}
                  title={tool.label}
                  type="button"
                >
                  {React.cloneElement(tool.icon, { color: selectedTool === tool.type ? '#fff' : tool.color })}
                  <span className="tool-name">{tool.label.split('/')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-actions">
            {!state.imageUrl ? (
              <label className="upload-btn btn btn-outline" style={{ cursor: 'pointer', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <Upload size={14} /> Subir Foto Local
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            ) : (
              <button type="button" className="btn btn-outline danger" onClick={handleClearImage} style={{ borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                <X size={14} /> Quitar Foto
              </button>
            )}
          </div>
        </div>
      )}

      <div className="podograma-workspace">
        <div 
          className="canvas-container" 
          ref={containerRef}
          onClick={handleCanvasClick}
          style={{ cursor: readOnly ? 'default' : 'crosshair' }}
        >
          {state.imageUrl ? (
            <img src={state.imageUrl} alt="Podograma Real" className="canvas-bg-img" />
          ) : (
            <div className="canvas-generic-template">
              {/* Plantilla SVG genérica de pies */}
              <svg viewBox="0 0 800 600" width="100%" height="100%" className="foot-svg">
                <g fill="#f8f9fa" stroke="#e2e8f0" strokeWidth="4">
                  {/* Pie Izquierdo simplificado */}
                  <path d="M 250,500 C 250,560 150,560 150,500 C 150,300 180,150 250,150 C 300,150 280,300 250,500 Z" />
                  <circle cx="250" cy="110" r="25" />
                  <circle cx="210" cy="95" r="18" />
                  <circle cx="175" cy="100" r="15" />
                  <circle cx="145" cy="115" r="12" />
                  <circle cx="120" cy="140" r="10" />

                  {/* Pie Derecho simplificado */}
                  <path d="M 550,500 C 550,560 650,560 650,500 C 650,300 620,150 550,150 C 500,150 520,300 550,500 Z" />
                  <circle cx="550" cy="110" r="25" />
                  <circle cx="590" cy="95" r="18" />
                  <circle cx="625" cy="100" r="15" />
                  <circle cx="655" cy="115" r="12" />
                  <circle cx="680" cy="140" r="10" />
                </g>
              </svg>
              <div className="template-hint">
                <span>Plantilla Genérica (Vista Plantar)</span>
              </div>
            </div>
          )}

          {/* Render Markers */}
          {state.markers.map(marker => {
            const toolDef = MarkerTypes.find(t => t.type === marker.type) || MarkerTypes[0];
            const isActive = activeMarkerId === marker.id;

            return (
              <div 
                key={marker.id}
                className={`marker-pin ${isActive ? 'active' : ''}`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%`, backgroundColor: toolDef.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMarkerId(isActive ? null : marker.id);
                }}
              >
                <div className="marker-core" />
                
                {/* Info Popover */}
                {isActive && (
                  <div className="marker-popover glass-panel" onClick={e => e.stopPropagation()}>
                    <div className="popover-header" style={{ borderBottomColor: toolDef.color }}>
                      <span className="popover-title">{toolDef.label}</span>
                      {!readOnly && (
                        <button type="button" className="icon-btn delete-btn" onClick={(e) => deleteMarker(marker.id, e)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="popover-body">
                      {readOnly ? (
                        <p className="read-only-notes">{marker.notes || 'Sin notas adicionales.'}</p>
                      ) : (
                        <textarea
                          placeholder="Añadir notas clínicas..."
                          value={marker.notes}
                          onChange={(e) => updateMarkerNotes(marker.id, e.target.value)}
                          className="notes-input"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
