import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Parse strings back to Local Dates to avoid timezone offsets
  const parseLocal = (str: string) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const start = parseLocal(startDate);
  const end = parseLocal(endDate);

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
    const dateStr = format(day, 'yyyy-MM-dd');
    if (!start || (start && end)) {
      onRangeChange(dateStr, '');
    } else if (start && !end) {
      if (isBefore(day, start)) {
        onRangeChange(dateStr, '');
      } else {
        onRangeChange(format(start, 'yyyy-MM-dd'), dateStr);
        // Let them see the range, they click outside to close style.
      }
    }
  };

  const handleClear = () => {
    onRangeChange('', '');
    setIsOpen(false);
  };

  // Generate days grid
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDateGrid = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDateGrid = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = startDateGrid;
  while (day <= endDateGrid) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  const isSelected = (day: Date) => {
    return (start && isSameDay(day, start)) || (end && isSameDay(day, end));
  };

  const isInRange = (day: Date) => {
    if (!start || !end) return false;
    return isAfter(day, start) && isBefore(day, end) || isSameDay(day, start) || isSameDay(day, end);
  };

  const isFuture = (day: Date) => {
    return isAfter(day, new Date());
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.6rem 1rem', 
          borderRadius: '12px', 
          border: '1px solid var(--color-border)', 
          background: 'var(--color-background)', 
          color: 'var(--color-text-main)', 
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '0.9rem',
          fontWeight: 500
        }}
        className="hover-row"
      >
        <Calendar size={18} color="var(--color-text-muted)" />
        <span>
          {startDate && endDate ? `${startDate} / ${endDate}` : startDate ? `${startDate} ...` : 'Filtrar por fecha'}
        </span>
        {(startDate || endDate) && (
          <X 
            size={16} 
            style={{ marginLeft: '0.5rem', cursor: 'pointer', opacity: 0.6 }} 
            onClick={(e) => { e.stopPropagation(); handleClear(); }} 
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          />
        )}
      </button>

      {/* Dropdown Calendar Panel */}
      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          right: 0, 
          zIndex: 1000, 
          background: 'var(--color-surface, white)', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
          borderRadius: '14px', 
          padding: '1rem', 
          width: '260px', 
          border: '1px solid var(--color-border)',
          animation: 'slide-up 0.2s ease-out'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', color: 'var(--color-text-main)' }}>
              {format(viewDate, 'MMMM yyyy', { locale: es })}
            </div>
            <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-main)' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekdays */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', paddingBottom: '4px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((dayItem, i) => {
              const isCurrentMonth = isSameMonth(dayItem, viewDate);
              const selected = isSelected(dayItem);
              let ranged = isInRange(dayItem);
              const future = isFuture(dayItem);

              let bgColor = 'transparent';
              let textColor = 'var(--color-text-main)';
              let borderRadius = '8px';

              if (!isCurrentMonth) {
                textColor = 'var(--color-text-muted)';
                bgColor = 'transparent';
                ranged = false; // don't shade out-of-month ranges for simplicity
              } else if (selected) {
                bgColor = 'var(--color-primary)';
                textColor = 'white';
              } else if (ranged) {
                bgColor = 'var(--color-primary-light, rgba(0, 102, 204, 0.1))';
                textColor = 'var(--color-primary)';
              } else if (future) {
                textColor = 'rgba(0,0,0,0.2)'; // Faded for future
              }

              return (
                <div 
                  key={i} 
                  onClick={() => isCurrentMonth && handleDateClick(dayItem)}
                  style={{ 
                    padding: '0.5rem 0', 
                    textAlign: 'center', 
                    cursor: isCurrentMonth ? 'pointer' : 'default', 
                    fontSize: '0.85rem', 
                    fontWeight: selected ? 700 : 500,
                    backgroundColor: bgColor,
                    color: textColor,
                    borderRadius: borderRadius,
                    transition: 'all 0.1s'
                  }}
                  className={isCurrentMonth ? "hover-row" : ""}
                >
                  {format(dayItem, 'd')}
                </div>
              );
            })}
          </div>

          {/* Presets footer or similar controls if needed can be added here */}

        </div>
      )}
    </div>
  );
};
