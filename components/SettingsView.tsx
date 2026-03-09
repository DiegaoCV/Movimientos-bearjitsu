
import React, { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsViewProps {
  config: AppConfig;
  onSaveConfig: (config: AppConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ config, onSaveConfig }) => {
  const [url, setUrl] = useState(config.spreadsheetAppUrl);
  const [showCode, setShowCode] = useState(false);

  const scriptCode = `/**
 * MOV. BERJITSU - APPS SCRIPT V2.5
 * Soporte para Inventario, Clientes, Ventas y Créditos
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inventorySheet = ss.getSheetByName("Inventario") || ss.insertSheet("Inventario");
  var clientSheet = ss.getSheetByName("Clientes") || ss.insertSheet("Clientes");
  var salesSheet = ss.getSheetByName("Ventas") || ss.insertSheet("Ventas");
  
  var inventory = inventorySheet.getDataRange().getValues();
  var clients = clientSheet.getDataRange().getValues();
  var sales = salesSheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    inventory: inventory,
    clients: clients,
    transactions: sales
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.action === "UPDATE_INVENTORY") {
    var sheet = ss.getSheetByName("Inventario") || ss.insertSheet("Inventario");
    sheet.clear();
    sheet.appendRow(["id", "sku", "name", "description", "category", "price", "cost", "stock", "lastUpdated"]);
    data.payload.forEach(function(item) {
      sheet.appendRow([item.id, item.sku, item.name, item.description, item.category, item.price, item.cost, item.stock, item.lastUpdated]);
    });
  } 
  
  else if (data.action === "UPDATE_CLIENTS") {
    var sheet = ss.getSheetByName("Clientes") || ss.insertSheet("Clientes");
    sheet.clear();
    sheet.appendRow(["id", "nombre", "telefono", "correo", "direccion", "fecha_registro"]);
    data.payload.forEach(function(c) {
      sheet.appendRow([c.id, c.name, c.phone, c.email, c.address, c.createdAt]);
    });
  } 
  
  else if (data.action === "RECORD_SALE") {
    var sheet = ss.getSheetByName("Ventas") || ss.insertSheet("Ventas");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ID Transaccion", "Timestamp", "ID Cliente", "Cliente", "Estado", "Total", "Pagado", "Articulos"]);
    }
    
    var salesData = sheet.getDataRange().getValues();
    var foundRow = -1;
    var transactionId = data.payload.id;

    for (var i = 1; i < salesData.length; i++) {
      if (salesData[i][0] == transactionId) {
        foundRow = i + 1;
        break;
      }
    }

    var itemsSummary = data.payload.items.map(function(item) {
      return item.itemName + " (x" + item.quantity + ")";
    }).join(", ");

    var rowValues = [
      transactionId, 
      data.payload.timestamp, 
      data.payload.clientId || "N/A",
      data.payload.customerName || "Contado", 
      data.payload.paymentStatus, 
      data.payload.totalAmount, 
      data.payload.totalPaid, 
      itemsSummary
    ];

    if (foundRow > -1) {
      sheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }

    // Actualizar hoja de Créditos Activos
    updateCreditsSheet(ss);
  }
  
  return ContentService.createTextOutput("OK");
}

function updateCreditsSheet(ss) {
  var salesSheet = ss.getSheetByName("Ventas");
  var creditsSheet = ss.getSheetByName("Creditos") || ss.insertSheet("Creditos");
  creditsSheet.clear();
  creditsSheet.appendRow(["ID Cliente", "Nombre Cliente", "Ticket", "Monto Total", "Abonado", "Resta (Deuda)"]);
  
  var data = salesSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var status = data[i][4];
    var total = data[i][5];
    var paid = data[i][6];
    
    if (status === "CREDIT" && (total - paid) > 0) {
      creditsSheet.appendRow([
        data[i][2], // ID Cliente
        data[i][3], // Nombre
        data[i][0], // ID Transaccion
        total,
        paid,
        (total - paid)
      ]);
    }
  }
}`;

  const handleSave = () => {
    onSaveConfig({ spreadsheetAppUrl: url, isLinked: url.length > 5 });
    alert("Configuración guardada.");
  };

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sincronización de Datos</h3>
            <p className="text-sm text-slate-400 font-medium">Vincula tu Google Spreadsheet mediante Apps Script</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">URL del Despliegue (Web App)</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 font-bold transition-all"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button onClick={handleSave} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl transition-all active:scale-[0.98]">
            GUARDAR Y VINCULAR AHORA
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-2xl font-black mb-4 tracking-tighter uppercase">Código Apps Script V2.5</h4>
          <p className="text-sm text-slate-400 mb-8 max-w-md font-medium">Esta nueva versión soluciona el registro de clientes de crédito, crea una hoja de resumen de deudas y evita duplicados en el historial.</p>
          <button onClick={() => setShowCode(true)} className="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-2xl font-black transition-all shadow-lg flex items-center gap-3">
            <i className="fa-solid fa-code"></i> VER CÓDIGO PARA COPIAR
          </button>
        </div>
        <i className="fa-solid fa-file-code absolute -right-10 -bottom-10 text-[15rem] opacity-5"></i>
      </div>

      {showCode && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 text-white w-full max-w-2xl rounded-[3rem] p-8 max-h-[85vh] flex flex-col shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black uppercase tracking-tight">Copia este script</h4>
              <button onClick={() => setShowCode(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-red-500 hover:text-white transition-all">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-black/50 p-6 rounded-3xl font-mono text-xs text-green-400 mb-6 custom-scrollbar border border-white/5">
              <pre className="whitespace-pre-wrap">{scriptCode}</pre>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => { navigator.clipboard.writeText(scriptCode); alert("¡Código copiado al portapapeles!"); }}
                className="bg-white text-slate-900 py-5 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-copy"></i> COPIAR CÓDIGO
              </button>
              <button 
                onClick={() => window.open('https://script.google.com/home', '_blank')}
                className="bg-slate-700 text-white py-5 rounded-2xl font-black hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-external-link"></i> IR A GOOGLE SCRIPTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
