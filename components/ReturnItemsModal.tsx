import React, { useState, useMemo } from 'react';
import { Transaction, CartItem } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface ReturnItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onProcessReturn: (returnedItems: { itemId: number; quantity: number; reason: string }[], issueStoreCredit: boolean) => void;
}

export const ReturnItemsModal: React.FC<ReturnItemsModalProps> = ({ isOpen, onClose, transaction, onProcessReturn }) => {
  const dispatch = useAppDispatch();
  const [itemsToReturn, setItemsToReturn] = useState<Map<number, { quantity: number; reason: string }>>(new Map());
  const [issueStoreCredit, setIssueStoreCredit] = useState(false);

  const alreadyReturnedQuantities = useMemo(() => {
    const returnedMap: { [itemId: number]: number } = {};
    transaction.returns?.forEach(r => r.items.forEach(i => {
        returnedMap[i.itemId] = (returnedMap[i.itemId] || 0) + i.quantity;
    }));
    return returnedMap;
  }, [transaction.returns]);

  if (!isOpen) return null;
  
  const handleQuantityChange = (item: CartItem, quantity: number) => {
    const maxReturnable = item.quantity - (alreadyReturnedQuantities[item.id] || 0);
    const newQuantity = Math.max(0, Math.min(maxReturnable, quantity));
    const currentReturn = itemsToReturn.get(item.id) || { quantity: 0, reason: '' };
    if (newQuantity > 0) {
      setItemsToReturn(new Map(itemsToReturn.set(item.id, { ...currentReturn, quantity: newQuantity })));
    } else {
      const newMap = new Map(itemsToReturn);
      newMap.delete(item.id);
      setItemsToReturn(newMap);
    }
  };

  const handleSubmit = () => {
    const returnedItems = Array.from(itemsToReturn.entries())
      .filter(([, data]) => data.quantity > 0)
      .map(([itemId, data]) => ({ itemId, ...data }));
    if (returnedItems.length === 0) {
      dispatch(addNotification({ type: 'error', message: "No items selected for return." }));
      return;
    }
    onProcessReturn(returnedItems, issueStoreCredit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b"><h3 className="text-xl font-bold">Return Items from Invoice {transaction.id}</h3></div>
        <div className="p-6 overflow-y-auto space-y-4">
          {transaction.items.map(item => {
            const returnedSoFar = alreadyReturnedQuantities[item.id] || 0;
            const maxReturnable = item.quantity - returnedSoFar;
            if (maxReturnable <= 0) return null;

            return (
              <div key={item.id} className="grid grid-cols-5 gap-4 items-center p-3 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                <div className="col-span-2">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">Purchased: {item.quantity} (Returned: {returnedSoFar})</p>
                </div>
                <div>
                  <label className="text-xs">Return Qty</label>
                  <input type="number" max={maxReturnable} min="0" value={itemsToReturn.get(item.id)?.quantity || 0} onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10) || 0)} className="w-full p-1 border rounded" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs">Reason</label>
                  <input type="text" placeholder="e.g., Damaged" value={itemsToReturn.get(item.id)?.reason || ''} onChange={(e) => setItemsToReturn(new Map(itemsToReturn.set(item.id, { ...itemsToReturn.get(item.id)!, reason: e.target.value })))} disabled={!itemsToReturn.has(item.id) || itemsToReturn.get(item.id)!.quantity === 0} className="w-full p-1 border rounded disabled:opacity-50" />
                </div>
              </div>
            )
          })}
          <div className="pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={issueStoreCredit} onChange={e => setIssueStoreCredit(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className="text-sm font-medium">Issue store credit as a Gift Card for the return value</span>
              </label>
          </div>
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">Process Return</button>
        </div>
      </div>
    </div>
  );
};