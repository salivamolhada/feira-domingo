import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import {
  parseLocalDate,
  formatToDateInput,
  isSundayDate,
  getNearestSunday
} from '../utils/dateUtils';
import { Sale } from '../types';

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  sales?: Sale[];
  className?: string;
  label?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  sales = [],
  className = '',
  label = 'Data do Lançamento',
}) => {
  const [currentViewDate, setCurrentViewDate] = useState<Date>(() => {
    return value ? parseLocalDate(value) : new Date();
  });

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const prevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  const monthName = currentViewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const nextSunday = getNearestSunday(new Date(), 'next');
  const lastSunday = getNearestSunday(new Date(), 'last');
  const todayStr = formatToDateInput(new Date());

  const isCurrentSelectionSunday = isSundayDate(value);

  const salesCountByDate = React.useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      map[s.date] = (map[s.date] || 0) + 1;
    });
    return map;
  }, [sales]);

  return (
    <div className={`bg-white rounded-2xl border border-emerald-200 p-4 shadow-sm ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <label className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-red-600" />
            {label}
          </label>
          {isCurrentSelectionSunday ? (
            <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full bg-red-100 text-red-900 border border-red-200">
              <Sparkles className="w-3 h-3 text-red-600" />
              Domingo de Espetos & Bebidas
            </span>
          ) : (
            <span className="text-xs text-stone-500 font-medium">Dia de semana</span>
          )}
        </div>
      )}

      {/* Quick shortcuts */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          type="button"
          onClick={() => onChange(nextSunday)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
            value === nextSunday
              ? 'bg-red-600 text-white border-red-700 shadow-sm font-bold'
              : 'bg-red-50/80 text-red-900 border-red-200 hover:bg-red-100'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${value === nextSunday ? 'text-amber-200' : 'text-red-700'}`}>
            Próximo
          </span>
          <span>Domingo ({nextSunday.slice(8, 10)}/{nextSunday.slice(5, 7)})</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(todayStr)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
            value === todayStr
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm font-bold'
              : 'bg-stone-100 text-stone-900 border-stone-200 hover:bg-stone-200'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${value === todayStr ? 'text-emerald-200' : 'text-stone-500'}`}>Hoje</span>
          <span>{todayStr.slice(8, 10)}/{todayStr.slice(5, 7)}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(lastSunday)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center ${
            value === lastSunday
              ? 'bg-red-600 text-white border-red-700 shadow-sm font-bold'
              : 'bg-red-50/80 text-red-900 border-red-200 hover:bg-red-100'
          }`}
        >
          <span className={`text-[10px] uppercase font-bold tracking-wider ${value === lastSunday ? 'text-amber-200' : 'text-red-700'}`}>
            Último
          </span>
          <span>Domingo ({lastSunday.slice(8, 10)}/{lastSunday.slice(5, 7)})</span>
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          title="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-bold text-stone-800 capitalize">{monthName}</span>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          title="Próximo mês"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-1">
        <div className="text-red-700 font-black bg-red-100/80 rounded py-0.5">DOM</div>
        <div className="text-stone-500 py-0.5">SEG</div>
        <div className="text-stone-500 py-0.5">TER</div>
        <div className="text-stone-500 py-0.5">QUA</div>
        <div className="text-stone-500 py-0.5">QUI</div>
        <div className="text-stone-500 py-0.5">SEX</div>
        <div className="text-stone-500 py-0.5">SÁB</div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          const cellDate = new Date(year, month, dayNum);
          const cellDateStr = formatToDateInput(cellDate);
          const isSunday = cellDate.getDay() === 0;
          const isSelected = cellDateStr === value;
          const isToday = cellDateStr === todayStr;
          const ordersOnDay = salesCountByDate[cellDateStr] || 0;

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => onChange(cellDateStr)}
              className={`h-10 w-full rounded-xl text-xs font-semibold relative transition-all flex flex-col items-center justify-center overflow-hidden ${
                isSelected
                  ? isSunday
                    ? 'bg-red-600 text-white shadow-md font-black ring-2 ring-amber-300'
                    : 'bg-emerald-800 text-white shadow-md font-black ring-2 ring-emerald-300'
                  : isSunday
                  ? 'bg-red-50 text-red-950 font-bold border border-red-200 hover:bg-red-100'
                  : 'text-stone-700 hover:bg-stone-100'
              } ${isToday && !isSelected ? 'border-2 border-dashed border-amber-500' : ''}`}
            >
              <span>{dayNum}</span>
              {ordersOnDay > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 text-[9px] px-1 rounded-full font-black leading-tight ${
                    isSelected ? 'bg-amber-400 text-stone-950' : 'bg-emerald-700 text-white'
                  }`}
                >
                  {ordersOnDay}
                </span>
              )}
              {isSunday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-red-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Native input fallback */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <span className="font-medium">Data selecionada:</span>
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs font-bold px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};
