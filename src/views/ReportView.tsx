import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Download,
  CheckCircle2,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Sparkles,
  ShoppingBag,
  Share2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import {
  formatCurrency,
  getMonthLabel,
  formatFriendlyDate,
  isSundayDate,
  formatFullDate
} from '../utils/dateUtils';

export const ReportView: React.FC = () => {
  const { sales, expenses } = useData();

  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

    sales.forEach((s) => {
      if (s.date) set.add(s.date.slice(0, 7));
    });
    expenses.forEach((e) => {
      if (e.date) set.add(e.date.slice(0, 7));
    });

    return Array.from(set).sort().reverse();
  }, [sales, expenses]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  // Month data
  const monthSales = useMemo(() => {
    return sales
      .filter((s) => s.date && s.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [sales, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date && e.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses, selectedMonth]);

  // Financial calculations
  const totalRevenue = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceived = monthSales.reduce((sum, s) => sum + s.amountPaid, 0);
  const totalPending = Math.max(0, totalRevenue - totalReceived);
  const totalExpensesAmount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfitRealized = totalReceived - totalExpensesAmount;
  const netProfitProjected = totalRevenue - totalExpensesAmount;
  const profitMargin =
    totalRevenue > 0 ? ((netProfitProjected / totalRevenue) * 100).toFixed(1) : '0';
  const averageTicket =
    monthSales.length > 0 ? (totalRevenue / monthSales.length) : 0;

  // Sunday sales
  const sundaySales = monthSales.filter((s) => isSundayDate(s.date));
  const sundayRevenue = sundaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const sundayShare = totalRevenue > 0 ? ((sundayRevenue / totalRevenue) * 100).toFixed(0) : '0';

  // Sundays breakdown
  const sundayGroups = useMemo(() => {
    const map: Record<string, { date: string; total: number; count: number; sweets: string[] }> = {};
    sundaySales.forEach((s) => {
      if (!map[s.date]) {
        map[s.date] = { date: s.date, total: 0, count: 0, sweets: [] };
      }
      map[s.date].total += s.totalAmount;
      map[s.date].count += 1;
      s.items.forEach((i) => {
        if (!map[s.date].sweets.includes(i.name)) {
          map[s.date].sweets.push(i.name);
        }
      });
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [sundaySales]);

  // Expenses by Category
  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthExpenses]);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp formatted text summary
  const generateWhatsAppSummary = () => {
    const monthName = getMonthLabel(selectedMonth);
    let text = `📊 *FECHAMENTO MENSAL - CONFEITARIA*\n`;
    text += `🗓️ *Mês de Referência:* ${monthName}\n\n`;
    text += `💰 *FATURAMENTO BRUTO:* ${formatCurrency(totalRevenue)}\n`;
    text += `✅ *Total Recebido em Caixa:* ${formatCurrency(totalReceived)}\n`;
    text += `⏳ *Total a Receber / Fiado:* ${formatCurrency(totalPending)}\n`;
    text += `🧾 *Despesas com Insumos:* ${formatCurrency(totalExpensesAmount)}\n`;
    text += `--------------------------------\n`;
    text += `🏆 *LUCRO LÍQUIDO REALIZADO:* ${formatCurrency(netProfitRealized)}\n`;
    text += `📈 *Margem de Lucro:* ${profitMargin}%\n`;
    text += `⭐ *Vendas de Domingo:* ${formatCurrency(sundayRevenue)} (${sundayShare}% do total)\n`;
    text += `📦 *Total de Pedidos:* ${monthSales.length} | *Ticket Médio:* ${formatCurrency(averageTicket)}\n\n`;
    text += `_Relatório gerado automaticamente pelo DoceGestão_`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `RELATÓRIO MENSAL DE VENDAS E DESPESAS - ${getMonthLabel(selectedMonth)}\n\n`;
    csv += `RESUMO FINANCEIRO\n`;
    csv += `Faturamento Bruto;${formatCurrency(totalRevenue)}\n`;
    csv += `Recebido;${formatCurrency(totalReceived)}\n`;
    csv += `A Receber / Fiado;${formatCurrency(totalPending)}\n`;
    csv += `Total Despesas;${formatCurrency(totalExpensesAmount)}\n`;
    csv += `Lucro Líquido Realizado;${formatCurrency(netProfitRealized)}\n`;
    csv += `Margem de Lucro;${profitMargin}%\n\n`;

    csv += `VENDAS DO MÊS\n`;
    csv += `Data;Cliente;Telefone;Itens;Total;Valor Pago;Status;Forma\n`;
    monthSales.forEach((s) => {
      const itemsStr = s.items.map((i) => `${i.quantity}x ${i.name}`).join(' + ');
      csv += `"${s.date}";"${s.customerName}";"${s.customerPhone || ''}";"${itemsStr}";"${s.totalAmount}";"${s.amountPaid}";"${s.paymentStatus}";"${s.paymentMethod}"\n`;
    });

    csv += `\nDESPESAS DO MÊS\n`;
    csv += `Data;Descrição;Categoria;Valor;Forma de Pagamento\n`;
    monthExpenses.forEach((e) => {
      csv += `"${e.date}";"${e.description}";"${e.category}";"${e.amount}";"${e.paymentMethod}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-confeitaria-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Non-printable Control Header */}
      <div className="print:hidden bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📈</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Relatório de Fechamento Mensal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Gere o balanço completo de vendas, despesas e lucro para controle financeiro
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Month selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs sm:text-sm font-extrabold px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-stone-800"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {getMonthLabel(m)}
              </option>
            ))}
          </select>

          {/* Copy WhatsApp */}
          <button
            type="button"
            onClick={generateWhatsAppSummary}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            title="Copiar resumo para enviar no WhatsApp"
          >
            {copiedToast ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copiedToast ? 'Copiado!' : 'Copiar Resumo'}
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Exportar planilha CSV"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-rose-200 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-stone-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-rose-600">
              DoceGestão - Confeitaria Artesanal
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              Relatório Financeiro Mensal
            </h2>
            <p className="text-sm font-semibold text-stone-600 mt-0.5">
              Mês de Referência: <span className="font-extrabold text-stone-900">{getMonthLabel(selectedMonth)}</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-stone-500 space-y-1">
            <p>Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="font-semibold text-stone-700">Controle de Vendas de Doces & Despesas</p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase block">Faturamento Bruto</span>
            <span className="text-xl font-black text-stone-900 mt-1 block">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-[10px] text-stone-400 font-medium">{monthSales.length} pedidos no mês</span>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
            <span className="text-[11px] font-bold text-red-700 uppercase block">Total de Despesas</span>
            <span className="text-xl font-black text-red-600 mt-1 block">
              {formatCurrency(totalExpensesAmount)}
            </span>
            <span className="text-[10px] text-red-500 font-medium">{monthExpenses.length} compras de insumos</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Lucro Líquido Real</span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {formatCurrency(netProfitRealized)}
            </span>
            <span className="text-[10px] text-emerald-600 font-extrabold">{profitMargin}% margem de lucro</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Vendas de Domingo</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">
              {formatCurrency(sundayRevenue)}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">{sundayShare}% do faturamento</span>
          </div>
        </div>

        {/* Detailed Breakdown: Recebido vs Pendente */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50/80 border border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 block">Total Efetivamente Recebido (Caixa):</span>
            <span className="text-base font-extrabold text-emerald-700">{formatCurrency(totalReceived)}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Total em Aberto / Fiado a Receber:</span>
            <span className="text-base font-extrabold text-amber-700">{formatCurrency(totalPending)}</span>
          </div>
          <div>
            <span className="text-stone-500 block">Ticket Médio por Venda:</span>
            <span className="text-base font-extrabold text-stone-900">{formatCurrency(averageTicket)}</span>
          </div>
        </div>

        {/* Sunday Performance Table */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Desempenho dos Domingos no Mês
          </h3>

          {sundayGroups.length === 0 ? (
            <p className="text-xs text-stone-500 italic">Nenhuma venda aos domingos registrada neste mês.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200">
                  <tr>
                    <th className="p-3">Data do Domingo</th>
                    <th className="p-3">Qtd. Pedidos</th>
                    <th className="p-3">Doces Vendidos</th>
                    <th className="p-3 text-right">Faturamento Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {sundayGroups.map((sun) => (
                    <tr key={sun.date} className="hover:bg-stone-50/80">
                      <td className="p-3 font-extrabold text-stone-900">
                        Domingo, {sun.date.slice(8, 10)}/{sun.date.slice(5, 7)}
                      </td>
                      <td className="p-3 text-stone-700">{sun.count} pedidos</td>
                      <td className="p-3 text-stone-600 truncate max-w-xs">{sun.sweets.slice(0, 3).join(', ')}</td>
                      <td className="p-3 text-right font-black text-amber-900">{formatCurrency(sun.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
            <Receipt className="w-4 h-4 text-red-500" />
            Despesas e Insumos por Categoria
          </h3>

          {expenseCategories.length === 0 ? (
            <p className="text-xs text-stone-500 italic">Nenhuma despesa cadastrada neste mês.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {expenseCategories.map(([cat, amount]) => (
                <div key={cat} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                  <span className="text-stone-500 capitalize block">{cat}</span>
                  <span className="text-sm font-black text-stone-900 mt-0.5 block">{formatCurrency(amount)}</span>
                  <span className="text-[10px] text-stone-400 font-semibold">
                    {totalExpensesAmount > 0 ? ((amount / totalExpensesAmount) * 100).toFixed(0) : 0}% dos custos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Sales Table of the Month */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-2">
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            Extrato Detalhado de Vendas ({monthSales.length} pedidos)
          </h3>

          {monthSales.length === 0 ? (
            <p className="text-xs text-stone-500 italic">Nenhuma venda registrada para este mês.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-2.5">Data</th>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5">Doces do Pedido</th>
                    <th className="p-2.5">Status Pgto.</th>
                    <th className="p-2.5">Forma</th>
                    <th className="p-2.5 text-right">Valor Total</th>
                    <th className="p-2.5 text-right">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {monthSales.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-bold text-stone-800 whitespace-nowrap">
                        {s.date.slice(8, 10)}/{s.date.slice(5, 7)} {isSundayDate(s.date) ? '⭐' : ''}
                      </td>
                      <td className="p-2.5 font-semibold text-stone-900 whitespace-nowrap">{s.customerName}</td>
                      <td className="p-2.5 text-stone-600 max-w-xs truncate">
                        {s.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            s.paymentStatus === 'pago'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.paymentStatus === 'parcial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="p-2.5 text-stone-600 uppercase font-semibold">{s.paymentMethod}</td>
                      <td className="p-2.5 text-right font-black text-stone-900">{formatCurrency(s.totalAmount)}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{formatCurrency(s.amountPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Signature Box for Print */}
        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>Relatório emitido para fins de fechamento e apuração de resultados da confeitaria.</p>
          <div className="text-right">
            <span className="font-bold text-stone-800">DoceGestão - Sistema Confeitaria</span>
          </div>
        </div>
      </div>
    </div>
  );
};
