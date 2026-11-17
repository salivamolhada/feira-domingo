import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBag,
  Flame,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  formatToDateInput,
  formatFullDate,
  formatCurrency,
  isSundayDate,
  getNearestSunday
} from '../utils/dateUtils';
import { Sale } from '../types';

interface CalendarViewProps {
  onOpenSaleModalWithDate: (date: string) => void;
  onEditSale: (sale: Sale) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenSaleModalWithDate,
  onEditSale,
}) => {
  const { sales } = useData();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() =>
    formatToDateInput(new Date())
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatToDateInput(today));
  };
  const goToNextSunday = () => {
    const nextSunStr = getNearestSunday(new Date(), 'next');
    const [y, m, d] = nextSunStr.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, d));
    setSelectedDateStr(nextSunStr);
  };

  const monthLabel = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const salesByDate = useMemo(() => {
    const map: Record<string, { total: number; count: number; sales: Sale[] }> = {};
    sales.forEach((s) => {
      if (!map[s.date]) {
        map[s.date] = { total: 0, count: 0, sales: [] };
      }
      map[s.date].total += s.totalAmount;
      map[s.date].count += 1;
      map[s.date].sales.push(s);
    });
    return map;
  }, [sales]);

  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const selectedDayData = salesByDate[selectedDateStr] || { total: 0, count: 0, sales: [] };
  const isSelectedDateSunday = isSundayDate(selectedDateStr);

  const selectedDayReceived = selectedDayData.sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const selectedDayPending = Math.max(0, selectedDayData.total - selectedDayReceived);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-emerald-950/15 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Calendário de Vendas & Domingos na Brasa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Visualize as vendas organizadas por dia, com destaque para os domingos de espetinhos, salgados e bebidas
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={goToNextSunday}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Flame className="w-3.5 h-3.5 text-amber-200" />
            Próximo Domingo
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => onOpenSaleModalWithDate(selectedDateStr)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Lançar Venda em {selectedDateStr.slice(8, 10)}/{selectedDateStr.slice(5, 7)}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Calendar */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-950/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base sm:text-lg font-black text-stone-900 capitalize">
                {monthLabel}
              </h2>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-black text-red-900 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                Coluna de Domingos
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[11px] sm:text-xs font-black">
            <div className="py-2 rounded-xl bg-red-600 text-white shadow-xs">
              <span className="hidden md:inline">DOMINGO</span>
              <span className="md:hidden">DOM</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">SEGUNDA</span>
              <span className="md:hidden">SEG</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">TERÇA</span>
              <span className="md:hidden">TER</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">QUARTA</span>
              <span className="md:hidden">QUA</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">QUINTA</span>
              <span className="md:hidden">QUI</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">SEXTA</span>
              <span className="md:hidden">SEX</span>
            </div>
            <div className="py-2 text-stone-500 font-semibold">
              <span className="hidden md:inline">SÁBADO</span>
              <span className="md:hidden">SÁB</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {cells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-stone-50/50" />;
              }

              const cellDate = new Date(year, month, dayNum);
              const dateStr = formatToDateInput(cellDate);
              const isSunday = cellDate.getDay() === 0;
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === formatToDateInput(new Date());
              const dayData = salesByDate[dateStr];

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-24 sm:h-28 p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group min-w-0 ${
                    isSelected
                      ? 'ring-2 ring-red-600 border-red-600 bg-red-50/70 shadow-md'
                      : isSunday
                      ? 'bg-gradient-to-br from-red-50/85 to-amber-50/75 border-red-200 hover:border-red-400 hover:shadow-xs'
                      : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50/70'
                  } ${isToday && !isSelected ? 'border-2 border-dashed border-amber-500' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        isSunday
                          ? 'text-red-900 bg-red-200/75 px-1.5 py-0.5 rounded-lg'
                          : 'text-stone-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {isSunday && (
                        <span className="text-[10px] text-red-700 font-black hidden sm:inline">
                          Dom
                        </span>
                      )}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                      )}
                    </div>
                  </div>

                  {dayData ? (
                    <div className="space-y-1 min-w-0">
                      <div className="text-[10px] sm:text-xs font-black font-mono-num text-emerald-800 bg-emerald-100/90 px-1 sm:px-1.5 py-0.5 rounded-md truncate">
                        {formatCurrency(dayData.total)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold truncate">
                        {dayData.count} {dayData.count === 1 ? 'pedido' : 'pedidos'}
                      </div>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Lançar
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-emerald-950/15 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                {isSelectedDateSunday ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-red-600 text-white shadow-xs">
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    DOMINGO DE ESPETOS
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                    Dia Útil
                  </span>
                )}
                <span className="text-xs font-bold text-stone-400">
                  {selectedDayData.count} pedidos
                </span>
              </div>

              <h3 className="text-base font-extrabold text-stone-900 mt-2">
                {formatFullDate(selectedDateStr)}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Total Faturado</span>
                <span className="text-sm font-extrabold font-mono-num text-stone-900">
                  {formatCurrency(selectedDayData.total)}
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  selectedDayPending > 0
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="block font-medium">A Receber / Fiado</span>
                <span className="text-sm font-black font-mono-num">
                  {formatCurrency(selectedDayPending)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Pedidos deste dia
                </span>
              </div>

              {selectedDayData.sales.length === 0 ? (
                <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-600">
                    Nenhum lançamento para este dia.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenSaleModalWithDate(selectedDateStr)}
                    className="mt-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Venda
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedDayData.sales.map((sale) => (
                    <div
                      key={sale.id}
                      onClick={() => onEditSale(sale)}
                      className="p-3 rounded-2xl border border-stone-200 hover:border-red-300 bg-stone-50/60 hover:bg-red-50/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-stone-900">
                          {sale.customerName}
                        </span>
                        <span className="text-xs font-black font-mono-num text-emerald-700">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600 truncate">
                        {sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full ${
                            sale.paymentStatus === 'pago'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.paymentStatus === 'parcial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sale.paymentStatus.toUpperCase()} ({sale.paymentMethod.toUpperCase()})
                        </span>

                        <span className="text-stone-400 font-medium">
                          {sale.deliveryType === 'entrega' ? 'Entrega' : 'Balcão'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenSaleModalWithDate(selectedDateStr)}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black rounded-2xl text-xs shadow-md shadow-red-950/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Lançar Venda em {selectedDateStr.slice(8, 10)}/{selectedDateStr.slice(5, 7)}
          </button>
        </div>
      </div>
    </div>
  );
};
