import React, { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectAllMonthlyStatements } from '../store/slices/monthlyStatementsSlice';
import { MonthlyStatement } from '../types';

interface AgedReceivables {
    current: number;
    '1-30': number;
    '31-60': number;
    '61+': number;
}

export const FinanceReportsView: React.FC = () => {
    const allStatements = useAppSelector(selectAllMonthlyStatements);

    const { totalOutstanding, agedReceivables, customerBreakdown } = useMemo(() => {
        const dueStatements = allStatements.filter(s => s.status === 'due');
        const total = dueStatements.reduce((sum, s) => sum + s.totalDue, 0);
        
        const aged: AgedReceivables = { current: 0, '1-30': 0, '31-60': 0, '61+': 0 };
        const breakdown: ({ statement: MonthlyStatement; daysOverdue: number })[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        dueStatements.forEach(s => {
            const dueDate = new Date(s.dueDate);
            const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
            
            breakdown.push({ statement: s, daysOverdue });

            if (daysOverdue <= 0) {
                aged.current += s.totalDue;
            } else if (daysOverdue <= 30) {
                aged['1-30'] += s.totalDue;
            } else if (daysOverdue <= 60) {
                aged['31-60'] += s.totalDue;
            } else {
                aged['61+'] += s.totalDue;
            }
        });

        return { totalOutstanding: total, agedReceivables: aged, customerBreakdown: breakdown.sort((a,b) => b.daysOverdue - a.daysOverdue) };
    }, [allStatements]);

    const StatCard: React.FC<{ title: string, value: string, color?: string }> = ({ title, value, color = 'text-[rgb(var(--color-primary))]' }) => (
        <div className="bg-[rgb(var(--color-bg-subtle))] p-4 rounded-lg">
            <h4 className="text-sm text-[rgb(var(--color-text-muted))]">{title}</h4>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md space-y-6">
            <h2 className="text-2xl font-bold">Financial Reports</h2>
            
            <section>
                <h3 className="text-lg font-semibold mb-3">Accounts Receivable Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-1">
                        <StatCard title="Total Outstanding" value={`MVR ${totalOutstanding.toFixed(2)}`} />
                    </div>
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard title="Current" value={`MVR ${agedReceivables.current.toFixed(2)}`} color="text-green-600" />
                        <StatCard title="1-30 Days Overdue" value={`MVR ${agedReceivables['1-30'].toFixed(2)}`} color="text-yellow-600" />
                        <StatCard title="31-60 Days Overdue" value={`MVR ${agedReceivables['31-60'].toFixed(2)}`} color="text-orange-500" />
                        <StatCard title="61+ Days Overdue" value={`MVR ${agedReceivables['61+'].toFixed(2)}`} color="text-red-600" />
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold mb-3">Aged Receivables Breakdown</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                        <thead className="bg-[rgb(var(--color-bg-subtle))] sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs uppercase">Customer</th>
                                <th className="px-4 py-2 text-left text-xs uppercase">Statement ID</th>
                                <th className="px-4 py-2 text-left text-xs uppercase">Amount Due</th>
                                <th className="px-4 py-2 text-left text-xs uppercase">Days Overdue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerBreakdown.map(({ statement, daysOverdue }) => (
                                <tr key={statement.id}>
                                    <td className="px-4 py-3">{statement.customerName}</td>
                                    <td className="px-4 py-3 text-sm">{statement.id}</td>
                                    <td className="px-4 py-3 font-semibold">MVR {statement.totalDue.toFixed(2)}</td>
                                    <td className={`px-4 py-3 font-semibold ${daysOverdue > 60 ? 'text-red-600' : daysOverdue > 30 ? 'text-orange-500' : daysOverdue > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                                        {daysOverdue > 0 ? `${daysOverdue} days` : 'Current'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};
