import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  PieChart as PieChartIcon,
  Receipt,
  FileText,
  ChevronRight,
  Flame,
  UtensilsCrossed,
  Zap
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

  // Selected month filter (default current month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Available months extracted from sales and expenses
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

  // Filter sales & expenses for selected month
  const monthSales = useMemo(() => {
    return sales.filter((s) => s.date && s.date.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Key metrics calculation
  const totalRevenue = monthSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalReceived = monthSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalPending = monthSales.reduce(
    (acc, s) => acc + Math.max(0, s.totalAmount - s.amountPaid),
    0
  );
  const totalExpensesAmount = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Profit metrics
  const netProfitRealized = totalReceived - totalExpensesAmount;
  const netProfitProjected = totalRevenue - totalExpensesAmount;
  const profitMarginPercent =
    totalRevenue > 0 ? ((netProfitProjected / totalRevenue) * 100).toFixed(1) : '0';

  // Sunday sales analysis (key requirement for Sunday vendor)
  const sundaySales = monthSales.filter((s) => isSundayDate(s.date));
  const sundayRevenue = sundaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const sundaySharePercent =
    totalRevenue > 0 ? ((sundayRevenue / totalRevenue) * 100).toFixed(0) : '0';

  // Sales by payment status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { pago: 0, pendente: 0, parcial: 0, fiado: 0 };
    monthSales.forEach((s) => {
      if (counts[s.paymentStatus] !== undefined) {
        counts[s.paymentStatus] += s.totalAmount;
      }
    });
    return counts;
  }, [monthSales]);

  // Top selling items (skewers, snacks, drinks, energy drinks)
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

  // Sales by Sunday breakdown
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

  // Last 6 months trend calculation for visual profit comparison
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {businessName ? `${businessName} • Lucros Mensais` : 'Painel de Lucros & Vendas de Domingo'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Monitore espetinhos na brasa, salgados, energéticos, custos de carnes, carvão e margem de lucro
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-bold text-stone-600">Mês de Análise:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs sm:text-sm font-extrabold px-3 py-2 bg-orange-50 border border-orange-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gerar</span> Relatório
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lucro Líquido Realizado */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-lg shadow-emerald-200/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-15 pointer-events-none">
            <TrendingUp className="w-28 h-28 text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Lucro Líquido Realizado
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/40 text-[10px] font-black uppercase text-white">
                Margem {profitMarginPercent}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
              {formatCurrency(netProfitRealized)}
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-100 font-medium mt-3 pt-3 border-t border-emerald-400/40">
              <span>Projetado com a receber:</span>
              <span className="font-bold text-white">{formatCurrency(netProfitProjected)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Faturamento Bruto */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Faturamento do Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 tracking-tight">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mt-3 pt-3 border-t border-stone-100">
            <span>Já recebido em caixa:</span>
            <span className="font-bold text-emerald-600">{formatCurrency(totalReceived)}</span>
          </div>
        </div>

        {/* Card 3: Despesas & Insumos */}
        <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Despesas & Carnes
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2 tracking-tight">
            {formatCurrency(totalExpensesAmount)}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium mt-3 pt-3 border-t border-stone-100">
            <span>{monthExpenses.length} compras de insumos</span>
            <button
              onClick={() => onNavigateToTab('despesas')}
              className="font-bold text-red-600 hover:underline flex items-center gap-0.5"
            >
              Ver compras <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Domingos de Vendas */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-stone-950 rounded-3xl p-5 shadow-lg shadow-orange-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-stone-950" />
              Vendas de Domingo
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-950/15 text-[10px] font-black uppercase text-stone-950">
              {sundaySharePercent}% do faturamento
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-950 mt-2 tracking-tight">
            {formatCurrency(sundayRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-stone-900 font-bold mt-3 pt-3 border-t border-black/15">
            <span>{sundaySales.length} pedidos no espeto</span>
            <button
              onClick={() => onNavigateToTab('calendario')}
              className="font-black text-stone-950 hover:underline flex items-center gap-0.5"
            >
              Ver Calendário <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Warning: Fiado & Pendentes */}
      {totalPending > 0 && (
        <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Atenção: Você tem {formatCurrency(totalPending)} pendente ou fiado neste mês!
              </h3>
              <p className="text-xs text-amber-800">
                Espetinhos ou bebidas entregues aguardando acerto ou envio de comprovante Pix pelo cliente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('vendas')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-colors shrink-0 shadow-xs"
          >
            Cobrar / Ver Pedidos Pendentes
          </button>
        </div>
      )}

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Lucro e Vendas Mensais */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Evolução Mensal: Faturamento, Compras e Lucro
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Comparativo de desempenho dos últimos meses
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-orange-400" />
                <span className="text-stone-600">Faturamento</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-red-400" />
                <span className="text-stone-600">Despesas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span className="text-stone-600 font-bold">Lucro</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bars */}
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
                      ? 'bg-orange-50/80 border border-orange-300'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-orange-400 hover:bg-orange-500 transition-all"
                      title={`Faturamento: ${formatCurrency(t.revenue)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-red-400 hover:bg-red-500 transition-all"
                      title={`Despesas: ${formatCurrency(t.expenses)}`}
                    />
                    {/* Profit Bar */}
                    <div
                      style={{ height: `${profHeight}px` }}
                      className="w-3 sm:w-4 rounded-t-lg bg-emerald-500 hover:bg-emerald-600 transition-all shadow-xs"
                      title={`Lucro: ${formatCurrency(t.profit)}`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 ${
                      isCurrent ? 'text-orange-600 font-black' : 'text-stone-500'
                    }`}
                  >
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="bg-orange-50/60 p-2.5 rounded-2xl border border-orange-100">
              <span className="text-stone-500 block">Faturamento {getMonthLabel(selectedMonth)}</span>
              <span className="text-sm font-extrabold text-orange-700">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="bg-red-50/60 p-2.5 rounded-2xl border border-red-100">
              <span className="text-stone-500 block">Despesas {getMonthLabel(selectedMonth)}</span>
              <span className="text-sm font-extrabold text-red-700">
                {formatCurrency(totalExpensesAmount)}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100">
              <span className="text-stone-500 block">Lucro Líquido Real</span>
              <span className="text-sm font-extrabold text-emerald-700">
                {formatCurrency(netProfitRealized)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Status de Pagamento & Domingos */}
        <div className="space-y-6">
          {/* Card: Status de Pagamento */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-orange-500" />
                Status dos Pagamentos
              </h3>
              <span className="text-xs font-bold text-stone-500">
                {monthSales.length} pedidos
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Pago */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Pagos (100%)
                  </span>
                  <span className="font-extrabold text-stone-800">
                    {formatCurrency(statusCounts.pago || 0)}
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? ((statusCounts.pago || 0) / totalRevenue) * 100 : 0}%`,
                    }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* Pendente */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pendentes
                  </span>
                  <span className="font-extrabold text-stone-800">
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

              {/* Parcial */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Parcialmente Pagos
                  </span>
                  <span className="font-extrabold text-stone-800">
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

              {/* Fiado */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-purple-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Fiado / A Receber
                  </span>
                  <span className="font-extrabold text-stone-800">
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
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance por Domingo no mês */}
          <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 rounded-3xl p-5 border border-orange-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-orange-950 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" />
                Vendas por Domingo
              </h3>
              <span className="text-xs font-bold text-orange-800">
                {sundayBreakdown.length} domingos
              </span>
            </div>

            {sundayBreakdown.length === 0 ? (
              <p className="text-xs text-orange-900/80 py-2">
                Nenhuma venda de domingo registrada para este mês ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {sundayBreakdown.map((item) => (
                  <div
                    key={item.date}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-orange-200 shadow-2xs text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-stone-800">
                        Domingo {item.date.slice(8, 10)}/{item.date.slice(5, 7)}
                      </span>
                      <span className="text-stone-500 ml-2">({item.orderCount} pedidos)</span>
                    </div>
                    <span className="font-black text-orange-700">
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
        {/* Top Selling Skewers & Drinks */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              Mais Vendidos do Mês (Espetos, Salgados & Bebidas)
            </h3>
            <button
              onClick={() => onNavigateToTab('produtos')}
              className="text-xs font-bold text-orange-600 hover:underline"
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
                          ? 'bg-stone-300 text-stone-800'
                          : 'bg-stone-200 text-stone-700'
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
                  <span className="text-xs font-extrabold text-orange-600">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad for Sunday BBQ & Snacks */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-orange-950 rounded-3xl p-6 text-white shadow-xl shadow-stone-950/30 flex flex-col justify-between border border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Churrasqueira & Bar no Domingo
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Pronto para o próximo domingo na brasa?
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-md">
              Lance os pedidos antecipados de espetinhos, fardos de energéticos e refrigerantes, registre compras de carnes no atacado e monitore o lucro do dia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={onOpenSaleModal}
              className="py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 hover:opacity-95 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              Lançar Venda
            </button>

            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="py-3 px-4 bg-stone-800/80 hover:bg-stone-800 text-stone-200 rounded-2xl text-xs font-bold border border-stone-700 flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
            >
              <Receipt className="w-4 h-4 text-red-400" />
              Lançar Despesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
