import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ReturnItemsModal } from './ReturnItemsModal';
import { PaymentDetailsModal } from './PaymentDetailsModal';
import { useAppSelector } from '../store/hooks';
import { selectCompanyLogo } from '../store/slices/appSlice';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface InvoiceModalProps {
  invoice: Transaction;
  onClose: () => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onProcessReturn: (transactionId: string, returnedItems: { itemId: number; quantity: number; reason: string }[], issueStoreCredit: boolean) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose, onUpdateTransaction, onProcessReturn }) => {
  const companyLogo = useAppSelector(selectCompanyLogo);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'transfer' | null>(null);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating'>('idle');

  const canReturnItems = useMemo(() => {
    if (!invoice.items || invoice.items.length === 0) return false;
    const returnedQuantities: { [itemId: number]: number } = {};
    invoice.returns?.forEach(r => r.items.forEach(i => {
        returnedQuantities[i.itemId] = (returnedQuantities[i.itemId] || 0) + i.quantity;
    }));
    return invoice.items.some(item => (returnedQuantities[item.id] || 0) < item.quantity);
  }, [invoice]);
  
  const handleDownloadPdf = async () => {
    setPdfStatus('generating');
    const { jsPDF } = window.jspdf;
    const sourceElement = document.getElementById('printable-area');
    if (!sourceElement) { setPdfStatus('idle'); return; }

    const canvas = await window.html2canvas(sourceElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${invoice.id}.pdf`);
    setPdfStatus('idle');
  };
  
  const handleProcessReturnFromModal = (
    returnedItems: { itemId: number; quantity: number; reason: string }[],
    issueStoreCredit: boolean
  ) => {
    onProcessReturn(invoice.id, returnedItems, issueStoreCredit);
  };
  
  const handleOrderStatusChange = (newStatus: Transaction['orderStatus']) => {
    onUpdateTransaction({ ...invoice, orderStatus: newStatus });
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
        <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Invoice Details</h3>
            <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl">&times;</button>
          </div>
          
          <div className="overflow-y-auto">
            <div id="printable-area" className="bg-white text-gray-800 font-sans p-10 pdf-render">
                {/* Header */}
                <header className="flex justify-between items-start pb-6">
                    <div>
                        {companyLogo ? (
                          <img src={companyLogo} alt="Company Logo" className="max-h-16 mb-4" />
                        ) : (
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fridge MV</h2>
                        )}
                        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">Invoice</h1>
                        <p className="text-gray-500 mt-2">Invoice # {invoice.id}</p>
                        <p className="text-gray-500">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <dl className="space-y-1 text-sm">
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Invoice To</dt>
                                <dd className="text-gray-800 font-medium">{invoice.customer.name}</dd>
                            </div>
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Address</dt>
                                <dd className="text-gray-500">{invoice.customer.address || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Email</dt>
                                <dd className="text-gray-500">{invoice.customer.email || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Phone</dt>
                                <dd className="text-gray-500">{invoice.customer.phone || 'N/A'}</dd>
                            </div>
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Id</dt>
                                <dd className="text-gray-500">{invoice.customer.redboxId || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>
                </header>

                {/* Items Table */}
                <section className="mt-8">
                    <div className="w-full flex rounded-t-lg overflow-hidden text-sm font-semibold uppercase tracking-wider text-white">
                        <div className="w-8/12 bg-slate-800 p-3 flex">
                            <span className="w-10">SL.</span>
                            <span>Item Description</span>
                        </div>
                        <div className="w-4/12 bg-blue-500 p-3 flex justify-between rounded-tr-lg">
                            <span className="flex-1 text-right">Price</span>
                            <span className="flex-1 text-right">Quantity</span>
                            <span className="flex-1 text-right">Total</span>
                        </div>
                    </div>
                    <div className="text-sm border-l border-r border-b border-gray-200 rounded-b-lg">
                        {invoice.items.map((item, index) => (
                            <div key={item.id} className={`flex items-start border-b border-gray-200 last:border-0 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <div className="w-8/12 p-3 flex">
                                    <span className="w-10 text-gray-500">{index + 1}.</span>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-500">Standard product description.</p>
                                    </div>
                                </div>
                                <div className="w-4/12 p-3 flex justify-between items-start">
                                    <span className="flex-1 text-right text-gray-600">MVR {item.price.toFixed(2)}</span>
                                    <span className="flex-1 text-right text-gray-600">{item.quantity}</span>
                                    <span className="flex-1 text-right font-medium text-gray-800">MVR {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <section className="mt-8 flex justify-between items-end">
                    <div className="text-sm text-gray-600">
                        <h5 className="font-bold text-gray-800 mb-2">Terms & Conditions/Notes:</h5>
                        <p>All sales are final. Returns are subject to terms.</p>
                        <p className="font-bold text-gray-800 mt-4">THANK YOU FOR YOUR BUSINESS</p>
                        
                        {invoice.paymentStatus === 'paid' && invoice.paymentMethod &&
                            <div className="mt-6">
                                <h5 className="font-bold text-cyan-600 mb-1">Payment Method</h5>
                                <p className="capitalize">{invoice.paymentMethod.replace('_', ' ')}</p>
                            </div>
                        }
                    </div>

                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>MVR {invoice.subtotal.toFixed(2)}</span></div>
                        {invoice.discountAmount > 0 && <div className="flex justify-between text-gray-600"><span>Discount ({invoice.promotionCode || 'Manual'})</span><span>- MVR {invoice.discountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between text-gray-600"><span>Taxes</span><span>0.00%</span></div>
                        <div className="flex justify-between font-bold text-xl text-blue-500 border-t-2 border-blue-500 pt-2 mt-2">
                            <span>Total</span>
                            <span>MVR {invoice.total.toFixed(2)}</span>
                        </div>
                        
                        <div className="mt-20 text-center">
                            <p className="text-gray-800">_________________________</p>
                            <p className="text-gray-500 mt-1">Company signature</p>
                        </div>
                    </div>
                </section>

                {/* Bottom contact bar */}
                <footer className="mt-16 pt-6 border-t-2 border-gray-200 text-xs text-gray-500 flex justify-around">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                        <span>7322277</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                        <span>zahuwaan@redbox.mv</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        <span>G. Vaffushi, Malé</span>
                    </div>
                </footer>
            </div>
          </div>


          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex flex-wrap gap-2 justify-end items-center">
             <div className="mr-auto">
              <label htmlFor="orderStatus" className="text-sm font-medium mr-2">Order Status:</label>
              <select id="orderStatus" value={invoice.orderStatus} onChange={e => handleOrderStatusChange(e.target.value as Transaction['orderStatus'])} className="p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]">
                <option value="Pending">Pending</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            <button onClick={handleDownloadPdf} disabled={pdfStatus === 'generating'} className="px-4 py-2 bg-[rgb(var(--color-bg-subtle))] rounded-md disabled:opacity-50">{pdfStatus === 'generating' ? '...' : 'PDF'}</button>
            {canReturnItems && <button onClick={() => setIsReturnModalOpen(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-md">Return Items</button>}
            {invoice.paymentStatus === 'unpaid' && (
              <>
                <button onClick={() => { setSelectedPaymentMethod('cash'); setIsPaymentModalOpen(true); }} className="px-4 py-2 bg-green-600 text-white rounded-md">Paid (Cash)</button>
                <button onClick={() => { setSelectedPaymentMethod('transfer'); setIsPaymentModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md">Paid (Transfer)</button>
              </>
            )}
          </div>
        </div>
      </div>
       {isReturnModalOpen && <ReturnItemsModal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} transaction={invoice} onProcessReturn={handleProcessReturnFromModal}/>}
       {isPaymentModalOpen && selectedPaymentMethod && <PaymentDetailsModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} transaction={invoice} paymentMethod={selectedPaymentMethod} onUpdateTransaction={onUpdateTransaction} />}
    </>
  );
};