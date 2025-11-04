import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addProductRequest } from '../store/slices/productRequestsSlice';
import { selectUser } from '../store/slices/authSlice';

interface ProductRequestModalProps {
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

export const ProductRequestModal: React.FC<ProductRequestModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [productName, setProductName] = useState('');
  const [wholesaler, setWholesaler] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
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
    if (!productName || !user || user.role !== 'customer') return;

    setIsLoading(true);
    await dispatch(addProductRequest({
      customerId: user.id as number,
      customerName: user.name || 'Unknown',
      productName,
      wholesaler,
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
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Request a New Product</h3>
            <button type="button" onClick={onClose} className="text-3xl">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Saw something we should stock? Let us know!</p>
            <div>
              <label className="block text-sm font-medium mb-1">Product Name*</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wholesale Shop (Optional)</label>
              <input type="text" value={wholesaler} onChange={e => setWholesaler(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., Global Foods Inc."/>
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[rgb(var(--color-primary-light))] file:text-[rgb(var(--color-primary-text-on-light))]"/>
              {image && <img src={image} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
            </div>
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md disabled:opacity-50">
                {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
