import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
    { keys: ['F1'], description: 'Focus on Customer Search in POS view' },
    { keys: ['F2'], description: 'Focus on Product Search in POS view' },
    { keys: ['F4', 'Ctrl + S'], description: 'Save the current order in POS view' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-[rgb(var(--color-text-base))]">{shortcut.description}</span>
                <div className="flex items-center space-x-2">
                  {shortcut.keys.map(key => (
                     <kbd key={key} className="px-2 py-1.5 text-xs font-semibold text-[rgb(var(--color-text-muted))] bg-[rgb(var(--color-bg-subtle))] border border-[rgb(var(--color-border))] rounded-md">{key}</kbd>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Close</button>
        </div>
      </div>
    </div>
  );
};
