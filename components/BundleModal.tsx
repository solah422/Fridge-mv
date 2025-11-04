import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface BundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'stock' | 'wholesalePrice'> & { id?: number }) => void;
  bundleToEdit: Product | null;
  products: Product[];
}

interface BundleItem extends Product {
    quantity: number;
}

export const BundleModal: React.FC<BundleModalProps> = ({ isOpen, onClose, onSave, bundleToEdit, products }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Snacks');
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (bundleToEdit) {
        setName(bundleToEdit.name);
        setPrice(bundleToEdit.price.toString());
        setCategory(bundleToEdit.category);
        const items = bundleToEdit.bundleItems?.map(item => {
            const product = products.find(p => p.id === item.productId);
            return product ? { ...product, quantity: item.quantity } : null;
        }).filter(Boolean) as BundleItem[] || [];
        setBundleItems(items);
      } else {
        setName('');
        setPrice('');
        setCategory('Snacks');
        setBundleItems([]);
      }
    }
  }, [isOpen, bundleToEdit, products]);

  const availableProducts = useMemo(() => {
    return products.filter(p => !bundleItems.some(item => item.id === p.id));
  }, [products, bundleItems]);

  const handleAddItem = (product: Product) => {
    setBundleItems([...bundleItems, { ...product, quantity: 1 }]);
    setProductSearch('');
  };
  
  const handleUpdateItemQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setBundleItems(bundleItems.map(item => item.id === productId ? {...item, quantity} : item));
  };

  const handleRemoveItem = (productId: number) => {
      setBundleItems(bundleItems.filter(item => item.id !== productId));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !price || bundleItems.length === 0) {
          dispatch(addNotification({ type: 'error', message: "Please provide a name, price, and at least one item for the bundle." }));
          return;
      }
      onSave({
          id: bundleToEdit?.id,
          name: name.trim(),
          price: parseFloat(price),
          category,
          isBundle: true,
          bundleItems: bundleItems.map(item => ({ productId: item.id, quantity: item.quantity })),
      });
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">{bundleToEdit ? 'Edit Bundle' : 'Create New Bundle'}</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] text-3xl">&times;</button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Bundle Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" required/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Bundle Price (MVR)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" required/>
                </div>
            </div>
             <div className="border-t border-[rgb(var(--color-border-subtle))] pt-4">
              <label className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Add Products to Bundle</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a product to add..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                />
                {productSearch && (
                  <ul className="absolute z-10 w-full mt-1 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-md shadow-lg max-h-40 overflow-y-auto">
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
              <h4 className="text-lg font-semibold mb-2 text-[rgb(var(--color-text-base))]">Bundle Items</h4>
              <div className="space-y-2">
                {bundleItems.length === 0 ? (
                    <p className="text-center text-[rgb(var(--color-text-muted))] py-4">No items added to this bundle.</p>
                ) : (bundleItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                        <span className="font-medium text-[rgb(var(--color-text-base))]">{item.name}</span>
                        <div className="flex items-center gap-2">
                            <label className="text-sm">Qty:</label>
                            <input type="number" value={item.quantity} onChange={e => handleUpdateItemQuantity(item.id, parseInt(e.target.value))} className="w-20 p-1 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" min="1"/>
                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                )))}
              </div>
            </div>

          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md mr-2">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">Save Bundle</button>
          </div>
        </form>
      </div>
    </div>
  );
};