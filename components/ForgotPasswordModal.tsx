import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { requestPasswordReset } from '../store/slices/authSlice';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(requestPasswordReset(identifier))
      .unwrap()
      .then(() => {
        setIsSubmitted(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to allow for closing animation if any
    setTimeout(() => {
        setIsSubmitted(false);
        setIdentifier('');
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[rgb(var(--color-text-base))]">Forgot Password</h3>
            <button type="button" onClick={handleClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            {!isSubmitted ? (
              <>
                <p className="text-sm text-[rgb(var(--color-text-muted))]">Enter your Redbox ID or email. This will send a request to an administrator to reset your password.</p>
                <div>
                  <label htmlFor="identifier" className="block text-sm font-medium text-[rgb(var(--color-text-muted))] mb-1">Redbox ID or Email</label>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full p-2 border border-[rgb(var(--color-border))] rounded-md bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-base))]"
                    required
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-green-600">
                Your request has been submitted. An admin will review it shortly.
              </p>
            )}
          </div>
          <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end space-x-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] rounded-md">Close</button>
            {!isSubmitted && (
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-[rgb(var(--color-primary))] text-white rounded-md disabled:opacity-50">
                {isLoading ? 'Submitting...' : 'Request Reset'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};