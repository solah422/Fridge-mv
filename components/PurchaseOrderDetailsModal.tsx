import React, { useState } from 'react';
import { PurchaseOrder } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';
import { selectCompanyLogo } from '../store/slices/appSlice';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface PurchaseOrderDetailsModalProps {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onProcessOrder: (purchaseOrder: PurchaseOrder) => void;
}

export const PurchaseOrderDetailsModal: React.FC<PurchaseOrderDetailsModalProps> = ({ purchaseOrder, onClose, onProcessOrder }) => {
  const dispatch = useAppDispatch();
  const companyLogo = useAppSelector(selectCompanyLogo);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating'>('idle');

  const handlePrint = () => {
    const printableElement = document.getElementById('po-printable-area');
    if (!printableElement) {
      console.error('Printable area not found');
      return;
    }

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container-temp';
    printContainer.appendChild(printableElement.cloneNode(true));
    document.body.appendChild(printContainer);

    const afterPrint = () => {
      printContainer.remove();
      window.removeEventListener('afterprint', afterPrint);
    };

    window.addEventListener('afterprint', afterPrint);
    window.print();
  };
  
  const handleDownloadPdf = async () => {
    setPdfStatus('generating');
    
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;

    if (!jsPDF || !html2canvas) {
        dispatch(addNotification({ type: 'error', message: 'PDF generation library is not loaded. Please try again.' }));
        setPdfStatus('idle');
        return;
    }

    const sourceElement = document.getElementById('po-printable-area');
    if (!sourceElement) {
        setPdfStatus('idle');
        return;
    }

    const renderContainer = document.createElement('div');
    renderContainer.style.position = 'absolute';
    renderContainer.style.left = '-9999px';
    renderContainer.style.top = '0';
    renderContainer.style.width = '800px'; 
    
    const clonedContent = sourceElement.cloneNode(true) as HTMLElement;
    clonedContent.classList.add('pdf-render');
    
    renderContainer.appendChild(clonedContent);
    document.body.appendChild(renderContainer);

    try {
        const canvas = await html2canvas(renderContainer, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Purchase-Order-${purchaseOrder.id}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        document.body.removeChild(renderContainer);
        setPdfStatus('idle');
    }
  };

  return (
    <>
      <div id="po-modal-root" className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 print:static print:bg-transparent">
        <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col print:shadow-none print:rounded-none print:max-h-full">
          {/* Header */}
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center print:hidden">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Purchase Order Details</h3>
            <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto">
            <div id="po-printable-area" className="bg-white text-gray-800 font-sans p-10 pdf-render">
                <header className="flex justify-between items-start pb-6">
                    <div>
                        {companyLogo ? (
                          <img src={companyLogo} alt="Company Logo" className="max-h-16 mb-4" />
                        ) : (
                          <h2 className="text-2xl font-bold text-gray-800 mb-4">Fridge MV</h2>
                        )}
                        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wider">Purchase Order</h1>
                        <p className="text-gray-500 mt-2">PO # {purchaseOrder.id}</p>
                        <p className="text-gray-500">Date: {new Date(purchaseOrder.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <dl className="space-y-1 text-sm">
                            <div className="flex justify-end items-baseline">
                                <dt className="font-semibold text-cyan-600 w-16">Supplier</dt>
                                <dd className="text-gray-800 font-medium">{purchaseOrder.wholesalerName}</dd>
                            </div>
                        </dl>
                        <span className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                            purchaseOrder.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {purchaseOrder.status}
                        </span>
                    </div>
                </header>
                
                <section className="mt-8">
                     <div className="w-full flex rounded-t-lg overflow-hidden text-sm font-semibold uppercase tracking-wider text-white">
                        <div className="w-8/12 bg-slate-800 p-3 flex">
                            <span className="w-10">SL.</span>
                            <span>Item Description</span>
                        </div>
                        <div className="w-4/12 bg-blue-500 p-3 flex justify-between rounded-tr-lg">
                            <span className="flex-1 text-right">Unit Price</span>
                            <span className="flex-1 text-right">Quantity</span>
                            <span className="flex-1 text-right">Total</span>
                        </div>
                    </div>
                    <div className="text-sm border-l border-r border-b border-gray-200 rounded-b-lg">
                        {purchaseOrder.items.map((item, index) => (
                            <div key={item.productId} className={`flex items-start border-b border-gray-200 last:border-0 ${index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <div className="w-8/12 p-3 flex">
                                    <span className="w-10 text-gray-500">{index + 1}.</span>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                </div>
                                <div className="w-4/12 p-3 flex justify-between items-start">
                                    <span className="flex-1 text-right text-gray-600">MVR {item.purchasePrice.toFixed(2)}</span>
                                    <span className="flex-1 text-right text-gray-600">{item.quantity}</span>
                                    <span className="flex-1 text-right font-medium text-gray-800">MVR {(item.purchasePrice * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-8 flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between font-bold text-xl text-blue-500 border-t-2 border-blue-500 pt-2 mt-2">
                            <span>Total</span>
                            <span>MVR {purchaseOrder.total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>
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
          
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex flex-wrap gap-2 justify-end print:hidden">
            <button onClick={handlePrint} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Print</button>
            <button onClick={handleDownloadPdf} disabled={pdfStatus === 'generating'} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition disabled:opacity-50">
                {pdfStatus === 'generating' ? 'Generating...' : 'Download PDF'}
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Close</button>
            {purchaseOrder.status === 'pending' && (
                <button 
                    onClick={() => onProcessOrder(purchaseOrder)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold"
                >
                    Process & Add to Stock
                </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body > *:not(#print-container-temp) { display: none !important; }
          #print-container-temp { display: block !important; }
          #po-printable-area {
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
};