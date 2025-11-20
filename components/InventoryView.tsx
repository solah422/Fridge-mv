
import React, { useState, useMemo } from 'react';
import { Product, Wholesaler, PurchaseOrder, InventoryEvent } from '../types';
import { ProductModal } from './ProductModal';
import { WholesalerModal } from './WholesalerModal';
import { PurchaseOrderModal } from './PurchaseOrderModal';
import { PurchaseOrderDetailsModal } from './PurchaseOrderDetailsModal';
import { InventoryHistoryModal } from './InventoryHistoryModal';
import { BundleModal } from './BundleModal';
import { ImportProductsModal } from './ImportProductsModal';
import { ImportWholesalersModal } from './ImportWholesalersModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const InventoryView: React.FC<{
  products: Product[];
  wholesalers: Wholesaler[];
  purchaseOrders: PurchaseOrder[];
  inventoryHistory: InventoryEvent[];
  onProductsUpdate: (products: Product[]) => void;
  onWholesalersUpdate: (wholesalers: Wholesaler[]) => void;
  onPurchaseOrdersUpdate: (purchaseOrders: PurchaseOrder[]) => void;
  onInventoryHistoryUpdate: (history: InventoryEvent[]) => void;
}> = ({
  products,
  wholesalers,
  purchaseOrders,
  inventoryHistory,
  onProductsUpdate,
  onWholesalersUpdate,
  onPurchaseOrdersUpdate,
  onInventoryHistoryUpdate,
}) => {
  const [view, setView] = useState<'products' | 'wholesalers' | 'purchase_orders'>('products');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  const [isWholesalerModalOpen, setIsWholesalerModalOpen] = useState(false);
  const [wholesalerToEdit, setWholesalerToEdit] = useState<Wholesaler | null>(null);
  const [isImportWholesalersModalOpen, setIsImportWholesalersModalOpen] = useState(false);

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  
  const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: number }) => {
    if (productData.id) {
      onProductsUpdate(products.map(p => p.id === productData.id ? { ...p, ...productData } as Product : p));
    } else {
      const newProduct: Product = { ...productData, id: Date.now() };
      onProductsUpdate([...products, newProduct]);
    }
  };

  const handleBulkImport = (newProducts: (Omit<Product, 'id' | 'isBundle' | 'bundleItems'>)[]) => {
    const productsWithIds = newProducts.map((p, index) => ({
      ...p,
      id: Date.now() + index, // Basic unique ID generation
      isBundle: false,
      bundleItems: [],
    }));
    onProductsUpdate([...products, ...productsWithIds]);
  };

  const handleSaveWholesaler = (wholesalerData: Omit<Wholesaler, 'id'> & { id?: number }) => {
    if (wholesalerData.id) {
      onWholesalersUpdate(wholesalers.map(w => w.id === wholesalerData.id ? { ...w, ...wholesalerData } : w));
    } else {
      const newWholesaler: Wholesaler = { ...wholesalerData, id: Date.now() };
      onWholesalersUpdate([...wholesalers, newWholesaler]);
    }
  };

  const handleBulkImportWholesalers = (newWholesalers: Omit<Wholesaler, 'id'>[]) => {
    const wholesalersWithIds = newWholesalers.map((w, index) => ({
        ...w,
        id: Date.now() + index,
    }));
    onWholesalersUpdate([...wholesalers, ...wholesalersWithIds]);
  };

  const handleSavePO = (purchaseOrder: PurchaseOrder) => {
    onPurchaseOrdersUpdate([...purchaseOrders, purchaseOrder]);
  };
  
  const handleProcessPO = (po: PurchaseOrder) => {
    const updatedProducts = [...products];
    const newHistoryEvents: InventoryEvent[] = [];

    po.items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            updatedProducts[productIndex].stock += item.quantity;
            newHistoryEvents.push({
                id: `evt-${Date.now()}-${item.productId}`,
                productId: item.productId,
                type: 'purchase',
                quantityChange: item.quantity,
                date: new Date().toISOString(),
                relatedId: po.id,
                notes: `From ${po.wholesalerName}`
            });
        }
    });

    onProductsUpdate(updatedProducts);
    onInventoryHistoryUpdate([...inventoryHistory, ...newHistoryEvents]);
    
    const updatedPO = { ...po, status: 'processed' as const };
    onPurchaseOrdersUpdate(purchaseOrders.map(o => o.id === po.id ? updatedPO : o));
    setSelectedPO(updatedPO);
  };

  const openProductHistory = (product: Product) => {
    setSelectedProductForHistory(product);
    setIsHistoryModalOpen(true);
  };

  const openAdjustmentModal = (product: Product) => {
    setProductToAdjust(product);
    setIsAdjustmentModalOpen(true);
  };

  const handleSaveStockAdjustment = (productId: number, adjustment: number, reason: string) => {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const updatedProducts = [...products];
    const product = updatedProducts[productIndex];
    updatedProducts[productIndex] = { ...product, stock: product.stock + adjustment };
    onProductsUpdate(updatedProducts);

    const newHistoryEvent: InventoryEvent = {
        id: `evt-adj-${Date.now()}-${productId}`,
        productId: productId,
        type: 'adjustment',
        quantityChange: adjustment,
        date: new Date().toISOString(),
        notes: reason,
    };
    onInventoryHistoryUpdate([...inventoryHistory, newHistoryEvent]);
  };
  
  const renderContent = () => {
    switch(view) {
      case 'products': return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Products</h3>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] transition">Import Products</button>
                <button onClick={() => { setProductToEdit(null); setIsProductModalOpen(true); }} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">Add Product</button>
                <div className="relative">
                    <button onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] flex items-center transition">
                        More
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isAddDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-bg-card))] rounded-md shadow-lg z-20 border border-[rgb(var(--color-border))]">
                            <a href="#" onClick={(e) => { e.preventDefault(); setProductToEdit(null); setIsBundleModalOpen(true); setIsAddDropdownOpen(false); }} className="block px-4 py-2 text-sm text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-bg-subtle))]">Create Bundle</a>
                        </div>
                    )}
                </div>
            </div>
          </div>
          <ProductTable products={products} wholesalers={wholesalers} onEdit={(p) => { setProductToEdit(p); p.isBundle ? setIsBundleModalOpen(true) : setIsProductModalOpen(true); }} onViewHistory={openProductHistory} onAdjustStock={openAdjustmentModal} />
        </div>
      );
      case 'wholesalers': return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Wholesalers</h3>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsImportWholesalersModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] transition">Import Wholesalers</button>
                <button onClick={() => { setWholesalerToEdit(null); setIsWholesalerModalOpen(true); }} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">Add Wholesaler</button>
            </div>
          </div>
          <WholesalerTable wholesalers={wholesalers} onEdit={(w) => { setWholesalerToEdit(w); setIsWholesalerModalOpen(true); }} />
        </div>
      );
      case 'purchase_orders': return (
        <div>
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Purchase Orders</h3>
            <button onClick={() => setIsPOModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">New Purchase Order</button>
          </div>
          <PurchaseOrderTable purchaseOrders={purchaseOrders} onView={(po) => setSelectedPO(po)} />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
      <div className="flex border-b border-[rgb(var(--color-border-subtle))] mb-6">
        <TabButton label="Products" active={view === 'products'} onClick={() => setView('products')} />
        <TabButton label="Wholesalers" active={view === 'wholesalers'} onClick={() => setView('wholesalers')} />
        <TabButton label="Purchase Orders" active={view === 'purchase_orders'} onClick={() => setView('purchase_orders')} />
      </div>
      {renderContent()}
      
      <ProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit} wholesalers={wholesalers} />
      <BundleModal isOpen={isBundleModalOpen} onClose={() => setIsBundleModalOpen(false)} onSave={handleSaveProduct} bundleToEdit={productToEdit} products={products.filter(p => !p.isBundle)} />
      <ImportProductsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={handleBulkImport} wholesalers={wholesalers} />
      <WholesalerModal isOpen={isWholesalerModalOpen} onClose={() => setIsWholesalerModalOpen(false)} onSave={handleSaveWholesaler} wholesalerToEdit={wholesalerToEdit} />
      <ImportWholesalersModal isOpen={isImportWholesalersModalOpen} onClose={() => setIsImportWholesalersModalOpen(false)} onImport={handleBulkImportWholesalers} />
      <PurchaseOrderModal isOpen={isPOModalOpen} onClose={() => setIsPOModalOpen(false)} onSave={handleSavePO} products={products} wholesalers={wholesalers} />
      {selectedPO && <PurchaseOrderDetailsModal purchaseOrder={selectedPO} onClose={() => setSelectedPO(null)} onProcessOrder={handleProcessPO} />}
      {isHistoryModalOpen && selectedProductForHistory && (
        <InventoryHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          product={selectedProductForHistory}
          history={inventoryHistory.filter(e => e.productId === selectedProductForHistory.id)}
        />
      )}
      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSave={handleSaveStockAdjustment}
        product={productToAdjust}
      />
    </div>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${active ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}>{label}</button>
);

