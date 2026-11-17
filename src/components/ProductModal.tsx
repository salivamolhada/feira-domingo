import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
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
  const [category, setCategory] = useState<string>('Espetinhos');
  const [price, setPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('espeto');
  const [description, setDescription] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setCostPrice(productToEdit.costPrice || 0);
      setUnit(productToEdit.unit || 'espeto');
      setDescription(productToEdit.description || '');
      setActive(productToEdit.active !== undefined ? productToEdit.active : true);
    } else {
      setName('');
      setCategory('Espetinhos');
      setPrice('');
      setCostPrice('');
      setUnit('espeto');
      setDescription('');
      setActive(true);
    }
    setFormError(null);
  }, [productToEdit, isOpen]);

  const numPrice = Number(price) || 0;
  const numCost = Number(costPrice) || 0;
  const unitProfit = Math.max(0, numPrice - numCost);
  const profitMarginPercent = numPrice > 0 ? ((unitProfit / numPrice) * 100).toFixed(0) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Informe o nome do item (ex: Espetinho de Alcatra, Monster, Coxinha).');
      return;
    }
    if (!price || Number(price) <= 0) {
      setFormError('Informe um preço de venda válido maior que zero.');
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
      setFormError('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-amber-50/70 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-red-200">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {productToEdit ? 'Editar Item do Cardápio' : 'Cadastrar Item no Cardápio'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Espetinhos na brasa, salgados fritos/assados, energéticos e bebidas geladas
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
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Nome do Item
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Espetinho de Carne Alcatra c/ Farofa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-semibold px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  if (newCat === 'Espetinhos') setUnit('espeto');
                  else if (newCat === 'Energéticos' || newCat === 'Refrigerantes') setUnit('lata 350ml');
                  else if (newCat === 'Cervejas & Bebidas') setUnit('long neck');
                  else if (newCat === 'Salgados') setUnit('unidade');
                }}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-600"
              >
                <option value="Espetinhos">Espetinhos</option>
                <option value="Salgados">Salgados</option>
                <option value="Energéticos">Energéticos</option>
                <option value="Refrigerantes">Refrigerantes</option>
                <option value="Cervejas & Bebidas">Cervejas & Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-600"
              >
                <option value="espeto">espeto</option>
                <option value="unidade">unidade</option>
                <option value="lata 473ml">lata 473ml</option>
                <option value="lata 350ml">lata 350ml</option>
                <option value="lata 250ml">lata 250ml</option>
                <option value="garrafa 2L">garrafa 2L</option>
                <option value="long neck">long neck</option>
                <option value="porção">porção</option>
                <option value="cento">cento</option>
              </select>
            </div>
          </div>

          {/* Pricing & Profit calculation */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 to-amber-50/70 rounded-2xl border border-emerald-200 space-y-3">
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
                    className="w-full text-sm font-black font-mono-num pl-9 pr-3 py-2 bg-white border border-emerald-300 rounded-xl text-stone-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                  Custo / Insumos (R$)
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
                    className="w-full text-sm font-medium font-mono-num pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {numPrice > 0 && (
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold font-mono-num text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                  <span>Lucro Unitário: {formatCurrency(unitProfit)}</span>
                </div>
                <div className="font-extrabold font-mono-num text-red-800 px-2.5 py-0.5 rounded-full bg-red-100">
                  Margem: {profitMarginPercent}%
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Acompanhamentos / Descrição (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Acompanha farofa artesanal temperada e vinagrete especial da casa."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="product-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <label htmlFor="product-active" className="text-xs font-semibold text-stone-700 cursor-pointer">
              Disponível para venda no cardápio de domingo
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
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
