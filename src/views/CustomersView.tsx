import React, { useState } from 'react';
import { User, Plus, Search, Phone, MapPin, MessageCircle, Edit, Trash2, DollarSign } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Customer } from '../types';
import { formatCurrency } from '../utils/dateUtils';

interface CustomersViewProps {
  onOpenCustomerModal: () => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenCustomerModal,
  onEditCustomer,
}) => {
  const { customers, deleteCustomer, sales } = useData();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      c.name.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja remover o cliente ${name}?`)) {
      await deleteCustomer(id);
    }
  };

  const getCustomerMetrics = (customer: Customer) => {
    const custSales = sales.filter(
      (s) =>
        s.customerId === customer.id ||
        s.customerName.toLowerCase().trim() === customer.name.toLowerCase().trim()
    );
    const totalSpent = custSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPending = custSales.reduce(
      (sum, s) => sum + Math.max(0, s.totalAmount - s.amountPaid),
      0
    );
    return { count: custSales.length, totalSpent, totalPending };
  };

  const openWhatsApp = (customer: Customer, totalPending: number) => {
    if (!customer.phone) return;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let msg = `Olá ${customer.name}! Tudo bem? Passando para te mandar um abraço doce da nossa confeitaria 🧁✨`;
    if (totalPending > 0) {
      msg += `\nLembramos que consta um saldo em aberto de ${formatCurrency(
        totalPending
      )}. Deseja nossa chave Pix para acerto?`;
    }
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Gestão de Clientes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Mantenha contatos, histórico de compras de domingo e saldos a receber organizados
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCustomerModal}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou rua..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
          />
        </div>
        <span className="text-xs font-bold text-stone-500 hidden sm:inline">
          {customers.length} clientes cadastrados
        </span>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const metrics = getCustomerMetrics(cust);

          return (
            <div
              key={cust.id}
              className="bg-white rounded-3xl p-5 border border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-700 flex items-center justify-center font-black text-sm">
                    {cust.name.slice(0, 2).toUpperCase()}
                  </div>
                  {metrics.totalPending > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                      Fiado: {formatCurrency(metrics.totalPending)}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Quitado
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-stone-900 mt-3">{cust.name}</h3>

                <div className="mt-2 space-y-1 text-xs text-stone-600 font-medium">
                  {cust.phone && (
                    <p className="flex items-center gap-1.5 text-stone-500">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {cust.phone}
                    </p>
                  )}
                  {cust.address && (
                    <p className="flex items-center gap-1.5 text-stone-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {cust.address}
                    </p>
                  )}
                </div>

                {cust.notes && (
                  <p className="text-[11px] text-stone-500 mt-2 italic bg-stone-50 p-2 rounded-xl">
                    {cust.notes}
                  </p>
                )}
              </div>

              {/* Stats Box */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-semibold">{metrics.count} pedidos</span>
                  <span className="font-extrabold text-stone-900">
                    Total: {formatCurrency(metrics.totalSpent)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {cust.phone ? (
                    <button
                      type="button"
                      onClick={() => openWhatsApp(cust, metrics.totalPending)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-400">Sem telefone</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditCustomer(cust)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cust.id, cust.name)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
