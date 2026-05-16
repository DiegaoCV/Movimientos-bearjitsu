
import React from 'react';
import { InventoryItem, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardViewProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ inventory, transactions }) => {
  const totalStock = inventory.reduce((acc, curr) => acc + curr.stock, 0);
  const totalValue = inventory.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  const lowStockItems = inventory.filter(item => item.stock <= 5);
  const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const revenueData = transactions.slice(0, 7).reverse().map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    amount: t.totalAmount
  }));

  const stockData = inventory.slice(0, 6).map(item => ({
    name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
    stock: item.stock
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Artículos" value={totalStock} icon="fa-box" color="bg-slate-800" />
        <StatCard title="Valor Inventario" value={`₡${totalValue.toLocaleString()}`} icon="fa-dollar-sign" color="bg-green-600" />
        <StatCard title="Ventas Totales" value={`₡${totalRevenue.toLocaleString()}`} icon="fa-chart-line" color="bg-emerald-500" />
        <StatCard title="Stock Bajo" value={lowStockItems.length} icon="fa-triangle-exclamation" color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Nivel de Stock (Top Artículos)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="stock" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Flujo de Caja Reciente</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-bell text-amber-500"></i> Alertas de Reposición
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 font-semibold text-slate-600 text-sm">Articulo</th>
                <th className="pb-3 font-semibold text-slate-600 text-sm">Categoría</th>
                <th className="pb-3 font-semibold text-slate-600 text-sm">Stock</th>
                <th className="pb-3 font-semibold text-slate-600 text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.length > 0 ? lowStockItems.map(item => (
                <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-4 text-slate-500 text-sm">{item.category}</td>
                  <td className="py-4 text-slate-800 font-bold">{item.stock}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-wider">Crítico</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 italic font-medium">Inventario optimizado. No hay alertas pendientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
      <i className={`fa-solid ${icon} text-lg`}></i>
    </div>
    <div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
  </div>
);

export default DashboardView;
