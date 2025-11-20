
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, MonthlyStatement, InventoryEvent, Customer } from '../types';
import { InvoiceModal, InvoiceDocument, SummaryInvoiceModal } from './InvoiceModal';
import { CalendarDropdown } from './CalendarDropdown';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateTransaction } from '../store/slices/transactionsSlice';
import { updateProducts } from '../store/slices/productsSlice';
import { addInventoryEvents } from '../store/slices/inventoryHistorySlice';
import { updateCustomers } from '../store/slices/customersSlice';
import { createGiftCard } from '../store/slices/giftCardSlice';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectAllMonthlyStatements, updateMonthlyStatement } from '../store/slices/monthlyStatementsSlice';
import { MonthlyStatementModal } from './MonthlyStatementModal';
import { selectCompanyLogo } from '../store/slices/appSlice';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

type ViewTab = 'invoices' | 'statements';

const InvoicesList: React.FC = () => {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(state => state.transactions.items);
    const products = useAppSelector(state => state.products.items);
    const customers = useAppSelector(state => state.customers.items);
    const loyaltySettings = useAppSelector(state => state.loyalty.loyaltySettings);
    const companyLogo = useAppSelector(selectCompanyLogo);

    const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
    const [pdfInvoice, setPdfInvoice] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'Out for Delivery' | 'Delivered'>('all');
    const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
    const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
    
    // Multi-select and Summary Modal state
    const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

    const filteredTransactions = useMemo(() => {
        return [...transactions].filter(tx => {
          const transactionDate = new Date(tx.date);
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = searchTerm ? tx.customer.name.toLowerCase().includes(searchLower) || tx.id.toLowerCase().includes(searchLower) : true;
          const matchesStartDate = startDate ? transactionDate >= new Date(startDate) : true;
          const matchesEndDate = endDate ? transactionDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999)) : true;
          const matchesPaymentStatus = paymentStatusFilter === 'all' ? true : tx.paymentStatus === paymentStatusFilter;
          const matchesOrderStatus = orderStatusFilter === 'all' ? true : tx.orderStatus === orderStatusFilter;
          return matchesSearch && matchesStartDate && matchesEndDate && matchesPaymentStatus && matchesOrderStatus;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }, [transactions, searchTerm, startDate, endDate, paymentStatusFilter, orderStatusFilter]);
      
      useEffect(() => {
        if (pdfInvoice) {
            const generatePdf = async () => {
                // Small delay to allow DOM to render the hidden invoice
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const { jsPDF } = window.jspdf;
                const sourceElement = document.getElementById('hidden-invoice-render');
                
                if (sourceElement && window.html2canvas && jsPDF) {
                    try {
                        const canvas = await window.html2canvas(sourceElement, { scale: 2, useCORS: true });
                        const imgData = canvas.toDataURL('image/png');
                        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`Invoice-${pdfInvoice.id}.pdf`);
                        dispatch(addNotification({ type: 'success', message: `PDF generated for ${pdfInvoice.id}` }));
                    } catch (error) {
                        console.error("PDF Generation failed", error);
                        dispatch(addNotification({ type: 'error', message: 'Failed to generate PDF' }));
                    }
                }
                setPdfInvoice(null);
            };
            generatePdf();
        }
      }, [pdfInvoice, dispatch]);

      const handleUpdateTransaction = (updatedTx: Transaction) => {
        dispatch(updateTransaction(updatedTx));
        if (selectedInvoice && selectedInvoice.id === updatedTx.id) {
          setSelectedInvoice(updatedTx);
        }
      };
    
      const handleProcessReturn = async (transactionId: string, returnedItems: { itemId: number; quantity: number; reason: string }[], issueStoreCredit: boolean) => {
          let transactionToUpdate = transactions.find(t => t.id === transactionId);
          if (!transactionToUpdate) return;
          
          let updatedProducts = [...products];
          let updatedCustomers = [...customers];
          const newHistoryEvents: InventoryEvent[] = [];
          let totalReturnValue = 0;
    
          returnedItems.forEach(returnedItem => {
              const productIndex = updatedProducts.findIndex(p => p.id === returnedItem.itemId);
              if (productIndex > -1) {
                  const product = updatedProducts[productIndex];
                  updatedProducts[productIndex] = { ...product, stock: product.stock + returnedItem.quantity };
                  
                  newHistoryEvents.push({ id: `evt-return-${Date.now()}-${returnedItem.itemId}`, productId: returnedItem.itemId, type: 'return', quantityChange: returnedItem.quantity, date: new Date().toISOString(), relatedId: transactionId, notes: `Return from ${transactionToUpdate!.customer.name}` });
                  
                  const originalItem = transactionToUpdate!.items.find(i => i.id === returnedItem.itemId);
                  if (originalItem) {
                    totalReturnValue += originalItem.price * returnedItem.quantity;
                  }
              }
          });
          
          if (loyaltySettings.enabled && loyaltySettings.pointsPerMvr > 0 && totalReturnValue > 0) {
              const pointsToDeduct = Math.floor(totalReturnValue * loyaltySettings.pointsPerMvr);
              const customerIndex = updatedCustomers.findIndex(c => c.id === transactionToUpdate!.customerId);
              if (customerIndex > -1) {
                  const customer = updatedCustomers[customerIndex];
                  updatedCustomers[customerIndex] = { 
                      ...customer,
                      loyaltyPoints: Math.max(0, (customer.loyaltyPoints || 0) - pointsToDeduct)
                  };
              }
          }
    
          if (issueStoreCredit && totalReturnValue > 0) {
              const newCard = await dispatch(createGiftCard({ initialBalance: totalReturnValue, customerId: transactionToUpdate.customerId })).unwrap();
              dispatch(addNotification({ type: 'success', message: `Store credit issued on new Gift Card: ${newCard.id}`}));
              
              const customerIndex = updatedCustomers.findIndex(c => c.id === transactionToUpdate!.customerId);
              if (customerIndex > -1) {
                  const customer = updatedCustomers[customerIndex];
                  const newNotification = `You have received MVR ${totalReturnValue.toFixed(2)} in store credit. Your Gift Card code is: ${newCard.id}`;
                  const updatedNotifications = [...(customer.notifications || []), newNotification];
                  updatedCustomers[customerIndex] = {
                      ...customer,
                      notifications: updatedNotifications
                  };
              }
          }
          
          const newSubtotal = transactionToUpdate.subtotal - totalReturnValue;
          let newDiscountAmount = transactionToUpdate.discountAmount;
          const newTotal = Math.max(0, newSubtotal - (newDiscountAmount || 0));
    
          const updatedTransaction: Transaction = {
              ...transactionToUpdate,
              returns: [...(transactionToUpdate.returns || []), { date: new Date().toISOString(), items: returnedItems }],
              subtotal: newSubtotal,
              discountAmount: newDiscountAmount,
              total: newTotal
          };
          
          dispatch(updateProducts(updatedProducts));
          dispatch(updateCustomers(updatedCustomers));
          dispatch(addInventoryEvents(newHistoryEvents));
          handleUpdateTransaction(updatedTransaction);
      };

    // Selection Logic
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedTransactionIds(filteredTransactions.map(t => t.id));
        } else {
            setSelectedTransactionIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedTransactionIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };
    
    const isAllSelected = filteredTransactions.length > 0 && selectedTransactionIds.length === filteredTransactions.length;

    const handleGenerateSummary = () => {
        if (selectedTransactionIds.length === 0) return;
        setIsSummaryModalOpen(true);
    };

    const selectedTransactionsData = useMemo(() => {
        return transactions.filter(t => selectedTransactionIds.includes(t.id));
    }, [transactions, selectedTransactionIds]);

    return (
        <>
        <div className="p-4 mb-6 bg-[rgb(var(--color-bg-subtle))] rounded-lg border border-[rgb(var(--color-border-subtle))]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2 lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Search</label>
                <input type="text" id="search" placeholder="Customer or Invoice ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"/>
            </div>
            <div className="relative">
                <label htmlFor="start-date" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Start Date</label>
                <button id="start-date" onClick={() => { setIsStartDatePickerOpen(!isStartDatePickerOpen); setIsEndDatePickerOpen(false); }} className="w-full p-2 h-[42px] text-left border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]">{startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString() : <span className="text-[rgb(var(--color-text-muted))]">Select...</span>}</button>
                {isStartDatePickerOpen && <CalendarDropdown selectedDate={startDate} onDateSelect={setStartDate} onClose={() => setIsStartDatePickerOpen(false)} />}
            </div>
            <div className="relative">
                <label htmlFor="end-date" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">End Date</label>
                <button id="end-date" onClick={() => { setIsEndDatePickerOpen(!isEndDatePickerOpen); setIsStartDatePickerOpen(false); }} className="w-full p-2 h-[42px] text-left border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]">{endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString() : <span className="text-[rgb(var(--color-text-muted))]">Select...</span>}</button>
                {isEndDatePickerOpen && <CalendarDropdown selectedDate={endDate} onDateSelect={setEndDate} onClose={() => setIsEndDatePickerOpen(false)} />}
            </div>
            <div>
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Payment</label>
                <select id="paymentStatus" value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value as any)} className="w-full p-2 h-[42px] border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"><option value="all">All</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select>
            </div>
            <div>
                <label htmlFor="orderStatus" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Order Status</label>
                <select id="orderStatus" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as any)} className="w-full p-2 h-[42px] border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"><option value="all">All</option><option value="Pending">Pending</option><option value="Out for Delivery">Out for Delivery</option><option value="Delivered">Delivered</option></select>
            </div>
            <button onClick={() => { setSearchTerm(''); setStartDate(''); setEndDate(''); setPaymentStatusFilter('all'); setOrderStatusFilter('all'); }} className="bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-muted))] px-4 py-2 rounded-md hover:bg-[rgb(var(--color-border))] transition h-[42px]">Clear</button>
            </div>
        </div>

        {selectedTransactionIds.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 flex justify-between items-center">
                <div className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                    {selectedTransactionIds.length} invoices selected
                </div>
                <button onClick={handleGenerateSummary} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                    Generate Summary Invoice
                </button>
            </div>
        )}

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
            <thead className="bg-[rgb(var(--color-bg-subtle))]">
                <tr>
                <th className="px-3 py-3 w-10">
                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="rounded border-[rgb(var(--color-border))] text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Order Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[rgb(var(--color-bg-subtle))]">
                    <td className="px-3 py-4">
                        <input type="checkbox" checked={selectedTransactionIds.includes(tx.id)} onChange={() => handleSelectOne(tx.id)} className="rounded border-[rgb(var(--color-border))] text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[rgb(var(--color-text-base))]">{tx.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{tx.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-muted))]">{new Date(tx.date).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    tx.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : tx.orderStatus === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{tx.orderStatus}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>{tx.paymentStatus}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[rgb(var(--color-text-base))] font-semibold">MVR {tx.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => setPdfInvoice(tx)} disabled={pdfInvoice !== null} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]">
                            {pdfInvoice?.id === tx.id ? '...' : 'PDF'}
                        </button>
                        <button onClick={() => setSelectedInvoice(tx)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">View</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {/* Hidden Render Area for PDF Generation */}
        {pdfInvoice && (
            <div id="hidden-invoice-render" style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '794px' }} className="bg-white text-gray-800 font-sans p-10 pdf-render">
                <InvoiceDocument invoice={pdfInvoice} companyLogo={companyLogo} />
            </div>
        )}

        {selectedInvoice && (
            <InvoiceModal 
            invoice={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)} 
            onUpdateTransaction={handleUpdateTransaction}
            onProcessReturn={handleProcessReturn}
            />
        )}

        {isSummaryModalOpen && (
            <SummaryInvoiceModal 
                isOpen={isSummaryModalOpen} 
                onClose={() => setIsSummaryModalOpen(false)} 
                transactions={selectedTransactionsData} 
            />
        )}
        </>
    )
}

