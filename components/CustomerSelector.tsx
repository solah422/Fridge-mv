import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Customer } from '../types';
import { useAppSelector } from '../store/hooks';
import fuzzySearch from '../services/fuseService';

interface CustomerSelectorProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  selectedCustomer,
  onSelectCustomer,
}) => {
  const customers = useAppSelector(state => state.customers.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(selectedCustomer ? selectedCustomer.name : '');
  }, [selectedCustomer]);

  // FIX: Explicitly type the useMemo return value to correct type inference issues.
  const filteredCustomers = useMemo<Customer[]>(() => {
    if (!searchTerm || (selectedCustomer && searchTerm === selectedCustomer.name)) {
      return [];
    }
    return fuzzySearch(customers, searchTerm, ['name', 'email', 'phone']);
  }, [customers, searchTerm, selectedCustomer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (selectedCustomer) onSelectCustomer(null);
    setIsDropdownOpen(newSearchTerm.length > 0);
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    setSearchTerm(customer.name);
    setIsDropdownOpen(false);
  };
  
  const handleClear = () => {
    onSelectCustomer(null);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        if (!selectedCustomer) setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomer]);

  return (
    <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow-md mb-6" ref={wrapperRef}>
      <h2 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-3">Select Customer</h2>
      <div className="relative">
        <input
          id="customer-search-input"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => { if (searchTerm) setIsDropdownOpen(true); }}
          placeholder="-- Search for a customer (F1) --"
          className="w-full p-3 pr-10 bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] border border-[rgb(var(--color-border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--color-primary-focus-ring))] focus:border-[rgb(var(--color-primary-focus-ring))] transition"
        />
        {searchTerm && (
          <button onClick={handleClear} className="absolute inset-y-0 right-0 flex items-center pr-3 text-[rgb(var(--color-text-subtle))] hover:text-[rgb(var(--color-text-base))]" aria-label="Clear customer selection">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          </button>
        )}
        {isDropdownOpen && filteredCustomers.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <li key={customer.id} onClick={() => handleSelectCustomer(customer)} className="p-3 text-[rgb(var(--color-text-base))] hover:bg-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-text-on-primary))] cursor-pointer transition-colors">
                {customer.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};