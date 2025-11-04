import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addProductSuggestion } from '../store/slices/productSuggestionsSlice';
import { selectUser } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/notificationsSlice';

interface ProductSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const ProductSuggestionModal: React.FC<ProductSuggestionModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [productName, setProductName] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImage(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(wholesalePrice);
    if (!productName || !image || isNaN(price) || price <= 0 || !user || user.role !== 'customer') {
        dispatch(addNotification({ type: 'error', message: "Please fill all fields with valid data."}));
        return;
    };

    setIsLoading(true);
    await dispatch(addProductSuggestion({
      customerId: user.id as number,
      customerName: user.name || 'Unknown',
      productName,
      wholesalePrice: price,
      image,
    }));
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Suggest Your Product</h3>
             <button type="button" onClick={onClose} className="text-3xl">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Have a product you want to sell through us? Fill out the details below.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name*</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Wholesale Price (MVR)*</label>
              <input type="number" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} className="w-full p-2 border rounded" placeholder="Price you sell to us for" required />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Product Image*</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[rgb(var(--color-primary-light))] file:text-[rgb(var(--color-primary-text-on-light))]" required/>
              {image && <img src={image} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
            </div>
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md disabled:opacity-50">
                {isLoading ? 'Submitting...' : 'Submit Suggestion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};