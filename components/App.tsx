
import React, { useState, useEffect, useCallback } from 'react';
import { InventoryItem, Transaction, ViewType, AppConfig, Client } from '../types';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import InventoryView from './InventoryView';
import SalesView from './SalesView';
import ClientsView from './ClientsView';
import CreditsView from './CreditsView';
import ReportsView from './ReportsView';
import SettingsView from './SettingsView';
import { syncWithSheet, mapSheetDataToInventory, mapSheetDataToTransactions } from '../spreadsheetService';

const DEFAULT_SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbzeCoD4XRzl0Yp5VpLQTRB9cv-r3Ys3PmR52bweq72LLFyP2Pjyg4sN4iYd8hZb17Enuw/exec"; 

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('berjitsu_config');
    if (saved) return JSON.parse(saved);
    return { 
      spreadsheetAppUrl: DEFAULT_SPREADSHEET_URL, 
      isLinked: DEFAULT_SPREADSHEET_URL.length > 10 
    };
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      const savedInv = localStorage.getItem('berjitsu_inventory');
      const savedTrans = localStorage.getItem('berjitsu_transactions');
      const savedClients = localStorage.getItem('berjitsu_clients');
      
      if (savedInv) setInventory(JSON.parse(savedInv));
      if (savedTrans) setTransactions(JSON.parse(savedTrans));
      if (savedClients) setClients(JSON.parse(savedClients));

      if (config.isLinked && config.spreadsheetAppUrl) {
        setIsSyncing(true);
        try {
          const res = await syncWithSheet(config.spreadsheetAppUrl, 'READ');
          if (res) {
            if (res.inventory) setInventory(mapSheetDataToInventory(res.inventory));
            if (res.transactions) setTransactions(mapSheetDataToTransactions(res.transactions));
            if (res.clients && res.clients.length > 1) {
              const mappedClients = res.clients.slice(1).map((r: any[]) => ({
                id: r[0], name: r[1], phone: r[2], email: r[3], address: r[4], createdAt: r[5]
              }));
              setClients(mappedClients);
            }
          }
        } catch (e) { 
          console.error("Error de sincronización inicial:", e); 
        } finally { 
          setIsSyncing(false); 
        }
      }
      setIsInitialLoad(false);
    };
    initApp();
  }, [config.isLinked, config.spreadsheetAppUrl]);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('berjitsu_inventory', JSON.stringify(inventory));
      localStorage.setItem('berjitsu_transactions', JSON.stringify(transactions));
      localStorage.setItem('berjitsu_clients', JSON.stringify(clients));
      localStorage.setItem('berjitsu_config', JSON.stringify(config));
    }
  }, [inventory, transactions, clients, config, isInitialLoad]);

  const pushToRemote = useCallback((payload: any, action: string) => {
    if (config.isLinked && config.spreadsheetAppUrl) {
      syncWithSheet(config.spreadsheetAppUrl, 'WRITE', payload, action as any);
    }
  }, [config.isLinked, config.spreadsheetAppUrl]);

  const handleSale = (cartItems: { itemId: string, quantity: number }[], isCredit: boolean, clientId: string, initialPayment: number) => {
    const client = clients.find(c => c.id === clientId);
    const updatedInv = inventory.map(item => {
      const sold = cartItems.find(si => si.itemId === item.id);
      return sold ? { ...item, stock: item.stock - sold.quantity } : item;
    });

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      type: 'SALE',
      items: cartItems.map(si => {
        const item = inventory.find(i => i.id === si.itemId);
        return { itemId: si.itemId, itemName: item?.name, quantity: si.quantity, priceAtSale: item?.price || 0 };
      }),
      totalAmount: cartItems.reduce((acc, curr) => {
        const item = inventory.find(i => i.id === curr.itemId);
        return acc + ((item?.price || 0) * curr.quantity);
      }, 0),
      timestamp: new Date().toISOString(),
      paymentStatus: isCredit ? 'CREDIT' : 'PAID',
      clientId: clientId || 'CONTADO',
      customerName: client?.name || 'Venta Mostrador',
      totalPaid: isCredit ? (initialPayment || 0) : 0,
      payments: isCredit && initialPayment > 0 ? [{ amount: initialPayment, timestamp: new Date().toISOString() }] : []
    };

    if (!isCredit) newTransaction.totalPaid = newTransaction.totalAmount;

    setTransactions(prev => [newTransaction, ...prev]);
    setInventory(updatedInv);
    
    pushToRemote(newTransaction, 'RECORD_SALE');
    pushToRemote(updatedInv, 'UPDATE_INVENTORY');
  };

  const addPayment = (transactionId: string, amount: number) => {
    const updated: Transaction[] = transactions.map(t => {
      if (t.id === transactionId) {
        const newPaid = t.totalPaid + amount;
        const updatedTrans: Transaction = {
          ...t,
          totalPaid: newPaid,
          paymentStatus: (newPaid >= t.totalAmount ? 'PAID' : 'CREDIT') as 'PAID' | 'CREDIT',
          payments: [...t.payments, { amount, timestamp: new Date().toISOString() }]
        };
        pushToRemote(updatedTrans, 'RECORD_SALE');
        return updatedTrans;
      }
      return t;
    });
    setTransactions(updated);
  };

  const handleUpdateStock = (id: string, amount: number) => {
    const updated = inventory.map(item => 
      item.id === id ? { ...item, stock: item.stock + amount, lastUpdated: new Date().toISOString() } : item
    );
    setInventory(updated);
    pushToRemote(updated, 'UPDATE_INVENTORY');
  };

  const handleAddItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'ITM-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      lastUpdated: new Date().toISOString()
    };
    const updated = [...inventory, newItem];
    setInventory(updated);
    pushToRemote(updated, 'UPDATE_INVENTORY');
  };

  const handleDeleteItem = (id: string) => {
    const updated = inventory.filter(item => item.id !== id);
    setInventory(updated);
    pushToRemote(updated, 'UPDATE_INVENTORY');
  };

  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newC: Client = { ...clientData, id: 'CL-' + Math.random().toString(36).substr(2, 5), createdAt: new Date().toISOString() };
    const updated = [...clients, newC];
    setClients(updated);
    pushToRemote(updated, 'UPDATE_CLIENTS');
  };

  const handleDeleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    pushToRemote(updated, 'UPDATE_CLIENTS');
  };

  if (isInitialLoad) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="w-20 h-20 bg-green-500 rounded-3xl mb-6 animate-bounce flex items-center justify-center shadow-2xl shadow-green-500/20">
        <img src="logo.png" alt="Berjitsu" className="w-12 h-12 object-contain" />
      </div>
      <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">MOV. BERJITSU</h2>
      <p className="text-slate-400 font-bold text-sm animate-pulse uppercase tracking-widest">Sincronizando Base de Datos...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeView={activeView} setActiveView={setActiveView} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${isCollapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-64'} pb-24 lg:pb-8`}>
        <header className="mb-8 flex justify-between items-center mt-12 lg:mt-0">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">{activeView}</h1>
          {isSyncing && (
            <div className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm">
              <i className="fa-solid fa-cloud-arrow-up animate-bounce"></i>
              NUBE ACTIVA
            </div>
          )}
        </header>

        <div className="fade-in max-w-7xl mx-auto">
          {activeView === 'DASHBOARD' && <DashboardView inventory={inventory} transactions={transactions} />}
          {activeView === 'INVENTORY' && <InventoryView inventory={inventory} onUpdateStock={handleUpdateStock} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem} />}
          {activeView === 'SALES' && <SalesView inventory={inventory} clients={clients} onSale={handleSale} />}
          {activeView === 'CLIENTS' && <ClientsView clients={clients} onAddClient={handleAddClient} onDeleteClient={handleDeleteClient} />}
          {activeView === 'CREDITS' && <CreditsView transactions={transactions} clients={clients} onAddPayment={addPayment} />}
          {activeView === 'REPORTS' && <ReportsView transactions={transactions} inventory={inventory} onAddPayment={addPayment} />}
          {activeView === 'SETTINGS' && <SettingsView config={config} onSaveConfig={setConfig} />}
        </div>
      </main>
    </div>
  );
};

export default App;
