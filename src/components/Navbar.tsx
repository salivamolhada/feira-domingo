import React from 'react';
import {
  TreePine,
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
  AlertCircle,
  X,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenSettings: () => void;
  showChristmas: boolean;
  onToggleChristmas: () => void;
}

const STRING_BULBS = [
  '#ef4444', '#fbbf24', '#34d399', '#38bdf8',
  '#ef4444', '#fbbf24', '#34d399', '#38bdf8',
  '#ef4444', '#fbbf24', '#34d399', '#38bdf8',
  '#ef4444', '#fbbf24', '#34d399', '#38bdf8',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSaleModal,
  onOpenExpenseModal,
  onOpenSettings,
  showChristmas,
  onToggleChristmas,
}) => {
  const { user, loginWithGoogle, logout, businessName, authError, clearAuthError } = useData();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [copiedDomain, setCopiedDomain] = React.useState(false);

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
    { id: 'calendario', label: 'Calendário de Vendas', icon: CalendarIcon },
    { id: 'vendas', label: 'Pedidos & Vendas', icon: ShoppingBag },
    { id: 'despesas', label: 'Despesas & Carnes', icon: Receipt },
    { id: 'produtos', label: 'Cardápio & Espetos', icon: UtensilsCrossed },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'relatorio', label: 'Relatório Mensal', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/92 backdrop-blur-md border-b border-emerald-800/80 shadow-xl print:hidden text-white">
      {/* Unclipped Christmas String Lights Trim (Pisca-Pisca) */}
      {showChristmas && (
        <div
          className="h-4 w-full bg-emerald-950 border-b border-emerald-900/90 flex items-center justify-around px-4 overflow-hidden"
          aria-hidden="true"
        >
          {STRING_BULBS.map((color, idx) => (
            <span
              key={idx}
              className="w-2 h-2 rounded-full animate-bulb shrink-0"
              style={{
                backgroundColor: color,
                animationDelay: `${(idx % 5) * 0.28}s`,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-2.5 sm:py-3 gap-x-3 gap-y-2">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group min-w-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-950/70 border border-amber-300/40 group-hover:scale-105 transition-transform shrink-0">
              <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black text-white tracking-tight whitespace-nowrap">
                  Espeto<span className="text-amber-400">&</span>Brasa
                </span>
                <span className="hidden md:inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-red-900/85 text-amber-200 border border-amber-400/40 whitespace-nowrap">
                  NATAL & DOMINGOS
                </span>
              </div>
              <p className="text-[11px] font-medium text-emerald-200/80 -mt-0.5 hidden lg:block truncate max-w-[260px]">
                {businessName || 'Espetinhos, Salgados & Bebidas Geladas'}
              </p>
            </div>
          </div>

          {/* Action Buttons & Auth */}
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {/* Christmas Scene Toggle */}
            <button
              type="button"
              onClick={onToggleChristmas}
              className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 border whitespace-nowrap shrink-0 ${
                showChristmas
                  ? 'bg-emerald-900/90 text-amber-300 border-amber-400/40 hover:bg-emerald-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
              }`}
              title={showChristmas ? 'Ocultar animações de Natal' : 'Ativar animações de Natal'}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden xl:inline font-bold">
                {showChristmas ? 'Natal Ativo' : 'Ativar Natal'}
              </span>
            </button>

            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-emerald-100 hover:text-white hover:bg-emerald-900 rounded-xl text-xs transition-colors flex items-center gap-1.5 border border-emerald-800/80 whitespace-nowrap shrink-0"
              title="Configurar nome do negócio, chave Pix e exemplos"
            >
              <Settings className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="hidden lg:inline font-bold">Ajustes & Pix</span>
            </button>

            {/* Nova Despesa button */}
            <button
              type="button"
              onClick={onOpenExpenseModal}
              className="px-2.5 sm:px-3 py-2 text-emerald-100 hover:text-amber-300 hover:bg-emerald-900 rounded-xl text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5 border border-emerald-800/80 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Despesa</span>
            </button>

            {/* Novo Lançamento de Venda (Primary Action) */}
            <button
              type="button"
              onClick={onOpenSaleModal}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-xl text-xs font-black shadow-md shadow-red-950/60 border border-amber-300/30 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Lançar Venda</span>
            </button>

            {/* Auth / Cloud Sync Status */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-800 shrink-0">
                <div className="text-right hidden md:block">
                  <span className="text-xs font-extrabold text-white block truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-0.5 justify-end">
                    <Cloud className="w-2.5 h-2.5" /> Nuvem ativa
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-8 h-8 rounded-full border border-amber-400/60"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors"
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
                className="px-2.5 sm:px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-black rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                title="Fazer login com Google para sincronizar com o banco de dados na nuvem"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950 shrink-0" />
                    <span className="hidden md:inline">Conectando...</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5 text-stone-950 shrink-0" />
                    <span className="hidden md:inline">Conectar Nuvem</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Auth Error Notification Banner if login failed */}
        {authError && (
          <div className="mb-2.5 p-3.5 bg-emerald-950 border border-red-400/60 rounded-2xl text-xs text-emerald-50 shadow-xl space-y-2 max-h-56 overflow-y-auto">
            {authError.startsWith('DOMINIO_NAO_AUTORIZADO:') ? (
              (() => {
                const domain = authError.replace('DOMINIO_NAO_AUTORIZADO:', '');
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                        <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
                        <span>Autorizar Domínio no Firebase Authentication</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAuthError}
                        className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900"
                        title="Fechar aviso"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-emerald-100 leading-relaxed">
                      O Firebase bloqueia o login do Google quando a URL atual ainda não foi adicionada à lista de domínios autorizados do seu projeto <strong className="text-white">gen-lang-client-0233520699</strong>.
                    </p>

                    <div className="p-3 bg-black/30 rounded-xl border border-emerald-800 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] text-emerald-200 font-medium">Domínio atual a ser autorizado:</span>
                        <div className="flex items-center gap-1.5 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-700 max-w-full overflow-hidden">
                          <code className="text-amber-300 font-mono font-bold select-all truncate">{domain}</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(domain);
                              setCopiedDomain(true);
                              setTimeout(() => setCopiedDomain(false), 2500);
                            }}
                            className="p-1 text-emerald-200 hover:text-white transition-colors shrink-0"
                            title="Copiar domínio"
                          >
                            {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-emerald-200 space-y-1 pt-1">
                        <p className="font-bold text-white">Como liberar em 3 passos simples:</p>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-emerald-100">
                          <li>Abra o Console do Firebase no seu projeto.</li>
                          <li>Vá em <strong>Authentication</strong> → aba <strong>Settings (Configurações)</strong> → <strong>Authorized domains (Domínios autorizados)</strong>.</li>
                          <li>Clique em <strong>Add domain (Adicionar domínio)</strong>, cole <code className="text-amber-300 px-1 bg-emerald-950 rounded">{domain}</code> e salve!</li>
                        </ol>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0233520699/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-xl text-xs transition-colors shadow-sm"
                      >
                        <span>Abrir Configurações no Firebase Console</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="text-[11px] text-emerald-300 font-semibold">
                        Seus dados continuam salvos no navegador normalmente!
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{authError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900"
                  title="Fechar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation Row - wraps cleanly instead of clipping or crowding */}
        <nav
          aria-label="Navegação principal"
          className="flex flex-wrap items-center gap-1 sm:gap-1.5 py-2 border-t border-emerald-800/70"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md border border-amber-300/40'
                    : 'text-emerald-100/85 hover:text-white hover:bg-emerald-900/90'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-200' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
