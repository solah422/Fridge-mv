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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Send Bulk Notification</h3>
            <button type="button" onClick={onClose} className="text-3xl">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">
              This message will be sent to all <strong>{selectedCount}</strong> selected customers. It will appear as a banner on their dashboard.
            </p>
            <div>
              <label htmlFor="bulk-message" className="block text-sm font-medium mb-1">Notification Message</label>
              <textarea
                id="bulk-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                rows={4}
                required
              />
            </div>
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md">
              Send Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};