import React, { useState } from 'react';

interface BulkNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  selectedCount: number;
}

export const BulkNotificationModal: React.FC<BulkNotificationModalProps> = ({ isOpen, onClose, onSend, selectedCount }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage(''); // Clear after send
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Send Bulk Notification</h3>
            <button type="button" onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">
              This message will be sent to <strong>{selectedCount}</strong> selected customers. It will appear as a banner at the top of their dashboard.
            </p>
            <div>
              <label htmlFor="bulk-message" className="block text-sm font-medium mb-1 text-[rgb(var(--color-text-base))]">Notification Message</label>
              <textarea
                id="bulk-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))] focus:ring-2 focus:ring-[rgb(var(--color-primary-focus-ring))]"
                rows={4}
                placeholder="e.g., Our store will be closed tomorrow for maintenance."
                required
              />
            </div>
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition font-semibold">
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};