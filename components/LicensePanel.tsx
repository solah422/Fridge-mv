import React from 'react';

interface LicensePanelProps {
  onClose: () => void;
}

export const LicensePanel: React.FC<LicensePanelProps> = ({ onClose }) => {
    const licenseText = `BSD 3-Clause License

Copyright (c) 2025, Ahmed Solah
All rights reserved.

This software (the "POS System") was developed by Ahmed Solah and provided to
Adam Zahuwaan for use in connection with his business operations. Redistribution
and use in source and binary forms, with or without modification, are permitted
subject to the following conditions:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions, and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions, and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of Ahmed Solah nor the names of any contributors or
   recipients, including Adam Zahuwaan, may be used to endorse or promote
   products derived from this software without specific prior written
   permission from Ahmed Solah.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-[rgb(var(--color-border-subtle))] flex justify-between items-center flex-shrink-0">
                    <h3 className="text-xl font-bold">BSD 3-Clause License</h3>
                    <button onClick={onClose} className="text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-base))] text-3xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-[rgb(var(--color-text-muted))] font-sans">
                        {licenseText}
                    </pre>
                </div>
                <div className="p-4 bg-[rgb(var(--color-bg-subtle))] border-t border-[rgb(var(--color-border-subtle))] flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-[rgb(var(--color-border-subtle))] text-[rgb(var(--color-text-base))] rounded-md hover:bg-[rgb(var(--color-border))] transition">Close</button>
                </div>
            </div>
        </div>
    );
};
