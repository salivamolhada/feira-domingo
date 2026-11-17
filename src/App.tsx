import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { ChristmasScene, ChristmasSkyStage } from './components/ChristmasScene';
import { SaleModal } from './components/SaleModal';
import { ExpenseModal } from './components/ExpenseModal';
import { ProductModal } from './components/ProductModal';
import { CustomerModal } from './components/CustomerModal';
import { SettingsModal } from './components/SettingsModal';

import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { SalesView } from './views/SalesView';
import { ExpensesView } from './views/ExpensesView';
import { ProductsView } from './views/ProductsView';
import { CustomersView } from './views/CustomersView';
import { ReportView } from './views/ReportView';

import { Sale, Expense, Product, Customer } from './types';
import { Plus } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showChristmas, setShowChristmas] = useState<boolean>(true);

  // Modal States
  const [isSaleModalOpen, setIsSaleModalOpen] = useState<boolean>(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [saleDefaultDate, setSaleDefaultDate] = useState<string | undefined>(undefined);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Handlers
  const handleOpenNewSale = (date?: string) => {
    setSaleToEdit(null);
    setSaleDefaultDate(date);
    setIsSaleModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setSaleToEdit(sale);
    setSaleDefaultDate(sale.date);
    setIsSaleModalOpen(true);
  };

  const handleOpenNewExpense = () => {
    setExpenseToEdit(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenNewCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  return (
    <div className="min-h-screen relative bg-[#071913] print:bg-white text-stone-900 font-sans flex flex-col selection:bg-red-600 selection:text-white">
      {/* Animated Christmas Background Scene */}
      <ChristmasScene enabled={showChristmas} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSaleModal={() => handleOpenNewSale()}
        onOpenExpenseModal={handleOpenNewExpense}
        onOpenSettings={() => setIsSettingsOpen(true)}
        showChristmas={showChristmas}
        onToggleChristmas={() => setShowChristmas((prev) => !prev)}
      />

      {/* Dedicated Unobstructed Sky Stage for Flying Santa, Reindeer & Dropping Presents */}
      <ChristmasSkyStage enabled={showChristmas} />

      {/* Main Container */}
      <main className={`relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-36 sm:pb-44 print:pt-4 print:pb-4 ${showChristmas ? 'pt-2 sm:pt-3' : 'pt-6'}`}>
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenSaleModal={() => handleOpenNewSale()}
            onOpenExpenseModal={handleOpenNewExpense}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarView
            onOpenSaleModalWithDate={(date) => handleOpenNewSale(date)}
            onEditSale={handleEditSale}
          />
        )}

        {activeTab === 'vendas' && (
          <SalesView
            onOpenSaleModal={() => handleOpenNewSale()}
            onEditSale={handleEditSale}
          />
        )}

        {activeTab === 'despesas' && (
          <ExpensesView
            onOpenExpenseModal={handleOpenNewExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {activeTab === 'produtos' && (
          <ProductsView
            onOpenProductModal={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'clientes' && (
          <CustomersView
            onOpenCustomerModal={handleOpenNewCustomer}
            onEditCustomer={handleEditCustomer}
          />
        )}

        {activeTab === 'relatorio' && <ReportView />}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30 print:hidden flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => handleOpenNewSale()}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white shadow-xl shadow-red-950/60 border border-amber-300/60 flex items-center justify-center active:scale-95 transition-transform"
          title="Novo Lançamento de Venda"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Modals */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        saleToEdit={saleToEdit}
        defaultDate={saleDefaultDate}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
