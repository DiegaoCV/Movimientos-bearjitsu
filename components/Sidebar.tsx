
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'DASHBOARD' as ViewType, icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: 'INVENTORY' as ViewType, icon: 'fa-boxes-stacked', label: 'Inventario' },
    { id: 'SALES' as ViewType, icon: 'fa-cart-shopping', label: 'Ventas' },
    { id: 'CLIENTS' as ViewType, icon: 'fa-users', label: 'Clientes' },
    { id: 'CREDITS' as ViewType, icon: 'fa-hand-holding-dollar', label: 'Créditos' },
    { id: 'REPORTS' as ViewType, icon: 'fa-file-lines', label: 'Reportes' },
    { id: 'SETTINGS' as ViewType, icon: 'fa-gear', label: 'Configuración' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 bottom-0 bg-[#1a1a1a] text-white shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg hover:bg-green-400 transition-colors z-50"
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
      </button>

      <div className={`flex items-center gap-3 mb-10 px-4 mt-8 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={`shrink-0 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-700 shadow-lg p-0.5 transition-all duration-300 ${
          isCollapsed ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          <img src="logo.png" alt="Berjitsu Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <div className="fade-in">
            <span className="text-lg font-bold tracking-tight block leading-none">Mov.</span>
            <span className="text-green-500 font-black tracking-widest text-sm uppercase">Berjitsu</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
              isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
            } ${
              activeView === item.id 
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/40' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} ${isCollapsed ? 'text-xl' : 'w-5'}`}></i>
            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className={`mt-auto border-t border-slate-800 pt-6 px-3 pb-8`}>
        <div className={`flex items-center gap-3 p-2 bg-slate-800/30 rounded-2xl border border-slate-700/30 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 shrink-0 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
             <i className="fa-solid fa-user-ninja text-slate-500"></i>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden fade-in">
              <p className="text-xs font-bold truncate">Admin Mov.</p>
              <p className="text-[10px] text-green-500/80 truncate uppercase tracking-tighter">Berjitsu Oficial</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
