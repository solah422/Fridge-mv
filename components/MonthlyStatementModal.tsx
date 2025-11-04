import React, { useState, useEffect } from 'react';
import { MonthlyStatement, Customer } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateMonthlyStatement, selectAllMonthlyStatements } from '../store/slices/monthlyStatementsSlice';
import { MonthlyStatementPDFContent } from './MonthlyStatementPDFContent';
import { selectUser } from '../store/slices/authSlice';
import { selectAllCustomers, updateCustomers } from '../store/slices/customersSlice';
import { selectCreditSettings, selectCompanyLogo } from '../store/slices/appSlice';
import { addNotification } from '../store/slices/notificationsSlice';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface MonthlyStatementModalProps {
  statement: MonthlyStatement;
  onClose: () => void;
}

export const MonthlyStatementModal: React.FC<MonthlyStatementModalProps> = ({ statement, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const customers = useAppSelector(selectAllCustomers);
  const allStatements = useAppSelector(selectAllMonthlyStatements);
  const { creditLimitIncreaseCap } = useAppSelector(selectCreditSettings);
  const companyLogo = useAppSelector(selectCompanyLogo);

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(statement.pdfDataUrl);

  useEffect(() => {
    if (!pdfUrl) {
      generateAndSavePdf();
    }
  }, [pdfUrl]);

  const generateAndSavePdf = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const { jsPDF } = window.jspdf;
    const sourceElement = document.getElementById(`pdf-render-area-${statement.id}`);
    if (!sourceElement) {
        console.error("PDF source element not found!");
        setIsGenerating(false);
        return;
    }

    const canvas = await window.html2canvas(sourceElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const dataUrl = pdf.output('datauristring');
    setPdfUrl(dataUrl);

    dispatch(updateMonthlyStatement({ ...statement, pdfDataUrl: dataUrl }));
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Monthly-Statement-${statement.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleMarkAsPaid = async () => {
      const updatedStatement = { ...statement, status: 'paid' as const, paymentDate: new Date().toISOString() };
      await dispatch(updateMonthlyStatement(updatedStatement));

      const customer = customers.find(c => c.id === statement.customerId);
      if (!customer) return;

      let customerUpdate: Partial<Customer> = {};
      let needsUpdate = false;

      // 1. Credit Limit Increase Logic
      const paidStatements = allStatements
        .filter(s => s.customerId === customer.id && s.status === 'paid')
        .sort((a,b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime());
      
      if (paidStatements.length >= 3) {
        const lastThreePaidOnTime = paidStatements.slice(0, 3).every(s => s.paymentDate && new Date(s.paymentDate) <= new Date(s.dueDate));
        if (lastThreePaidOnTime) {
            const currentLimit = customer.maximumCreditLimit || 500;
            const newLimit = Math.min(currentLimit * 1.1, creditLimitIncreaseCap);
            if (newLimit > currentLimit) {
                customerUpdate.maximumCreditLimit = parseFloat(newLimit.toFixed(2));
                needsUpdate = true;
                dispatch(addNotification({ type: 'success', message: `${customer.name}'s credit limit increased to MVR ${newLimit.toFixed(2)}.`}));
            }
        }
      }

      // 2. Unblocking Logic
      const otherOverdueStatements = allStatements.some(s => 
        s.customerId === customer.id && 
        s.id !== statement.id && // Exclude the one we just paid
        s.overdueStatus === '7_days_overdue' &&
        s.status === 'due'
      );
      
      if (customer.creditBlocked && !otherOverdueStatements) {
          customerUpdate.creditBlocked = false;
          needsUpdate = true;
          dispatch(addNotification({ type: 'info', message: `${customer.name}'s credit block has been removed.`}));
      }
      
      // Dispatch customer update if anything changed
      if (needsUpdate) {
        const updatedCustomers = customers.map(c => c.id === customer.id ? { ...c, ...customerUpdate } : c);
        dispatch(updateCustomers(updatedCustomers));
      }

      onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
        <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Monthly Statement</h3>
            <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl">&times;</button>
          </div>
          
          <div className="p-8 overflow-y-auto">
            {isGenerating && (
                <div className="text-center py-10">
                    <p>Generating statement PDF...</p>
                </div>
            )}
            {!isGenerating && (
                <div>
                    <header className="flex justify-between items-start pb-6">
                        <div>
                            {companyLogo ? (
                              <img src={companyLogo} alt="Company Logo" className="max-h-16 mb-4" />
                            ) : (
                              <h2 className="text-2xl font-bold text-gray-800 mb-4">Fridge MV</h2>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider">Statement</h1>
                            <p className="text-gray-500 mt-2">For: {statement.customerName}</p>
                            <p className="text-gray-500">
                                Period: {new Date(statement.billingPeriodStart).toLocaleDateString()} - {new Date(statement.billingPeriodEnd).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="text-gray-500">Total Due</p>
                            <p className="font-bold text-4xl text-blue-500">MVR {statement.totalDue.toFixed(2)}</p>
                            <p className="text-sm text-gray-600 mt-1">Due by: <span className="font-semibold">{new Date(statement.dueDate).toLocaleDateString()}</span></p>
                        </div>
                    </header>
                     <div className="mt-6 p-4 bg-slate-800 text-white rounded-lg">
                        <h5 className="font-bold text-lg">Payment Instructions</h5>
                        <p className="text-sm text-slate-300 mt-1">Please transfer to the account below or pay in cash at our counter.</p>
                        <div className="mt-3 text-xs space-y-1 font-mono bg-black/20 p-3 rounded">
                            <p><strong className="text-slate-300">Account Name:</strong> Ahmed Afrah</p>
                            <p><strong className="text-slate-300">Account Number:</strong> MVR 7730000599889</p>
                            <p><strong className="text-slate-300">Bank Name:</strong> BANK OF MALDIVES PLC</p>
                            <p className="mt-2"><strong className="text-slate-300">Reference:</strong> {statement.customerName} or {statement.id}</p>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-between items-center">
             <div>
                {user?.role === 'admin' && statement.status === 'due' && (
                    <button onClick={handleMarkAsPaid} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold">
                        Mark as Paid
                    </button>
                )}
             </div>
             <div className="flex gap-2 justify-end">
                <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Close</button>
                <button onClick={handleDownload} disabled={!pdfUrl || isGenerating} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md disabled:opacity-50">
                    {isGenerating ? '...' : 'Download PDF'}
                </button>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden render area for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
          <MonthlyStatementPDFContent statement={statement} companyLogo={companyLogo} />
      </div>
    </>
  );
};
