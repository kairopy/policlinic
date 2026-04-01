import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointments, useDeleteAppointment } from '../../hooks/queries/useAppointments';
import type { Appointment } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { SlidePanel } from '../../components/ui/SlidePanel';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { CreateAppointment } from './CreateAppointment';

export const CalendarView: React.FC = () => {
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const { data: appointments = [], isLoading: loading, refetch: refetchAppointments, isFetching: isSyncing } = useAppointments();
  const deleteMutation = useDeleteAppointment();

  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadAppointments = React.useCallback(async () => {
    refetchAppointments();
  }, [refetchAppointments]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const renderHeader = () => {
    return (
      <header className="page-header flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{t('sidebar.appointments')}</h1>
          <p className="page-description">Programa y gestiona tu calendario clínico.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '0.25rem', border: '1px solid var(--color-border)' }}>
            <button className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('month')}>Mes</button>
            <button className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('week')}>Semana</button>
            <button className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('day')}>Día</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewAppointment(true)}>
            <Plus size={18} /> {t('dashboard.newAppointment')}
          </button>
        </div>
      </header>
    );
  };

  const renderCells = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', width: '100%' }}>
          <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
        </div>
      );
    }

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        // Find events for this day
        const dayEvents = appointments.filter((e: Appointment) => isSameDay(e.date, cloneDay));

        days.push(
          <div 
            className={`col cell ${!isSameMonth(day, monthStart) ? "disabled" : isSameDay(day, new Date()) ? "selected" : ""}`} 
            key={day.toString()}
          >
            <span className="number">{formattedDate}</span>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dayEvents.map((event: Appointment) => (
                <div key={event.id} className="event-badge" onClick={(e) => { e.stopPropagation(); setSelectedAppointment(event); }}>
                  {format(new Date(event.date), "HH:mm")} - {event.title.split(' - ')[0]}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const renderWeek = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = endOfWeek(currentDate);
    
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const cloneDay = day;
      const dayEvents = appointments.filter((e: Appointment) => isSameDay(e.date, cloneDay));

      days.push(
        <div className="col cell week-cell" key={day.toString()} style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{format(day, 'EEEE', { locale: es })}</div>
            <div className={`number ${isSameDay(day, new Date()) ? 'selected-day' : ''}`} style={{ fontSize: '1.25rem', fontWeight: 600, display: 'inline-block', width: '32px', height: '32px', lineHeight: '32px', borderRadius: '50%' }}>
              {format(day, 'd')}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }} className="custom-scrollbar">
            {dayEvents.map((event: Appointment) => (
              <div key={event.id} className="event-card" onClick={(e) => { e.stopPropagation(); setSelectedAppointment(event); }} style={{ background: 'var(--color-primary-light)', padding: '0.75rem', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)', cursor: 'pointer' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>{format(new Date(event.date), "HH:mm")}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem' }}>{event.title.split(' - ')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{event.type}</div>
              </div>
            ))}
            {dayEvents.length === 0 && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>Sin citas</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    return <div className="body" style={{ height: '100%' }}><div className="row" style={{ height: '100%' }}>{days}</div></div>;
  };

  const renderDay = () => {
    const dayEvents = appointments.filter((e: Appointment) => isSameDay(e.date, currentDate)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
      <div className="body day-view" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', textTransform: 'capitalize', color: 'var(--color-primary)', borderBottom: '2px solid var(--color-primary-light)', paddingBottom: '0.5rem' }}>
          {format(currentDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          {dayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
              No hay citas programadas para este día.
            </div>
          ) : (
            dayEvents.map((event: Appointment) => (
              <div key={event.id} className="day-event-card glass-panel" onClick={() => setSelectedAppointment(event)} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '6px solid var(--color-primary)', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ minWidth: '80px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{format(new Date(event.date), "HH:mm")}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{event.duration} min</div>
                </div>
                <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{event.title.split(' - ')[0]}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-block', background: 'var(--color-primary-light)', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.5rem' }}>
                    {event.type}
                  </div>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  <span className="badge badge-warning">{event.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in calendar-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderHeader()}
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="calendar-controls">
          <div className="flex-center" style={{ gap: '1rem' }}>
            <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <h2 style={{ fontSize: '1.25rem', minWidth: '150px', textAlign: 'center', textTransform: 'capitalize' }}>
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>
        
        <div className="calendar">
          {viewMode === 'month' && (
            <div className="days-header row">
               {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((d, i) => (
                 <div className="col col-center" key={i}>
                   {d}
                 </div>
               ))}
            </div>
          )}
          {viewMode === 'month' && renderCells()}
          {viewMode === 'week' && renderWeek()}
          {viewMode === 'day' && renderDay()}
        </div>
      </div>

      <SlidePanel
        isOpen={showNewAppointment}
        onClose={() => setShowNewAppointment(false)}
        title={t('dashboard.newAppointment')}
      >
        <CreateAppointment 
          onClose={() => {
             setShowNewAppointment(false);
             loadAppointments();
          }} 
          onSaved={loadAppointments}
        />
      </SlidePanel>

      <SlidePanel
        isOpen={selectedAppointment !== null}
        onClose={() => { setSelectedAppointment(null); setIsEditing(false); setShowDeleteConfirm(false); }}
        title={isEditing ? "Editar Cita" : "Detalles de la Cita"}
      >
        {isEditing && selectedAppointment ? (
          <CreateAppointment 
            initialAppointment={selectedAppointment}
            onClose={() => {
              setIsEditing(false);
              setSelectedAppointment(null);
              loadAppointments();
            }} 
            onSaved={loadAppointments}
          />
        ) : selectedAppointment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>PACIENTE / TÍTULO</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{selectedAppointment.title}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>FECHA Y HORA</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{format(new Date(selectedAppointment.date), "dd/MM/yyyy • HH:mm", { locale: es })}</div>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>DURACIÓN</div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedAppointment.duration} min</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>TIPO</div>
                <div style={{ display: 'inline-block', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>
                  {selectedAppointment.type}
                </div>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>ESTADO</div>
                <div><span className={`badge badge-${selectedAppointment.status === 'Completada' ? 'success' : selectedAppointment.status === 'Cancelada' ? 'error' : 'warning'}`}>{selectedAppointment.status}</span></div>
              </div>
            </div>

            {(selectedAppointment as Appointment & { notes?: string }).notes && (
              <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>NOTAS</div>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
                  {(selectedAppointment as Appointment & { notes?: string }).notes}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div>
                <button 
                  className="btn btn-outline" 
                  style={{ borderRadius: '999px', padding: '0.75rem 1.5rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Eliminar
                </button>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ borderRadius: '999px', padding: '0.75rem 1.5rem' }}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Editar
                </button>
                <button className="btn btn-outline" onClick={() => setSelectedAppointment(null)} style={{ borderRadius: '999px', padding: '0.75rem 2rem' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </SlidePanel>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="¿Eliminar esta cita?"
        message="Esta acción no se puede deshacer. Se eliminará el registro de la cita del calendario."
        confirmText="Eliminar"
        cancelText="Mantener"
        isDanger={true}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          if (selectedAppointment) {
            deleteMutation.mutate(selectedAppointment.id, {
              onSuccess: () => {
                addNotification('Cita Eliminada', 'La cita fue eliminada del sistema y de Google Calendar.', 'success');
                setSelectedAppointment(null);
                setShowDeleteConfirm(false);
              },
              onError: (error) => {
                addNotification('Error', 'No se pudo eliminar la cita: ' + error.message, 'error');
              }
            });
          }
        }}
      />
      
      <style>{`
        .calendar-controls {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .calendar {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .row {
          display: flex;
          width: 100%;
        }
        .days-header {
          font-weight: 600;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
          background-color: var(--color-background);
        }
        .col {
          flex: 1;
          padding: 0.75rem;
          border-right: 1px solid var(--color-border);
        }
        .col:last-child {
          border-right: none;
        }
        .col-center {
          text-align: center;
        }
        .body .row {
          border-bottom: 1px solid var(--color-border);
          flex: 1;
          min-height: 120px;
        }
        .body .row:last-child {
          border-bottom: none;
        }
        .cell {
          position: relative;
          transition: background-color var(--transition-fast);
        }
        .cell:hover {
          background-color: var(--color-primary-light);
        }
        .cell.disabled {
          color: var(--color-border);
          background-color: var(--color-background);
        }
        .cell .number {
          font-weight: 500;
        }
        .cell.selected .number {
          background-color: var(--color-primary);
          color: white;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
        }
        .event-badge {
          background-color: var(--color-secondary);
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
        }
        .week-cell {
          border-right: 1px solid var(--color-border);
        }
        .week-cell:last-child {
          border-right: none;
        }
        .selected-day {
          background-color: var(--color-primary);
          color: white;
        }
        .event-card:hover {
          background-color: var(--color-surface) !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .day-event-card:hover {
          transform: translateX(4px);
          border-color: var(--color-secondary) !important;
        }
      `}</style>
    </div>
  );
};
