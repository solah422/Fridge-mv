import React from 'react';
import { Product, InventoryEvent } from '../types';

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  history: InventoryEvent[];
}

export const InventoryHistoryModal: React.FC<InventoryHistoryModalProps> = ({ isOpen, onClose, product, history }) => {
  if (!isOpen) return null;
  
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Inventory History</h3>
            <p className="text-[rgb(var(--color-text-muted))]">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <ul className="space-y-3">
            {sortedHistory.length === 0 ? (
              <p className="text-center text-[rgb(var(--color-text-muted))] py-8">No history found for this product.</p>
            ) : (
              sortedHistory.map(event => (
              <li key={event.id} className="p-3 bg-[rgb(var(--color-bg-subtle))] rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold capitalize text-[rgb(var(--color-text-base))]">{event.type}</p>
                  <p className="text-sm text-[rgb(var(--color-text-muted))]">{new Date(event.date).toLocaleString()}</p>
                  {event.notes && <p className="text-xs text-[rgb(var(--color-text-subtle))] italic mt-1">Note: {event.notes}</p>}
                </div>
                <p className={`text-lg font-bold ${event.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {event.quantityChange > 0 ? `+${event.quantityChange}` : event.quantityChange}
                </p>
              </li>
            )))}
          </ul>
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Close</button>
        </div>
      </div>
    </div>
  );
};