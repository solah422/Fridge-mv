import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder, PurchaseItem, Wholesaler, Product } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseOrder: PurchaseOrder) => void;
  products: Product[];
  wholesalers: Wholesaler[];
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave, products, wholesalers }) => {
  const dispatch = useAppDispatch();
  const [wholesalerId, setWholesalerId] = useState<number | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setWholesalerId(wholesalers[0]?.id || null);
      setItems([]);
      setProductSearch('');
    }
  }, [isOpen, wholesalers]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
  }, [items]);

  const availableProducts = useMemo(() => {
    return products.filter(p => !items.some(item => item.productId === p.id));
  }, [products, items]);

  const handleAddItem = (product: Product) => {
    const newItem: PurchaseItem = {
      productId: product.id,
      name: product.name,
      quantity: 1,
      purchasePrice: product.wholesalePrice,
    };
    setItems([...items, newItem]);
    setProductSearch('');
  };

  const handleUpdateItem = (productId: number, field: 'quantity' | 'purchasePrice', value: string) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) && value !== '') return;

    setItems(items.map(item => 
      item.productId === productId 
      ? { ...item, [field]: value === '' ? 0 : numericValue } 
      : item
    ));
  };
  
  const handleRemoveItem = (productId: number) => {
      setItems(items.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedWholesaler = wholesalers.find(w => w.id === wholesalerId);

    if (!selectedWholesaler || items.length === 0) {
      dispatch(addNotification({ type: 'error', message: 'Please select a wholesaler and add at least one item.' }));
      return;
    }

    const newPurchaseOrder: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      wholesalerId: selectedWholesaler.id,
      wholesalerName: selectedWholesaler.name,
      items,
      date: new Date().toISOString(),
      total,
      status: 'pending',
    };

    onSave(newPurchaseOrder);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">New Purchase Order</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          
          <div className="p-6 space-y-4 overflow-y-auto flex-grow">
            <div>
              <label htmlFor="po-wholesaler" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Wholesaler</label>
              <select 
                id="po-wholesaler" 
                value={wholesalerId || ''} 
                onChange={e => setWholesalerId(Number(e.target.value))} 
                className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
              >
                {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            <div className="border-t border-[rgb(var(--color-border-subtle))] pt-4">
              <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Add Products</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a product to add..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                />
                {productSearch && (
                  <ul className="absolute z-10 w-full mt-1 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {availableProducts
                      .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <li key={p.id} onClick={() => handleAddItem(p)} className="p-3 text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-text-on-primary))] cursor-pointer transition-colors">
                          {p.name}
                        </li>
                      ))
                    }
                  </ul>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2 text-[rgb(var(--color-text-base))]">Order Items</h4>
              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-center text-[rgb(var(--color-text-muted))] py-4">No items added to this order.</p>
                ) : (
                  items.map(item => (
                    <div key={item.productId} className="grid grid-cols-12 gap-3 items-center p-2 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                        <span className="col-span-4 font-medium text-[rgb(var(--color-text-base))]">{item.name}</span>
                        <div className="col-span-3">
                             <label className="text-xs text-[rgb(var(--color-text-muted))]">Qty</label>
                             <input type="number" value={item.quantity} onChange={e => handleUpdateItem(item.productId, 'quantity', e.target.value)} className="w-full p-1 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" min="1" />
                        </div>
                        <div className="col-span-3">
                            <label className="text-xs text-[rgb(var(--color-text-muted))]">Price/Item</label>
                            <input type="number" value={item.purchasePrice} onChange={e => handleUpdateItem(item.productId, 'purchasePrice', e.target.value)} className="w-full p-1 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" step="0.01" min="0" />
                        </div>
                        <div className="col-span-1 text-right font-semibold text-[rgb(var(--color-text-base))]">
                           MVR {(item.quantity * item.purchasePrice).toFixed(2)}
                        </div>
                        <div className="col-span-1 text-right">
                            <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <div className="text-xl font-bold text-[rgb(var(--color-text-base))]">
                Total: <span className="text-[rgb(var(--color-primary))]">MVR {total.toFixed(2)}</span>
            </div>
            <div className="space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Save Purchase Order</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};