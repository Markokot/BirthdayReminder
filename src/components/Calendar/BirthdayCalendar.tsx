import React from 'react';
import { Calendar } from 'react-calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';

interface BirthdayCalendarProps {
  selectedDate: Date | null;
  hoverDate: Date | null;
  birthdayDates: Date[];
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date | null) => void;
  renderBirthdayInfo: (date: Date) => React.ReactNode;
}

export const BirthdayCalendar: React.FC<BirthdayCalendarProps> = ({
  selectedDate,
  hoverDate,
  birthdayDates,
  onDateClick,
  onDateHover,
  renderBirthdayInfo
}) => {
  const tileClassName = ({ date }: { date: Date }) => {
    const hasBirthday = birthdayDates.some(
      d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth()
    );
    const isSelected = selectedDate?.getTime() === date.getTime();
    return `cursor-pointer ${hasBirthday ? 'bg-blue-500 text-white rounded-full' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`;
  };

  return (
    <div className="relative bg-white rounded-lg shadow p-4">
      <Calendar
        locale="ru-RU"
        className="w-full"
        tileClassName={tileClassName}
        onClickDay={onDateClick}
        onMouseOver={({ activeStartDate, value, view }) => {
          if (!selectedDate) onDateHover(value);
        }}
        onMouseOut={() => !selectedDate && onDateHover(null)}
      />
      {(selectedDate && renderBirthdayInfo(selectedDate)) || 
       (hoverDate && !selectedDate && renderBirthdayInfo(hoverDate))}
    </div>
  );
};
