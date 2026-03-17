import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface SingleDatePickerProps {
  date: string; // yyyy-MM-dd
  onChange: (date: string) => void;
}

export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({ date, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(date ? new Date(date + 'T12:00:00') : new Date()); // avoid TZ issues
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

  const handleDateClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDateGrid;
  while (day <= endDateGrid) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={pickerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0.85rem 1rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', transition: 'all 0.2s' }}
        className="hover-border-primary"
      >
        <Calendar size={18} color="var(--color-primary)" />
        <span style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: 500 }}>{date || "Seleccionar fecha"}</span>
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 1000, background: 'var(--color-surface, white)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderRadius: '12px', padding: '1rem', width: '260px', border: '1px solid var(--color-border)', animation: 'slide-up 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}><ChevronLeft size={20} /></button>
            <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', color: 'var(--color-text-main)' }}>{format(viewDate, 'MMMM yyyy', { locale: es })}</div>
            <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}><ChevronRight size={20} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
            {weekDays.map((d, i) => <div key={i} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((dayItem, i) => {
              const isCurrentMonth = isSameMonth(dayItem, viewDate);
              const isSelected = date && isSameDay(dayItem, new Date(date + 'T12:00:00'));
              return (
                <div 
                  key={i} 
                  onClick={() => isCurrentMonth && handleDateClick(dayItem)}
                  style={{ padding: '0.5rem 0', textAlign: 'center', cursor: isCurrentMonth ? 'pointer' : 'default', fontSize: '0.85rem', borderRadius: '8px', backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent', color: isSelected ? 'white' : isCurrentMonth ? 'var(--color-text-main)' : 'var(--color-text-muted)', transition: 'all 0.1s' }}
                  className={isCurrentMonth && !isSelected ? "hover-bg" : ""}
                >
                  {format(dayItem, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
