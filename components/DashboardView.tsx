import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveView } from '../store/slices/appSlice';
import { selectAllPasswordResetRequests, updatePasswordResetRequests } from '../store/slices/passwordResetSlice';
import { updateCustomers } from '../store/slices/customersSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectForecastingSettings, ForecastingSettings } from '../store/slices/appSlice';
import { Product, Transaction } from '../types';

export interface ForecastResult {
  productId: number;
  name: string;
  currentStock: number;
  avgDailySales: number;
  daysRemaining: number;
}

export const calculateInventoryForecast = (
  transactions: Transaction[],
  products: Product[],
  settings: ForecastingSettings
): ForecastResult[] => {
  const { lookbackDays, reorderThresholdDays } = settings;
  const results: ForecastResult[] = [];
  
  if (lookbackDays <= 0) {
    return [];
  }

  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  const relevantTransactions = transactions.filter(
    tx => new Date(tx.date) >= lookbackDate
  );

  products.forEach(product => {
    // Skip bundles as their stock is derived
    if (product.isBundle) {
      return;
    }
    
    let totalSold = 0;
    relevantTransactions.forEach(tx => {
      tx.items.forEach(item => {
        if (item.id === product.id) {
          totalSold += item.quantity;
        }
      });
    });

    const avgDailySales = totalSold / lookbackDays;

    if (avgDailySales > 0) {
      const daysRemaining = product.stock / avgDailySales;
      if (daysRemaining <= reorderThresholdDays) {
        results.push({
          productId: product.id,
          name: product.name,
          currentStock: product.stock,
          avgDailySales: parseFloat(avgDailySales.toFixed(2)),
          daysRemaining: Math.floor(daysRemaining),
        });
      }
    }
  });

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
};


const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-[rgb(var(--color-text-base))]">{value}</p>
    </div>
);

