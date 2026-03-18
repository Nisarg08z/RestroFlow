import React from "react";
import { BadgeCheck, XCircle, Clock } from "lucide-react";

const getMockAttendance = (date, today, selectedStatus) => {
  // Reset time portions for accurate date comparison
  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Only show attendance logs for previous days and today. Future days are completely empty.
  if (checkDate > currentDate) return null;

  // Utilize the actual selected staff's current status for "today"
  const isToday = checkDate.getTime() === currentDate.getTime();
  if (isToday && selectedStatus) {
    return selectedStatus;
  }

  // We do not have historical data yet, so past dates will remain empty.
  return null;
};

const StaffCalendar = ({ selected, calendarDate = new Date() }) => {
  const getAttendancePill = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT':
        return (
          <div className="px-2 py-1.5 text-[10.5px] font-bold text-emerald-500 bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r flex items-center gap-1.5 w-full truncate shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="truncate">Present</span>
          </div>
        );
      case 'ABSENT':
        return (
          <div className="px-2 py-1.5 text-[10.5px] font-bold text-rose-500 bg-rose-500/10 border-l-2 border-rose-500 rounded-r flex items-center gap-1.5 w-full truncate shadow-sm">
            <XCircle className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="truncate">Absent</span>
          </div>
        );
      case 'HALF_DAY':
        return (
          <div className="px-2 py-1.5 text-[10.5px] font-bold text-amber-500 bg-amber-500/10 border-l-2 border-amber-500 rounded-r flex items-center gap-1.5 w-full truncate shadow-sm">
            <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span className="truncate">Half Day</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full border border-border/80 rounded-xl overflow-hidden bg-card/60 shadow-inner">
      {/* Calendar Header Column Names */}
      <div className="grid grid-cols-7 border-b border-border/80 bg-background text-[11px] font-medium text-muted-foreground/90">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="px-3 py-2 text-left truncate border-l first:border-l-0 border-border/80">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-[380px]">
        {Array.from({ length: 35 }).map((_, i) => {
          const today = new Date();
          const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
          const startDay = date.getDay();
          
          date.setDate(i - startDay + 1);
          
          const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
          const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
          
          const status = getMockAttendance(date, today, selected?.attendanceStatus);
          
          return (
            <div 
              key={i} 
              className={`p-1.5 border-b border-l first:border-l-0 border-border/80 flex flex-col gap-1 transition-colors group
                ${!isCurrentMonth ? 'bg-background opacity-40' : 'bg-transparent hover:bg-muted/10'}
                ${isToday ? 'bg-primary/5' : ''}
              `}
            >
              <div className={`text-xs px-1 pt-0.5
                ${isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-muted-foreground/80' : 'text-muted-foreground/30'}
              `}>
                {date.getDate()} {date.getDate() === 1 ? date.toLocaleString('default', { month: 'short' }) : ''}
              </div>
              
              <div className="flex-1 space-y-1 mt-1 overflow-y-auto hide-scrollbar">
                {status && getAttendancePill(status)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffCalendar;
