import React, { useState } from 'react';
import { CakeSlice, Plus, Search, Edit, Trash2, TrendingUp, Sparkles } from 'lucide-react';
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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja remover "${name}" do cardápio?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-rose-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍰</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Cardápio de Doces & Margens
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-0.5">
            Cadastre seus doces, defina preços e veja a margem de lucro de cada receita
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenProductModal}
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Doce
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou sabor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'todas'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sweet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const unitProfit = Math.max(0, prod.price - (prod.costPrice || 0));
          const marginPercent = prod.price > 0 ? ((unitProfit / prod.price) * 100).toFixed(0) : 0;

          return (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-5 border border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {prod.category}
                  </span>
                  <span className="text-xs text-stone-400 font-semibold">{prod.unit}</span>
                </div>

                <h3 className="text-base font-black text-stone-900 mt-2">{prod.name}</h3>
                {prod.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{prod.description}</p>
                )}
              </div>

              {/* Financial Box */}
              <div className="p-3 bg-gradient-to-br from-amber-50/60 to-rose-50/60 rounded-2xl border border-rose-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Preço de Venda</span>
                    <span className="text-base font-black text-stone-900">
                      {formatCurrency(prod.price)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[10px]">Custo Ingredientes</span>
                    <span className="text-xs font-bold text-stone-600">
                      {formatCurrency(prod.costPrice || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-rose-200/50 text-xs">
                  <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Lucro: {formatCurrency(unitProfit)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[10px]">
                    {marginPercent}% margem
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                <span
                  className={`text-xs font-bold ${
                    prod.active ? 'text-emerald-600' : 'text-stone-400'
                  }`}
                >
                  {prod.active ? '🟢 Ativo no cardápio' : '⚪ Pausado'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditProduct(prod)}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                    title="Editar produto"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id, prod.name)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
