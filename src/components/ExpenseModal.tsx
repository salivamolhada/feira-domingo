import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, Calendar as CalendarIcon, CheckCircle2, Flame } from 'lucide-react';
import { Expense, PaymentMethod } from '../types';
import { useData } from '../context/DataContext';
import { formatToDateInput } from '../utils/dateUtils';
import { CalendarPicker } from './CalendarPicker';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  defaultDate?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  defaultDate,
}) => {
  const { saveExpense } = useData();

  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<Expense['category']>('carnes_insumos');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(
    expenseToEdit?.date || defaultDate || formatToDateInput(new Date())
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setNotes(expenseToEdit.notes || '');
    } else {
      setDescription('');
      setCategory('carnes_insumos');
      setAmount('');
      setDate(defaultDate || formatToDateInput(new Date()));
      setPaymentMethod('pix');
      setNotes('');
    }
  }, [expenseToEdit, defaultDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Informe a descrição da despesa (ex: Carne alcatra, carvão, fardo de energético).');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('Informe um valor válido para a despesa.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveExpense(
        {
          description: description.trim(),
          category,
          amount: Number(amount),
          date,
          paymentMethod,
          notes: notes.trim(),
        },
        expenseToEdit?.id
      );
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('Ocorreu um erro ao salvar a despesa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-orange-50 to-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-red-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {expenseToEdit ? 'Editar Despesa' : 'Nova Despesa / Compra de Insumos'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Carnes, carvão vegetal, fardos de bebidas e embalagens
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Descrição da Compra / Despesa
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Alcatra no atacado (15kg) ou Saco de Carvão 10kg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm font-semibold px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Valor Total (R$)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full text-sm font-bold pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-red-500"
              >
                <option value="carnes_insumos">🥩 Carnes & Insumos</option>
                <option value="bebidas_estoque">🥤 Bebidas & Energéticos</option>
                <option value="carvao_gas">🔥 Carvão & Gás</option>
                <option value="embalagens">📦 Espetos & Embalagens</option>
                <option value="entrega">🛵 Entrega / Frete / Gelo</option>
                <option value="equipamentos">🔪 Grelhas & Utensílios</option>
                <option value="marketing">📢 Divulgação</option>
                <option value="outros">🧾 Outros Custos</option>
              </select>
            </div>
          </div>

          {/* Date with Calendar toggle */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-orange-600" />
                Data da Despesa
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                {showCalendar ? 'Ocultar Calendário' : '📅 Escolher no Calendário'}
              </button>
            </div>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-stone-200 rounded-xl"
            />

            {showCalendar && (
              <div className="pt-2">
                <CalendarPicker
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    setShowCalendar(false);
                  }}
                  label="Selecione a data da despesa:"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl"
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Observações / Fornecedor (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Comprado no Açougue Central, nota guardada"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-white border border-stone-200 rounded-xl"
            />
          </div>

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
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
