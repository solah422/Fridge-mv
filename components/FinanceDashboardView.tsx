import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectAllMonthlyStatements } from '../store/slices/monthlyStatementsSlice';
import { Customer, MonthlyStatement } from '../types';
import { MonthlyStatementModal } from './MonthlyStatementModal';
import { ManageCustomersModal } from './ManageCustomersModal';
import { addNotification } from '../store/slices/notificationsSlice';
import { updateCustomers } from '../store/slices/customersSlice';
// FIX: Added import for selectAllCustomerGroups to fetch customer groups.
import { selectAllCustomerGroups } from '../store/slices/customerGroupsSlice';

export const FinanceDashboardView: React.FC = () => {
    const dispatch = useAppDispatch();
    const allStatements = useAppSelector(selectAllMonthlyStatements);
    const allCustomers = useAppSelector(state => state.customers.items);
    // FIX: Fetched customer groups from the Redux store.
    const customerGroups = useAppSelector(selectAllCustomerGroups);

    const [filter, setFilter] = useState<'all' | 'due' | 'paid'>('due');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingStatement, setViewingStatement] = useState<MonthlyStatement | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const filteredStatements = useMemo(() => {
        return [...allStatements]
            .filter(s => {
                const matchesFilter = filter === 'all' ? true : s.status === filter;
                const matchesSearch = searchTerm ? s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : true;
                return matchesFilter && matchesSearch;
            })
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    }, [allStatements, filter, searchTerm]);

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

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Invoice Management Center</h2>
            <div className="flex justify-between items-center mb-4 p-4 bg-[rgb(var(--color-bg-subtle))] rounded-md">
                <div className="flex items-center gap-2">
                    <button onClick={() => setFilter('due')} className={`px-3 py-1 rounded-md text-sm ${filter === 'due' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>Unpaid/Overdue</button>
                    <button onClick={() => setFilter('paid')} className={`px-3 py-1 rounded-md text-sm ${filter === 'paid' ? 'bg-green-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>Paid</button>
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-[rgb(var(--color-border))]'}`}>All</button>
                </div>
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by customer name..." className="p-2 border rounded-md" />
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
            {viewingStatement && <MonthlyStatementModal statement={viewingStatement} onClose={() => setViewingStatement(null)} />}
            {editingCustomer && <ManageCustomersModal isOpen={true} customers={allCustomers} customerGroups={customerGroups} onSave={handleSaveCustomer} onRemove={() => {}} onClose={() => setEditingCustomer(null)} customerToEdit={editingCustomer} />}
        </div>
    );
};