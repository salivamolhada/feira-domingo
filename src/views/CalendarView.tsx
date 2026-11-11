import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  ShoppingBag,
  Flame,
  CheckCircle2
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

  // Active view date for calendar navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Selected date clicked by user
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

  // Group all sales by date string (YYYY-MM-DD)
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

  // Calendar cells
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  // Selected date details
  const selectedDayData = salesByDate[selectedDateStr] || { total: 0, count: 0, sales: [] };
  const isSelectedDateSunday = isSundayDate(selectedDateStr);

  const selectedDayReceived = selectedDayData.sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const selectedDayPending = Math.max(0, selectedDayData.total - selectedDayReceived);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Calendário de Vendas & Domingos na Brasa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Visualize as vendas organizadas por dia, com destaque para os domingos de espetinhos, salgados e bebidas
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={goToNextSunday}
            className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-stone-950 font-black rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-stone-950" />
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
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Lançar Venda em {selectedDateStr.slice(8, 10)}/{selectedDateStr.slice(5, 7)}
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (2 cols), Selected Day Orders on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Calendar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          {/* Month Header / Controls */}
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
              <span className="flex items-center gap-1 font-black text-orange-950 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Coluna de Domingos
              </span>
            </div>
          </div>

          {/* Weekday Labels (Sunday is prominent!) */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-black">
            <div className="py-2 rounded-xl bg-orange-600 text-white shadow-xs">DOMINGO</div>
            <div className="py-2 text-stone-500 font-semibold">SEGUNDA</div>
            <div className="py-2 text-stone-500 font-semibold">TERÇA</div>
            <div className="py-2 text-stone-500 font-semibold">QUARTA</div>
            <div className="py-2 text-stone-500 font-semibold">QUINTA</div>
            <div className="py-2 text-stone-500 font-semibold">SEXTA</div>
            <div className="py-2 text-stone-500 font-semibold">SÁBADO</div>
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5">
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
                  className={`h-24 sm:h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/70 shadow-md'
                      : isSunday
                      ? 'bg-gradient-to-br from-orange-50/90 to-amber-50/80 border-orange-200 hover:border-orange-400 hover:shadow-xs'
                      : 'bg-white border-stone-200 hover:border-orange-300 hover:bg-stone-50/70'
                  } ${isToday && !isSelected ? 'border-2 border-dashed border-orange-400' : ''}`}
                >
                  {/* Top: Day Number & Sunday icon */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        isSunday
                          ? 'text-orange-950 bg-orange-200/80 px-1.5 py-0.5 rounded-lg'
                          : 'text-stone-700'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {isSunday && (
                      <span className="text-[10px] text-orange-700 font-black hidden sm:inline">
                        🔥 Dom
                      </span>
                    )}
                  </div>

                  {/* Middle / Bottom: Sales badges */}
                  {dayData ? (
                    <div className="space-y-1">
                      <div className="text-[10px] sm:text-xs font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md truncate">
                        {formatCurrency(dayData.total)}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold truncate">
                        {dayData.count} {dayData.count === 1 ? 'pedido' : 'pedidos'}
                      </div>
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Lançar
                      </span>
                    </div>
                  )}

                  {/* Active selection dot */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header of selected day */}
            <div className="pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                {isSelectedDateSunday ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-orange-600 text-white shadow-xs">
                    <Flame className="w-3.5 h-3.5" />
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

            {/* Quick Metrics of the Day */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <span className="text-stone-500 block">Total Faturado</span>
                <span className="text-sm font-extrabold text-stone-900">
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
                <span className="text-sm font-black">
                  {formatCurrency(selectedDayPending)}
                </span>
              </div>
            </div>

            {/* List of Orders on this day */}
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
                    className="mt-3 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1"
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
                      className="p-3 rounded-2xl border border-stone-200 hover:border-orange-300 bg-stone-50/60 hover:bg-orange-50/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-stone-900">
                          {sale.customerName}
                        </span>
                        <span className="text-xs font-black text-orange-600">
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
                          {sale.deliveryType === 'entrega' ? '🛵 Entrega' : '🛍️ Balcão'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Button to Launch on This Day */}
          <button
            type="button"
            onClick={() => onOpenSaleModalWithDate(selectedDateStr)}
            className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 hover:from-orange-700 hover:to-red-600 text-stone-950 font-black rounded-2xl text-xs shadow-md shadow-orange-950/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Lançar Venda em {selectedDateStr.slice(8, 10)}/{selectedDateStr.slice(5, 7)}
          </button>
        </div>
      </div>
    </div>
  );
};
