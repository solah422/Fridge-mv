import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { DailyReport, Transaction, Product } from '../types';
import { addDailyReport, selectAllDailyReports } from '../store/slices/reportsSlice';
import { CalendarDropdown } from './CalendarDropdown';
import { ZReportModal } from './ZReportModal';
import { addNotification } from '../store/slices/notificationsSlice';
import { Chart, registerables } from 'chart.js/auto';

declare global {
    interface Window {
        Chart: typeof Chart;
    }
}

if (window.Chart) {
    Chart.register(...registerables);
}

// Helper to get theme-aware colors for charts
const getThemeColor = (variable: string) => `rgb(var(--color-${variable}))`;

export const ReportsView: React.FC = () => {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(state => state.transactions.items);
    const products = useAppSelector(state => state.products.items);
    const dailyReports = useAppSelector(selectAllDailyReports);
    const theme = useAppSelector(state => state.app.theme);
    
    const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
    
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

    const productMap = useMemo<Map<number, Product>>(() => new Map(products.map(p => [p.id, p])), [products]);
    const reportedTxIds = useMemo(() => new Set(dailyReports.flatMap(r => r.transactions.map(t => t.id))), [dailyReports]);
    
    const todaysTransactions = useMemo(() => transactions.filter(tx => !reportedTxIds.has(tx.id)), [transactions, reportedTxIds]);

    const filteredTransactions = useMemo(() => {
        const start = startDate ? new Date(startDate) : null;
        if (start) start.setHours(0, 0, 0, 0);

        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);
        
        return transactions.filter(tx => {
            const transactionDate = new Date(tx.date);
            if (start && transactionDate < start) return false;
            if (end && transactionDate > end) return false;
            return true;
        });
    }, [transactions, startDate, endDate]);

    const reportData = useMemo(() => {
        const summary = { totalRevenue: 0, totalProfit: 0, totalItemsSold: 0, transactionCount: filteredTransactions.length };
        const salesByDay = new Map<string, number>();
        const salesByCategory = new Map<string, number>();
        const salesByProduct = new Map<string, { quantity: number, name: string }>();

        for (const tx of filteredTransactions) {
            summary.totalRevenue += tx.total;
            summary.totalItemsSold += tx.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const day = tx.date.split('T')[0];
            salesByDay.set(day, (salesByDay.get(day) || 0) + tx.total);

            for (const item of tx.items) {
                const product = productMap.get(item.id);
                if (product) {
                    summary.totalProfit += (item.price - product.wholesalePrice) * item.quantity;
                    salesByCategory.set(product.category, (salesByCategory.get(product.category) || 0) + item.price * item.quantity);
                    
                    const currentProduct = salesByProduct.get(product.name) || { quantity: 0, name: product.name };
                    currentProduct.quantity += item.quantity;
                    salesByProduct.set(product.name, currentProduct);
                }
            }
        }
        
        const topProducts = Array.from(salesByProduct.values())
            .sort((a,b) => b.quantity - a.quantity)
            .slice(0, 5);

        return { summary, salesByDay, salesByCategory, topProducts };
    }, [filteredTransactions, productMap]);
    
    const handleConfirmZReport = (report: DailyReport) => {
        dispatch(addDailyReport(report));
        setIsZReportModalOpen(false);
        dispatch(addNotification({ type: 'success', message: `Day closed successfully. Report ID: ${report.id}` }));
    };

    // Chart refs
    const salesChartRef = useRef<HTMLCanvasElement>(null);
    const categoryChartRef = useRef<HTMLCanvasElement>(null);
    const topProductsChartRef = useRef<HTMLCanvasElement>(null);
    const salesChartInstance = useRef<Chart | null>(null);
    const categoryChartInstance = useRef<Chart | null>(null);
    const topProductsChartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        const textMuted = getThemeColor('text-muted');
        const borderSubtle = getThemeColor('border-subtle');
        const primaryColor = getThemeColor('primary');

        // Destroy previous charts
        if (salesChartInstance.current) salesChartInstance.current.destroy();
        if (categoryChartInstance.current) categoryChartInstance.current.destroy();
        if (topProductsChartInstance.current) topProductsChartInstance.current.destroy();

        // Sales Over Time Chart
        if (salesChartRef.current && reportData.salesByDay.size > 0) {
            const sortedSales = Array.from(reportData.salesByDay.entries()).sort((a,b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
            salesChartInstance.current = new Chart(salesChartRef.current, {
                type: 'line',
                data: {
                    labels: sortedSales.map(d => d[0]),
                    datasets: [{
                        label: 'Sales (MVR)',
                        data: sortedSales.map(d => d[1]),
                        borderColor: primaryColor,
                        backgroundColor: `rgba(var(--color-primary), 0.1)`,
                        fill: true,
                        tension: 0.1,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { type: 'time', time: { unit: 'day' }, grid: { color: borderSubtle }, ticks: { color: textMuted } },
                        y: { beginAtZero: true, grid: { color: borderSubtle }, ticks: { color: textMuted } }
                    }
                }
            });
        }
        
        // Sales by Category Chart
        if (categoryChartRef.current && reportData.salesByCategory.size > 0) {
            categoryChartInstance.current = new Chart(categoryChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: Array.from(reportData.salesByCategory.keys()),
                    datasets: [{
                        data: Array.from(reportData.salesByCategory.values()),
                        backgroundColor: ['rgba(var(--color-primary), 0.7)', 'rgba(var(--color-primary), 0.5)', 'rgba(var(--color-primary), 0.3)'],
                        borderColor: getThemeColor('bg-card'),
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textMuted }}}}
            });
        }
        
        // Top Products Chart
        if (topProductsChartRef.current && reportData.topProducts.length > 0) {
            topProductsChartInstance.current = new Chart(topProductsChartRef.current, {
                type: 'bar',
                data: {
                    labels: reportData.topProducts.map(p => p.name),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: reportData.topProducts.map(p => p.quantity),
                        backgroundColor: `rgba(var(--color-primary), 0.7)`,
                        borderColor: primaryColor,
                        borderWidth: 1
                    }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { x: { grid: { color: borderSubtle }, ticks: { color: textMuted }}, y: { grid: { display: false }, ticks: { color: textMuted }}}}
            });
        }

        return () => {
            if (salesChartInstance.current) salesChartInstance.current.destroy();
            if (categoryChartInstance.current) categoryChartInstance.current.destroy();
            if (topProductsChartInstance.current) topProductsChartInstance.current.destroy();
        }
    }, [reportData, theme]);


    const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
        <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg shadow"><h4 className="text-sm text-[rgb(var(--color-text-muted))]">{title}</h4><p className="text-2xl font-bold mt-1">{value}</p></div>
    );

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="relative"><label className="block text-sm mb-1">Start Date</label><button onClick={() => setIsStartDatePickerOpen(p => !p)} className="w-full p-2 h-[42px] text-left border rounded-md">{startDate ? new Date(startDate+'T00:00:00').toLocaleDateString() : 'Select...'}</button>{isStartDatePickerOpen && <CalendarDropdown selectedDate={startDate} onDateSelect={setStartDate} onClose={() => setIsStartDatePickerOpen(false)} />}</div>
                    <div className="relative"><label className="block text-sm mb-1">End Date</label><button onClick={() => setIsEndDatePickerOpen(p => !p)} className="w-full p-2 h-[42px] text-left border rounded-md">{endDate ? new Date(endDate+'T00:00:00').toLocaleDateString() : 'Select...'}</button>{isEndDatePickerOpen && <CalendarDropdown selectedDate={endDate} onDateSelect={setEndDate} onClose={() => setIsEndDatePickerOpen(false)} />}</div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`MVR ${reportData.summary.totalRevenue.toFixed(2)}`} />
                <StatCard title="Gross Profit" value={`MVR ${reportData.summary.totalProfit.toFixed(2)}`} />
                <StatCard title="Total Items Sold" value={reportData.summary.totalItemsSold} />
                <StatCard title="Transactions" value={reportData.summary.transactionCount} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
                    <div className="h-80"><canvas ref={salesChartRef}></canvas></div>
                </div>
                 <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                    <div className="h-80"><canvas ref={categoryChartRef}></canvas></div>
                </div>
            </div>
            <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                <div className="h-96"><canvas ref={topProductsChartRef}></canvas></div>
            </div>
        </div>
        {isZReportModalOpen && <ZReportModal isOpen={isZReportModalOpen} onClose={() => setIsZReportModalOpen(false)} onConfirm={handleConfirmZReport} transactions={todaysTransactions} productMap={productMap} />}
        </>
    );
};