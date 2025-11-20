
import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAllMonthlyStatements } from '../store/slices/monthlyStatementsSlice';
import { Customer, MonthlyStatement, Transaction } from '../types';
import { MonthlyStatementModal } from './MonthlyStatementModal';
import { ManageCustomersModal } from './ManageCustomersModal';
import { addNotification } from '../store/slices/notificationsSlice';
import { updateCustomers } from '../store/slices/customersSlice';
import { selectAllCustomerGroups } from '../store/slices/customerGroupsSlice';
import { InvoiceModal, SummaryInvoiceModal } from './InvoiceModal';
import { updateTransaction } from '../store/slices/transactionsSlice';

export const FinanceDashboardView: React.FC = () => {
    const dispatch = useAppDispatch();
    const allStatements = useAppSelector(selectAllMonthlyStatements);
    const allCustomers = useAppSelector(state => state.customers.items);
    const allTransactions = useAppSelector(state => state.transactions.items);
    const customerGroups = useAppSelector(selectAllCustomerGroups);

    const [activeTab, setActiveTab] = useState<'statements' | 'transactions'>('statements');
    
    // Statement Filter State
    const [filter, setFilter] = useState<'all' | 'due' | 'paid'>('due');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Transaction List State
    const [txSearchTerm, setTxSearchTerm] = useState('');
    const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    // Modals State
    const [viewingStatement, setViewingStatement] = useState<MonthlyStatement | null>(null);
    const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // Identify transactions with uploaded receipts that need review
    const transactionsToReview = useMemo(() => {
        return allTransactions.filter(tx => tx.paymentStatus === 'review' && tx.paymentReceiptUrl);
    }, [allTransactions]);

    const filteredStatements = useMemo(() => {
        return [...allStatements]
            .filter(s => {
                const matchesFilter = filter === 'all' ? true : s.status === filter;
                const matchesSearch = searchTerm ? s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : true;
                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }, [allStatements, filter, searchTerm]);

    const filteredTransactions = useMemo(() => {
        if (!txSearchTerm) return [...allTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lowerSearch = txSearchTerm.toLowerCase();
        return allTransactions.filter(tx => 
            tx.id.toLowerCase().includes(lowerSearch) || 
            tx.customer.name.toLowerCase().includes(lowerSearch)
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [allTransactions, txSearchTerm]);

    const handleSendReminder = (statement: MonthlyStatement) => {
        const customer = allCustomers.find(c => c.id === statement.customerId);
        if (!customer) {
            dispatch(addNotification({ type: 'error', message: 'Customer not found.' }));
            return;
        }
        
        const message = `Payment Reminder: Your statement for the period ending ${new Date(statement.billingPeriodEnd).toLocaleDateString()} with a total of MVR ${statement.totalDue.toFixed(2)} is due on ${new Date(statement.dueDate).toLocaleDateString()}.`;

        const updatedNotifications = [...(customer.notifications || []), message];
        const updatedCustomer: Customer = { ...customer, notifications: updatedNotifications };
        const updatedCustomerList = allCustomers.map(c => c.id === customer.id ? updatedCustomer : c);
        
        dispatch(updateCustomers(updatedCustomerList));
        
        // Open mailto link
        const subject = `Payment Reminder for Fridge MV - Statement ${statement.id}`;
        const body = `Dear ${customer.name},\n\nThis is a friendly reminder that your payment of MVR ${statement.totalDue.toFixed(2)} for the billing period ending ${new Date(statement.billingPeriodEnd).toLocaleDateString()} is due on ${new Date(statement.dueDate).toLocaleDateString()}.\n\nPlease find the payment details in your customer portal.\n\nThank you,\nFridge MV`;
        window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        dispatch(addNotification({ type: 'success', message: `Reminder sent to ${customer.name}` }));
    };

    const handleSaveCustomer = (customerData: Customer | Omit<Customer, 'id'>) => {
        if ('id' in customerData) {
            dispatch(updateCustomers(allCustomers.map(c => c.id === customerData.id ? { ...c, ...customerData } : c)));
        }
        setEditingCustomer(null);
    };

    const handleUpdateTransaction = (updatedTx: Transaction) => {
        dispatch(updateTransaction(updatedTx));
        setViewingTransaction(null);
    };
    
    const handleSelectAllTx = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTransactionIds(filteredTransactions.map(t => t.id));
        } else {
            setSelectedTransactionIds([]);
        }
    };

    const handleSelectOneTx = (id: string) => {
        setSelectedTransactionIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleGenerateSummary = () => {
        if (selectedTransactionIds.length === 0) return;
        setIsSummaryModalOpen(true);
    };

    const selectedTransactionsData = useMemo(() => {
        return allTransactions.filter(t => selectedTransactionIds.includes(t.id));
    }, [allTransactions, selectedTransactionIds]);

    const noOpReturn = () => {};

    return (
        <div className="space-y-8">
            {/* --- Review Section (Always Visible) --- */}
            {transactionsToReview.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md border border-blue-200 dark:border-blue-800">
                    <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Payment Receipts to Review ({transactionsToReview.length})
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-[rgb(var(--color-bg-card))] rounded-md">
                            <thead>
                                <tr className="border-b border-[rgb(var(--color-border-subtle))] text-left">
                                    <th className="p-3 text-xs uppercase">Customer</th>
                                    <th className="p-3 text-xs uppercase">Invoice ID</th>
                                    <th className="p-3 text-xs uppercase">Amount</th>
                                    <th className="p-3 text-xs uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionsToReview.map(tx => (
                                    <tr key={tx.id} className="border-b border-[rgb(var(--color-border-subtle))] last:border-0">
                                        <td className="p-3 font-medium">{tx.customer.name}</td>
                                        <td className="p-3 text-sm">{tx.id}</td>
                                        <td className="p-3 font-bold">MVR {tx.total.toFixed(2)}</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => setViewingTransaction(tx)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                            >
                                                Review Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Invoice Management Center</h2>
                
                <div className="flex border-b border-[rgb(var(--color-border-subtle))] mb-6">
                    <button onClick={() => setActiveTab('statements')} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'statements' ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}>
                        Monthly Statements
                    </button>
                    <button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'transactions' ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}>
                        Individual Transactions
                    </button>
                </div>

                {activeTab === 'statements' && (
                    <>
                        <div className="flex justify-between items-center mb-4 p-4 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setFilter('due')} className={`px-3 py-1 rounded-md text-sm ${filter === 'due' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>Unpaid/Overdue</button>
                                <button onClick={() => setFilter('paid')} className={`px-3 py-1 rounded-md text-sm ${filter === 'paid' ? 'bg-green-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>Paid</button>
                                <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>All</button>
                            </div>
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by customer..." className="p-2 border rounded-md" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                                <thead className="bg-[rgb(var(--color-bg-subtle))]">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Billing Period</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Due Date</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Total Due</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Status</th>
                                        <th className="px-4 py-2 text-right text-xs uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStatements.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-4 py-3 font-medium">{s.customerName}</td>
                                            <td className="px-4 py-3 text-sm">{new Date(s.billingPeriodStart).toLocaleDateString()} - {new Date(s.billingPeriodEnd).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 text-sm">{new Date(s.dueDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-semibold">MVR {s.totalDue.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${s.status === 'paid' ? 'bg-green-100 text-green-800' : s.overdueStatus === '7_days_overdue' ? 'bg-red-200 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {s.status === 'paid' ? 'Paid' : s.overdueStatus === '7_days_overdue' ? 'Overdue' : 'Due'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm space-x-2">
                                                <button onClick={() => setViewingStatement(s)} className="text-[rgb(var(--color-primary))] hover:underline">View</button>
                                                <button onClick={() => setEditingCustomer(allCustomers.find(c => c.id === s.customerId) || null)} className="text-[rgb(var(--color-primary))] hover:underline">Contact</button>
                                                {s.status === 'due' && <button onClick={() => handleSendReminder(s)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">Remind</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'transactions' && (
                    <>
                        <div className="flex justify-between items-center mb-4 p-4 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                             <div className="flex items-center gap-4">
                                <input type="text" value={txSearchTerm} onChange={e => setTxSearchTerm(e.target.value)} placeholder="Search transactions..." className="p-2 border rounded-md w-64" />
                                {selectedTransactionIds.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{selectedTransactionIds.length} selected</span>
                                        <button onClick={handleGenerateSummary} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 shadow-sm">Generate Summary</button>
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                                <thead className="bg-[rgb(var(--color-bg-subtle))]">
                                    <tr>
                                        <th className="px-3 py-3 w-10">
                                            <input type="checkbox" onChange={handleSelectAllTx} checked={filteredTransactions.length > 0 && selectedTransactionIds.length === filteredTransactions.length} className="rounded border-[rgb(var(--color-border))] text-indigo-600 focus:ring-indigo-500" />
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">ID</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Customer</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Total</th>
                                        <th className="px-4 py-2 text-left text-xs uppercase">Status</th>
                                        <th className="px-4 py-2 text-right text-xs uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td className="px-3 py-4">
                                                <input type="checkbox" checked={selectedTransactionIds.includes(tx.id)} onChange={() => handleSelectOneTx(tx.id)} className="rounded border-[rgb(var(--color-border))] text-indigo-600 focus:ring-indigo-500" />
                                            </td>
                                            <td className="px-4 py-3 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 font-mono text-sm">{tx.id}</td>
                                            <td className="px-4 py-3 font-medium">{tx.customer.name}</td>
                                            <td className="px-4 py-3 font-semibold">MVR {tx.total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${tx.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {tx.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                 <button onClick={() => setViewingTransaction(tx)} className="text-[rgb(var(--color-primary))] hover:underline text-sm">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            
            {viewingStatement && <MonthlyStatementModal statement={viewingStatement} onClose={() => setViewingStatement(null)} />}
            {editingCustomer && <ManageCustomersModal isOpen={true} customers={allCustomers} customerGroups={customerGroups} onSave={handleSaveCustomer} onRemove={() => {}} onClose={() => setEditingCustomer(null)} customerToEdit={editingCustomer} />}
            {viewingTransaction && (
                <InvoiceModal 
                    invoice={viewingTransaction}
                    onClose={() => setViewingTransaction(null)}
                    onUpdateTransaction={handleUpdateTransaction}
                    onProcessReturn={noOpReturn}
                />
            )}
            {isSummaryModalOpen && (
                <SummaryInvoiceModal 
                    isOpen={isSummaryModalOpen} 
                    onClose={() => setIsSummaryModalOpen(false)} 
                    transactions={selectedTransactionsData} 
                />
            )}
        </div>
    );
};
