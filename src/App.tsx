import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/Navbar';
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
    <div className="min-h-screen bg-[#fcfbfa] text-stone-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSaleModal={() => handleOpenNewSale()}
        onOpenExpenseModal={handleOpenNewExpense}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-red-500 text-stone-950 shadow-xl shadow-orange-950/40 flex items-center justify-center active:scale-95 transition-transform"
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
