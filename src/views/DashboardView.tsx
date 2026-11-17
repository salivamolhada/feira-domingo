import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  PieChart as PieChartIcon,
  Receipt,
  FileText,
  ChevronRight,
  Flame,
  UtensilsCrossed,
  TreePine
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatCurrency, getMonthLabel, isSundayDate } from '../utils/dateUtils';

interface DashboardViewProps {
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenSaleModal,
  onOpenExpenseModal,
  onNavigateToTab,
}) => {
  const { sales, expenses, businessName } = useData();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const now = new Date();
    monthSet.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

    sales.forEach((s) => {
      if (s.date) monthSet.add(s.date.slice(0, 7));
    });
    expenses.forEach((e) => {
      if (e.date) monthSet.add(e.date.slice(0, 7));
    });

    return Array.from(monthSet).sort().reverse();
  }, [sales, expenses]);

  const monthSales = useMemo(() => {
    return sales.filter((s) => s.date && s.date.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const totalRevenue = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalReceived = monthSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalPending = monthSales.reduce(
    (acc, s) => acc + Math.max(0, s.totalAmount - s.amountPaid),
    0
  );
  const totalExpensesAmount = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  const netProfitRealized = totalReceived - totalExpensesAmount;
  const netProfitProjected = totalRevenue - totalExpensesAmount;
  const profitMarginPercent =
    totalRevenue > 0 ? ((netProfitProjected / totalRevenue) * 100).toFixed(1) : '0';

  const sundaySales = monthSales.filter((s) => isSundayDate(s.date));
  const sundayRevenue = sundaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const sundaySharePercent =
    totalRevenue > 0 ? ((sundayRevenue / totalRevenue) * 100).toFixed(0) : '0';

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pago: 0, pendente: 0, parcial: 0, fiado: 0 };
    monthSales.forEach((s) => {
      if (counts[s.paymentStatus] !== undefined) {
        counts[s.paymentStatus] += s.totalAmount;
      }
    });
    return counts;
  }, [monthSales]);

  const topItems = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    monthSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        map[item.name].quantity += item.quantity;
        map[item.name].revenue += item.totalPrice;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [monthSales]);

  const sundayBreakdown = useMemo(() => {
    const sundaysMap: Record<string, { date: string; revenue: number; orderCount: number }> = {};
    sundaySales.forEach((s) => {
      if (!sundaysMap[s.date]) {
        sundaysMap[s.date] = { date: s.date, revenue: 0, orderCount: 0 };
      }
      sundaysMap[s.date].revenue += s.totalAmount;
      sundaysMap[s.date].orderCount += 1;
    });
    return Object.values(sundaysMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [sundaySales]);

  const monthTrends = useMemo(() => {
    const months = availableMonths.slice(0, 6).reverse();
    return months.map((m) => {
      const rev = sales
        .filter((s) => s.date && s.date.startsWith(m))
        .reduce((sum, s) => sum + s.totalAmount, 0);
      const exp = expenses
        .filter((e) => e.date && e.date.startsWith(m))
        .reduce((sum, e) => sum + e.amount, 0);
      const prof = rev - exp;
      return {
        month: m,
        label: m.slice(5, 7) + '/' + m.slice(2, 4),
        revenue: rev,
        expenses: exp,
        profit: prof,
      };
    });
  }, [sales, expenses, availableMonths]);

  const maxTrendValue = Math.max(
    1,
    ...monthTrends.map((t) => Math.max(t.revenue, t.expenses, t.profit))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-emerald-950/15 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {businessName ? `${businessName} • Lucros Mensais` : 'Painel de Lucros & Vendas de Domingo'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Monitore espetinhos na brasa, salgados, energéticos, custos de carnes, carvão e margem de lucro
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <label className="text-xs font-bold text-stone-600">Mês de Análise:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs sm:text-sm font-extrabold px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {getMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onNavigateToTab('relatorio')}
            className="px-3.5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Gerar Relatório</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lucro Líquido Realizado */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15 pointer-events-none">
            <TrendingUp className="w-28 h-28 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Lucro Líquido Realizado
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap shrink-0 ${
                  netProfitProjected < 0
                    ? 'bg-red-500/80 text-white'
                    : 'bg-amber-400/25 text-amber-200 border border-amber-300/30'
                }`}
              >
                Margem {profitMarginPercent}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono-num mt-2 tracking-tight">
              {formatCurrency(netProfitRealized)}
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium mt-3 pt-3 border-t border-emerald-400/30">
              <span>Projetado com a receber:</span>
              <span className="font-bold font-mono-num text-white">{formatCurrency(netProfitProjected)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Faturamento Bruto */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-emerald-950/15 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Faturamento do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-stone-900 mt-2 tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mt-3 pt-3 border-t border-stone-100">
            <span>Já recebido em caixa:</span>
            <span className="font-bold font-mono-num text-emerald-700">{formatCurrency(totalReceived)}</span>
          </div>
        </div>

        {/* Card 3: Despesas & Insumos */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-red-200/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Despesas & Carnes
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-red-600 mt-2 tracking-tight">
            {formatCurrency(totalExpensesAmount)}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mt-3 pt-3 border-t border-stone-100">
            <span>{monthExpenses.length} compras de insumos</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('despesas')}
              className="font-bold text-red-600 hover:underline flex items-center gap-0.5"
            >
              Ver compras <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Domingos de Vendas */}
        <div className="bg-gradient-to-br from-red-700 via-red-600 to-amber-600 text-white rounded-3xl p-5 shadow-xl border border-amber-300/30 relative overflow-hidden">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              Vendas de Domingo
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/25 text-[10px] font-black uppercase text-amber-200 whitespace-nowrap shrink-0">
              {sundaySharePercent}% do total
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono-num text-white mt-2 tracking-tight">
            {formatCurrency(sundayRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-amber-100 font-bold mt-3 pt-3 border-t border-white/20">
            <span>{sundaySales.length} pedidos no espeto</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('calendario')}
              className="font-black text-white hover:underline flex items-center gap-0.5"
            >
              Ver Calendário <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Warning: Fiado & Pendentes */}
      {totalPending > 0 && (
        <div className="bg-amber-50/95 backdrop-blur-md rounded-2xl p-4 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Atenção: Você tem <span className="font-mono-num">{formatCurrency(totalPending)}</span> pendente ou fiado neste mês!
              </h3>
              <p className="text-xs text-amber-900">
                Espetinhos ou bebidas entregues aguardando acerto ou envio de comprovante Pix pelo cliente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('vendas')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-colors shrink-0 shadow-xs"
          >
            Cobrar / Ver Pedidos Pendentes
          </button>
        </div>
      )}

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Lucro e Vendas Mensais */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-emerald-950/15 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Evolução Mensal: Faturamento, Compras e Lucro
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Comparativo de desempenho dos últimos meses
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span className="text-stone-600">Faturamento</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-red-500" />
                <span className="text-stone-600">Despesas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-emerald-600" />
                <span className="text-stone-600 font-bold">Lucro</span>
              </div>
            </div>
          </div>

          {/* Visual Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-stone-100">
            {monthTrends.map((t) => {
              const revHeight = Math.max(8, (t.revenue / maxTrendValue) * 190);
              const expHeight = Math.max(8, (t.expenses / maxTrendValue) * 190);
              const profHeight = Math.max(8, (Math.max(0, t.profit) / maxTrendValue) * 190);
              const isCurrent = t.month === selectedMonth;

              return (
                <div
                  key={t.month}
                  onClick={() => setSelectedMonth(t.month)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer p-1.5 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/90 border border-emerald-300'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    <div
                      style={{ height: `${revHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-amber-400 hover:bg-amber-500 transition-all"
                      title={`Faturamento: ${formatCurrency(t.revenue)}`}
                    />
                    <div
                      style={{ height: `${expHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-red-500 hover:bg-red-600 transition-all"
                      title={`Despesas: ${formatCurrency(t.expenses)}`}
                    />
                    <div
                      style={{ height: `${profHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
                      title={`Lucro: ${formatCurrency(t.profit)}`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 ${
                      isCurrent ? 'text-emerald-800 font-black' : 'text-stone-500'
                    }`}
                  >
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200">
              <span className="text-stone-500 block">Faturamento {getMonthLabel(selectedMonth)}</span>
              <span className="text-sm font-extrabold font-mono-num text-amber-800">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="bg-red-50/80 p-2.5 rounded-2xl border border-red-200">
              <span className="text-stone-500 block">Despesas {getMonthLabel(selectedMonth)}</span>
              <span className="text-sm font-extrabold font-mono-num text-red-700">
                {formatCurrency(totalExpensesAmount)}
              </span>
            </div>
            <div className="bg-emerald-50/80 p-2.5 rounded-2xl border border-emerald-200">
              <span className="text-stone-500 block">Lucro Líquido Real</span>
              <span className={`text-sm font-extrabold font-mono-num ${netProfitRealized < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {formatCurrency(netProfitRealized)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Status de Pagamento & Domingos */}
        <div className="space-y-6">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-emerald-950/15 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-red-600" />
                Status dos Pagamentos
              </h3>
              <span className="text-xs font-bold text-stone-500">
                {monthSales.length} pedidos
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Pagos (100%)
                  </span>
                  <span className="font-extrabold font-mono-num text-stone-800">
                    {formatCurrency(statusCounts.pago || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? ((statusCounts.pago || 0) / totalRevenue) * 100 : 0}%`,
                    }}
                    className="h-full bg-emerald-600 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pendentes
                  </span>
                  <span className="font-extrabold font-mono-num text-stone-800">
                    {formatCurrency(statusCounts.pendente || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        totalRevenue > 0 ? ((statusCounts.pendente || 0) / totalRevenue) * 100 : 0
                      }%`,
                    }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Parcialmente Pagos
                  </span>
                  <span className="font-extrabold font-mono-num text-stone-800">
                    {formatCurrency(statusCounts.parcial || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        totalRevenue > 0 ? ((statusCounts.parcial || 0) / totalRevenue) * 100 : 0
                      }%`,
                    }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-red-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Fiado / A Receber
                  </span>
                  <span className="font-extrabold font-mono-num text-stone-800">
                    {formatCurrency(statusCounts.fiado || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${
                        totalRevenue > 0 ? ((statusCounts.fiado || 0) / totalRevenue) * 100 : 0
                      }%`,
                    }}
                    className="h-full bg-red-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance por Domingo no mês */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-red-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-red-950 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                Vendas por Domingo
              </h3>
              <span className="text-xs font-bold text-red-700">
                {sundayBreakdown.length} domingos
              </span>
            </div>

            {sundayBreakdown.length === 0 ? (
              <p className="text-xs text-stone-500 py-2">
                Nenhuma venda de domingo registrada para este mês ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {sundayBreakdown.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between p-2.5 bg-red-50/60 rounded-xl border border-red-200/70 shadow-2xs text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-stone-800">
                        Domingo {item.date.slice(8, 10)}/{item.date.slice(5, 7)}
                      </span>
                      <span className="text-stone-500 ml-2">({item.orderCount} pedidos)</span>
                    </div>
                    <span className="font-black font-mono-num text-red-700">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Items & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-emerald-950/15 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-red-600" />
              Mais Vendidos do Mês (Espetos, Salgados & Bebidas)
            </h3>
            <button
              type="button"
              onClick={() => onNavigateToTab('produtos')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Ver Cardápio
            </button>
          </div>

          {topItems.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              Nenhuma venda registrada neste mês para ranquear os itens.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        index === 0
                          ? 'bg-amber-400 text-stone-900'
                          : index === 1
                          ? 'bg-emerald-700 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-stone-800">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.quantity} {item.quantity === 1 ? 'saída' : 'saídas'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold font-mono-num text-emerald-700">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad for Sunday BBQ & Christmas Season */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-red-950 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between border border-amber-400/30">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-amber-200 border border-amber-400/40 text-xs font-extrabold uppercase tracking-wider mb-3">
              <TreePine className="w-3.5 h-3.5 text-amber-300" />
              Churrasqueira & Bar Especial de Natal
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Pronto para o próximo domingo na brasa?
            </h3>
            <p className="text-xs text-emerald-100/85 mt-1 max-w-md">
              Lance os pedidos antecipados de espetinhos, fardos de energéticos e refrigerantes, registre compras de carnes no atacado e monitore o lucro do dia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onOpenSaleModal}
              className="py-3 px-4 bg-gradient-to-r from-red-600 to-amber-500 text-white hover:opacity-95 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              Lançar Venda
            </button>

            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="py-3 px-4 bg-emerald-900/90 hover:bg-emerald-800 text-emerald-50 rounded-2xl text-xs font-bold border border-emerald-700 flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <Receipt className="w-4 h-4 text-amber-300" />
              Lançar Despesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
