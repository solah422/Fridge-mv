import React, { useState, useEffect } from 'react';
import { Customer } from '../types';

type ParsedCustomer = Omit<Customer, 'id' | 'loyaltyPoints'>;

interface ImportCustomersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (customers: ParsedCustomer[]) => void;
}

export const ImportCustomersModal: React.FC<ImportCustomersModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
        setFile(null);
        setParsedData([]);
        setErrors([]);
    }
  }, [isOpen]);

  const handleDownloadSample = () => {
    const headers = "name,email,phone,telegramId";
    const sampleData = "John Doe,john.d@example.com,555-1234,@johndoe";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sampleData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setErrors(["CSV file must contain a header row and at least one data row."]);
            setParsedData([]);
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name'];
        
        const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));
        if (missingHeaders.length > 0) {
            setErrors([`Missing required column(s): ${missingHeaders.join(', ')}`]);
            setParsedData([]);
            return;
        }

        const newCustomers: ParsedCustomer[] = [];
        const newErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const rowData: { [key: string]: string } = headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim() || '';
                return obj;
            }, {} as { [key: string]: string });

            const name = rowData.name;
            const email = rowData.email || '';
            const phone = rowData.phone || '';
            const telegramId = rowData.telegramId || '';

            if (!name) { 
                newErrors.push(`Row ${i + 1}: Name is required.`); 
            } else {
                newCustomers.push({ name, email, phone, telegramId });
            }
        }
        setErrors(newErrors);
        setParsedData(newCustomers);
    }
    reader.readAsText(csvFile);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setParsedData([]);
    setErrors([]);
    if (selectedFile) {
        if (selectedFile.type !== 'text/csv') {
            setErrors(['Invalid file type. Please upload a .csv file.']);
            setFile(null);
            return;
        }
        setFile(selectedFile);
        parseCSV(selectedFile);
    }
  };

  const handleImportClick = () => {
    if (parsedData.length > 0 && errors.length === 0) {
      onImport(parsedData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Bulk Import Customers</h3>
          <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-grow">
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-md border border-[rgb(var(--color-border-subtle))]">
            <h4 className="font-semibold text-[rgb(var(--color-text-base))]">How to Import</h4>
            <ol className="list-decimal list-inside text-sm text-[rgb(var(--color-text-muted))] mt-2 space-y-1">
              <li>Download the sample CSV file.</li>
              <li>Fill the sheet with your customer data. The `name` column is required.</li>
              <li>`email`, `phone`, and `telegramId` are optional.</li>
              <li>Upload the completed CSV file below.</li>
            </ol>
            <button onClick={handleDownloadSample} className="mt-3 text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">Download Sample Template</button>
          </div>
          
          <div>
            <label htmlFor="csv-upload-customer" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Upload CSV File</label>
            <input 
                id="csv-upload-customer"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm text-[rgb(var(--color-text-muted))] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[rgb(var(--color-primary-light))] file:text-[rgb(var(--color-primary-text-on-light))] hover:file:bg-[rgb(var(--color-primary-light)_/_0.8)]"
            />
          </div>

          {errors.length > 0 && (
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-md">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Validation Errors</h4>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1 max-h-32 overflow-y-auto">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
            </div>
          )}

          {parsedData.length > 0 && errors.length === 0 && (
            <div>
              <h4 className="font-semibold text-[rgb(var(--color-text-base))] mb-2">Import Preview ({parsedData.length} customers)</h4>
              <div className="max-h-60 overflow-y-auto border border-[rgb(var(--color-border))] rounded-md">
                <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))] text-sm">
                  <thead className="bg-[rgb(var(--color-bg-subtle))] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Email</th>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                    {parsedData.slice(0, 10).map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-base))]">{p.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-muted))]">{p.email || 'N/A'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-muted))]">{p.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 {parsedData.length > 10 && <p className="text-center text-xs p-2 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text-muted))]">...and {parsedData.length - 10} more rows.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
          <button 
            type="button" 
            onClick={handleImportClick} 
            className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={parsedData.length === 0 || errors.length > 0}
          >
            Import Customers
          </button>
        </div>
      </div>
    </div>
  );
};