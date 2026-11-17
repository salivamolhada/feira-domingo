import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Search, Edit, Trash2, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/dateUtils';

interface ProductsViewProps {
  onOpenProductModal: () => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenProductModal,
  onEditProduct,
}) => {
  const { products, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (selectedCategory !== 'todas' && p.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'espetinhos':
        return 'bg-red-100 text-red-950 border-red-200';
      case 'energéticos':
        return 'bg-emerald-100 text-emerald-950 border-emerald-200';
      case 'refrigerantes':
        return 'bg-sky-100 text-sky-950 border-sky-200';
      case 'cervejas & bebidas':
      case 'cervejas':
        return 'bg-amber-100 text-amber-950 border-amber-200';
      case 'salgados':
        return 'bg-yellow-100 text-yellow-950 border-yellow-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-emerald-950/15 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Cardápio de Espetinhos, Salgados & Bebidas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Cadastre os espetinhos na brasa, salgados, refrigerantes, energéticos e acompanhe suas margens de lucro
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProductModal}
          className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-2xl text-xs font-black shadow-md shadow-red-950/20 transition-all flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Item
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-emerald-950/15 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por espetinho, salgado, energético..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-600"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'todas'
                ? 'bg-red-600 text-white shadow-xs font-black'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-xs font-black'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const unitProfit = Math.max(0, prod.price - (prod.costPrice || 0));
          const marginPercent = prod.price > 0 ? ((unitProfit / prod.price) * 100).toFixed(0) : 0;

          return (
            <div
              key={prod.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-emerald-950/15 hover:border-red-300 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getCategoryBadgeStyle(
                      prod.category
                    )}`}
                  >
                    {prod.category}
                  </span>
                  <span className="text-xs text-stone-400 font-semibold">{prod.unit}</span>
                </div>

                <h3 className="text-base font-black text-stone-900 mt-2.5 group-hover:text-red-700 transition-colors">
                  {prod.name}
                </h3>
                {prod.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                )}
              </div>

              {/* Financial Box */}
              <div className="p-3 bg-gradient-to-br from-emerald-50/70 to-amber-50/60 rounded-2xl border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Preço de Venda</span>
                    <span className="text-base font-black font-mono-num text-stone-900">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px]">Custo / Insumo</span>
                    <span className="text-xs font-bold font-mono-num text-stone-600">
                      {formatCurrency(prod.costPrice || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-emerald-200/60 text-xs">
                  <span className="font-extrabold font-mono-num text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Lucro: {formatCurrency(unitProfit)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black font-mono-num text-[10px]">
                    {marginPercent}% margem
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                <span
                  className={`text-xs font-bold ${
                    prod.active ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                >
                  {prod.active ? 'Disponível no domingo' : 'Indisponível'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditProduct(prod)}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Editar item"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {confirmDeleteId === prod.id ? (
                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-xl px-2 py-1 text-[11px]">
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteProduct(prod.id);
                          setConfirmDeleteId(null);
                        }}
                        className="font-black text-red-700 hover:underline"
                      >
                        Excluir
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="font-semibold text-stone-500 hover:text-stone-800"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(prod.id)}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
