import React, { memo } from 'react';

const AboutModal = ({ showAbout, setShowAbout }) => {
    if (!showAbout) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-brand-bg/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setShowAbout(false)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[calc(100%-3rem)] max-w-lg bg-brand-bg border border-brand-text/10 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 text-left">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text">About NCFCA Impromptu</h2>
                        <p className="text-sm font-medium text-brand-primary mt-1">
                            Created by <a href="https://ezra.is-a.dev" target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-4 transition-all">Ezra</a> • Capital Forensics Club (CFC)
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAbout(false)}
                        className="p-2 -mr-2 rounded-xl text-brand-text-muted hover:text-brand-text hover:bg-brand-text/5 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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

                    <div className="bg-brand-text/5 border border-brand-text/10 rounded-2xl p-4 space-y-3">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="m17 12-5 5-5-5" /><path d="m17 17-5 5-5-5" /><path d="m17 7-5 5-5-5" /><path d="m17 2-5 5-5-5" /></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-brand-text">Multiple Themes</h3>
                                <p className="text-xs">Choose from 10 premium color palettes to match your focus environment.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-brand-text">Acknowledgements</h3>
                                <p className="text-xs">Special thanks to <b>Danielle Miller</b> for providing the expansive prompt datasets.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 space-y-3 text-center md:text-left border-t border-brand-border/10">
                        <p className="text-xs">
                            Have suggestions? Email me at <a href="mailto:ezraclintoc@gmail.com" className="text-brand-primary font-bold hover:underline">ezraclintoc@gmail.com</a>
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