const ProductTable: React.FC<{ products: Product[], wholesalers: Wholesaler[], onEdit: (p: Product) => void, onViewHistory: (p: Product) => void, onAdjustStock: (p: Product) => void }> = ({ products, wholesalers, onEdit, onViewHistory, onAdjustStock }) => {
    const wholesalerMap = useMemo(() => new Map(wholesalers.map(w => [w.id, w.name])), [wholesalers]);
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                <thead className="bg-[rgb(var(--color-bg-subtle))]">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Wholesaler</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                    {products.map(p => (
                        <tr key={p.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">
                                {p.name}
                                {p.isBundle && <span className="ml-2 text-xs bg-[rgb(var(--color-primary-light))] text-[rgb(var(--color-primary-text-on-light))] px-2 py-0.5 rounded-full">Bundle</span>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{p.category}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{p.isBundle ? 'N/A' : p.stock}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">MVR {p.price.toFixed(2)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{wholesalerMap.get(p.defaultWholesalerId ?? -1) || 'N/A'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button onClick={() => onViewHistory(p)} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] flex items-center inline-flex">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    History
                                </button>
                                <button
                                  onClick={() => onAdjustStock(p)}
                                  className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={p.isBundle}
                                >
                                  Adjust
                                </button>
                                <button onClick={() => onEdit(p)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const WholesalerTable: React.FC<{ wholesalers: Wholesaler[], onEdit: (w: Wholesaler) => void }> = ({ wholesalers, onEdit }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
            <thead className="bg-[rgb(var(--color-bg-subtle))]">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Contact Person</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Contact Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Email</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                </tr>
            </thead>
             <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                {wholesalers.map(w => (
                    <tr key={w.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{w.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{w.contactPerson || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{w.contactNumber || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{w.email || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onEdit(w)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">Edit</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PurchaseOrderTable: React.FC<{ purchaseOrders: PurchaseOrder[], onView: (po: PurchaseOrder) => void }> = ({ purchaseOrders, onView }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
            <thead className="bg-[rgb(var(--color-bg-subtle))]">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">PO ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Wholesaler</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                </tr>
            </thead>
             <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                {[...purchaseOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(po => (
                    <tr key={po.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{po.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{po.wholesalerName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{new Date(po.date).toLocaleDateString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">MVR {po.total.toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                po.status === 'processed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {po.status}
                            </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onView(po)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">View</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
