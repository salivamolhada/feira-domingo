import React from 'react';
import {
  Flame,
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
  RefreshCw,
  Settings,
  UtensilsCrossed,
  Zap,
  AlertCircle,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSaleModal,
  onOpenExpenseModal,
  onOpenSettings,
}) => {
  const { user, loginWithGoogle, logout, resetToDemoData, businessName, authError, clearAuthError } = useData();
  const [isConnecting, setIsConnecting] = React.useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsConnecting(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel de Lucros', icon: TrendingUp },
    { id: 'calendario', label: 'Calendário de Vendas', icon: CalendarIcon, badge: '⭐' },
    { id: 'vendas', label: 'Pedidos & Vendas', icon: ShoppingBag },
    { id: 'despesas', label: 'Despesas & Carnes', icon: Receipt },
    { id: 'produtos', label: 'Cardápio & Espetos', icon: UtensilsCrossed },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'relatorio', label: 'Relatório Mensal', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-lg print:hidden text-white">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-950/60 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Espeto<span className="text-orange-500">&</span>Brasa
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-950/80 text-orange-300 border border-orange-500/40">
                  DOMINGOS
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-400 -mt-0.5 hidden sm:block truncate max-w-[260px]">
                {businessName || 'Espetinhos, Salgados & Bebidas Geladas'}
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-stone-800"
              title="Configurar nome do negócio e chave Pix"
            >
              <Settings className="w-4 h-4 text-stone-400" />
              <span className="hidden md:inline font-bold">Ajustes & Pix</span>
            </button>

            {/* Quick Demo Data Reset */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Deseja recarregar os dados de exemplo de espetinhos, energéticos, salgados, clientes e vendas de domingo?')) {
                  resetToDemoData();
                }
              }}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl text-xs transition-colors hidden md:flex items-center gap-1"
              title="Carregar dados de demonstração de espetinhos e bebidas"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Exemplos</span>
            </button>

            {/* Nova Despesa button */}
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-3 py-2 text-stone-300 hover:text-orange-400 hover:bg-stone-800 rounded-xl text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5 border border-stone-800"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>Despesa</span>
            </button>

            {/* Novo Lançamento de Venda (Primary Action) */}
            <button
              type="button"
              onClick={onOpenSaleModal}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-stone-950 rounded-xl text-xs font-black shadow-md shadow-orange-950 hover:shadow-orange-900/50 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Venda</span>
            </button>

            {/* Auth / Cloud Sync Status */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-800">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-extrabold text-stone-200 block truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 justify-end">
                    <Cloud className="w-2.5 h-2.5" /> Nuvem ativa
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full border border-orange-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
                  title="Sair da conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-stone-950 font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                title="Fazer login com Google para sincronizar com o banco de dados na nuvem"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                    <span className="hidden sm:inline">Conectando...</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-stone-950" />
                    <span className="hidden sm:inline">Conectar Nuvem</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Auth Error Notification Banner if login failed */}
        {authError && (
          <div className="mx-2 mb-2 p-3 bg-red-950/90 border border-red-500/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-red-200 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={clearAuthError}
              className="p-1 text-red-300 hover:text-white rounded-lg hover:bg-red-900/50"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5 border-t border-stone-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/90'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1 rounded font-black ${
                      isActive ? 'bg-black/20 text-stone-950' : 'bg-orange-950 text-orange-300 border border-orange-500/30'
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