const MonthlyStatementsList: React.FC = () => {
    const allStatements = useAppSelector(selectAllMonthlyStatements);
    const [viewingStatement, setViewingStatement] = useState<MonthlyStatement | null>(null);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))]">
                    <thead className="bg-[rgb(var(--color-bg-subtle))]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Statement ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Billing Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Total Due</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                        {[...allStatements].sort((a,b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()).map(statement => (
                            <tr key={statement.id} className="hover:bg-[rgb(var(--color-bg-subtle))]">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{statement.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{statement.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(statement.billingPeriodStart).toLocaleDateString()} - {new Date(statement.billingPeriodEnd).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statement.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {statement.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">MVR {statement.totalDue.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setViewingStatement(statement)} className="text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))]">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {viewingStatement && <MonthlyStatementModal statement={viewingStatement} onClose={() => setViewingStatement(null)} />}
        </>
    );
}

export const InvoicesView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ViewTab>('invoices');

    const TabButton: React.FC<{ tab: ViewTab, label: string }> = ({ tab, label }) => (
        <button
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]' : 'border-transparent text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))]'}`}
        >
          {label}
        </button>
    );

    return (
        <div className="bg-[rgb(var(--color-bg-card))] p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Invoices & Statements</h2>
            </div>
            <div className="flex border-b border-[rgb(var(--color-border-subtle))] mb-6">
                <TabButton tab="invoices" label="Individual Invoices" />
                <TabButton tab="statements" label="Monthly Statements" />
            </div>
            
            {activeTab === 'invoices' && <InvoicesList />}
            {activeTab === 'statements' && <MonthlyStatementsList />}
        </div>
    );
};
