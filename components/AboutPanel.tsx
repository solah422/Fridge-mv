import React, { useState } from 'react';
import { ChangelogModal } from './ChangelogModal';
import { LicensePanel } from './LicensePanel';

interface AboutPanelProps {
  version: string;
}

export const AboutPanel: React.FC<AboutPanelProps> = ({ version }) => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isLicensePanelOpen, setIsLicensePanelOpen] = useState(false);

  return (
    <>
      <section>
        <h3 className="text-xl font-semibold text-[rgb(var(--color-text-base))] mb-3">About Fridge MV</h3>
        <div className="p-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Version</p>
            <p className="text-sm font-mono px-2 py-1 bg-[rgb(var(--color-border-subtle))] rounded">{version}</p>
          </div>
          <div className="flex items-center justify-between border-t border-[rgb(var(--color-border-subtle))] pt-3">
            <p className="font-medium text-[rgb(var(--color-text-base))]">Changelog</p>
            <button onClick={() => setIsChangelogOpen(true)} className="text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">View History</button>
          </div>
        </div>
        <div className="p-4 mt-4 bg-[rgb(var(--color-bg-subtle))] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[rgb(var(--color-text-base))]">License</p>
              <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">BSD 3-Clause License</p>
            </div>
            <button onClick={() => setIsLicensePanelOpen(true)} className="text-sm font-semibold text-[rgb(var(--color-primary))] hover:underline">
              View Full License
            </button>
          </div>
        </div>
      </section>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
      {isLicensePanelOpen && <LicensePanel onClose={() => setIsLicensePanelOpen(false)} />}
    </>
  );
};
