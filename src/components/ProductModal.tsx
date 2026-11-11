import React, { useState, useEffect } from 'react';
import { X, CakeSlice, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/dateUtils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { saveProduct } = useData();

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Brigadeiros');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('unidade');
  const [description, setDescription] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setCostPrice(productToEdit.costPrice || 0);
      setUnit(productToEdit.unit || 'unidade');
      setDescription(productToEdit.description || '');
      setActive(productToEdit.active !== undefined ? productToEdit.active : true);
    } else {
      setName('');
      setCategory('Brigadeiros');
      setPrice('');
      setCostPrice('');
      setUnit('unidade');
      setDescription('');
      setActive(true);
    }
  }, [productToEdit, isOpen]);

  const numPrice = Number(price) || 0;
  const numCost = Number(costPrice) || 0;
  const unitProfit = Math.max(0, numPrice - numCost);
  const profitMarginPercent = numPrice > 0 ? ((unitProfit / numPrice) * 100).toFixed(0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome do doce.');
      return;
    }
    if (!price || Number(price) <= 0) {
      alert('Informe um preço de venda válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveProduct(
        {
          name: name.trim(),
          category,
          price: Number(price),
          costPrice: Number(costPrice) || 0,
          unit,
          description: description.trim(),
          active,
        },
        productToEdit?.id
      );
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erro ao salvar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 to-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <CakeSlice className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {productToEdit ? 'Editar Doce / Produto' : 'Cadastrar Doce no Cardápio'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Defina o preço de venda e custo de ingredientes para calcular seu lucro
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
              Nome do Doce
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Copo da Felicidade Brownie & Ninho"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-medium px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl"
              >
                <option value="Brigadeiros">Brigadeiros & Trufas</option>
                <option value="Bolos no Pote">Bolos no Pote</option>
                <option value="Cones Trufados">Cones Trufados</option>
                <option value="Copos Gourmet">Copos da Felicidade</option>
                <option value="Tortas">Tortas & Fatias</option>
                <option value="Doces Tradicionais">Doces Tradicionais</option>
                <option value="Outros">Outros Doces</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl"
              >
                <option value="unidade">unidade</option>
                <option value="pote 250ml">pote 250ml</option>
                <option value="copo 350ml">copo 350ml</option>
                <option value="fatia">fatia</option>
                <option value="caixa">caixa</option>
                <option value="cento">cento (100 un)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Profit calculation */}
          <div className="p-3.5 bg-gradient-to-br from-amber-50/60 to-rose-50/60 rounded-2xl border border-rose-200/80 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">
                  Preço de Venda (R$)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm font-black pl-9 pr-3 py-2 bg-white border border-rose-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Custo Insumos (R$)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm font-medium pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* Profit summary card */}
            {numPrice > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>Lucro Unitário: {formatCurrency(unitProfit)}</span>
                </div>
                <div className="font-extrabold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100">
                  Margem: {profitMarginPercent}%
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Descrição / Ingredientes (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Leite moça, cacau 50%, manteiga de primeira e morangos frescos."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-white border border-stone-200 rounded-xl focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="product-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-400"
            />
            <label htmlFor="product-active" className="text-xs font-semibold text-stone-700 cursor-pointer">
              Disponível para venda no cardápio
            </label>
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
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Doce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
