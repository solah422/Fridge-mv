import React, { useMemo } from 'react';
import { Product } from '../types';
import { useAppSelector } from '../store/hooks';
import fuzzySearch from '../services/fuseService';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  getBundleStock: (product: Product) => number;
}

const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void; }> = ({ product, onAddToCart }) => (
  <div 
    className="relative bg-[rgb(var(--color-bg-subtle))] rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200"
    onClick={() => product.stock > 0 && onAddToCart(product)}
  >
    {product.isBundle && (
      <span className="absolute top-2 right-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] text-xs font-semibold px-2 py-1 rounded-full">Bundle</span>
    )}
    <div className={`p-4 ${product.stock === 0 ? 'opacity-50' : ''}`}>
      <h3 className="font-semibold text-[rgb(var(--color-text-base))] truncate">{product.name}</h3>
      <p className="text-[rgb(var(--color-text-muted))] font-bold mt-1">MVR {product.price.toFixed(2)}</p>
      <p className={`text-sm mt-2 ${product.stock > 10 ? 'text-green-600 dark:text-green-400' : product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
      </p>
    </div>
  </div>
);

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  onAddToCart, 
  searchTerm, 
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  getBundleStock
}) => {
  const products = useAppSelector(state => state.products.items);
  
  const productsWithLiveStock = useMemo(() => {
    return products.map(p => ({
      ...p,
      stock: p.isBundle ? getBundleStock(p) : p.stock,
    }));
  }, [products, getBundleStock]);

  // FIX: Explicitly type the useMemo return value to correct type inference issues.
  const filteredProducts = useMemo<Product[]>(() => {
    const categoryFiltered = selectedCategory !== 'All' 
        ? productsWithLiveStock.filter(p => p.category === selectedCategory)
        : productsWithLiveStock;

    return fuzzySearch(categoryFiltered, searchTerm, ['name', 'category']);
  }, [productsWithLiveStock, searchTerm, selectedCategory]);
  
  // FIX: Explicitly type the useMemo return value to correct type inference issues.
  const categories = useMemo<string[]>(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          id="product-search-input"
          type="text"
          placeholder="Search products... (F2)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-grow p-3 bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] border border-[rgb(var(--color-border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-primary-focus-ring))]"
        />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="p-3 bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] border border-[rgb(var(--color-border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-primary-focus-ring))]"
        >
          {/* FIX: Explicitly type 'cat' as string to resolve type inference issue. */}
          {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
};