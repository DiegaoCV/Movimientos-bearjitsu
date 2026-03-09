
import { InventoryItem, Transaction, SaleItem, PaymentRecord } from "./types";

export type SyncAction = 'UPDATE_INVENTORY' | 'RECORD_SALE' | 'UPDATE_CLIENTS';

export const syncWithSheet = async (url: string, action: 'READ' | 'WRITE', payload?: any, syncAction?: SyncAction) => {
  if (!url) return null;

  try {
    if (action === 'READ') {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      return data;
    } else {
      const body = {
        action: syncAction,
        payload: payload
      };

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return "Sincronizado";
    }
  } catch (error) {
    console.error("Error en SpreadsheetService:", error);
    return null;
  }
};

// Función auxiliar para convertir a número de forma segura
const safeNumber = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'string') {
    const clean = val.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }
  return isNaN(Number(val)) ? 0 : Number(val);
};

export const mapSheetDataToInventory = (rows: any[][]): InventoryItem[] => {
  if (!rows || !Array.isArray(rows) || rows.length < 2) return [];
  
  const headers = rows[0].map((h: any) => String(h).toLowerCase().trim());
  const dataRows = rows.slice(1);

  return dataRows
    .filter(row => row.length > 0 && row.some(cell => cell !== ''))
    .map((row, index) => {
      const getVal = (name: string) => {
        const idx = headers.indexOf(name.toLowerCase());
        return idx > -1 ? row[idx] : null;
      };

      const rawId = getVal('id');
      const id = rawId ? String(rawId).trim() : `item-${index}`;
      
      return {
        id: id,
        sku: String(getVal('sku') || '').trim(),
        name: String(getVal('name') || 'Sin nombre').trim(),
        description: String(getVal('description') || '').trim(),
        category: String(getVal('category') || 'General').trim(),
        price: safeNumber(getVal('price')),
        cost: safeNumber(getVal('cost')),
        stock: safeNumber(getVal('stock')),
        lastUpdated: String(getVal('lastupdated') || new Date().toISOString()),
      };
    });
};

export const mapSheetDataToTransactions = (rows: any[][]): Transaction[] => {
  if (!rows || !Array.isArray(rows) || rows.length < 2) return [];
  
  const headers = rows[0].map((h: any) => String(h).toLowerCase().trim());
  const dataRows = rows.slice(1);

  return dataRows
    .filter(row => row.length > 0 && row.some(cell => cell !== ''))
    .map((row) => {
      const getVal = (name: string) => {
        const idx = headers.indexOf(name.toLowerCase());
        return idx > -1 ? row[idx] : null;
      };

      // Intentamos reconstruir los artículos desde el resumen o detalle
      // Para simplificar la recuperación de la nube, asumimos estructura básica
      return {
        id: String(getVal('id transaccion')),
        type: 'SALE',
        items: [], // En una implementación real, parsearíamos el detalle JSON si existiera
        totalAmount: safeNumber(getVal('total')),
        timestamp: String(getVal('timestamp')),
        paymentStatus: String(getVal('estado')) as 'PAID' | 'CREDIT',
        clientId: String(getVal('id cliente')),
        customerName: String(getVal('cliente')),
        totalPaid: safeNumber(getVal('pagado')),
        payments: []
      } as Transaction;
    });
};
