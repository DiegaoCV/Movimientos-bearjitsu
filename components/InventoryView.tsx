
import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onUpdateStock: (id: string, amount: number) => void;
  onAddItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onDeleteItem: (id: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, onUpdateStock, onAddItem, onDeleteItem }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Estado para lo que el usuario escribe en el cuadro
  const [inputValue, setInputValue] = useState('');
  // Estado real que filtra la lista (se actualiza al dar click en Buscar)
  const [filterQuery, setFilterQuery] = useState('');
  
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0
  });

  const normalize = (text: any) => 
    String(text || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Filtrado basado únicamente en filterQuery
  const filteredItems = useMemo(() => {
    const term = normalize(filterQuery);
    if (!term) return inventory;
    
    return inventory.filter(i => {
      const name = normalize(i.name);
      const sku = normalize(i.sku);
      const category = normalize(i.category);
      return name.includes(term) || sku.includes(term) || category.includes(term);
    });
  }, [inventory, filterQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilterQuery(inputValue);
  };

  const clearSearch = () => {
    setInputValue('');
    setFilterQuery('');
  };

  const handleStockUpdate = (id: string) => {
    const amount = stockInputs[id];
    if (amount === undefined || amount <= 0) {
      alert("Por favor, ingrese una cantidad mayor a 0.");
      return;
    }
    onUpdateStock(id, amount);
    setStockInputs(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Inventario Maestro</h3>
          <p className="text-sm text-slate-400 font-medium">Control total de stock y artículos</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> NUEVO ARTÍCULO
        </button>
      </div>

      {/* Buscador Profesional con Botón */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <input 
              type="text" 
              placeholder="Buscar por Nombre, SKU o Categoría..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-700"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-5 text-slate-300 text-lg group-focus-within:text-green-500 transition-colors"></i>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-search text-sm"></i> BUSCAR
            </button>
            {(inputValue || filterQuery) && (
              <button 
                type="button"
                onClick={clearSearch}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 px-6 py-4 rounded-2xl font-bold transition-all"
              >
                LIMPIAR
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest min-w-[320px]">Producto / SKU</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Categoría</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Precio</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">Ajuste</th>
                <th className="px-8 py-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-800 text-base leading-tight break-words whitespace-normal mb-1">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{item.sku}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center font-bold text-slate-700 whitespace-nowrap">
                    ₡{Number(item.price).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`min-w-[45px] h-10 flex items-center justify-center rounded-xl font-black text-sm px-3 ${
                        item.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-20 px-3 py-2 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-bold outline-none"
                        value={stockInputs[item.id] === 0 ? '' : (stockInputs[item.id] || '')}
                        onChange={e => setStockInputs(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                      />
                      <button 
                        onClick={() => handleStockUpdate(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-md"
                      >
                        <i className="fa-solid fa-plus text-xs"></i>
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => { if(confirm('¿Eliminar este producto?')) onDeleteItem(item.id) }}
                      className="w-10 h-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <i className="fa-solid fa-magnifying-glass text-4xl text-slate-100 mb-4 block"></i>
                      <p className="text-slate-400 font-bold">Sin resultados para "{filterQuery}"</p>
                      <button onClick={clearSearch} className="text-green-600 font-black text-sm mt-4 underline decoration-2">Ver todo el inventario</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">NUEVO ARTÍCULO</h3>
                <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                onAddItem(newItem);
                setNewItem({ sku: '', name: '', description: '', category: '', price: 0, cost: 0, stock: 0 });
                setShowAddModal(false);
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Producto</label>
                  <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">SKU / Código</label>
                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoría</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                      <option value="">Seleccione...</option>
                      <option value="Vestuario">Vestuario</option>
                      <option value="Equipamiento">Equipamiento</option>
                      <option value="Accesorios">Accesorios</option>
                      <option value="Protección">Protección</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio de Venta (₡)</label>
                    <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={newItem.price || ''} onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Existencia Inicial</label>
                    <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={newItem.stock || ''} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
                  </div>
                </div>

                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-green-100 transition-all uppercase tracking-widest">
                  REGISTRAR PRODUCTO
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
