import React from 'react';
import { MonthlyStatement } from '../types';

interface PDFContentProps {
    statement: MonthlyStatement;
    companyLogo: string | null;
}

export const MonthlyStatementPDFContent: React.FC<PDFContentProps> = ({ statement, companyLogo }) => {
    return (
        <div id={`pdf-render-area-${statement.id}`} className="p-10 pdf-render bg-white text-gray-800 font-sans">
            <header className="flex justify-between items-start pb-6">
                <div>
                    {companyLogo ? (
                        <img src={companyLogo} alt="Company Logo" className="max-h-16 mb-4" />
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fridge MV</h2>
                    )}
                    <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">Statement</h1>
                    <p className="text-gray-500 mt-2">ID: {statement.id}</p>
                    <p className="text-gray-500">Issued: {new Date(statement.generatedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-end items-baseline">
                            <dt className="font-semibold text-cyan-600 w-20">Statement To</dt>
                            <dd className="text-gray-800 font-medium">{statement.customerName}</dd>
                        </div>
                         <div className="flex justify-end items-baseline">
                            <dt className="font-semibold text-cyan-600 w-20">Billing Period</dt>
                            <dd className="text-gray-500">{new Date(statement.billingPeriodStart).toLocaleDateString()} - {new Date(statement.billingPeriodEnd).toLocaleDateString()}</dd>
                        </div>
                         <div className="flex justify-end items-baseline">
                            <dt className="font-semibold text-cyan-600 w-20">Due Date</dt>
                            <dd className="text-gray-800 font-medium">{new Date(statement.dueDate).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                </div>
            </header>

            <section className="mt-8">
                <h3 className="text-xl font-bold mb-3">Itemized Transactions</h3>
                 <div className="w-full flex rounded-t-lg overflow-hidden text-sm font-semibold uppercase tracking-wider text-white">
                    <div className="w-full bg-slate-800 p-3 flex">
                        <span className="w-1/4">Date</span>
                        <span className="w-1/4">Transaction ID</span>
                        <span className="w-2/4 text-right">Amount</span>
                    </div>
                </div>
                 <div className="text-sm border-l border-r border-b border-gray-200 rounded-b-lg">
                    {statement.transactions.map((tx, index) => (
                        <div key={tx.id} className={`flex items-center border-b border-gray-200 last:border-0 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <div className="w-full p-3 flex justify-between">
                                <span className="w-1/4 text-gray-600">{new Date(tx.date).toLocaleDateString()}</span>
                                <span className="w-1/4 text-gray-600">{tx.id}</span>
                                <span className="w-2/4 text-right font-medium text-gray-800">MVR {tx.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                    <div className="flex justify-between font-bold text-xl text-blue-500 border-t-2 border-blue-500 pt-2 mt-2">
                        <span>Total Due</span>
                        <span>MVR {statement.totalDue.toFixed(2)}</span>
                    </div>
                </div>
            </section>

            <footer className="mt-10 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-bold mb-2">Payment Instructions</h4>
                <div className="text-sm bg-gray-100 p-4 rounded-lg">
                    <p className="mb-2">Please transfer the total amount due to the account below or pay in cash at our office counter.</p>
                    <div className="font-mono text-xs space-y-1">
                        <p><strong>Account Name:</strong> Ahmed Afrah</p>
                        <p><strong>Account Number:</strong> MVR 7730000599889</p>
                        <p><strong>Bank Name:</strong> BANK OF MALDIVES PLC</p>
                        <p><strong>Viber/Telegram:</strong> 7322277</p>
                        <p className="mt-2"><strong>Payment Reference:</strong> Please include your Name or Statement ID ({statement.id}) in the transaction details.</p>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-6">Thank you for your business!</p>
            </footer>
        </div>
    );
};