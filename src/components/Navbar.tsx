import React from 'react';
import {
  Cake,
  TrendingUp,
  Calendar as CalendarIcon,
  ShoppingBag,
  Receipt,
  Users,
  FileText,
  Plus,
  Cloud,
  CloudOff,
  LogOut,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSaleModal,
  onOpenExpenseModal,
}) => {
  const { user, loginWithGoogle, logout, isSyncing, resetToDemoData } = useData();

  const navItems = [
    { id: 'dashboard', label: 'Painel de Lucros', icon: TrendingUp },
    { id: 'calendario', label: 'Calendário de Vendas', icon: CalendarIcon, badge: '⭐' },
    { id: 'vendas', label: 'Pedidos & Vendas', icon: ShoppingBag },
    { id: 'despesas', label: 'Despesas & Insumos', icon: Receipt },
    { id: 'produtos', label: 'Cardápio de Doces', icon: Cake },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'relatorio', label: 'Relatório Mensal', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs print:hidden">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  Doce<span className="text-rose-500">Gestão</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  DOMINGOS
                </span>
              </div>
              <p className="text-[11px] font-semibold text-stone-400 -mt-0.5 hidden sm:block">
                Controle de Vendas de Doces & Lucro Mensal
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Data Reset */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja recarregar os dados de exemplo de doces, clientes e vendas?')) {
                  resetToDemoData();
                }
              }}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-xs transition-colors hidden md:flex items-center gap-1"
              title="Carregar dados de demonstração da confeitaria"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Exemplos</span>
            </button>

            {/* Nova Despesa button */}
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-3 py-2 text-stone-700 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5 border border-stone-200"
            >
              <Plus className="w-3.5 h-3.5 text-red-500" />
              <span>Despesa</span>
            </button>

            {/* Novo Lançamento de Venda (Primary Action) */}
            <button
              type="button"
              onClick={onOpenSaleModal}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Venda</span>
            </button>

            {/* Auth / Cloud Sync Status */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-extrabold text-stone-800 block truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                    <Cloud className="w-2.5 h-2.5" /> Nuvem ativa
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full border border-rose-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200"
                title="Fazer login com Google para sincronizar com o banco de dados na nuvem"
              >
                <CloudOff className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Conectar Nuvem</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-rose-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1 rounded font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
