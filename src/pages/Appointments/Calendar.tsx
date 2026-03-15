import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';

// Mock Events
const mockEvents = [
  { id: 1, title: 'John Doe - Checkup', date: new Date(2023, 9, 15, 10, 0), duration: 60, type: 'Checkup' },
  { id: 2, title: 'Jane Smith - Follow-up', date: new Date(2023, 9, 15, 14, 30), duration: 30, type: 'Follow-up' },
  { id: 3, title: 'Robert Johnson - Consultation', date: new Date(2023, 9, 18, 11, 0), duration: 45, type: 'Consultation' },
];

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // Fixed to Oct 2023 for mock data matching
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  const renderHeader = () => {
    return (
      <header className="page-header flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-description">Schedule and manage your clinical calendar.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: '0.25rem', border: '1px solid var(--color-border)' }}>
            <button className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('month')}>Month</button>
            <button className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('week')}>Week</button>
            <button className={`btn ${viewMode === 'day' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setViewMode('day')}>Day</button>
          </div>
          <button className="btn btn-primary"><Plus size={18} /> New Event</button>
        </div>
      </header>
    );
  };

  const renderCells = () => {
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
        const dayEvents = mockEvents.filter(e => isSameDay(e.date, cloneDay));

        days.push(
          <div 
            className={`col cell ${!isSameMonth(day, monthStart) ? "disabled" : isSameDay(day, new Date(2023, 9, 15)) ? "selected" : ""}`} 
            key={day.toString()}
          >
            <span className="number">{formattedDate}</span>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {dayEvents.map(event => (
                <div key={event.id} className="event-badge">
                  {format(event.date, "HH:mm")} - {event.title.split(' - ')[0]}
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

  return (
    <div className="animate-fade-in calendar-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderHeader()}
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="calendar-controls">
          <div className="flex-center" style={{ gap: '1rem' }}>
            <button className="icon-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <h2 style={{ fontSize: '1.25rem', minWidth: '150px', textAlign: 'center' }}>
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <button className="icon-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>
        </div>
        
        <div className="calendar">
          <div className="days-header row">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
               <div className="col col-center" key={i}>
                 {d}
               </div>
             ))}
          </div>
          {renderCells()}
        </div>
      </div>
      
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
      `}</style>
    </div>
  );
};