export const DashboardView: React.FC = () => {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(state => state.transactions.items);
    const products = useAppSelector(state => state.products.items);
    const customers = useAppSelector(state => state.customers.items);
    const passwordResetRequests = useAppSelector(selectAllPasswordResetRequests);
    const forecastingSettings = useAppSelector(selectForecastingSettings);

    const forecastResults = useMemo(() => {
        return calculateInventoryForecast(transactions, products, forecastingSettings);
    }, [transactions, products, forecastingSettings]);

    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(tx => tx.date.startsWith(today));

    const todaysSales = todaysTransactions.reduce((acc, tx) => acc + tx.total, 0);
    const todaysTransactionCount = todaysTransactions.length;

    const lowStockProducts = products.filter(p => !p.isBundle && p.stock <= 10 && p.stock > 0).sort((a,b) => a.stock - b.stock);
    const outOfStockProducts = products.filter(p => !p.isBundle && p.stock === 0);

    const productSales = todaysTransactions.flatMap(tx => tx.items).reduce((acc, item) => {
        acc.set(item.id, (acc.get(item.id) || 0) + item.quantity);
        return acc;
    }, new Map<number, number>());

    const topSellingProducts = Array.from(productSales.entries())
        .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
        .slice(0, 5)
        .map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            return { name: product?.name || 'Unknown', quantity };
        });

    const pendingOrders = transactions
        .filter(tx => tx.orderStatus === 'Pending')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const pendingResets = passwordResetRequests.filter(r => r.status === 'pending');

    const handleApproveReset = (requestId: string, customerId: number) => {
        const customerToUpdate = customers.find(c => c.id === customerId);
        if (!customerToUpdate) {
            dispatch(addNotification({ type: 'error', message: 'Error: Customer not found.' }));
            return;
        }

        const updatedCustomers = customers.map(c => 
            c.id === customerId ? { ...c, password: '' } : c
        );
        dispatch(updateCustomers(updatedCustomers));
        
        const updatedRequests = passwordResetRequests.map(r => 
            r.id === requestId ? { ...r, status: 'completed' } : r
        );
        dispatch(updatePasswordResetRequests(updatedRequests));

        dispatch(addNotification({ type: 'success', message: `${customerToUpdate.name}'s password has been reset.` }));
    };

    return (
        <div className="space-y-8">
            <section>
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-base))] mb-4">Today's Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Today's Sales" value={`MVR ${todaysSales.toFixed(2)}`} />
                    <StatCard title="Transactions" value={todaysTransactionCount} />
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-base))] mb-4">Inventory Forecast & Re-order ({forecastResults.length})</h3>
                    {forecastResults.length > 0 ? (
                        <div className="overflow-x-auto max-h-72">
                            <table className="min-w-full">
                                <thead className="border-b border-[rgb(var(--color-border-subtle))]">
                                    <tr>
                                        <th className="text-left text-xs font-medium uppercase pb-2">Product</th>
                                        <th className="text-center text-xs font-medium uppercase pb-2">Current Stock</th>
                                        <th className="text-center text-xs font-medium uppercase pb-2">Avg. Daily Sales</th>
                                        <th className="text-center text-xs font-medium uppercase pb-2">Days Remaining</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forecastResults.map(item => (
                                        <tr key={item.productId} className="border-b border-[rgb(var(--color-border-subtle))] last:border-0">
                                            <td className="py-3 font-medium">{item.name}</td>
                                            <td className="py-3 text-center">{item.currentStock}</td>
                                            <td className="py-3 text-center">{item.avgDailySales}</td>
                                            <td className={`py-3 text-center font-bold ${item.daysRemaining <= 3 ? 'text-red-500' : 'text-yellow-600'}`}>
                                                ~{item.daysRemaining} days
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[rgb(var(--color-text-muted))] py-4">No products are currently flagged for re-ordering based on your settings.</p>
                    )}
                </div>
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-base))] mb-4">Pending Customer Orders ({pendingOrders.length})</h3>
                    {pendingOrders.length > 0 ? (
                        <div className="overflow-x-auto max-h-72">
                            <table className="min-w-full">
                                <thead className="border-b border-[rgb(var(--color-border-subtle))]">
                                    <tr>
                                        <th className="text-left text-xs font-medium uppercase pb-2">Customer</th>
                                        <th className="text-right text-xs font-medium uppercase pb-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.map(order => (
                                        <tr key={order.id} className="border-b border-[rgb(var(--color-border-subtle))] last:border-0">
                                            <td className="py-3">{order.customer.name}</td>
                                            <td className="py-3 text-right font-semibold">MVR {order.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[rgb(var(--color-text-muted))] py-4">No pending orders.</p>
                    )}
                </div>

                 <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-base))] mb-4">Password Reset Requests ({pendingResets.length})</h3>
                    {pendingResets.length > 0 ? (
                        <div className="overflow-x-auto max-h-72">
                            <table className="min-w-full">
                                <thead className="border-b border-[rgb(var(--color-border-subtle))]">
                                    <tr>
                                        <th className="text-left text-xs font-medium uppercase pb-2">Customer</th>
                                        <th className="text-right text-xs font-medium uppercase pb-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingResets.map(req => (
                                        <tr key={req.id} className="border-b border-[rgb(var(--color-border-subtle))] last:border-0">
                                            <td className="py-3">{req.customerName} (ID: {req.redboxId})</td>
                                            <td className="py-3 text-right">
                                                <button onClick={() => handleApproveReset(req.id, req.customerId)} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md hover:bg-green-200">
                                                    Approve Reset
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-center text-[rgb(var(--color-text-muted))] py-4">No pending password resets.</p>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-base))] mb-4">Top Selling Products Today</h3>
                    {topSellingProducts.length > 0 ? (
                        <ul className="space-y-3">
                            {topSellingProducts.map((p, i) => (
                                <li key={i} className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-[rgb(var(--color-text-base))]">{p.name}</span>
                                    <span className="font-bold text-[rgb(var(--color-text-muted))]">{p.quantity} sold</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-[rgb(var(--color-text-muted))] py-4">No sales recorded yet today.</p>
                    )}
                </div>
                <div className="lg:col-span-2 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-base))] mb-4">Inventory Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Low Stock Alerts</h4>
                             {lowStockProducts.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {lowStockProducts.slice(0,5).map(p => (
                                        <li key={p.id} className="flex justify-between">
                                            <span>{p.name}</span>
                                            <span className="font-mono">{p.stock} left</span>
                                        </li>
                                    ))}
                                    {lowStockProducts.length > 5 && <li className="text-xs text-[rgb(var(--color-text-muted))]">...and {lowStockProducts.length - 5} more.</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-[rgb(var(--color-text-muted))]">No items are currently low on stock.</p>
                            )}
                        </div>
                         <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Out of Stock</h4>
                             {outOfStockProducts.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {outOfStockProducts.slice(0,5).map(p => <li key={p.id}>{p.name}</li>)}
                                    {outOfStockProducts.length > 5 && <li className="text-xs text-[rgb(var(--color-text-muted))]">...and {outOfStockProducts.length - 5} more.</li>}
                                </ul>
                            ) : (
                                <p className="text-sm text-[rgb(var(--color-text-muted))]">All products are in stock.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};