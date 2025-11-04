

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { DailyReport, Transaction, Product, Customer } from '../types';
import { addDailyReport, selectAllDailyReports } from '../store/slices/reportsSlice';
import { CalendarDropdown } from './CalendarDropdown';
import { ZReportModal } from './ZReportModal';
import { addNotification } from '../store/slices/notificationsSlice';
// FIX: Replaced direct access to 'state.app.theme' with the 'selectActiveTheme' selector to correctly retrieve the current theme and resolve the type error.
import { selectActiveTheme } from '../store/slices/appSlice';

// Rely on the global Chart and dateFns objects loaded from index.html
declare global {
    interface Window {
        Chart: any;
        dateFns: any;
    }
}

// Helper to get theme-aware colors for charts
const getThemeColor = (variable: string) => `rgb(var(--color-${variable}))`;

type ProductPerformance = {
    productId: number;
    name: string;
    category: string;
    unitsSold: number;
    netRevenue: number;
    cogs: number;
    grossProfit: number;
}
type TopCustomer = {
    customerId: number;
    name: string;
    orderCount: number;
    totalSpent: number;
}
type SortKey = keyof ProductPerformance;

export const ReportsView: React.FC = () => {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(state => state.transactions.items);
    const products = useAppSelector(state => state.products.items);
    const customers = useAppSelector(state => state.customers.items);
    const dailyReports = useAppSelector(selectAllDailyReports);
    const theme = useAppSelector(selectActiveTheme);
    
    const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
    
    const [startDate, setStartDate] = useState(window.dateFns.startOfMonth(new Date()).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [activePreset, setActivePreset] = useState('This Month');
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'grossProfit', direction: 'desc' });

    const productMap = useMemo<Map<number, Product>>(() => new Map(products.map(p => [p.id, p])), [products]);
    const reportedTxIds = useMemo(() => new Set(dailyReports.flatMap(r => r.transactions.map(t => t.id))), [dailyReports]);
    const todaysTransactions = useMemo(() => transactions.filter(tx => !reportedTxIds.has(tx.id)), [transactions, reportedTxIds]);

    const reportData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= start && txDate <= end;
        });

        const summary = { totalRevenue: 0, totalProfit: 0, totalItemsSold: 0, transactionCount: filteredTransactions.length, newCustomers: 0 };
        const salesByDay = new Map<string, { sales: number; profit: number }>();
        const salesByCategory = new Map<string, number>();
        const productPerformanceMap = new Map<number, ProductPerformance>();
        const customerSpendMap = new Map<number, { name: string, orderCount: number; totalSpent: number }>();

        const newCustomerIds = new Set(customers.filter(c => c.createdAt && new Date(c.createdAt) >= start && new Date(c.createdAt) <= end).map(c => c.id));
        summary.newCustomers = newCustomerIds.size;
        
        for (const tx of filteredTransactions) {
            summary.totalRevenue += tx.total;
            summary.totalItemsSold += tx.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const day = tx.date.split('T')[0];
            const dayData = salesByDay.get(day) || { sales: 0, profit: 0 };
            dayData.sales += tx.total;
            
            let txProfit = 0;
            for (const item of tx.items) {
                const product = productMap.get(item.id);
                if (product) {
                    const itemProfit = (item.price - product.wholesalePrice) * item.quantity;
                    txProfit += itemProfit;

                    salesByCategory.set(product.category, (salesByCategory.get(product.category) || 0) + item.price * item.quantity);
                    
                    let perf = productPerformanceMap.get(product.id);
                    if (!perf) {
                        perf = { productId: product.id, name: product.name, category: product.category, unitsSold: 0, netRevenue: 0, cogs: 0, grossProfit: 0 };
                    }
                    perf.unitsSold += item.quantity;
                    perf.netRevenue += item.price * item.quantity;
                    perf.cogs += product.wholesalePrice * item.quantity;
                    perf.grossProfit += itemProfit;
                    productPerformanceMap.set(product.id, perf);
                }
            }
            dayData.profit += txProfit;
            summary.totalProfit += txProfit;
            salesByDay.set(day, dayData);

            let custData = customerSpendMap.get(tx.customer.id);
            if (!custData) {
                custData = { name: tx.customer.name, orderCount: 0, totalSpent: 0 };
            }
            custData.orderCount++;
            custData.totalSpent += tx.total;
            customerSpendMap.set(tx.customer.id, custData);
        }
        
        // FIX: The original sort logic performed subtraction on strings (e.g., product names), causing a type error.
        // This updated logic handles both string and number types correctly and respects the sort direction.
        const sortedProductPerformance = Array.from(productPerformanceMap.values()).sort((a, b) => {
            const key = sortConfig.key;
            const aValue = a[key];
            const bValue = b[key];
        
            let compare = 0;
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                compare = aValue - bValue;
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                compare = aValue.localeCompare(bValue);
            }
            
            return sortConfig.direction === 'asc' ? compare : -compare;
        });
        const topCustomers = Array.from(customerSpendMap.entries()).map(([id, data]) => ({ customerId: id, ...data })).sort((a,b) => b.totalSpent - a.totalSpent).slice(0, 5);

        return { summary, salesByDay, salesByCategory, productPerformance: sortedProductPerformance, topCustomers };
    }, [transactions, products, customers, startDate, endDate, sortConfig]);
    
    const handleConfirmZReport = (report: DailyReport) => {
        dispatch(addDailyReport(report));
        setIsZReportModalOpen(false);
        dispatch(addNotification({ type: 'success', message: `Day closed successfully. Report ID: ${report.id}` }));
    };

    const handlePreset = (preset: string) => {
        setActivePreset(preset);
        const today = new Date();
        let start = new Date();
        let end = new Date();
    
        switch(preset) {
            case 'Today':
                start = window.dateFns.startOfDay(today);
                end = window.dateFns.endOfDay(today);
                break;
            case 'Last 7 Days':
                start = window.dateFns.subDays(today, 6);
                end = today;
                break;
            case 'Last 30 Days':
                start = window.dateFns.subDays(today, 29);
                end = today;
                break;
            case 'This Month':
                start = window.dateFns.startOfMonth(today);
                end = today;
                break;
        }
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };
    
    const salesProfitChartRef = useRef<HTMLCanvasElement>(null);
    const categoryChartRef = useRef<HTMLCanvasElement>(null);
    const salesProfitChartInstance = useRef<any>(null);
    const categoryChartInstance = useRef<any>(null);

    useEffect(() => {
        if (!window.Chart) return;
        const textMuted = getThemeColor('text-muted');
        const borderSubtle = getThemeColor('border-subtle');
        const primaryColor = getThemeColor('primary');
        const profitColor = '#10b981'; // green-500

        if (salesProfitChartInstance.current) salesProfitChartInstance.current.destroy();
        if (categoryChartInstance.current) categoryChartInstance.current.destroy();

        if (salesProfitChartRef.current && reportData.salesByDay.size > 0) {
            const sortedSales = Array.from(reportData.salesByDay.entries()).sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
            const ctx = salesProfitChartRef.current.getContext('2d');
            if (ctx) {
                salesProfitChartInstance.current = new window.Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: sortedSales.map(d => d[0]),
                        datasets: [
                            { label: 'Profit (MVR)', yAxisID: 'y1', data: sortedSales.map(d => d[1].profit), borderColor: profitColor, backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.1, fill: true },
                            { label: 'Sales (MVR)', yAxisID: 'y', data: sortedSales.map(d => d[1].sales), borderColor: primaryColor, backgroundColor: `rgba(var(--color-primary), 0.1)`, tension: 0.1, fill: true },
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: {
                        x: { type: 'time', time: { unit: 'day' }, grid: { color: borderSubtle }, ticks: { color: textMuted } },
                        y: { position: 'left', beginAtZero: true, grid: { color: borderSubtle }, ticks: { color: textMuted, callback: (v: any) => `MVR ${v}` } },
                        y1: { position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }, ticks: { color: profitColor, callback: (v: any) => `MVR ${v}` }}
                    }}
                });
            }
        }
        
        if (categoryChartRef.current && reportData.salesByCategory.size > 0) {
            const ctx = categoryChartRef.current.getContext('2d');
            if (ctx) {
                categoryChartInstance.current = new window.Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Array.from(reportData.salesByCategory.keys()),
                        datasets: [{ data: Array.from(reportData.salesByCategory.values()), backgroundColor: ['rgba(var(--color-primary), 0.8)', 'rgba(var(--color-primary), 0.6)', 'rgba(var(--color-primary), 0.4)'], borderColor: getThemeColor('bg-card') }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textMuted }}}}
                });
            }
        }
    }, [reportData, theme]);

    const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
        <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow"><h4 className="text-sm text-[rgb(var(--color-text-muted))]">{title}</h4><p className="text-2xl font-bold mt-1">{value}</p></div>
    );

    const presets = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];

    return (
        <>
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold">Sales Dashboard</h2>
                <button onClick={() => setIsZReportModalOpen(true)} disabled={todaysTransactions.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                    Close Day & Generate Z-Report
                </button>
            </div>

            <div className="p-4 bg-[rgb(var(--color-bg-card))] rounded-lg shadow">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex items-center gap-2">
                        {presets.map(p => (
                            <button key={p} onClick={() => handlePreset(p)} className={`px-3 py-1.5 text-sm rounded-md ${activePreset === p ? 'bg-[rgb(var(--color-primary))] text-white' : 'bg-[rgb(var(--color-bg-subtle))]'}`}>{p}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative"><label className="block text-xs mb-1">Start Date</label><button onClick={() => setIsStartDatePickerOpen(p => !p)} className="p-2 h-[38px] text-left border rounded-md text-sm w-32">{new Date(startDate+'T00:00:00').toLocaleDateString()}</button>{isStartDatePickerOpen && <CalendarDropdown selectedDate={startDate} onDateSelect={d => {setStartDate(d); setActivePreset('')}} onClose={() => setIsStartDatePickerOpen(false)} />}</div>
                        <div className="relative"><label className="block text-xs mb-1">End Date</label><button onClick={() => setIsEndDatePickerOpen(p => !p)} className="p-2 h-[38px] text-left border rounded-md text-sm w-32">{new Date(endDate+'T00:00:00').toLocaleDateString()}</button>{isEndDatePickerOpen && <CalendarDropdown selectedDate={endDate} onDateSelect={d => {setEndDate(d); setActivePreset('')}} onClose={() => setIsEndDatePickerOpen(false)} />}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Net Revenue" value={`MVR ${reportData.summary.totalRevenue.toFixed(2)}`} />
                <StatCard title="Gross Profit" value={`MVR ${reportData.summary.totalProfit.toFixed(2)}`} />
                <StatCard title="Transactions" value={reportData.summary.transactionCount} />
                <StatCard title="Items Sold" value={reportData.summary.totalItemsSold} />
                <StatCard title="New Customers" value={reportData.summary.newCustomers} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales & Profit Over Time</h3>
                    <div className="h-80"><canvas ref={salesProfitChartRef}></canvas></div>
                </div>
                 <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                    <div className="h-80 flex items-center justify-center">{reportData.salesByCategory.size > 0 ? <canvas ref={categoryChartRef}></canvas> : <p className="text-sm text-[rgb(var(--color-text-muted))]">No sales in this period.</p>}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
                     <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-[rgb(var(--color-bg-card))]"><tr>{['name', 'unitsSold', 'netRevenue', 'grossProfit'].map(k => <th key={k} onClick={() => handleSort(k as SortKey)} className="text-left font-medium uppercase py-2 cursor-pointer">{k.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead>
                            <tbody>{reportData.productPerformance.map(p => <tr key={p.productId} className="border-t">
                                <td className="py-2 font-medium">{p.name}</td><td>{p.unitsSold}</td><td>{p.netRevenue.toFixed(2)}</td><td>{p.grossProfit.toFixed(2)}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                    <div className="space-y-3">{reportData.topCustomers.map(c => <div key={c.customerId} className="flex justify-between items-center"><p className="font-medium">{c.name}</p><p className="text-sm font-mono bg-[rgb(var(--color-bg-subtle))] px-2 py-0.5 rounded">MVR {c.totalSpent.toFixed(2)}</p></div>)}</div>
                </div>
            </div>

        </div>
        {isZReportModalOpen && <ZReportModal isOpen={isZReportModalOpen} onClose={() => setIsZReportModalOpen(false)} onConfirm={handleConfirmZReport} transactions={todaysTransactions} productMap={productMap} />}
        </>
    );
};