import React, { useState, useEffect } from 'react';
import { Product, Wholesaler } from '../types';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> & { id?: number }) => void;
  productToEdit: Product | null;
  wholesalers: Wholesaler[];
}

const CATEGORIES = ['Drinks', 'Snacks'];

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, wholesalers }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [defaultWholesalerId, setDefaultWholesalerId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setWholesalePrice(productToEdit.wholesalePrice.toString());
        setStock(productToEdit.stock.toString());
        setCategory(productToEdit.category);
        setDefaultWholesalerId(productToEdit.defaultWholesalerId?.toString() || '');
      } else {
        setName('');
        setPrice('');
        setWholesalePrice('');
        setStock('');
        setCategory(CATEGORIES[0]);
        setDefaultWholesalerId('');
      }
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceValue = parseFloat(price);
    const wholesalePriceValue = parseFloat(wholesalePrice);
    const stockValue = parseInt(stock, 10);
    const wholesalerIdValue = defaultWholesalerId ? parseInt(defaultWholesalerId, 10) : undefined;
    
    if (name.trim() && !isNaN(priceValue) && priceValue >= 0 && !isNaN(wholesalePriceValue) && wholesalePriceValue >= 0 && !isNaN(stockValue) && stockValue >= 0) {
      onSave({
        id: productToEdit?.id,
        name: name.trim(),
        price: priceValue,
        wholesalePrice: wholesalePriceValue,
        stock: stockValue,
        category,
        defaultWholesalerId: wholesalerIdValue,
      });
      onClose();
    } else {
      dispatch(addNotification({ type: 'error', message: 'Please fill in all fields with valid values.' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">{productToEdit ? 'Edit Product' : 'Add New Product'}</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="prod-name" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Product Name</label>
              <input id="prod-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="prod-price" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Sale Price (MVR)</label>
                    <input id="prod-price" type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" step="0.01" min="0" required />
                </div>
                 <div>
                    <label htmlFor="prod-wholesale-price" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Wholesale Price (MVR)</label>
                    <input id="prod-wholesale-price" type="number" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" step="0.01" min="0" required />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prod-stock" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Stock Quantity</label>
                <input id="prod-stock" type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]" min="0" required />
              </div>
              <div>
                <label htmlFor="prod-category" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Category</label>
                <select id="prod-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] h-[42px]">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <div>
                <label htmlFor="prod-wholesaler" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Default Wholesaler (Optional)</label>
                <select 
                    id="prod-wholesaler" 
                    value={defaultWholesalerId} 
                    onChange={e => setDefaultWholesalerId(e.target.value)} 
                    className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] h-[42px]"
                >
                  <option value="">-- None --</option>
                  {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
            </div>
          </div>

          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};