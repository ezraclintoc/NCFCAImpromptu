import React, { memo, useEffect, useRef, useCallback } from 'react';

const AboutModal = ({ showAbout, setShowAbout }) => {
    const panelRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            setShowAbout(false);
            return;
        }
        if (e.key === 'Tab' && panelRef.current) {
            const focusable = panelRef.current.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }, [setShowAbout]);

    useEffect(() => {
        if (!showAbout) return;
        const previousFocus = document.activeElement;
        document.addEventListener('keydown', handleKeyDown);
        const timer = setTimeout(() => panelRef.current?.focus(), 50);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
            previousFocus?.focus();
        };
    }, [showAbout, handleKeyDown]);

    if (!showAbout) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-brand-bg/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setShowAbout(false)}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="about-title"
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[calc(100%-3rem)] max-w-lg bg-brand-bg border border-brand-text/10 p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 text-left outline-none"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 id="about-title" className="text-2xl font-bold text-brand-text">About NCFCA Impromptu</h2>
                        <p className="text-sm font-medium text-brand-primary mt-1">
                            Created by <a href="https://ezra.is-a.dev" target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-4 transition-all">Ezra</a> • Capital Forensics Club (CFC)
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAbout(false)}
                        aria-label="Close"
                        className="p-2 -mr-2 rounded-xl text-brand-text-muted hover:text-brand-text hover:bg-brand-text/5 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
                <div className="space-y-5 text-brand-text-muted leading-relaxed">
                    <div className="bg-brand-primary/5 border-l-4 border-brand-primary p-4 rounded-r-2xl italic shadow-sm">
                        <p className="text-sm text-brand-text font-serif">
                            "But in your hearts honor Christ the Lord as holy, always being prepared to make a defense to anyone who asks you for a reason for the hope that is in you; yet do it with gentleness and respect."
                        </p>
                        <p className="text-[10px] font-bold mt-2 text-brand-primary uppercase tracking-widest text-right">— 1 Peter 3:15</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest">The Mission</h3>
                        <p className="text-sm">
                            This tool is designed to empower NCFCA speakers by providing a premium, distraction-free environment for Impromptu and Apologetics practice. We believe that with the right tools, every student can find their voice and speak with conviction.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest">Acknowledgements</h3>
                        <p className="text-sm">
                            Special thanks to <span className="font-bold text-brand-text">Danielle Miller</span> for providing the expansive prompt datasets that power this tool.
                        </p>
                    </div>

                    <div className="pt-2 space-y-3 text-center md:text-left border-t border-brand-border/10">
                        <p className="text-xs">
                            Have suggestions? Email <a href="mailto:ezraclintoc@gmail.com" className="text-brand-primary font-bold hover:underline">ezraclintoc@gmail.com</a>
                        </p>
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-widest">Version 1.0.0</p>
                            <p className="text-[10px] font-bold text-brand-primary">CFC Community Project</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(AboutModal);
