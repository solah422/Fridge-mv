import React, { useState } from 'react';
import { Transaction } from '../types';

interface PaymentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    paymentMethod: 'cash' | 'transfer';
    onUpdateTransaction: (transaction: Transaction) => void;
}

const today = new Date().toISOString().split('T')[0];

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({ isOpen, onClose, transaction, paymentMethod, onUpdateTransaction }) => {
    const [paymentDate, setPaymentDate] = useState(today);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setReceiptFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        let updatedTransaction: Transaction = {
            ...transaction,
            // FIX: Corrected property name from 'status' to 'paymentStatus' to match the Transaction type.
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
        };

        if (paymentMethod === 'cash') {
            updatedTransaction.paymentDate = new Date(paymentDate + 'T00:00:00').toISOString();
        }

        if (paymentMethod === 'transfer' && receiptPreview) {
            updatedTransaction.paymentReceiptUrl = receiptPreview;
        }

        onUpdateTransaction(updatedTransaction);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-[rgb(var(--color-border-subtle))]">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Payment Details ({paymentMethod})</h3>
                </div>
                <div className="p-6 space-y-4">
                    {paymentMethod === 'cash' && (
                        <div>
                            <label htmlFor="paymentDate" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Payment Date</label>
                            <input
                                type="date"
                                id="paymentDate"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                                className="w-full p-2 border border-[rgb(var(--color-border))] rounded bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                            />
                        </div>
                    )}
                    {paymentMethod === 'transfer' && (
                        <div>
                             <label htmlFor="receipt" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Upload Receipt</label>
                             <input
                                type="file"
                                id="receipt"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-[rgb(var(--color-text-muted))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgb(var(--color-primary-light))] file:text-[rgb(var(--color-primary-text-on-light))] hover:file:bg-[rgb(var(--color-primary-light)_/_0.8)]"
                            />
                            {receiptPreview && <img src={receiptPreview} alt="Receipt Preview" className="mt-4 max-h-40 rounded-md border"/>}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))]">Confirm Payment</button>
                </div>
            </div>
        </div>
    );
};
