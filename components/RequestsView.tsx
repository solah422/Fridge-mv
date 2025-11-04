import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { ProductRequest, ProductSuggestion } from '../types';
import { selectAllProductRequests, updateProductRequests } from '../store/slices/productRequestsSlice';
import { selectAllProductSuggestions, updateProductSuggestions } from '../store/slices/productSuggestionsSlice';

const StatusBadge: React.FC<{ status: 'pending' | 'approved' | 'denied' | 'contacted' }> = ({ status }) => {
    const colorClasses = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300',
        approved: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300',
        denied: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300',
        contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClasses[status]}`}>{status}</span>;
};

export const RequestsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'suggestions'>('requests');
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectAllProductRequests);
    const suggestions = useAppSelector(selectAllProductSuggestions);

    const handleRequestStatusChange = (request: ProductRequest, newStatus: ProductRequest['status']) => {
        const updatedRequest = { ...request, status: newStatus };
        const updatedRequests = requests.map(r => r.id === request.id ? updatedRequest : r);
        dispatch(updateProductRequests(updatedRequests));
    };

    const handleSuggestionStatusChange = (suggestion: ProductSuggestion, newStatus: ProductSuggestion['status']) => {
        const updatedSuggestion = { ...suggestion, status: newStatus };
        const updatedSuggestions = suggestions.map(s => s.id === suggestion.id ? updatedSuggestion : s);
        dispatch(updateProductSuggestions(updatedSuggestions));
    };
    
    const TabButton: React.FC<{ tab: 'requests' | 'suggestions'; label: string; count: number; }> = ({ tab, label, count }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors relative ${activeTab === tab ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}
        >
            {label}
            {count > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center absolute -top-2 -right-2">{count}</span>}
        </button>
    );

    const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
    const pendingSuggestionsCount = suggestions.filter(s => s.status === 'pending').length;

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Customer Requests & Suggestions</h2>
            </div>
            <div className="flex border-b border-[rgb(var(--color-border-subtle))] mb-6">
                <TabButton tab="requests" label="Product Requests" count={pendingRequestsCount} />
                <TabButton tab="suggestions" label="Product Suggestions" count={pendingSuggestionsCount} />
            </div>

            {activeTab === 'requests' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                        <thead className="bg-[rgb(var(--color-bg-subtle))]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Suggested Wholesaler</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--color-border-subtle))]">
                            {[...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(req => (
                                <tr key={req.id}>
                                    <td className="px-4 py-4">{req.customerName}</td>
                                    <td className="px-4 py-4 font-semibold">{req.productName}</td>
                                    <td className="px-4 py-4">{req.wholesaler || 'N/A'}</td>
                                    <td className="px-4 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4"><StatusBadge status={req.status} /></td>
                                    <td className="px-4 py-4 text-right">
                                        <select onChange={(e) => handleRequestStatusChange(req, e.target.value as ProductRequest['status'])} value={req.status} className="p-1 border rounded bg-[rgb(var(--color-bg-card))] text-sm">
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approve</option>
                                            <option value="denied">Deny</option>
                                            <option value="contacted">Contact for Info</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'suggestions' && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                        <thead className="bg-[rgb(var(--color-bg-subtle))]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Wholesale Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgb(var(--color-border-subtle))]">
                            {[...suggestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(sug => (
                                <tr key={sug.id}>
                                    <td className="px-4 py-4">{sug.customerName}</td>
                                    <td className="px-4 py-4 font-semibold">{sug.productName}</td>
                                    <td className="px-4 py-4">MVR {sug.wholesalePrice.toFixed(2)}</td>
                                    <td className="px-4 py-4">{new Date(sug.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4"><StatusBadge status={sug.status} /></td>
                                    <td className="px-4 py-4 text-right">
                                        <select onChange={(e) => handleSuggestionStatusChange(sug, e.target.value as ProductSuggestion['status'])} value={sug.status} className="p-1 border rounded bg-[rgb(var(--color-bg-card))] text-sm">
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approve</option>
                                            <option value="denied">Deny</option>
                                            <option value="contacted">Contact for Info</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
