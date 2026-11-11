import React, { useState, useMemo } from 'react';
import { Receipt, Plus, Search, Trash2, Edit, Calendar as CalendarIcon, Tag, Flame } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Expense } from '../types';
import { formatCurrency, formatFriendlyDate, getMonthLabel } from '../utils/dateUtils';

interface ExpensesViewProps {
  onOpenExpenseModal: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenExpenseModal,
  onEditExpense,
}) => {
  const { expenses, deleteExpense } = useData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todas');
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');

  // Available months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.date) set.add(e.date.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !searchTerm ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (categoryFilter !== 'todas' && e.category !== categoryFilter) return false;
      if (selectedMonth !== 'todos' && !e.date.startsWith(selectedMonth)) return false;

      return true;
    });
  }, [expenses, searchTerm, categoryFilter, selectedMonth]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for quick breakdown
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [filteredExpenses]);

  const handleDelete = async (id: string, desc: string) => {
    if (window.confirm(`Deseja excluir a despesa "${desc}"?`)) {
      await deleteExpense(id);
    }
  };

  const getCategoryBadge = (cat: Expense['category']) => {
    switch (cat) {
      case 'carnes_insumos':
        return <span className="bg-red-100 text-red-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">🥩 Carnes & Insumos</span>;
      case 'bebidas_estoque':
        return <span className="bg-sky-100 text-sky-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-200">🥤 Bebidas & Energéticos</span>;
      case 'carvao_gas':
        return <span className="bg-orange-100 text-orange-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-orange-200">🔥 Carvão & Gás</span>;
      case 'embalagens':
        return <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">📦 Espetos & Embalagens</span>;
      case 'entrega':
        return <span className="bg-purple-100 text-purple-950 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">🛵 Entrega / Gelo</span>;
      case 'equipamentos':
        return <span className="bg-stone-200 text-stone-900 px-2 py-0.5 rounded-full text-[10px] font-bold border border-stone-300">🔪 Grelhas & Utensílios</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-full text-[10px] font-bold">🧾 Outros Custos</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Despesas & Compras de Insumos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Acompanhe compras de carnes, carvão vegetal, fardos de energéticos, refrigerantes e embalagens
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenExpenseModal}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black shadow-md shadow-red-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Despesa
        </button>
      </div>

      {/* Filter and Category Cards */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por corte de carne, fornecedor, carvão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-red-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="todas">Todas Categorias</option>
              <option value="carnes_insumos">🥩 Carnes & Insumos</option>
              <option value="bebidas_estoque">🥤 Bebidas & Estoque</option>
              <option value="carvao_gas">🔥 Carvão & Gás</option>
              <option value="embalagens">📦 Espetos & Embalagens</option>
              <option value="entrega">🛵 Entrega / Gelo</option>
              <option value="equipamentos">🔪 Grelhas & Utensílios</option>
              <option value="outros">🧾 Outros Custos</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option value="todos">Todos os Meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {getMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(categoryTotals).map(([cat, amount]) => (
              <span
                key={cat}
                className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 text-[11px] font-semibold"
              >
                {cat.replace('_', ' ')}: <strong className="text-stone-900">{formatCurrency(amount)}</strong>
              </span>
            ))}
          </div>

          <div className="text-right">
            <span className="text-stone-400 mr-1.5">Total de Despesas:</span>
            <span className="text-sm font-black text-red-600">
              {formatCurrency(totalFilteredAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs space-y-3">
          <Receipt className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-extrabold text-stone-900">Nenhuma compra ou despesa encontrada</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Lance os custos de carnes, carvão vegetal e bebidas para que o sistema consiga calcular com precisão o lucro líquido das vendas.
          </p>
          <button
            type="button"
            onClick={onOpenExpenseModal}
            className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-red-200"
          >
            <Plus className="w-4 h-4" />
            Lançar Primeira Despesa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-red-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  {getCategoryBadge(expense.category)}
                  <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatFriendlyDate(expense.date)}
                  </span>
                </div>

                <h3 className="text-base font-black text-stone-900 mt-2">
                  {expense.description}
                </h3>

                {expense.notes && (
                  <p className="text-xs text-stone-500 mt-1 italic">
                    {expense.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 block font-medium">
                    Pago via: {expense.paymentMethod.toUpperCase()}
                  </span>
                  <span className="text-lg font-black text-red-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditExpense(expense)}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(expense.id, expense.description)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
