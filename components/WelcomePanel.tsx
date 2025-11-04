import React from 'react';
import { changelogData } from '../data/changelogData';

interface WelcomePanelProps {
  onClose: () => void;
  version: string;
}

export const WelcomePanel: React.FC<WelcomePanelProps> = ({ onClose, version }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-[rgb(var(--color-border-subtle))]">
          <h3 className="text-2xl font-bold text-[rgb(var(--color-text-base))]">Welcome to Fridge MV v{version}</h3>
          <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">Here's what's new and improved in the latest version.</p>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          {changelogData.map(entry => (
            <div key={entry.version} className="border-b border-[rgb(var(--color-border-subtle))] pb-4 last:border-b-0">
              <h4 className="text-lg font-semibold text-[rgb(var(--color-text-base))]">Version {entry.version}</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-[rgb(var(--color-text-muted))]">
                {entry.changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] font-semibold rounded-md hover:bg-[rgb(var(--color-primary-hover))] transition">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};