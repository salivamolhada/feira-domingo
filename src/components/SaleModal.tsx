import React, { useState, useEffect, useRef } from 'react';
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
  Calendar as CalendarIcon,
  MessageCircle,
  Search,
  Check,
  ChevronDown,
  Percent,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sale, SaleItem, PaymentStatus, PaymentMethod, OrderStatus } from '../types';
import { useData } from '../context/DataContext';
import { CalendarPicker } from './CalendarPicker';
import { formatCurrency, formatToDateInput, isSundayDate } from '../utils/dateUtils';
import { formatPhoneBR, cleanPhoneDigits, getWhatsAppUrl, isValidBRPhone } from '../utils/phoneUtils';

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
  const { products, customers, saveSale, sales, businessName, pixKey } = useData();

  const [date, setDate] = useState<string>(
    saleToEdit?.date || defaultDate || formatToDateInput(new Date())
  );
  const [customerName, setCustomerName] = useState<string>(saleToEdit?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(saleToEdit?.customerPhone || '');
  const [customerId, setCustomerId] = useState<string | undefined>(saleToEdit?.customerId);

  // Customer autocomplete dropdown state
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<SaleItem[]>(
    saleToEdit?.items || []
  );

  // Custom sweet item state
  const [showCustomItemForm, setShowCustomItemForm] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemPrice, setCustomItemPrice] = useState<string>('');
  const [customItemQty, setCustomItemQty] = useState<number>(1);

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

  // Initialize or reset state when modal opens or edits
  useEffect(() => {
    if (saleToEdit) {
      setDate(saleToEdit.date);
      setCustomerName(saleToEdit.customerName);
      setCustomerPhone(formatPhoneBR(saleToEdit.customerPhone || ''));
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
    setShowCustomerDropdown(false);
    setShowCustomItemForm(false);
  }, [saleToEdit, defaultDate, isOpen]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter existing customers matching input
  const matchingCustomers = React.useMemo(() => {
    if (!customerName.trim()) return customers.slice(0, 5);
    const term = customerName.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term))
    );
  }, [customers, customerName]);

  // Handle phone change with automatic formatting mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneBR(rawValue);
    setCustomerPhone(formatted);
  };

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

  // Update amountPaid if total changes while 'pago' is active
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

  // Add custom unlisted sweet item
  const handleAddCustomItem = () => {
    if (!customItemName.trim()) {
      alert('Informe o nome do doce personalizado.');
      return;
    }
    const priceNum = parseFloat(customItemPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Informe um valor válido.');
      return;
    }

    const newItem: SaleItem = {
      id: `custom-item-${Date.now()}`,
      name: customItemName.trim(),
      quantity: Math.max(1, customItemQty),
      unitPrice: priceNum,
      totalPrice: Math.max(1, customItemQty) * priceNum,
    };

    setItems([...items, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    setCustomItemQty(1);
    setShowCustomItemForm(false);
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

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Select customer from dropdown or recent tags
  const handleSelectCustomer = (cust: typeof customers[0]) => {
    setCustomerId(cust.id);
    setCustomerName(cust.name);
    setCustomerPhone(formatPhoneBR(cust.phone || ''));
    if (cust.address && !notes.includes(cust.address)) {
      setNotes((prev) => (prev ? `${prev} | Entrega: ${cust.address}` : `Entrega: ${cust.address}`));
    }
    setShowCustomerDropdown(false);
  };

  // Test WhatsApp message to customer
  const handleTestWhatsApp = () => {
    if (!customerPhone) return;
    const msg = `Olá ${customerName || 'querido(a) cliente'}! Tudo bem? Aqui é da ${businessName || 'confeitaria'} 🧁✨`;
    const url = getWhatsAppUrl(customerPhone, msg);
    if (url) window.open(url, '_blank');
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
          particleCount: 55,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#f43f5e', '#fbbf24', '#ec4899', '#10b981'],
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
  const isPhoneValid = isValidBRPhone(customerPhone);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-amber-50/60 to-pink-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">
                {saleToEdit ? 'Editar Pedido / Venda' : 'Novo Lançamento de Venda'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Controle datas no calendário, doces, pagamentos e WhatsApp do cliente
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
          {/* SECTION 1: CALENDAR & DATE PICKER */}
          <div className="bg-gradient-to-br from-amber-50/70 to-rose-50/50 rounded-2xl p-4 border border-amber-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-600" />
                <span className="font-extrabold text-sm text-stone-900">
                  Data do Lançamento no Calendário
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
                  <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-white shadow-xs tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    DOMINGO DE VENDAS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                    Dia útil / Semana
                  </span>
                )}
                <span className="text-sm font-black text-stone-800">
                  {date.slice(8, 10)}/{date.slice(5, 7)}/{date.slice(0, 4)}
                </span>
              </div>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs font-extrabold px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

          {/* SECTION 2: CUSTOMER & TELEFONE / WHATSAPP (FIXED & ENHANCED) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-rose-500" />
                Cliente & Contato
              </label>
              {customerId && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Cliente Vinculado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name with Autocomplete Dropdown */}
              <div className="relative" ref={customerDropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nome do cliente (ex: Mariana Silva)"
                    value={customerName}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setShowCustomerDropdown(true);
                      // If user clears, detach id
                      if (!e.target.value.trim()) setCustomerId(undefined);
                    }}
                    className="w-full text-sm font-semibold px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all pr-8"
                  />
                  {customerName && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerName('');
                        setCustomerPhone('');
                        setCustomerId(undefined);
                      }}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Autocomplete suggestions */}
                {showCustomerDropdown && matchingCustomers.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-rose-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 px-2 py-1 block">
                      Clientes Cadastrados:
                    </span>
                    {matchingCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left p-2 rounded-xl hover:bg-rose-50 flex items-center justify-between text-xs transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-stone-800 group-hover:text-rose-700">
                            {c.name}
                          </p>
                          {c.phone && (
                            <p className="text-[11px] text-stone-400 font-medium">
                              {formatPhoneBR(c.phone)}
                            </p>
                          )}
                        </div>
                        {c.address && (
                          <span className="text-[10px] text-stone-400 truncate max-w-[120px]">
                            {c.address}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick tags for most recent customers */}
                {customers.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-stone-500 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="shrink-0 text-[10px] font-bold text-stone-400">
                      Recentes:
                    </span>
                    {customers.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className={`shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                          customerName === c.name
                            ? 'bg-rose-500 text-white'
                            : 'bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700'
                        }`}
                      >
                        {c.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TELEFONE COM MÁSCARA AUTOMÁTICA E VALIDAÇÃO WHATSAPP */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className={`w-full text-sm font-bold pl-9 pr-24 py-2.5 bg-white border rounded-xl transition-all ${
                      isPhoneValid
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-stone-900'
                        : 'border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 text-stone-900'
                    }`}
                  />

                  {/* Direct WhatsApp Action in Input */}
                  {customerPhone && (
                    <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                      {isPhoneValid && (
                        <button
                          type="button"
                          onClick={handleTestWhatsApp}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                          title="Abrir conversa no WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 px-1 text-[11px]">
                  <span className="text-stone-400">
                    {customerPhone.length > 0 && !isPhoneValid ? (
                      <span className="text-amber-600 font-semibold">
                        Digite DDD + 8 ou 9 dígitos
                      </span>
                    ) : isPhoneValid ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Número formatado para WhatsApp
                      </span>
                    ) : (
                      'WhatsApp para envio de comprovante'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SWEET PRODUCTS / ITEMS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Doces do Pedido
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomItemForm(!showCustomItemForm)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showCustomItemForm ? 'Fechar Personalizado' : 'Doce fora do cardápio'}
                </button>
                <span className="text-xs font-bold text-stone-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                  Subtotal: {formatCurrency(itemsSubtotal)}
                </span>
              </div>
            </div>

            {/* Custom Item Form */}
            {showCustomItemForm && (
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in duration-150">
                <span className="text-xs font-extrabold text-rose-800 block">
                  Adicionar Doce Personalizado / Especial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Nome do doce (ex: Bolo Vulcão Ninho 1kg)"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    className="sm:col-span-6 text-xs font-medium px-3 py-2 bg-white border border-rose-200 rounded-xl"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Valor R$"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(e.target.value)}
                    className="sm:col-span-3 text-xs font-bold px-3 py-2 bg-white border border-rose-200 rounded-xl"
                  />
                  <div className="sm:col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={customItemQty}
                      onChange={(e) => setCustomItemQty(Number(e.target.value))}
                      className="w-14 text-xs font-bold px-2 py-2 bg-white border border-rose-200 rounded-xl text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-xs"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Sweet Dropdown from Catalog */}
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
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
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-6 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-xs sm:text-sm font-semibold text-stone-500">
                  Nenhum doce adicionado a este pedido ainda.
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Selecione um doce do cardápio acima para calcular o valor automaticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-2xs gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black text-stone-900 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="text-stone-400">
                          Unit: {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="font-extrabold text-rose-600">
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
                          className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-l"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-black text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-r"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Remover doce"
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
                className="w-full text-xs font-bold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
              >
                <option value="retirada">🛍️ Retirada no Balcão</option>
                <option value="entrega">🛵 Entrega a Domicílio</option>
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
                className="w-full text-xs font-bold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
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
                className="w-full text-xs font-bold px-2.5 py-2 bg-white border border-stone-200 rounded-xl"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* SECTION 5: PAYMENT STATUS & METHOD */}
          <div className="space-y-3 bg-gradient-to-br from-rose-50/60 to-amber-50/50 p-4 rounded-2xl border border-rose-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Status do Pagamento
              </label>
              <div className="text-right">
                <span className="text-xs text-stone-500 font-medium">Valor Total:</span>
                <span className="text-base sm:text-lg font-black text-stone-900 ml-1.5">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Status Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePaymentStatusChange('pago')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
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
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
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
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
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
                className={`p-2.5 rounded-xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
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
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-stone-200 rounded-xl"
                >
                  <option value="pix">Pix (Chave / QR Code)</option>
                  <option value="dinheiro">Dinheiro Físico</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="outro">Outro meio</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
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
                  className="w-full text-xs font-black px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900"
                />
              </div>
            </div>

            {/* Remaining amount banner if pending or partial */}
            {remainingBalance > 0 && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-bold">
                <span>Saldo Restante a Receber:</span>
                <span className="text-sm font-black text-rose-700">
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 6: NOTES */}
          <div>
            <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wider block mb-1.5">
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
              className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center gap-1.5"
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
