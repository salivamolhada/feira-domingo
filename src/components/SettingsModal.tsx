import React, { useState, useEffect } from 'react';
import { X, DollarSign, Store, CheckCircle2, Download, RefreshCw, TreePine } from 'lucide-react';
import { useData } from '../context/DataContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    businessName,
    pixKey,
    pixReceiver,
    updateBusinessSettings,
    resetToDemoData,
    sales,
    customers,
    products,
    expenses
  } = useData();

  const [localBusinessName, setLocalBusinessName] = useState<string>(businessName);
  const [localPixKey, setLocalPixKey] = useState<string>(pixKey);
  const [localPixReceiver, setLocalPixReceiver] = useState<string>(pixReceiver);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [confirmingDemo, setConfirmingDemo] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLocalBusinessName(businessName);
      setLocalPixKey(pixKey);
      setLocalPixReceiver(pixReceiver);
      setSavedSuccess(false);
      setConfirmingDemo(false);
    }
  }, [isOpen, businessName, pixKey, pixReceiver]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings({
      businessName: localBusinessName.trim() || 'Espeto & Brasa - Espetinhos & Bebidas',
      pixKey: localPixKey.trim(),
      pixReceiver: localPixReceiver.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      businessName: localBusinessName,
      pixKey: localPixKey,
      sales,
      customers,
      products,
      expenses,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-espetobrasa-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-200 max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-red-100 flex items-center justify-between bg-gradient-to-r from-red-50 via-amber-50/70 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-900 text-amber-400 flex items-center justify-center shadow-md">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">Configurações do Negócio</h2>
              <p className="text-xs text-stone-500 font-medium">Nome do seu negócio e chave Pix para cobranças</p>
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
              Nome do Estabelecimento / Venda
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400">
                <Store className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Ex: Espeto & Brasa - Espetinhos & Bebidas"
                value={localBusinessName}
                onChange={(e) => setLocalBusinessName(e.target.value)}
                className="w-full text-sm font-semibold pl-9 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Esse nome aparecerá nos relatórios impressos e nas mensagens de WhatsApp enviadas aos seus clientes.
            </p>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-amber-50/70 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Dados Pix para Cobrança Automática
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Sua Chave Pix (CPF, Celular, E-mail ou Aleatória)
              </label>
              <input
                type="text"
                placeholder="Ex: (11) 98888-7777 ou espeto@brasa.com"
                value={localPixKey}
                onChange={(e) => setLocalPixKey(e.target.value)}
                className="w-full text-xs font-bold px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-stone-900 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Nome do Titular da Conta Pix (opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo dos Santos"
                value={localPixReceiver}
                onChange={(e) => setLocalPixReceiver(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:border-emerald-600"
              />
            </div>

            <p className="text-[11px] text-emerald-950 font-medium">
              Ao preencher sua chave Pix, ela será inserida automaticamente nas mensagens de confirmação e cobrança de pedidos pelo WhatsApp.
            </p>
          </div>

          {/* Backup & Data Actions */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Backup e Manutenção
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Backup (JSON)
              </button>

              {confirmingDemo ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs">
                  <span className="font-bold text-red-900">Recarregar exemplos?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetToDemoData();
                      setConfirmingDemo(false);
                      onClose();
                    }}
                    className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black"
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDemo(false)}
                    className="px-2 py-0.5 text-stone-600 hover:text-stone-900 font-bold"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDemo(true)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recarregar Exemplos
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-red-950/20 flex items-center gap-1.5 transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvo!
                </>
              ) : (
                'Salvar Configurações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
