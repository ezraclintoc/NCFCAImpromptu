import React, { memo, useEffect, useRef, useCallback } from 'react';

const Toggle = ({ checked, onChange, label }) => (
    <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-brand-primary' : 'bg-brand-text/20'}`}
    >
        <div className={`absolute top-1 w-4 h-4 bg-white shadow-sm rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
);

const SettingsPanel = ({
    showSettings,
    setShowSettings,
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    selectedDataset,
    setSelectedDataset,
    datasetKeys,
    datasetManifest,
    loadingDataset,
    topicsData,
    categories,
    toggleCategory,
    cookieConsent,
    setShowConsentManager,
    history,
    clearHistory,
    replaySession
}) => {
    const panelRef = useRef(null);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            setShowSettings(false);
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
    }, [setShowSettings]);

    useEffect(() => {
        if (!showSettings) return;
        const previousFocus = document.activeElement;
        document.addEventListener('keydown', handleKeyDown);
        const timer = setTimeout(() => panelRef.current?.focus(), 50);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(timer);
            previousFocus?.focus();
        };
    }, [showSettings, handleKeyDown]);

    if (!showSettings) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm cursor-default"
                onClick={() => setShowSettings(false)}
                aria-hidden="true"
            />
            <div
                id="settings-panel"
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label="Settings"
                className="absolute top-16 right-0 z-[100] w-full max-w-md bg-brand-surface border border-brand-border p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left outline-none"
            >
                <div
                    role="tablist"
                    aria-label="Settings sections"
                    className="flex gap-1.5 mb-6 p-1 bg-brand-text/5 rounded-xl"
                >
                    {['general', 'topics', 'display', 'history'].map(tab => (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            aria-controls={`tabpanel-${tab}`}
                            id={`tab-${tab}`}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:text-brand-text'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'general' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-general"
                        aria-labelledby="tab-general"
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-brand-text/80">Auto-start prep</span>
                            <Toggle
                                checked={settings.immediatelyStartPrep}
                                onChange={() => setSettings(s => ({ ...s, immediatelyStartPrep: !s.immediatelyStartPrep }))}
                                label="Auto-start prep timer"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Alert on Prep Over</span>
                                <span className="text-[10px] text-brand-text-muted">Vibrate or play sound when prep time is up</span>
                            </div>
                            <Toggle
                                checked={settings.buzzOnPrepOver}
                                onChange={() => setSettings(s => ({ ...s, buzzOnPrepOver: !s.buzzOnPrepOver }))}
                                label="Alert when prep time ends"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Force Same Category</span>
                                <span className="text-[10px] text-brand-text-muted">Pick all prompts from one category</span>
                            </div>
                            <Toggle
                                checked={settings.forceSameCategory}
                                onChange={() => setSettings(s => ({ ...s, forceSameCategory: !s.forceSameCategory }))}
                                label="Force all prompts from same category"
                            />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-brand-border">
                            <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest block mb-1">Presets</span>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setSettings(s => ({ ...s, prepTime: 120, speakingTime: 300 }));
                                        setSelectedDataset('ncfca_impromptu');
                                    }}
                                    className="px-3 py-2 bg-brand-text/5 hover:bg-brand-text/10 text-brand-text/80 text-xs rounded-lg transition-colors border border-brand-border"
                                >
                                    NCFCA Impromptu
                                    <span className="block text-[9px] opacity-50 font-normal mt-0.5">2m Prep / 5m Speak</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSettings(s => ({ ...s, prepTime: 240, speakingTime: 360 }));
                                        setSelectedDataset('ncfca_apologetics');
                                    }}
                                    className="px-3 py-2 bg-brand-text/5 hover:bg-brand-text/10 text-brand-text/80 text-xs rounded-lg transition-colors border border-brand-border"
                                >
                                    Apologetics Doctrinal
                                    <span className="block text-[9px] opacity-50 font-normal mt-0.5">4m Prep / 6m Speak</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSettings(s => ({ ...s, prepTime: 240, speakingTime: 360 }));
                                        setSelectedDataset('ncfca_apologetics_applicational');
                                    }}
                                    className="px-3 py-2 bg-brand-text/5 hover:bg-brand-text/10 text-brand-text/80 text-xs rounded-lg transition-colors border border-brand-border"
                                >
                                    Apologetics Applicational
                                    <span className="block text-[9px] opacity-50 font-normal mt-0.5">4m Prep / 6m Speak</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSettings(s => ({ ...s, prepTime: 120, speakingTime: 180 }));
                                        setSelectedDataset('ncfca_junior');
                                    }}
                                    className="px-3 py-2 bg-brand-text/5 hover:bg-brand-text/10 text-brand-text/80 text-xs rounded-lg transition-colors border border-brand-border"
                                >
                                    NCFCA Junior
                                    <span className="block text-[9px] opacity-50 font-normal mt-0.5">2m Prep / 3m Speak</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-brand-border">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label htmlFor="prep-time-range" className="text-sm text-brand-text/80">Preparation Time</label>
                                    <span className="text-sm font-bold text-brand-primary" aria-live="polite">
                                        {Math.floor(settings.prepTime / 60)}:{(settings.prepTime % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <input
                                    id="prep-time-range"
                                    type="range" min="30" max="600" step="30"
                                    value={settings.prepTime}
                                    aria-label={`Preparation time: ${Math.floor(settings.prepTime / 60)} minutes ${settings.prepTime % 60} seconds`}
                                    onChange={(e) => setSettings(s => ({ ...s, prepTime: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label htmlFor="speaking-time-range" className="text-sm text-brand-text/80">Speaking Time (Target)</label>
                                    <span className="text-sm font-bold text-brand-secondary" aria-live="polite">
                                        {Math.floor(settings.speakingTime / 60)}:00
                                    </span>
                                </div>
                                <input
                                    id="speaking-time-range"
                                    type="range" min="60" max="900" step="60"
                                    value={settings.speakingTime}
                                    aria-label={`Speaking time: ${Math.floor(settings.speakingTime / 60)} minutes`}
                                    onChange={(e) => setSettings(s => ({ ...s, speakingTime: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label htmlFor="prompts-range" className="text-sm text-brand-text/80">Prompts to draw</label>
                                    <span className="text-sm font-bold text-brand-text-muted" aria-live="polite">
                                        {settings.promptAmount}
                                    </span>
                                </div>
                                <input
                                    id="prompts-range"
                                    type="range" min="1" max="5" step="1"
                                    value={settings.promptAmount}
                                    aria-label={`Number of prompts: ${settings.promptAmount}`}
                                    onChange={(e) => setSettings(s => ({ ...s, promptAmount: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-text-muted"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'topics' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-topics"
                        aria-labelledby="tab-topics"
                        className="space-y-6"
                    >
                        <label className="block">
                            <span className="text-xs font-bold text-brand-text-muted uppercase mb-2 block">Choose Dataset</span>
                            <select
                                value={selectedDataset}
                                onChange={(e) => setSelectedDataset(e.target.value)}
                                className="w-full bg-brand-surface border border-brand-border rounded-xl p-3 text-sm text-brand-text focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer"
                            >
                                {datasetKeys.map(key => (
                                    <option key={key} value={key}>
                                        {datasetManifest[key].name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="space-y-3 pt-4 border-t border-brand-border">
                            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block mb-2">Category Selection</span>
                            {loadingDataset ? (
                                <div className="flex items-center justify-center h-48 italic text-brand-text-muted text-[10px]">Updating items...</div>
                            ) : (
                                <div
                                    className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2"
                                    role="group"
                                    aria-label="Category toggles"
                                >
                                    {topicsData && Object.keys(topicsData).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            aria-pressed={!!categories[cat]}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${categories[cat]
                                                ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary'
                                                : 'bg-brand-surface border-brand-border text-brand-text-muted'
                                                }`}
                                        >
                                            <span className="text-[10px] font-bold text-left leading-tight uppercase tracking-wider">{cat}</span>
                                            {categories[cat] && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 ml-1" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-brand-text/5 border border-brand-text/10 rounded-xl p-3">
                            <p className="text-[10px] text-brand-text-muted leading-relaxed italic">
                                {datasetManifest[selectedDataset].tagline}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'display' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-display"
                        aria-labelledby="tab-display"
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Enable Animations</span>
                                <span className="text-[10px] text-brand-text-muted">Smooth transitions and entry effects</span>
                            </div>
                            <Toggle
                                checked={settings.animationsEnabled}
                                onChange={() => setSettings(s => ({ ...s, animationsEnabled: !s.animationsEnabled }))}
                                label="Enable animations"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-brand-border">
                            <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest block mb-1">Color Theme</span>
                            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Color theme">
                                {[
                                    { id: 'sleek', name: 'NCFCA', primary: 'bg-blue-700', bg: 'bg-blue-50' },
                                    { id: 'ncfca-dark', name: 'NCFCA Dark', primary: 'bg-blue-400', bg: 'bg-blue-950' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        role="radio"
                                        aria-checked={settings.theme === t.id}
                                        onClick={() => setSettings(s => ({ ...s, theme: t.id }))}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${settings.theme === t.id ? 'bg-brand-primary/10 border-brand-primary/30 ring-2 ring-brand-primary/50' : 'bg-brand-surface border-brand-border hover:border-brand-text/20'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${t.bg} border border-brand-text/10 flex items-center justify-center overflow-hidden shrink-0`}>
                                            <div className={`w-4 h-4 rounded-full ${t.primary} blur-[4px]`} />
                                        </div>
                                        <span className="text-sm font-medium text-brand-text/80">{t.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div
                        role="tabpanel"
                        id="tabpanel-history"
                        aria-labelledby="tab-history"
                        className="space-y-4"
                    >
                        {cookieConsent !== 'all' ? (
                            <div className="text-center py-6 space-y-4">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-text/10 mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-text-muted"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                </div>
                                <p className="text-sm text-brand-text-muted">
                                    Practice history requires <span className="font-bold text-brand-primary">"Accept All"</span> consent to save and display your sessions.
                                </p>
                                <button
                                    onClick={() => setShowConsentManager(true)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    Update Preferences
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-brand-text-muted uppercase">Recent Practice</span>
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs text-brand-secondary hover:text-brand-secondary/80 transition-colors"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {history.length === 0 ? (
                                        <p className="text-sm text-brand-text-muted text-center py-8 italic">No speeches recorded yet.</p>
                                    ) : (
                                        history.map((entry) => (
                                            <div key={entry.date} className="bg-brand-text/5 border border-brand-text/10 rounded-xl p-3">
                                                <div className="flex justify-between items-start mb-2 border-b border-brand-text/10 pb-2">
                                                    <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-brand-text-muted font-medium">{entry.dataset}</span>
                                                        <button
                                                            onClick={() => replaySession(entry)}
                                                            className="text-[10px] font-bold text-brand-primary hover:text-brand-primary/80 uppercase tracking-tighter flex items-center gap-1 px-2 py-1 rounded hover:bg-brand-primary/10 transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                                            Replay
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5 mb-1">
                                                    {(entry.topics || [{ text: entry.topic, category: entry.category }]).map((t, tIdx) => (
                                                        <div key={tIdx} className="group/item">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold uppercase tracking-tighter border border-brand-primary/10 shrink-0">
                                                                    {t.category}
                                                                </span>
                                                                <p className="text-sm text-brand-text font-medium leading-relaxed italic">"{t.text}"</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default memo(SettingsPanel);
