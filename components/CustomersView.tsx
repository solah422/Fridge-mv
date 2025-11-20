import React, { useState, useMemo } from 'react';
import { Customer, Transaction, LoyaltySettings, CustomerGroup, Credential } from '../types';
import { ManageCustomersModal } from './ManageCustomersModal';
import { ImportCustomersModal } from './ImportCustomersModal';
import { LoyaltySettingsView } from './LoyaltySettingsView';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';
import { BulkNotificationModal } from './BulkNotificationModal';
import { selectAllCustomerGroups } from '../store/slices/customerGroupsSlice';
import { ManageGroupsModal } from './ManageGroupsModal';
import { selectUser } from '../store/slices/authSlice';
import { selectAllCredentials } from '../store/slices/credentialsSlice';
import { ManagePermissionsModal } from './ManagePermissionsModal';

interface CustomersViewProps {
  customers: Customer[];
  onCustomersUpdate: (customers: Customer[]) => void;
  transactions: Transaction[];
  loyaltySettings: LoyaltySettings;
  onLoyaltySettingsUpdate: (settings: LoyaltySettings) => void;
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
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  const customerGroups = useAppSelector(selectAllCustomerGroups);
  const credentials = useAppSelector(selectAllCredentials);
  
  const [activeTab, setActiveTab] = useState<'customers' | 'loyalty'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isBulkNotificationModalOpen, setIsBulkNotificationModalOpen] = useState(false);
  
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerForPermissions, setCustomerForPermissions] = useState<Customer | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);

  const groupMap = useMemo(() => new Map(customerGroups.map(g => [g.id, g.name])), [customerGroups]);
  const credentialMap = useMemo(() => new Map(credentials.map(c => [c.redboxId, c])), [credentials]);

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
    let customersToFilter = customerData;
    
    if (groupFilter !== 'all') {
        customersToFilter = customersToFilter.filter(c => c.groupId === parseInt(groupFilter));
    }

    if (!searchTerm) return customersToFilter;

    const lowercasedFilter = searchTerm.toLowerCase();
    return customersToFilter.filter(customer =>
      customer.name.toLowerCase().includes(lowercasedFilter) ||
      (customer.email && customer.email.toLowerCase().includes(lowercasedFilter)) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  }, [customerData, searchTerm, groupFilter]);
  
  const handleOpenAddModal = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleOpenPermissionsModal = (customer: Customer) => {
      if (customer.redboxId) {
          setCustomerForPermissions(customer);
          setIsPermissionsModalOpen(true);
      } else {
          dispatch(addNotification({ type: 'error', message: 'This customer does not have a Redbox ID assigned.' }));
      }
  };

  const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
    if ('id' in customerData) {
      onCustomersUpdate(customers.map(c => 
        c.id === customerData.id 
          ? { ...c, ...customerData } 
          : c
      ));
    } else {
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

  // --- Bulk Actions Logic ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedCustomerIds(filteredCustomers.map(c => c.id));
    } else {
        setSelectedCustomerIds([]);
    }
  };

  const handleSelectOne = (customerId: number) => {
    setSelectedCustomerIds(prev =>
        prev.includes(customerId)
            ? prev.filter(id => id !== customerId)
            : [...prev, customerId]
    );
  };

  const isAllSelected = filteredCustomers.length > 0 && selectedCustomerIds.length === filteredCustomers.length;

  const handleDeleteSelected = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCustomerIds.length} selected customers? This action cannot be undone.`)) {
        onCustomersUpdate(customers.filter(c => !selectedCustomerIds.includes(c.id)));
        dispatch(addNotification({ type: 'success', message: `${selectedCustomerIds.length} customers deleted.` }));
        setSelectedCustomerIds([]);
    }
  };

  const handleSendBulkNotification = (message: string) => {
    const updatedCustomers = customers.map(customer => {
        if (selectedCustomerIds.includes(customer.id)) {
            const newNotifications = [...(customer.notifications || []), message];
            return { ...customer, notifications: newNotifications };
        }
        return customer;
    });
    onCustomersUpdate(updatedCustomers);
    dispatch(addNotification({ type: 'success', message: `Notification sent to ${selectedCustomerIds.length} customers.` }));
    setSelectedCustomerIds([]);
    setIsBulkNotificationModalOpen(false);
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
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] transition text-sm font-semibold">
                                Import
                            </button>
                             <button onClick={() => setIsGroupsModalOpen(true)} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border-subtle))] transition text-sm font-semibold">
                                Manage Groups
                            </button>
                            <button onClick={handleOpenAddModal} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition text-sm font-semibold">
                                Add New Customer
                            </button>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="w-full md:w-48 p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]">
                                <option value="all">All Groups</option>
                                {customerGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <input 
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                            />
                        </div>
                    </div>
                    
                    {selectedCustomerIds.length > 0 && (
                        <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg p-3 mb-4 flex justify-between items-center">
                            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                {selectedCustomerIds.length} customer(s) selected
                            </p>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsBulkNotificationModalOpen(true)} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 shadow-sm transition-colors">
                                    Send Notification
                                </button>
                                <button onClick={handleDeleteSelected} className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 shadow-sm transition-colors">
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                            <thead className="bg-[rgb(var(--color-bg-subtle))]">
                                <tr>
                                    <th className="px-2 py-3">
                                        <input type="checkbox"
                                               checked={isAllSelected}
                                               onChange={handleSelectAll}
                                               className="h-4 w-4 rounded border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary-focus-ring))]" />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Group</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Contact</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Total Spent</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Last Purchase</th>
                                    {currentUser?.role === 'admin' && (
                                        <th className="px-4 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Role</th>
                                    )}
                                    <th className="px-4 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                                {filteredCustomers.map(customer => {
                                    const cred = customer.redboxId ? credentialMap.get(customer.redboxId) : null;
                                    return (
                                        <tr key={customer.id} className="hover:bg-[rgb(var(--color-bg-subtle))] transition-colors">
                                            <td className="px-2 py-4">
                                                <input type="checkbox"
                                                    checked={selectedCustomerIds.includes(customer.id)}
                                                    onChange={() => handleSelectOne(customer.id)}
                                                    className="h-4 w-4 rounded border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary-focus-ring))]" />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{customer.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{customer.groupId ? groupMap.get(customer.groupId) : 'None'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{customer.email || customer.phone || 'N/A'}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">MVR {customer.totalSpent.toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{customer.lastPurchase ? customer.lastPurchase.toLocaleDateString() : 'N/A'}</td>
                                            {currentUser?.role === 'admin' && (
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                                                        cred?.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                                        cred?.role === 'finance' ? 'bg-blue-100 text-blue-800' : 
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {cred?.role || 'Customer'}
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {currentUser?.role === 'admin' && (
                                                    <button onClick={() => handleOpenPermissionsModal(customer)} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]" title="Manage Permissions">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                    </button>
                                                )}
                                                <button onClick={() => handleOpenEditModal(customer)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">Edit</button>
                                            </td>
                                        </tr>
                                    );
                                })}
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
        customerGroups={customerGroups}
    />
    <ImportCustomersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBulkImport}
        customers={customers}
    />
     <ManageGroupsModal
        isOpen={isGroupsModalOpen}
        onClose={() => setIsGroupsModalOpen(false)}
        groups={customerGroups}
        customers={customers}
    />
    <BulkNotificationModal
        isOpen={isBulkNotificationModalOpen}
        onClose={() => setIsBulkNotificationModalOpen(false)}
        onSend={handleSendBulkNotification}
        selectedCount={selectedCustomerIds.length}
    />
    {customerForPermissions && (
        <ManagePermissionsModal
            isOpen={isPermissionsModalOpen}
            onClose={() => setIsPermissionsModalOpen(false)}
            customer={customerForPermissions}
            currentRole={
                customerForPermissions.redboxId 
                ? (credentialMap.get(customerForPermissions.redboxId)?.role || 'customer') 
                : 'customer'
            }
        />
    )}
    </>
  );
};