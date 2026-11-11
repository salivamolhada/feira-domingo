import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  User,
  Phone,
  DollarSign,
  Calendar as CalendarIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sale, SaleItem, PaymentStatus, PaymentMethod, OrderStatus } from '../types';
import { useData } from '../context/DataContext';
import { CalendarPicker } from './CalendarPicker';
import { formatCurrency, formatToDateInput, isSundayDate } from '../utils/dateUtils';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleToEdit?: Sale | null;
  defaultDate?: string;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  saleToEdit,
  defaultDate
}) => {
  const { products, customers, saveSale, sales } = useData();

  const [date, setDate] = useState<string>(
    saleToEdit?.date || defaultDate || formatToDateInput(new Date())
  );
  const [customerName, setCustomerName] = useState<string>(saleToEdit?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(saleToEdit?.customerPhone || '');
  const [customerId, setCustomerId] = useState<string | undefined>(saleToEdit?.customerId);

  const [items, setItems] = useState<SaleItem[]>(
    saleToEdit?.items || []
  );

  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>(
    saleToEdit?.deliveryType || 'retirada'
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(saleToEdit?.deliveryTime || '');
  const [deliveryFee, setDeliveryFee] = useState<number>(saleToEdit?.deliveryFee || 0);
  const [discount, setDiscount] = useState<number>(saleToEdit?.discount || 0);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    saleToEdit?.paymentStatus || 'pago'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    saleToEdit?.paymentMethod || 'pix'
  );
  const [amountPaid, setAmountPaid] = useState<number>(saleToEdit?.amountPaid || 0);

  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    saleToEdit?.orderStatus || 'entregue'
  );
  const [notes, setNotes] = useState<string>(saleToEdit?.notes || '');

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset or initialize state
  useEffect(() => {
    if (saleToEdit) {
      setDate(saleToEdit.date);
      setCustomerName(saleToEdit.customerName);
      setCustomerPhone(saleToEdit.customerPhone || '');
      setCustomerId(saleToEdit.customerId);
      setItems(saleToEdit.items || []);
      setDeliveryType(saleToEdit.deliveryType || 'retirada');
      setDeliveryTime(saleToEdit.deliveryTime || '');
      setDeliveryFee(saleToEdit.deliveryFee || 0);
      setDiscount(saleToEdit.discount || 0);
      setPaymentStatus(saleToEdit.paymentStatus);
      setPaymentMethod(saleToEdit.paymentMethod);
      setAmountPaid(saleToEdit.amountPaid);
      setOrderStatus(saleToEdit.orderStatus);
      setNotes(saleToEdit.notes || '');
    } else {
      setDate(defaultDate || formatToDateInput(new Date()));
      setCustomerName('');
      setCustomerPhone('');
      setCustomerId(undefined);
      setItems([]);
      setDeliveryType('retirada');
      setDeliveryTime('');
      setDeliveryFee(0);
      setDiscount(0);
      setPaymentStatus('pago');
      setPaymentMethod('pix');
      setAmountPaid(0);
      setOrderStatus('entregue');
      setNotes('');
    }
  }, [saleToEdit, defaultDate, isOpen]);

  // Calculate items subtotal
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalAmount = Math.max(0, itemsSubtotal + Number(deliveryFee || 0) - Number(discount || 0));

  // Sync amountPaid when payment status changes
  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'pago') {
      setAmountPaid(totalAmount);
    } else if (status === 'pendente' || status === 'fiado') {
      setAmountPaid(0);
    } else if (status === 'parcial') {
      if (amountPaid === 0 || amountPaid >= totalAmount) {
        setAmountPaid(Number((totalAmount / 2).toFixed(2)));
      }
    }
  };

  // When total amount changes and status is 'pago', update amountPaid
  useEffect(() => {
    if (paymentStatus === 'pago') {
      setAmountPaid(totalAmount);
    }
  }, [totalAmount, paymentStatus]);

  // Add product from catalog
  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = items.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = newQty * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      const newItem: SaleItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: prod.id,
        name: prod.name,
        quantity: 1,
        unitPrice: prod.price,
        totalPrice: prod.price,
      };
      setItems([...items, newItem]);
    }
    setSelectedProductId('');
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...items];
    updated[index].quantity = newQty;
    updated[index].totalPrice = newQty * updated[index].unitPrice;
    setItems(updated);
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const updated = [...items];
    updated[index].unitPrice = newPrice;
    updated[index].totalPrice = updated[index].quantity * newPrice;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Quick select customer
  const handleSelectCustomer = (cId: string) => {
    const cust = customers.find((c) => c.id === cId);
    if (cust) {
      setCustomerId(cust.id);
      setCustomerName(cust.name);
      if (cust.phone) setCustomerPhone(cust.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um doce ao pedido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveSale(
        {
          date,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerId,
          items,
          totalAmount,
          amountPaid: Number(amountPaid),
          paymentStatus,
          paymentMethod,
          orderStatus,
          deliveryType,
          deliveryTime,
          deliveryFee: Number(deliveryFee),
          discount: Number(discount),
          notes,
        },
        saleToEdit?.id
      );

      if (paymentStatus === 'pago') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f43f5e', '#fbbf24', '#ec4899', '#a855f7'],
        });
      }

      onClose();
    } catch (err) {
      console.error('Error saving sale:', err);
      alert('Ocorreu um erro ao salvar o lançamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isSunday = isSundayDate(date);
  const remainingBalance = Math.max(0, totalAmount - amountPaid);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-pink-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                {saleToEdit ? 'Editar Pedido / Venda' : 'Novo Lançamento de Venda'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Controle os doces vendidos, data no calendário e status de pagamento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* SECTION 1: CALENDAR DATE PICKER (KEY REQUIREMENT) */}
          <div className="bg-gradient-to-br from-amber-50/60 to-rose-50/40 rounded-2xl p-4 border border-amber-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm text-stone-900">
                  Data do Lançamento da Venda
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
              >
                {showCalendar ? 'Ocultar Calendário' : '📅 Abrir Calendário'}
              </button>
            </div>

            {/* Sunday Highlight Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                {isSunday ? (
                  <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    DOMINGO DE VENDAS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                    Dia útil / Semana
                  </span>
                )}
                <span className="text-sm font-bold text-stone-800">
                  {date.slice(8, 10)}/{date.slice(5, 7)}/{date.slice(0, 4)}
                </span>
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-semibold px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Embedded Calendar Picker */}
            {showCalendar && (
              <div className="mt-3">
                <CalendarPicker
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    setShowCalendar(false);
                  }}
                  sales={sales}
                  label="Selecione o dia da venda no calendário:"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: CUSTOMER */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-500" />
              Cliente
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente (ex: Mariana Silva)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-sm font-medium px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
                {/* Existing Customer Quick Select */}
                {customers.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-stone-500 overflow-x-auto py-1">
                    <span className="shrink-0 text-[11px] font-semibold text-stone-400">
                      Recentes:
                    </span>
                    {customers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c.id)}
                        className="shrink-0 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 text-[11px] font-medium transition-colors"
                      >
                        {c.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="WhatsApp / Telefone (opcional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-sm font-medium pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SWEET PRODUCTS / ITEMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Doces do Pedido
              </label>
              <span className="text-xs font-semibold text-stone-500">
                Subtotal doces: {formatCurrency(itemsSubtotal)}
              </span>
            </div>

            {/* Add Sweet Dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 text-sm font-medium px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              >
                <option value="">Selecione um doce do cardápio...</option>
                {products
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(p.price)} ({p.unit})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-6 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-sm font-medium text-stone-500">
                  Nenhum doce adicionado a este pedido ainda.
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  Selecione um doce acima para calcular o valor automaticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-xs gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500">
                          Unit: {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="text-xs font-bold text-rose-600">
                          Total: {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                          className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-l"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                          className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: DELIVERY & DISCOUNTS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Tipo de Entrega
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'retirada' | 'entrega')}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
              >
                <option value="retirada">Retirada no Balcão</option>
                <option value="entrega">Entrega a Domicílio</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Taxa de Entrega (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1">
                Desconto (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* SECTION 5: PAYMENT STATUS & METHOD (KEY REQUIREMENT) */}
          <div className="space-y-3 bg-gradient-to-br from-rose-50/50 to-amber-50/40 p-4 rounded-2xl border border-rose-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Status do Pagamento
              </label>
              <div className="text-right">
                <span className="text-xs text-stone-500 font-medium">Valor Total:</span>
                <span className="text-base font-extrabold text-stone-900 ml-1.5">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Status Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePaymentStatusChange('pago')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentStatus === 'pago'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                    : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pago (100%)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentStatusChange('pendente')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentStatus === 'pendente'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                    : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pendente</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentStatusChange('parcial')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentStatus === 'parcial'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                    : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Parcial (Sinal)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePaymentStatusChange('fiado')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentStatus === 'fiado'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                    : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Fiado / A Receber</span>
              </button>
            </div>

            {/* Payment method and amount inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-stone-200 rounded-xl"
                >
                  <option value="pix">Pix (Chave / QR Code)</option>
                  <option value="dinheiro">Dinheiro Físico</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="outro">Outro meio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={amountPaid}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmountPaid(val);
                    if (val >= totalAmount && totalAmount > 0) {
                      setPaymentStatus('pago');
                    } else if (val > 0) {
                      setPaymentStatus('parcial');
                    }
                  }}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
            </div>

            {/* Remaining amount banner if pending or partial */}
            {remainingBalance > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold">
                <span>Saldo Restante a Receber:</span>
                <span className="text-sm font-black text-rose-700">
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 6: NOTES */}
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
              Observações (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Entregar com fita vermelha, laço de presente, sem açúcar refinado, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                'Salvando...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {saleToEdit ? 'Atualizar Pedido' : 'Concluir Lançamento'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
