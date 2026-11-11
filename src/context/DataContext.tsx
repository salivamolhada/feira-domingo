import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  testConnection
} from '../firebase';
import { Sale, Customer, Product, Expense, PaymentStatus } from '../types';
import { generateSeedData } from '../utils/seedData';
import { isSundayDate, formatToDateInput } from '../utils/dateUtils';

interface DataContextType {
  user: User | null;
  isAuthReady: boolean;
  isSyncing: boolean;
  sales: Sale[];
  customers: Customer[];
  products: Product[];
  expenses: Expense[];
  saveSale: (saleData: Partial<Sale>, id?: string) => Promise<string>;
  deleteSale: (id: string) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus, amountPaid?: number) => Promise<void>;
  saveCustomer: (customerData: Partial<Customer>, id?: string) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  saveProduct: (productData: Partial<Product>, id?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveExpense: (expenseData: Partial<Expense>, id?: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SALES: 'docegestao_local_sales',
  CUSTOMERS: 'docegestao_local_customers',
  PRODUCTS: 'docegestao_local_products',
  EXPENSES: 'docegestao_local_expenses',
  INIT_FLAG: 'docegestao_seeded_v1'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatToDateInput(new Date()));

  // 1. Initial Load from LocalStorage if not logged in
  const loadLocalData = useCallback(() => {
    try {
      const storedSales = localStorage.getItem(STORAGE_KEYS.SALES);
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const hasSeeded = localStorage.getItem(STORAGE_KEYS.INIT_FLAG);

      if (!hasSeeded && !storedProducts && !storedSales) {
        // Auto-seed initial delicious demo data so the app looks alive and ready right out of the box
        const demo = generateSeedData('local-user');
        setSales(demo.sales);
        setCustomers(demo.customers);
        setProducts(demo.products);
        setExpenses(demo.expenses);
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(demo.sales));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(demo.customers));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(demo.products));
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(demo.expenses));
        localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
      } else {
        if (storedSales) setSales(JSON.parse(storedSales));
        if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
        if (storedProducts) setProducts(JSON.parse(storedProducts));
        if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      }
    } catch (err) {
      console.error('Error loading local storage data:', err);
    }
  }, []);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        testConnection();
      } else {
        loadLocalData();
      }
    });

    return () => unsubscribe();
  }, [loadLocalData]);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    const userId = user.uid;

    const salesRef = collection(db, 'users', userId, 'sales');
    const custRef = collection(db, 'users', userId, 'customers');
    const prodRef = collection(db, 'users', userId, 'products');
    const expRef = collection(db, 'users', userId, 'expenses');

    let isFirstSales = true;
    const unsubSales = onSnapshot(
      salesRef,
      (snapshot) => {
        const loaded: Sale[] = [];
        snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Sale));
        // Sort by date desc
        loaded.sort((a, b) => b.date.localeCompare(a.date));
        setSales(loaded);
        setIsSyncing(false);

        // If user is freshly logged in and has 0 sales in Firestore, check if we have local sales to sync up
        if (isFirstSales && loaded.length === 0) {
          isFirstSales = false;
          const localStored = localStorage.getItem(STORAGE_KEYS.SALES);
          if (localStored) {
            const localList: Sale[] = JSON.parse(localStored);
            localList.forEach((s) => {
              const newDocRef = doc(collection(db, 'users', userId, 'sales'));
              setDoc(newDocRef, { ...s, userId, id: newDocRef.id }).catch(console.error);
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/sales`);
        setIsSyncing(false);
      }
    );

    let isFirstCust = true;
    const unsubCust = onSnapshot(
      custRef,
      (snapshot) => {
        const loaded: Customer[] = [];
        snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Customer));
        loaded.sort((a, b) => a.name.localeCompare(b.name));
        setCustomers(loaded);

        if (isFirstCust && loaded.length === 0) {
          isFirstCust = false;
          const localStored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
          if (localStored) {
            const list: Customer[] = JSON.parse(localStored);
            list.forEach((c) => {
              const newDocRef = doc(collection(db, 'users', userId, 'customers'));
              setDoc(newDocRef, { ...c, userId, id: newDocRef.id }).catch(console.error);
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/customers`);
      }
    );

    let isFirstProd = true;
    const unsubProd = onSnapshot(
      prodRef,
      (snapshot) => {
        const loaded: Product[] = [];
        snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Product));
        loaded.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(loaded);

        if (isFirstProd && loaded.length === 0) {
          isFirstProd = false;
          const localStored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          if (localStored) {
            const list: Product[] = JSON.parse(localStored);
            list.forEach((p) => {
              const newDocRef = doc(collection(db, 'users', userId, 'products'));
              setDoc(newDocRef, { ...p, userId, id: newDocRef.id }).catch(console.error);
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/products`);
      }
    );

    let isFirstExp = true;
    const unsubExp = onSnapshot(
      expRef,
      (snapshot) => {
        const loaded: Expense[] = [];
        snapshot.forEach((d) => loaded.push({ ...d.data(), id: d.id } as Expense));
        loaded.sort((a, b) => b.date.localeCompare(a.date));
        setExpenses(loaded);

        if (isFirstExp && loaded.length === 0) {
          isFirstExp = false;
          const localStored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
          if (localStored) {
            const list: Expense[] = JSON.parse(localStored);
            list.forEach((e) => {
              const newDocRef = doc(collection(db, 'users', userId, 'expenses'));
              setDoc(newDocRef, { ...e, userId, id: newDocRef.id }).catch(console.error);
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${userId}/expenses`);
      }
    );

    return () => {
      unsubSales();
      unsubCust();
      unsubProd();
      unsubExp();
    };
  }, [user]);

  // Persist locally if offline or guest
  const updateLocalStateAndStorage = <T extends { id: string }>(
    key: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    updater: (prev: T[]) => T[]
  ) => {
    setter((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
      return next;
    });
  };

  // Actions
  const saveSale = async (saleData: Partial<Sale>, existingId?: string): Promise<string> => {
    const saleDate = saleData.date || formatToDateInput(new Date());
    const isSunday = isSundayDate(saleDate);

    const fullSale: Sale = {
      id: existingId || `sale-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.uid || 'local-user',
      customerName: saleData.customerName || 'Cliente Balcão',
      customerPhone: saleData.customerPhone || '',
      customerId: saleData.customerId,
      date: saleDate,
      isSunday,
      items: saleData.items || [],
      totalAmount: Number(saleData.totalAmount) || 0,
      amountPaid: Number(saleData.amountPaid) || 0,
      paymentStatus: saleData.paymentStatus || 'pago',
      paymentMethod: saleData.paymentMethod || 'pix',
      orderStatus: saleData.orderStatus || 'entregue',
      deliveryTime: saleData.deliveryTime,
      deliveryType: saleData.deliveryType || 'retirada',
      deliveryFee: saleData.deliveryFee || 0,
      discount: saleData.discount || 0,
      notes: saleData.notes || '',
      createdAt: saleData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        const saleRef = doc(db, 'users', user.uid, 'sales', fullSale.id);
        await setDoc(saleRef, fullSale);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sales/${fullSale.id}`);
      }
    } else {
      updateLocalStateAndStorage<Sale>(STORAGE_KEYS.SALES, setSales, (prev) => {
        const idx = prev.findIndex((s) => s.id === fullSale.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullSale;
          return updated;
        }
        return [fullSale, ...prev];
      });
    }

    // Auto-create or link customer if name provided
    if (fullSale.customerName && fullSale.customerName.trim() !== 'Cliente Balcão') {
      const exists = customers.some(
        (c) => c.name.toLowerCase().trim() === fullSale.customerName.toLowerCase().trim()
      );
      if (!exists) {
        saveCustomer({
          name: fullSale.customerName.trim(),
          phone: fullSale.customerPhone,
          notes: 'Criado automaticamente pelo pedido de doces',
        }).catch(console.error);
      }
    }

    return fullSale.id;
  };

  const deleteSale = async (id: string): Promise<void> => {
    if (user) {
      try {
        const saleRef = doc(db, 'users', user.uid, 'sales', id);
        await deleteDoc(saleRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sales/${id}`);
      }
    } else {
      updateLocalStateAndStorage<Sale>(STORAGE_KEYS.SALES, setSales, (prev) =>
        prev.filter((s) => s.id !== id)
      );
    }
  };

  const updatePaymentStatus = async (
    id: string,
    status: PaymentStatus,
    amountPaid?: number
  ): Promise<void> => {
    const sale = sales.find((s) => s.id === id);
    if (!sale) return;

    let newAmountPaid = amountPaid !== undefined ? amountPaid : sale.amountPaid;
    if (status === 'pago') {
      newAmountPaid = sale.totalAmount;
    } else if (status === 'pendente' || status === 'fiado') {
      if (amountPaid === undefined) newAmountPaid = 0;
    }

    await saveSale(
      {
        ...sale,
        paymentStatus: status,
        amountPaid: newAmountPaid,
      },
      id
    );
  };

  const saveCustomer = async (
    customerData: Partial<Customer>,
    existingId?: string
  ): Promise<Customer> => {
    const fullCustomer: Customer = {
      id: existingId || `cust-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.uid || 'local-user',
      name: customerData.name || 'Novo Cliente',
      phone: customerData.phone || '',
      address: customerData.address || '',
      notes: customerData.notes || '',
      createdAt: customerData.createdAt || new Date().toISOString(),
    };

    if (user) {
      try {
        const custRef = doc(db, 'users', user.uid, 'customers', fullCustomer.id);
        await setDoc(custRef, fullCustomer);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/customers/${fullCustomer.id}`);
      }
    } else {
      updateLocalStateAndStorage<Customer>(STORAGE_KEYS.CUSTOMERS, setCustomers, (prev) => {
        const idx = prev.findIndex((c) => c.id === fullCustomer.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullCustomer;
          return updated;
        }
        return [...prev, fullCustomer];
      });
    }

    return fullCustomer;
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    if (user) {
      try {
        const custRef = doc(db, 'users', user.uid, 'customers', id);
        await deleteDoc(custRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/customers/${id}`);
      }
    } else {
      updateLocalStateAndStorage<Customer>(STORAGE_KEYS.CUSTOMERS, setCustomers, (prev) =>
        prev.filter((c) => c.id !== id)
      );
    }
  };

  const saveProduct = async (productData: Partial<Product>, existingId?: string): Promise<void> => {
    const fullProduct: Product = {
      id: existingId || `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.uid || 'local-user',
      name: productData.name || 'Novo Doce',
      category: productData.category || 'Geral',
      price: Number(productData.price) || 0,
      costPrice: Number(productData.costPrice) || 0,
      unit: productData.unit || 'unidade',
      active: productData.active !== undefined ? productData.active : true,
      description: productData.description || '',
      createdAt: productData.createdAt || new Date().toISOString(),
    };

    if (user) {
      try {
        const prodRef = doc(db, 'users', user.uid, 'products', fullProduct.id);
        await setDoc(prodRef, fullProduct);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/products/${fullProduct.id}`);
      }
    } else {
      updateLocalStateAndStorage<Product>(STORAGE_KEYS.PRODUCTS, setProducts, (prev) => {
        const idx = prev.findIndex((p) => p.id === fullProduct.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullProduct;
          return updated;
        }
        return [...prev, fullProduct];
      });
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    if (user) {
      try {
        const prodRef = doc(db, 'users', user.uid, 'products', id);
        await deleteDoc(prodRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/products/${id}`);
      }
    } else {
      updateLocalStateAndStorage<Product>(STORAGE_KEYS.PRODUCTS, setProducts, (prev) =>
        prev.filter((p) => p.id !== id)
      );
    }
  };

  const saveExpense = async (expenseData: Partial<Expense>, existingId?: string): Promise<void> => {
    const fullExpense: Expense = {
      id: existingId || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.uid || 'local-user',
      description: expenseData.description || 'Despesa Confeitaria',
      category: expenseData.category || 'ingredientes',
      amount: Number(expenseData.amount) || 0,
      date: expenseData.date || formatToDateInput(new Date()),
      paymentMethod: expenseData.paymentMethod || 'pix',
      notes: expenseData.notes || '',
      createdAt: expenseData.createdAt || new Date().toISOString(),
    };

    if (user) {
      try {
        const expRef = doc(db, 'users', user.uid, 'expenses', fullExpense.id);
        await setDoc(expRef, fullExpense);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/expenses/${fullExpense.id}`);
      }
    } else {
      updateLocalStateAndStorage<Expense>(STORAGE_KEYS.EXPENSES, setExpenses, (prev) => {
        const idx = prev.findIndex((e) => e.id === fullExpense.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = fullExpense;
          return updated;
        }
        return [fullExpense, ...prev];
      });
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (user) {
      try {
        const expRef = doc(db, 'users', user.uid, 'expenses', id);
        await deleteDoc(expRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/expenses/${id}`);
      }
    } else {
      updateLocalStateAndStorage<Expense>(STORAGE_KEYS.EXPENSES, setExpenses, (prev) =>
        prev.filter((e) => e.id !== id)
      );
    }
  };

  const resetToDemoData = async () => {
    const uid = user ? user.uid : 'local-user';
    const demo = generateSeedData(uid);

    if (user) {
      setIsSyncing(true);
      try {
        // Upload products
        for (const p of demo.products) {
          await setDoc(doc(db, 'users', uid, 'products', p.id), p);
        }
        // Upload customers
        for (const c of demo.customers) {
          await setDoc(doc(db, 'users', uid, 'customers', c.id), c);
        }
        // Upload sales
        for (const s of demo.sales) {
          await setDoc(doc(db, 'users', uid, 'sales', s.id), s);
        }
        // Upload expenses
        for (const e of demo.expenses) {
          await setDoc(doc(db, 'users', uid, 'expenses', e.id), e);
        }
      } catch (err) {
        console.error('Error seeding to firestore:', err);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setSales(demo.sales);
      setCustomers(demo.customers);
      setProducts(demo.products);
      setExpenses(demo.expenses);
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(demo.sales));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(demo.customers));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(demo.products));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(demo.expenses));
    }
  };

  const clearAllData = async () => {
    if (user) {
      setIsSyncing(true);
      try {
        for (const s of sales) {
          await deleteDoc(doc(db, 'users', user.uid, 'sales', s.id));
        }
        for (const c of customers) {
          await deleteDoc(doc(db, 'users', user.uid, 'customers', c.id));
        }
        for (const e of expenses) {
          await deleteDoc(doc(db, 'users', user.uid, 'expenses', e.id));
        }
      } catch (err) {
        console.error('Error clearing firestore:', err);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setSales([]);
      setCustomers([]);
      setExpenses([]);
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        user,
        isAuthReady,
        isSyncing,
        sales,
        customers,
        products,
        expenses,
        saveSale,
        deleteSale,
        updatePaymentStatus,
        saveCustomer,
        deleteCustomer,
        saveProduct,
        deleteProduct,
        saveExpense,
        deleteExpense,
        resetToDemoData,
        clearAllData,
        loginWithGoogle,
        logout,
        selectedCalendarDate,
        setSelectedCalendarDate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
