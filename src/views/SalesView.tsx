import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MessageCircle,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../context/DataContext';
import { Sale, PaymentStatus } from '../types';
import { formatCurrency, formatFriendlyDate, isSundayDate } from '../utils/dateUtils';
import { formatPhoneBR, getWhatsAppUrl, isValidBRPhone } from '../utils/phoneUtils';

interface SalesViewProps {
  onOpenSaleModal: () => void;
  onEditSale: (sale: Sale) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({ onOpenSaleModal, onEditSale }) => {
  const { sales, deleteSale, updatePaymentStatus, businessName, pixKey } = useData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterSundayOnly, setFilterSundayOnly] = useState<boolean>(false);
  const [filterMonth, setFilterMonth] = useState<string>('todos');

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => {
      if (s.date) set.add(s.date.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [sales]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        sale.customerName.toLowerCase().includes(searchLower) ||
        (sale.customerPhone && sale.customerPhone.includes(searchTerm)) ||
        sale.items.some((i) => i.name.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Status
      if (filterStatus !== 'todos' && sale.paymentStatus !== filterStatus) {
        return false;
      }

      // Sunday only
      if (filterSundayOnly && !isSundayDate(sale.date)) {
        return false;
      }

      // Month
      if (filterMonth !== 'todos' && !sale.date.startsWith(filterMonth)) {
        return false;
      }

      return true;
    });
  }, [sales, searchTerm, filterStatus, filterSundayOnly, filterMonth]);

  // Totals for filtered list
  const totalFilteredRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalFilteredReceived = filteredSales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalFilteredPending = Math.max(0, totalFilteredRevenue - totalFilteredReceived);

  const handleMarkAsPaid = async (sale: Sale) => {
    try {
      await updatePaymentStatus(sale.id, 'pago', sale.totalAmount);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f59e0b', '#10b981'],
      });
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o lançamento de ${customerName}?`)) {
      await deleteSale(id);
    }
  };

  const openWhatsApp = (sale: Sale) => {
    if (!sale.customerPhone) {
      alert('Este pedido não possui telefone cadastrado.');
      return;
    }

    const itemsSummary = sale.items.map((i) => `• ${i.quantity}x ${i.name} (${formatCurrency(i.totalPrice)})`).join('\n');
    let msg = `Olá *${sale.customerName}*! Tudo bem? Aqui é do *${businessName || 'Espeto & Brasa'}* 🍢🔥\n\n`;
    msg += `Passando para confirmar os detalhes do seu pedido:\n\n`;
    msg += `🥩 *Itens Selecionados:*\n${itemsSummary}\n\n`;
    msg += `📅 *Data:* ${formatFriendlyDate(sale.date)}\n`;
    if (sale.deliveryTime) {
      msg += `⏰ *Horário:* ${sale.deliveryTime}\n`;
    }
    msg += `🚚 *Modalidade:* ${sale.deliveryType === 'entrega' ? 'Entrega a Domicílio' : 'Retirada no Balcão'}\n`;
    if (sale.deliveryFee && sale.deliveryFee > 0) {
      msg += `🛵 *Taxa de Entrega:* ${formatCurrency(sale.deliveryFee)}\n`;
    }
    msg += `💰 *Valor Total:* ${formatCurrency(sale.totalAmount)}\n`;

    if (sale.paymentStatus === 'pago') {
      msg += `\n✅ *Status do Pagamento:* Quitado com sucesso (${sale.paymentMethod.toUpperCase()}). Muito obrigado(a) pela preferência e bom apetite! 🔥🥩`;
    } else {
      const pendingVal = Math.max(0, sale.totalAmount - sale.amountPaid);
      if (sale.paymentStatus === 'parcial') {
        msg += `💵 *Valor já pago:* ${formatCurrency(sale.amountPaid)}\n`;
      }
      msg += `⏳ *Saldo a Pagar:* ${formatCurrency(pendingVal)}\n`;
      if (pixKey) {
        msg += `\n💳 *Chave Pix para pagamento:* ${pixKey}\n`;
      }
      msg += `\nPor favor, envie o comprovante Pix por aqui para separarmos seu pedido quentinho e as bebidas bem geladas! Agradecemos a preferência! 🙌`;
    }

    const url = getWhatsAppUrl(sale.customerPhone, msg);
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Controle de Pedidos & Vendas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Gerencie cada venda de domingo, espetos, salgados, refrigerantes, clientes e pendências
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenSaleModal}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 via-amber-500 to-red-500 hover:from-orange-700 hover:to-red-600 text-stone-950 font-black rounded-2xl text-xs shadow-md shadow-orange-950/20 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por cliente, espeto, salgado, bebida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Payment Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:border-orange-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">🟢 Somente Pagos</option>
              <option value="pendente">🟡 Somente Pendentes</option>
              <option value="parcial">🟠 Pagamento Parcial</option>
              <option value="fiado">🔴 Fiado / A Receber</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="sm:col-span-2">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:border-orange-500"
            >
              <option value="todos">Todos os Meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m.slice(5, 7)}/{m.slice(0, 4)}
                </option>
              ))}
            </select>
          </div>

          {/* Sunday Only Toggle */}
          <div className="sm:col-span-2 flex items-center">
            <button
              type="button"
              onClick={() => setFilterSundayOnly(!filterSundayOnly)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                filterSundayOnly
                  ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${filterSundayOnly ? 'text-amber-300' : 'text-orange-500'}`} />
              ⭐ Domingos
            </button>
          </div>
        </div>

        {/* Filter Summary Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 text-stone-500 font-semibold">
            <span>{filteredSales.length} pedidos encontrados</span>
            {filterSundayOnly && (
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 font-bold text-[10px]">
                Filtrado por Domingos
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-stone-400 mr-1.5">Total:</span>
              <span className="font-extrabold text-stone-900">
                {formatCurrency(totalFilteredRevenue)}
              </span>
            </div>
            {totalFilteredPending > 0 && (
              <div className="text-right font-black text-orange-600">
                <span className="text-stone-400 mr-1.5 font-normal">Pendente:</span>
                {formatCurrency(totalFilteredPending)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sales List */}
      {filteredSales.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-stone-900">Nenhum pedido encontrado</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Não há vendas cadastradas para os filtros selecionados. Clique no botão abaixo para
            lançar uma nova venda.
          </p>
          <button
            type="button"
            onClick={onOpenSaleModal}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-950/20 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Lançar Primeira Venda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSales.map((sale) => {
            const isSunday = isSundayDate(sale.date);
            const remaining = Math.max(0, sale.totalAmount - sale.amountPaid);

            return (
              <div
                key={sale.id}
                className="bg-white rounded-3xl p-5 border border-stone-200/90 hover:border-orange-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Top Info: Date, Customer, Sunday Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                        {formatFriendlyDate(sale.date)}
                      </span>
                      {isSunday && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-300 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-orange-600" />
                          DOMINGO
                        </span>
                      )}
                    </div>

                    {/* Payment status badge */}
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        sale.paymentStatus === 'pago'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : sale.paymentStatus === 'parcial'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : sale.paymentStatus === 'fiado'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {sale.paymentStatus === 'pago'
                        ? '🟢 Pago'
                        : sale.paymentStatus === 'parcial'
                        ? '🟠 Parcial'
                        : sale.paymentStatus === 'fiado'
                        ? '🔴 Fiado'
                        : '🟡 Pendente'}
                    </span>
                  </div>

                  {/* Customer name and phone */}
                  <div className="mt-2.5">
                    <h3 className="text-base font-black text-stone-900 tracking-tight">
                      {sale.customerName}
                    </h3>
                    {sale.customerPhone ? (
                      <button
                        type="button"
                        onClick={() => openWhatsApp(sale)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200 mt-1 transition-all"
                        title="Enviar mensagem ou comprovante no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formatPhoneBR(sale.customerPhone)}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-stone-400 font-medium block mt-0.5">Sem telefone informado</span>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                    {sale.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-stone-700"
                      >
                        <span className="font-semibold">
                          <span className="text-stone-400 mr-1">{item.quantity}x</span>
                          {item.name}
                        </span>
                        <span className="font-bold text-stone-800">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                    {sale.deliveryFee && sale.deliveryFee > 0 ? (
                      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/60">
                        <span>Taxa de Entrega</span>
                        <span>{formatCurrency(sale.deliveryFee)}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Notes if any */}
                  {sale.notes && (
                    <p className="mt-2 text-[11px] text-stone-500 italic bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                      📝 {sale.notes}
                    </p>
                  )}
                </div>

                {/* Bottom: Financial totals & Quick action buttons */}
                <div className="pt-3 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">
                        Forma: {sale.paymentMethod.toUpperCase()}
                      </span>
                      {remaining > 0 && (
                        <span className="text-xs font-bold text-orange-600">
                          Falta: {formatCurrency(remaining)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-400 block">Total do Pedido</span>
                      <span className="text-lg font-black text-stone-900">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      {sale.customerPhone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(sale)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditSale(sale)}
                        className="p-2 text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                        title="Editar pedido"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sale.id, sale.customerName)}
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Excluir pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick status button */}
                    {sale.paymentStatus !== 'pago' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkAsPaid(sale)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar Pago
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Quitado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
