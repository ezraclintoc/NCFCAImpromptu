import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

const ConsentManager = ({ onConsent, forceOpen = false, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const firstButtonRef = useRef(null);

    useEffect(() => {
        const consent = Cookies.get('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        if (forceOpen) {
            setIsVisible(true);
        }
    }, [forceOpen]);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => firstButtonRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const handleConsent = (level) => {
        Cookies.set('cookieConsent', level, { expires: 365, secure: true, sameSite: 'strict' });
        onConsent(level);
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <div
            role="alertdialog"
            aria-modal="false"
            aria-labelledby="consent-title"
            aria-describedby="consent-description"
            className="fixed bottom-0 left-0 right-0 bg-brand-bg/98 border-t border-brand-border p-6 z-[100] animate-in slide-in-from-bottom-full duration-500"
        >
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h3 id="consent-title" className="text-lg font-bold text-brand-text">Preference Settings</h3>
                    <p id="consent-description" className="text-sm text-brand-text-muted max-w-xl">
                        We use local storage to enhance your experience.
                        "Essential" saves your settings. "All" saves your practice history.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => handleConsent('none')}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-text/5 transition-colors"
                    >
                        None
                    </button>
                    <button
                        ref={firstButtonRef}
                        onClick={() => handleConsent('essential')}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-text/10 text-brand-text hover:bg-brand-text/20 transition-colors"
                    >
                        Essential
                    </button>
                    <button
                        onClick={() => handleConsent('all')}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-colors"
                    >
                        All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsentManager;
