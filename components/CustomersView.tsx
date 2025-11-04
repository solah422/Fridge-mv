import React, { useState, useMemo } from 'react';
import { Customer, Transaction, LoyaltySettings } from '../types';
import { ManageCustomersModal } from './ManageCustomersModal';
import { ImportCustomersModal } from './ImportCustomersModal';
import { LoyaltySettingsView } from './LoyaltySettingsView';

interface CustomersViewProps {
  customers: Customer[];
  onCustomersUpdate: (customers: Customer[]) => void;
  transactions: Transaction[];
  loyaltySettings: LoyaltySettings;
  onLoyaltySettingsUpdate: (settings: LoyaltySettings) => void;
}

type CustomerData = Customer & {
    transactionCount: number;
    totalSpent: number;
    lastPurchase: Date | null;
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-[rgb(var(--color-text-base))]">{value}</p>
    </div>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${active ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}>{label}</button>
);


export const CustomersView: React.FC<CustomersViewProps> = ({ customers, onCustomersUpdate, transactions, loyaltySettings, onLoyaltySettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<'customers' | 'loyalty'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const customerData = useMemo(() => {
    return customers.map(customer => {
      const customerTransactions = transactions.filter(t => t.customer.id === customer.id);
      const totalSpent = customerTransactions.reduce((acc, t) => acc + t.total, 0);
      const lastPurchase = customerTransactions.length > 0
        ? new Date(Math.max(...customerTransactions.map(t => new Date(t.date).getTime())))
        : null;
      return {
        ...customer,
        transactionCount: customerTransactions.length,
        totalSpent,
        lastPurchase
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [customers, transactions]);
  
  const totalRevenue = useMemo(() => customerData.reduce((acc, c) => acc + c.totalSpent, 0), [customerData]);
  const averageSpend = useMemo(() => customerData.length > 0 ? totalRevenue / customerData.length : 0, [customerData, totalRevenue]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customerData;
    const lowercasedFilter = searchTerm.toLowerCase();
    return customerData.filter(customer =>
      customer.name.toLowerCase().includes(lowercasedFilter) ||
      (customer.email && customer.email.toLowerCase().includes(lowercasedFilter)) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  }, [customerData, searchTerm]);
  
  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
    if ('id' in customerData) {
      // Edit: Merge existing customer data with new data to prevent accidental data loss (e.g., password)
      onCustomersUpdate(customers.map(c => 
        c.id === customerData.id 
          ? { ...c, ...customerData } 
          : c
      ));
    } else {
      // Add: Modal already provides defaults like loyaltyPoints and createdAt. Just add a unique ID.
      const newCustomer: Customer = { 
          ...customerData, 
          id: Date.now(),
      } as Customer;
      onCustomersUpdate([...customers, newCustomer]);
    }
    setIsModalOpen(false);
  };

  const handleRemoveCustomer = (customerId: number) => {
    onCustomersUpdate(customers.filter(c => c.id !== customerId));
    setIsModalOpen(false);
  };

  const handleBulkImport = (newCustomers: Omit<Customer, 'id' | 'loyaltyPoints'>[]) => {
    const customersWithIds = newCustomers.map((c, index) => ({
        ...c,
        id: Date.now() + index,
        loyaltyPoints: 0,
    }));
    onCustomersUpdate([...customers, ...customersWithIds]);
  };

  return (
    <>
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Customer Management</h2>
        </div>
        
        <div className="flex border-b border-[rgb(var(--color-border-subtle))]">
            <TabButton label="Customer List" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
            <TabButton label="Loyalty Program" active={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} />
        </div>

        {activeTab === 'customers' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Customers" value={customers.length} />
                    <StatCard title="Total Revenue" value={`MVR ${totalRevenue.toFixed(2)}`} />
                    <StatCard title="Avg. Spend / Customer" value={`MVR ${averageSpend.toFixed(2)}`} />
                </div>

                <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] transition text-sm font-semibold">
                                Import
                            </button>
                            <button onClick={handleOpenAddModal} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition text-sm font-semibold">
                                Add New Customer
                            </button>
                        </div>
                        <input 
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full max-w-xs p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                            <thead className="bg-[rgb(var(--color-bg-subtle))]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Total Spent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Last Purchase</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{customer.name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{customer.email || customer.phone || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">MVR {customer.totalSpent.toFixed(2)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{customer.lastPurchase ? customer.lastPurchase.toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenEditModal(customer)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'loyalty' && (
            <LoyaltySettingsView 
                loyaltySettings={loyaltySettings}
                onLoyaltySettingsUpdate={onLoyaltySettingsUpdate}
            />
        )}
    </div>
    <ManageCustomersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        onRemove={handleRemoveCustomer}
        customerToEdit={customerToEdit}
        customers={customers}
    />
    <ImportCustomersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
    />
    </>
  );
};