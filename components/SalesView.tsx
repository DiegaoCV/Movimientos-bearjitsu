
import React, { useState, useMemo } from 'react';
import { InventoryItem, Client } from '../types';

interface SalesViewProps {
  inventory: InventoryItem[];
  clients: Client[];
  onSale: (items: { itemId: string, quantity: number }[], isCredit: boolean, customerId: string, initialPayment: number) => void;
}

const SalesView: React.FC<SalesViewProps> = ({ inventory, clients, onSale }) => {
  const [cart, setCart] = useState<{ itemId: string, quantity: number }[]>([]);
  
  // Estado para lo que el usuario escribe
  const [inputValue, setInputValue] = useState('');
  // Estado real que filtra
  const [filterQuery, setFilterQuery] = useState('');
  
  const [isCredit, setIsCredit] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [initialPayment, setInitialPayment] = useState(0);

  const normalize = (text: any) => 
    String(text || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Filtrado optimizado para mostrar solo artículos con stock
  const filteredItems = useMemo(() => {
    const term = normalize(filterQuery);
    const available = inventory.filter(i => Number(i.stock) > 0);
    
    if (!term) return available;
    
    return available.filter(i => {
      const name = normalize(i.name);
      const sku = normalize(i.sku);
      return name.includes(term) || sku.includes(term);
    });
  }, [inventory, filterQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterQuery(inputValue);
  };

  const clearSearch = () => {
    setInputValue('');
    setFilterQuery('');
  };

  const addToCart = (itemId: string) => {
    const item = inventory.find(i => String(i.id) === String(itemId));
    if (!item) return;

    setCart(prev => {
      const existing = prev.find(p => String(p.itemId) === String(itemId));
      if (existing) {
        if (existing.quantity >= Number(item.stock)) {
          alert(`Stock insuficiente para: ${item.name}`);
          return prev;
        }
        return prev.map(p => p.itemId === itemId ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { itemId: itemId, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(p => p.itemId !== itemId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (isCredit && !selectedClientId) {
      alert("Para ventas a crédito debe seleccionar un cliente.");
      return;
    }
    onSale(cart, isCredit, selectedClientId, initialPayment);
    setCart([]);
    setSelectedClientId('');
    setInitialPayment(0);
    setIsCredit(false);
    clearSearch();
  };

  const total = useMemo(() => {
    return cart.reduce((acc, curr) => {
      const item = inventory.find(i => String(i.id) === String(curr.itemId));
      return acc + (item ? Number(item.price) * curr.quantity : 0);
    }, 0);
  }, [cart, inventory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          {/* Buscador con Botón */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                placeholder="Escriba el nombre o SKU y presione Buscar..."
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-700"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-6 text-slate-300 text-lg group-focus-within:text-green-500 transition-colors"></i>
            </div>
            <button 
              type="submit"
              className="bg-slate-900 text-white px-8 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-search"></i> BUSCAR
            </button>
            {(inputValue || filterQuery) && (
              <button 
                type="button" 
                onClick={clearSearch}
                className="bg-slate-100 text-slate-400 hover:text-red-500 px-4 rounded-2xl font-bold transition-all"
              >
                X
              </button>
            )}
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item.id)}
                className="flex items-start gap-4 p-5 border border-slate-100 rounded-3xl hover:bg-green-50 hover:border-green-200 transition-all text-left group active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-green-600 shadow-sm shrink-0">
                  <i className="fa-solid fa-cart-plus text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 leading-tight mb-1 whitespace-normal break-words">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.stock} DISPONIBLES</p>
                  <p className="font-black text-green-600 text-lg mt-1">₡{item.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <i className="fa-solid fa-box-open text-3xl text-slate-200 mb-3 block"></i>
                <p className="text-slate-400 font-bold">No hay coincidencias para "{filterQuery}"</p>
                <button onClick={clearSearch} className="text-green-600 text-sm font-black underline mt-2">Limpiar búsqueda</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 sticky top-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <i className="fa-solid fa-basket-shopping text-green-600"></i> MI CARRITO
          </h3>
          
          <div className="space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.map(c => {
              const item = inventory.find(i => String(i.id) === String(c.itemId));
              return item ? (
                <div key={c.itemId} className="flex justify-between items-start bg-slate-50 p-4 rounded-3xl border border-slate-100 group">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-black text-slate-800 text-sm whitespace-normal break-words leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{c.quantity} x ₡{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-black text-slate-800">₡{(item.price * c.quantity).toLocaleString()}</span>
                    <button onClick={() => removeFromCart(c.itemId)} className="text-[10px] text-red-500 font-black mt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all uppercase underline">Borrar</button>
                  </div>
                </div>
              ) : null;
            })}
            {cart.length === 0 && (
              <div className="text-center py-10 opacity-30">
                <p className="font-bold">Agregue productos</p>
              </div>
            )}
          </div>

          <div className="space-y-6 border-t border-slate-100 pt-8">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setIsCredit(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${!isCredit ? 'bg-white shadow-md text-green-600' : 'text-slate-400'}`}>CONTADO</button>
              <button onClick={() => setIsCredit(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${isCredit ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>CRÉDITO</button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seleccionar Cliente</label>
              <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-green-500" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                <option value="">Consumidor Final</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {isCredit && (
              <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100">
                <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Monto Adelanto (₡)</label>
                <input type="number" className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-xl font-black text-blue-700 outline-none" value={initialPayment || ''} onChange={e => setInitialPayment(Number(e.target.value))} placeholder="0" />
              </div>
            )}

            <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Venta</span>
              <span className="text-3xl font-black tracking-tighter">₡{total.toLocaleString()}</span>
            </div>

            <button 
              disabled={cart.length === 0} 
              onClick={handleCheckout} 
              className={`w-full py-6 rounded-[2rem] font-black text-white shadow-2xl transition-all active:scale-[0.96] flex items-center justify-center gap-3 ${isCredit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <i className={`fa-solid ${isCredit ? 'fa-file-invoice-dollar' : 'fa-check-circle'}`}></i>
              {isCredit ? 'CONFIRMAR CRÉDITO' : 'PROCESAR COBRO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
