
import React, { useState, useMemo } from 'react';
import { Transaction, Client } from '../types';

interface CreditsViewProps {
  transactions: Transaction[];
  clients: Client[];
  onAddPayment: (transactionId: string, amount: number) => void;
}

const CreditsView: React.FC<CreditsViewProps> = ({ transactions, clients, onAddPayment }) => {
  const [selectedDebt, setSelectedDebt] = useState<Transaction | null>(null);
  const [abonoAmount, setAbonoAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const debts = useMemo(() => {
    return transactions.filter(t => t.paymentStatus === 'CREDIT')
      .filter(t => {
        const nameMatch = (t.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = (t.id || '').toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || idMatch;
      });
  }, [transactions, searchTerm]);

  const totalOutstanding = useMemo(() => {
    return debts.reduce((acc, curr) => acc + (curr.totalAmount - curr.totalPaid), 0);
  }, [debts]);

  const handleRegisterAbono = () => {
    if (!selectedDebt || abonoAmount <= 0) return;
    const maxAbono = selectedDebt.totalAmount - selectedDebt.totalPaid;
    if (abonoAmount > maxAbono) {
      alert(`El abono no puede ser mayor a la deuda pendiente (₡${maxAbono.toLocaleString()})`);
      return;
    }
    onAddPayment(selectedDebt.id, abonoAmount);
    setAbonoAmount(0);
    setSelectedDebt(null);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-2">Total Cuentas por Cobrar</h3>
            <p className="text-5xl font-black tracking-tighter">₡{totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="flex gap-4 mt-8 relative z-10">
            <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/10">
              {debts.length} Deudas pendientes
            </div>
            <div className="bg-green-500/20 px-4 py-2 rounded-xl text-xs font-bold border border-green-500/30 text-green-400">
              Cartera Vigente
            </div>
          </div>
          <i className="fa-solid fa-hand-holding-dollar absolute -right-8 -bottom-8 text-[12rem] opacity-10 -rotate-12"></i>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center text-center">
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Acción Rápida</p>
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-4">
             <i className="fa-solid fa-magnifying-glass-dollar"></i>
          </div>
          <p className="text-slate-800 font-black text-sm px-4">Usa el buscador para localizar deudas por cliente o folio.</p>
        </div>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar deudores por nombre o número de ticket..."
          className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 shadow-sm transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <i className="fa-solid fa-search absolute left-6 top-6 text-slate-300 text-lg"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map(debt => {
          const progress = (debt.totalPaid / debt.totalAmount) * 100;
          return (
            <div key={debt.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-start mb-6">
                <div className="min-w-0">
                  <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{debt.customerName || 'Cliente No Identificado'}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ticket #{debt.id}</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  Pendiente
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase">Progreso del Pago</span>
                  <span className="text-sm font-black text-slate-900">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pagado</p>
                    <p className="font-black text-green-600">₡{debt.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-2xl text-center border border-red-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Resta</p>
                    <p className="font-black text-red-600">₡{(debt.totalAmount - debt.totalPaid).toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDebt(debt)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98]"
                >
                  <i className="fa-solid fa-plus-circle"></i> REGISTRAR ABONO
                </button>
              </div>
            </div>
          );
        })}
        {debts.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
             <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                <i className="fa-solid fa-check-circle"></i>
             </div>
             <p className="text-slate-400 font-black text-lg">No hay cuentas pendientes por cobrar.</p>
             <p className="text-slate-300 text-sm mt-2 font-medium">¡Gran trabajo manteniendo las cuentas al día!</p>
          </div>
        )}
      </div>

      {selectedDebt && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200 overflow-hidden relative">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">REGISTRAR PAGO</h3>
                <button onClick={() => setSelectedDebt(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             
             <div className="bg-slate-900 text-white p-6 rounded-[2rem] mb-6 relative overflow-hidden">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Deuda de Cliente</p>
                <p className="text-xl font-black mb-4 truncate">{selectedDebt.customerName}</p>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 font-black">
                  <span className="text-xs text-white/50">SALDO PENDIENTE</span>
                  <span className="text-2xl text-green-400">₡{(selectedDebt.totalAmount - selectedDebt.totalPaid).toLocaleString()}</span>
                </div>
                <i className="fa-solid fa-piggy-bank absolute -right-4 -bottom-4 text-6xl opacity-10"></i>
             </div>

             <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Monto del Abono (₡)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-5 font-black text-slate-400 text-xl">₡</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-2xl font-black focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all"
                      placeholder="0"
                      autoFocus
                      value={abonoAmount || ''}
                      onChange={e => setAbonoAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleRegisterAbono}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-3xl font-black shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <i className="fa-solid fa-check-double"></i> CONFIRMAR ABONO
                </button>
                <button 
                  onClick={() => setSelectedDebt(null)}
                  className="w-full text-slate-400 py-2 font-bold text-xs hover:text-slate-600 transition-colors"
                >
                  CANCELAR OPERACIÓN
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditsView;
