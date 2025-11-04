import React, { useState, useMemo } from 'react';

interface CalendarDropdownProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

export const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ selectedDate, onDateSelect, onClose }) => {
  // Add 'T00:00:00' to avoid timezone issues when parsing the date string
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [displayDate, setDisplayDate] = useState(initialDate);

  const daysInMonth = useMemo(() => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [displayDate]);
  
  const firstDayOfMonth = useMemo(() => {
    return new Date(displayDate.getFullYear(), displayDate.getMonth(), 1).getDay();
  }, [displayDate]);
  
  const selectedDateTime = selectedDate ? new Date(selectedDate + 'T00:00:00').getTime() : null;

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    onDateSelect(dateString);
    onClose();
  };

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="absolute top-full mt-2 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg shadow-lg p-4 z-50 w-72">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))]">&lt;</button>
        <div className="font-semibold text-lg text-[rgb(var(--color-text-base))]">
          {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))]">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[rgb(var(--color-text-muted))] mb-2">
        {dayNames.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDayOfMonth).fill(null).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {daysInMonth.map(day => {
          const isSelected = selectedDateTime === day.getTime();
          const isToday = new Date().toDateString() === day.toDateString();
          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors text-sm text-[rgb(var(--color-text-base))] ${
                isSelected 
                  ? 'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] font-semibold' 
                  : isToday 
                  ? 'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))]'
                  : 'hover:bg-[rgb(var(--color-bg-subtle))]'
              }`}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  );
};