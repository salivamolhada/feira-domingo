import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, FileText, CheckCircle2, MessageCircle, DollarSign } from 'lucide-react';
import { Customer } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatFriendlyDate } from '../utils/dateUtils';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { saveCustomer, sales } = useData();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone || '');
      setAddress(customerToEdit.address || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  // Find customer sales history
  const customerSales = React.useMemo(() => {
    if (!customerToEdit) return [];
    return sales.filter(
      (s) =>
        s.customerId === customerToEdit.id ||
        s.customerName.toLowerCase().trim() === customerToEdit.name.toLowerCase().trim()
    );
  }, [sales, customerToEdit]);

  const totalSpent = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPending = customerSales.reduce(
    (sum, s) => sum + Math.max(0, s.totalAmount - s.amountPaid),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCustomer(
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        },
        customerToEdit?.id
      );
      onClose();
    } catch (err) {
      console.error('Error saving customer:', err);
      alert('Erro ao salvar cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    let msg = `Olá ${name}! Tudo bem? Aqui é da confeitaria artesanal 🍰✨`;
    if (totalPending > 0) {
      msg += ` Passando com carinho para lembrar sobre o saldo pendente de ${formatCurrency(
        totalPending
      )}. Podemos enviar a chave Pix para acertar? Muito obrigada!`;
    } else {
      msg += ` Como estão os doces? Já estamos organizando a produção do próximo domingo e adoraríamos preparar sua sobremesa favorita!`;
    }
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/70 to-pink-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {customerToEdit ? 'Perfil do Cliente' : 'Novo Cliente'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Contatos, endereço de entrega e histórico de compras
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer financial badge if editing */}
        {customerToEdit && (
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Total já comprado</span>
              <span className="text-sm font-extrabold text-stone-900">
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                totalPending > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <span className="block font-medium">
                {totalPending > 0 ? 'Saldo a Receber / Fiado' : 'Situação Financeira'}
              </span>
              <span className="text-sm font-black">
                {totalPending > 0 ? formatCurrency(totalPending) : 'Em dia (Quitado)'}
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Nome Completo do Cliente
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mariana Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                WhatsApp / Celular
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            {phone && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir WhatsApp
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Endereço de Entrega
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Rua, número, complemento, bairro"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Preferências & Observações
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Gosta de muito brigadeiro belga, pede sempre aos domingos de manhã"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-white border border-stone-200 rounded-xl"
            />
          </div>

          {/* Recent Orders List if any */}
          {customerSales.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-stone-700 block mb-2">
                Últimos Pedidos ({customerSales.length})
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {customerSales.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-800">
                        {formatFriendlyDate(s.date)}
                      </span>
                      <span className="text-stone-500 ml-2">
                        {s.items.length} {s.items.length === 1 ? 'doce' : 'doces'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-900">
                        {formatCurrency(s.totalAmount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.paymentStatus === 'pago'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.paymentStatus === 'parcial'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
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
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
