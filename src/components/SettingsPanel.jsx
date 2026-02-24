import React, { memo } from 'react';

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
    if (!showSettings) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm cursor-default"
                onClick={() => setShowSettings(false)}
            />
            <div className="absolute top-16 right-0 z-[100] w-full max-w-md bg-brand-surface border border-brand-border p-6 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
                <div className="flex gap-1.5 mb-6 p-1 bg-brand-text/5 rounded-xl">
                    {['general', 'topics', 'display', 'history'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-muted hover:text-brand-text'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-brand-text/80">Auto-start prep</span>
                            <button
                                onClick={() => setSettings(s => ({ ...s, immediatelyStartPrep: !s.immediatelyStartPrep }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.immediatelyStartPrep ? 'bg-brand-primary' : 'bg-brand-text/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.immediatelyStartPrep ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Alert on Prep Over</span>
                                <span className="text-[10px] text-brand-text-muted">Vibrate or play sound when prep time is up</span>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, buzzOnPrepOver: !s.buzzOnPrepOver }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.buzzOnPrepOver ? 'bg-brand-primary' : 'bg-brand-text/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.buzzOnPrepOver ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Force Same Category</span>
                                <span className="text-[10px] text-brand-text-muted">Pick all prompts from one category</span>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, forceSameCategory: !s.forceSameCategory }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.forceSameCategory ? 'bg-brand-primary' : 'bg-brand-text/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.forceSameCategory ? 'left-7' : 'left-1'}`} />
                            </button>
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
                                    NCFCA Apologetics
                                    <span className="block text-[9px] opacity-50 font-normal mt-0.5">4m Prep / 6m Speak</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-brand-border">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-brand-text/80">Preparation Time</span>
                                    <span className="text-sm font-bold text-brand-primary">{Math.floor(settings.prepTime / 60)}:{(settings.prepTime % 60).toString().padStart(2, '0')}</span>
                                </div>
                                <input
                                    type="range" min="30" max="600" step="30"
                                    value={settings.prepTime}
                                    onChange={(e) => setSettings(s => ({ ...s, prepTime: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-brand-text/80">Speaking Time (Target)</span>
                                    <span className="text-sm font-bold text-brand-secondary">{Math.floor(settings.speakingTime / 60)}:00</span>
                                </div>
                                <input
                                    type="range" min="60" max="900" step="60"
                                    value={settings.speakingTime}
                                    onChange={(e) => setSettings(s => ({ ...s, speakingTime: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-brand-text/80">Prompts to draw</span>
                                    <span className="text-sm font-bold text-brand-text-muted">{settings.promptAmount}</span>
                                </div>
                                <input
                                    type="range" min="1" max="5" step="1"
                                    value={settings.promptAmount}
                                    onChange={(e) => setSettings(s => ({ ...s, promptAmount: parseInt(e.target.value) }))}
                                    className="w-full h-1.5 bg-brand-text/10 rounded-lg appearance-none cursor-pointer accent-brand-text-muted"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'topics' && (
                    <div className="space-y-6">
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
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {topicsData && Object.keys(topicsData).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${categories[cat]
                                                ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary'
                                                : 'bg-brand-surface border-brand-border text-brand-text/40'
                                                }`}
                                        >
                                            <span className="text-[10px] font-bold text-left leading-tight uppercase tracking-wider">{cat}</span>
                                            {categories[cat] && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_var(--brand-primary)] shrink-0 ml-1" />}
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
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-sm text-brand-text/80 block">Enable Animations</span>
                                <span className="text-[10px] text-brand-text-muted">Smooth transitions and entry effects</span>
                            </div>
                            <button
                                onClick={() => setSettings(s => ({ ...s, animationsEnabled: !s.animationsEnabled }))}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.animationsEnabled ? 'bg-brand-primary' : 'bg-brand-text/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.animationsEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-brand-border">
                            <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest block mb-1">Color Theme</span>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'sleek', name: 'Sleek Dark', primary: 'bg-indigo-500', bg: 'bg-slate-950' },
                                    { id: 'midnight', name: 'Midnight', primary: 'bg-blue-500', bg: 'bg-black' },
                                    { id: 'emerald', name: 'Emerald', primary: 'bg-emerald-500', bg: 'bg-teal-950' },
                                    { id: 'sunset', name: 'Sunset', primary: 'bg-orange-500', bg: 'bg-red-950' },
                                    { id: 'milk', name: 'Milk', primary: 'bg-indigo-600', bg: 'bg-white' },
                                    { id: 'rose', name: 'Rose', primary: 'bg-rose-400', bg: 'bg-gray-900' },
                                    { id: 'royal', name: 'Royal', primary: 'bg-violet-500', bg: 'bg-indigo-950' },
                                    { id: 'ocean', name: 'Ocean', primary: 'bg-sky-500', bg: 'bg-blue-950' },
                                    { id: 'forest', name: 'Forest', primary: 'bg-green-500', bg: 'bg-emerald-950' },
                                    { id: 'slate', name: 'Slate', primary: 'bg-slate-400', bg: 'bg-slate-900' }
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSettings(s => ({ ...s, theme: t.id }))}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${settings.theme === t.id ? 'bg-brand-primary/10 border-brand-primary/30 ring-2 ring-brand-primary/50' : 'bg-brand-surface border-brand-border hover:border-brand-text/20'}`}
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
                    <div className="space-y-4">
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
                                        history.map((entry, idx) => (
                                            <div key={idx} className="bg-brand-text/5 border border-brand-text/10 rounded-xl p-3">
                                                <div className="flex justify-between items-start mb-2 border-b border-brand-text/10 pb-2">
                                                    <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-widest">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] text-brand-text-muted font-medium">{entry.dataset}</span>
                                                        <button
                                                            onClick={() => replaySession(entry)}
                                                            className="text-[9px] font-bold text-brand-primary hover:text-brand-primary/80 uppercase tracking-tighter flex items-center gap-1"
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
