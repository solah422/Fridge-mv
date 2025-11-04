import React, { useState, useMemo, useEffect } from 'react';
import { Product, Wholesaler } from '../types';

type ParsedProduct = Omit<Product, 'id' | 'isBundle' | 'bundleItems'>;

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: ParsedProduct[]) => void;
  wholesalers: Wholesaler[];
}

export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ isOpen, onClose, onImport, wholesalers }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const wholesalerNameMap = useMemo(() => new Map(wholesalers.map(w => [w.name.toLowerCase(), w.id])), [wholesalers]);

  useEffect(() => {
    if (!isOpen) {
        setFile(null);
        setParsedData([]);
        setErrors([]);
    }
  }, [isOpen]);

  const handleDownloadSample = () => {
    const headers = "name,price,wholesalePrice,stock,category,defaultWholesalerName";
    const sampleData = "Espresso Shot,15.00,10.00,50,Drinks,Global Foods Inc.";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + sampleData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "product_import_sample.csv");
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
        const requiredHeaders = ['name', 'price', 'wholesalePrice', 'stock', 'category'];
        
        const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));
        if (missingHeaders.length > 0) {
            setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
            setParsedData([]);
            return;
        }

        const newProducts: ParsedProduct[] = [];
        const newErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const rowData: { [key: string]: string } = headers.reduce((obj, header, index) => {
                obj[header] = values[index]?.trim() || '';
                return obj;
            }, {} as { [key: string]: string });

            const name = rowData.name;
            const price = parseFloat(rowData.price);
            const wholesalePrice = parseFloat(rowData.wholesalePrice);
            const stock = parseInt(rowData.stock, 10);
            const category = rowData.category;
            const wholesalerName = rowData.defaultWholesalerName;

            let rowIsValid = true;
            if (!name) { newErrors.push(`Row ${i + 1}: Name is required.`); rowIsValid = false; }
            if (isNaN(price) || price < 0) { newErrors.push(`Row ${i + 1}: Invalid price. Must be a non-negative number.`); rowIsValid = false; }
            if (isNaN(wholesalePrice) || wholesalePrice < 0) { newErrors.push(`Row ${i + 1}: Invalid wholesale price. Must be a non-negative number.`); rowIsValid = false; }
            if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) { newErrors.push(`Row ${i + 1}: Invalid stock. Must be a non-negative integer.`); rowIsValid = false; }
            if (!category) { newErrors.push(`Row ${i + 1}: Category is required.`); rowIsValid = false; }
            
            let wholesalerId: number | undefined = undefined;
            if (wholesalerName) {
                const foundId = wholesalerNameMap.get(wholesalerName.toLowerCase());
                if (!foundId) {
                    newErrors.push(`Row ${i + 1}: Wholesaler "${wholesalerName}" not found. It must match an existing wholesaler name exactly (case-insensitive).`);
                    rowIsValid = false;
                } else {
                    wholesalerId = foundId;
                }
            }

            if (rowIsValid) {
                newProducts.push({ name, price, wholesalePrice, stock, category, defaultWholesalerId: wholesalerId });
            }
        }
        setErrors(newErrors);
        setParsedData(newProducts);
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
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Bulk Import Products</h3>
          <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto flex-grow">
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-md border border-[rgb(var(--color-border-subtle))]">
            <h4 className="font-semibold text-[rgb(var(--color-text-base))]">How to Import</h4>
            <ol className="list-decimal list-inside text-sm text-[rgb(var(--color-text-muted))] mt-2 space-y-1">
              <li>Download the sample CSV file to see the required format.</li>
              <li>Fill the sheet with your product data. Required columns are `name`, `price`, `wholesalePrice`, `stock`, `category`.</li>
              <li>`defaultWholesalerName` is optional. If provided, it must match an existing wholesaler's name exactly.</li>
              <li>Upload the completed CSV file below.</li>
            </ol>
            <button onClick={handleDownloadSample} className="mt-3 text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">Download Sample Template</button>
          </div>
          
          <div>
            <label htmlFor="csv-upload" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Upload CSV File</label>
            <input 
                id="csv-upload"
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
              <h4 className="font-semibold text-[rgb(var(--color-text-base))] mb-2">Import Preview ({parsedData.length} products)</h4>
              <div className="max-h-60 overflow-y-auto border border-[rgb(var(--color-border))] rounded-md">
                <table className="min-w-full divide-y divide-[rgb(var(--color-border-subtle))] text-sm">
                  <thead className="bg-[rgb(var(--color-bg-subtle))] sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Price</th>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Stock</th>
                      <th className="px-3 py-2 text-left font-medium text-[rgb(var(--color-text-muted))]">Category</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[rgb(var(--color-bg-card))] divide-y divide-[rgb(var(--color-border-subtle))]">
                    {parsedData.slice(0, 10).map((p, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-base))]">{p.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-muted))]">{p.price.toFixed(2)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-muted))]">{p.stock}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-[rgb(var(--color-text-muted))]">{p.category}</td>
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
            Import Products
          </button>
        </div>
      </div>
    </div>
  );
};