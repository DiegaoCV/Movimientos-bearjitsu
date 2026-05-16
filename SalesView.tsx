
import React, { useState } from 'react';
import { Transaction, InventoryItem } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
  onAddPayment: (transactionId: string, amount: number) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, inventory, onAddPayment }) => {
  const [tab, setTab] = useState<'HISTORY' | 'DEBTS'>('HISTORY');
  const [selectedDebt, setSelectedDebt] = useState<Transaction | null>(null);
  const [abonoAmount, setAbonoAmount] = useState(0);

  const debts = transactions.filter(t => t.paymentStatus === 'CREDIT');

  const handleRegisterAbono = () => {
    if (!selectedDebt || abonoAmount <= 0) return;
    onAddPayment(selectedDebt.id, abonoAmount);
    setAbonoAmount(0);
    setSelectedDebt(null);
    alert("Abono registrado correctamente.");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b pb-4">
        <button 
          onClick={() => setTab('HISTORY')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${tab === 'HISTORY' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >Historial General</button>
        <button 
          onClick={() => setTab('DEBTS')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${tab === 'DEBTS' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        >Cuentas por Cobrar ({debts.length})</button>
      </div>

      {tab === 'HISTORY' ? (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ID / Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">#{t.id}</div>
                    <div className="text-[10px] text-slate-400">{new Date(t.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm font-medium">{t.customerName || 'Venta Mostrador'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">₡{t.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {t.paymentStatus === 'PAID' ? (
                      <span className="text-green-500 text-xs font-bold">Cobrado</span>
                    ) : (
                      <span className="text-amber-500 text-xs font-bold">Saldo: ₡{(t.totalAmount - t.totalPaid).toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map(debt => (
            <div key={debt.id} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-slate-900 text-lg uppercase">{debt.customerName}</h4>
                  <p className="text-xs text-slate-400">Venta #{debt.id}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">PENDIENTE</div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Venta:</span>
                  <span className="font-bold text-slate-800">₡{debt.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Pagado:</span>
                  <span className="font-bold text-green-600">₡{debt.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-bold text-slate-900">Deuda:</span>
                  <span className="font-black text-red-500">₡{(debt.totalAmount - debt.totalPaid).toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDebt(debt)}
                className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-money-bill-transfer"></i> Registrar Abono
              </button>
            </div>
          ))}
          {debts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
               <i className="fa-solid fa-face-smile text-4xl text-green-400 mb-2"></i>
               <p className="text-slate-400 font-medium">No hay cuentas pendientes de cobro.</p>
            </div>
          )}
        </div>
      )}

      {selectedDebt && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">REGISTRAR ABONO</h3>
                <button onClick={() => setSelectedDebt(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
             </div>
             
             <div className="bg-blue-50 p-4 rounded-2xl mb-6">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Cliente</p>
                <p className="text-lg font-black text-blue-900">{selectedDebt.customerName}</p>
                <div className="flex justify-between mt-3 text-sm font-bold text-blue-800">
                  <span>Deuda Actual:</span>
                  <span>₡{(selectedDebt.totalAmount - selectedDebt.totalPaid).toLocaleString()}</span>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto del Abono (₡)</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-xl font-black focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none"
                    placeholder="0"
                    autoFocus
                    value={abonoAmount || ''}
                    onChange={e => setAbonoAmount(Number(e.target.value))}
                  />
                </div>
                
                <button 
                  onClick={handleRegisterAbono}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-check"></i> Confirmar Abono
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
