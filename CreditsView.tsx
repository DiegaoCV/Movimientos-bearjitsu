
import React, { useState } from 'react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onDeleteClient: (id: string) => void;
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, onAddClient, onDeleteClient }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient(newClient);
    setNewClient({ name: '', phone: '', email: '', address: '' });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Directorio de Clientes</h3>
          <p className="text-sm text-slate-400 font-medium">{clients.length} clientes registrados</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-xl transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-user-plus"></i> Registrar Cliente
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar por nombre, teléfono o correo..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-5 text-slate-300 text-lg"></i>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-xl group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                <i className="fa-solid fa-user"></i>
              </div>
              <button 
                onClick={() => onDeleteClient(client.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
            
            <h4 className="font-black text-slate-800 text-lg mb-4">{client.name}</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <i className="fa-solid fa-phone w-4"></i>
                <span className="font-medium">{client.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <i className="fa-solid fa-envelope w-4"></i>
                <span className="font-medium truncate">{client.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <i className="fa-solid fa-location-dot w-4"></i>
                <span className="font-medium truncate">{client.address || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <span>Registrado</span>
              <span>{new Date(client.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <i className="fa-solid fa-users-slash text-4xl text-slate-200 mb-4 block"></i>
            <p className="text-slate-400 font-medium">No se encontraron clientes.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900">NUEVO CLIENTE</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  <i className="fa-solid fa-xmark"></i>
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                    placeholder="Juan Pérez"
                    value={newClient.name}
                    onChange={e => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Teléfono</label>
                    <input 
                      type="tel" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                      placeholder="+123 456 7890"
                      value={newClient.phone}
                      onChange={e => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold"
                      placeholder="juan@ejemplo.com"
                      value={newClient.email}
                      onChange={e => setNewClient({...newClient, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Dirección</label>
                  <textarea 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-bold min-h-[100px]"
                    placeholder="Calle, Ciudad, País..."
                    value={newClient.address}
                    onChange={e => setNewClient({...newClient, address: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <i className="fa-solid fa-user-check"></i> GUARDAR CLIENTE
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
