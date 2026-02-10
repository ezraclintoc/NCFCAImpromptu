import React, { useState, useEffect } from 'react';
import { datasets, datasetKeys, defaultDataset } from './data/datasets.js';
import Timer from './components/Timer';
import Cookies from 'js-cookie';
import ConsentManager from './components/ConsentManager';

const App = () => {
    // Dataset State
    const [selectedDataset, setSelectedDataset] = useState(() => {
        const saved = Cookies.get('selectedDataset');
        return (saved && datasets[saved]) ? saved : defaultDataset;
    });
    const topicsData = datasets[selectedDataset].topics;

    // Categories State
    const [categories, setCategories] = useState(
        Object.keys(topicsData).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
    );

    useEffect(() => {
        setCategories(Object.keys(topicsData).reduce((acc, cat) => ({ ...acc, [cat]: true }), {}));
    }, [selectedDataset]);

    // Settings State
    const [settings, setSettings] = useState(() => {
        const defaultSettings = {
            immediatelyStartPrep: true,
            promptAmount: 2,
            prepTime: 120,
            speakingTime: 300,
            animationsEnabled: true,
            theme: 'sleek',
            forceSameCategory: false
        };
        const savedSettings = Cookies.get('settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                return { ...defaultSettings, ...parsed };
            } catch (e) {
                console.error("Failed to parse settings cookie:", e);
            }
        }
        return defaultSettings;
    });

    const [history, setHistory] = useState(() => {
        const savedHistory = Cookies.get('history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Failed to parse history cookie:", e);
            }
        }
        return [];
    });

    const [cookieConsent, setCookieConsent] = useState(() => Cookies.get('cookieConsent'));

    useEffect(() => {
        if (cookieConsent === 'essential' || cookieConsent === 'all') {
            Cookies.set('settings', JSON.stringify(settings), { expires: 365, secure: true, sameSite: 'strict' });
            Cookies.set('selectedDataset', selectedDataset, { expires: 365, secure: true, sameSite: 'strict' });
        }
    }, [settings, selectedDataset, cookieConsent]);

    useEffect(() => {
        if (cookieConsent === 'all') {
            Cookies.set('history', JSON.stringify(history), { expires: 365, secure: true, sameSite: 'strict' });
        }
    }, [history, cookieConsent]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        document.documentElement.setAttribute('data-animations', settings.animationsEnabled);
    }, [settings.theme, settings.animationsEnabled]);

    // UI state
    const [showSettings, setShowSettings] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showConsentManager, setShowConsentManager] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    // Play State
    const [currentTopics, setCurrentTopics] = useState([]);
    const [timerMode, setTimerMode] = useState('none');

    const toggleCategory = (cat) => {
        setCategories(prev => {
            const activeCats = Object.keys(prev).filter(key => prev[key]);
            if (activeCats.length === 1 && prev[cat]) return prev;
            return { ...prev, [cat]: !prev[cat] };
        });
    };

    const generateTopics = () => {
        const activeCategories = Object.keys(categories).filter(cat => categories[cat] && topicsData[cat]);
        if (activeCategories.length === 0) return;

        const newTopics = [];
        let forceCat = null;
        if (settings.forceSameCategory) {
            forceCat = activeCategories[Math.floor(Math.random() * activeCategories.length)];
        }

        for (let i = 0; i < settings.promptAmount; i++) {
            const randomCat = forceCat || activeCategories[Math.floor(Math.random() * activeCategories.length)];
            const topics = topicsData[randomCat];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            newTopics.push({ category: randomCat, text: randomTopic });
        }

        setCurrentTopics(newTopics);
        setTimerMode('prep');
    };

    const addToHistory = () => {
        const newEntry = {
            date: new Date().toISOString(),
            topics: currentTopics.map(t => ({ text: t.text, category: t.category })),
            dataset: datasets[selectedDataset].name,
        };
        setHistory(prev => [newEntry, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
        if (cookieConsent === 'all') {
            Cookies.remove('history');
        }
    };

    const replaySession = (entry) => {
        setCurrentTopics(entry.topics);
        setTimerMode('prep');
        setShowSettings(false);
    };

    return (
        <div
            className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 transition-colors duration-500 flex flex-col"
        >
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center flex-1 w-full">
                <header className={`mb-12 text-center w-full relative ${showSettings ? 'z-[100]' : 'z-10'}`}>
                    <div className="animate-premium-in">
                        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary mb-2">
                            NCFCA Impromptu
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-brand-text-muted text-lg">Practice like a champion.</p>
                            <button
                                onClick={() => setShowAbout(true)}
                                className="p-1.5 rounded-full hover:bg-brand-text/5 text-brand-text-muted hover:text-brand-text transition-colors"
                                title="About"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                            </button>
                        </div>
                    </div>

                    <button
                        id="settings-button"
                        aria-label="Settings"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`absolute right-0 top-0 p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 z-[100] animate-premium-in ${showSettings ? 'bg-brand-primary border-brand-primary shadow-lg text-white' : 'bg-brand-surface border-brand-border text-brand-text-muted hover:text-brand-text'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>

                    {/* Settings Panel */}
                    {showSettings && (
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
                                                        {datasets[key].name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <div className="space-y-3 pt-4 border-t border-brand-border">
                                            <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest block mb-2">Category Selection</span>
                                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                                {Object.keys(topicsData).map(cat => (
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
                                        </div>

                                        <div className="bg-brand-text/5 border border-brand-text/10 rounded-xl p-3">
                                            <p className="text-[10px] text-brand-text-muted leading-relaxed italic">
                                                {datasets[selectedDataset].tagline}
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
                    )}
                </header>

                <div className="flex-1 w-full flex flex-col items-center">
                    {timerMode === 'none' && (
                        <div className="flex flex-col items-center justify-center flex-1 w-full animate-premium-in">
                            <div className="mb-8 text-center">
                                <div className="inline-flex gap-2 mb-4 px-4 py-2 bg-brand-surface border border-brand-border rounded-full text-xs text-brand-text-muted">
                                    <span>{Object.keys(topicsData).length} Categories</span>
                                    <span className="opacity-20">|</span>
                                    <span>{settings.promptAmount} {settings.promptAmount === 1 ? 'Prompt' : 'Prompts'}</span>
                                </div>
                            </div>

                            <button
                                onClick={generateTopics}
                                className="group relative px-12 py-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-[2.5rem] transition-all shadow-2xl hover:shadow-brand-primary/40 active:scale-95"
                            >
                                <span className="relative z-10 text-2xl font-bold tracking-tight">Generate Prompts</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full" />
                            </button>

                            <p className="mt-8 text-brand-text-muted text-sm italic">
                                Drawing from {Object.keys(categories).filter(c => categories[c]).length} active categories
                            </p>
                        </div>
                    )}

                    {timerMode !== 'none' && currentTopics.length > 0 && (
                        <div className="w-full max-w-3xl flex flex-col items-center text-center animate-premium-in">
                            <div className="mb-12 w-full space-y-6">
                                {currentTopics.map((topic, idx) => {
                                    const isQuote = topic.category === 'Quotes' || topic.category.includes('Quotes');
                                    return (
                                        <div key={idx} className="transition-all duration-500 scale-100 opacity-100">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border bg-brand-primary/20 text-brand-primary/80 border-brand-primary/30">
                                                {topic.category}
                                            </span>
                                            <h2 className={`text-2xl md:text-3xl leading-snug text-brand-text ${isQuote ? 'font-serif italic' : 'font-sans font-medium'}`}>
                                                {isQuote && '"'}{topic.text}{isQuote && '"'}
                                            </h2>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="w-full bg-brand-surface backdrop-blur-xl border border-brand-border p-12 rounded-[3rem] shadow-2xl mb-8">
                                <span className="text-sm font-bold text-brand-text-muted uppercase tracking-widest mb-4 block">
                                    {timerMode === 'prep' ? 'Preparation Time' : 'Speaking Time'}
                                </span>
                                <Timer
                                    key={timerMode}
                                    mode={timerMode}
                                    autoStart={timerMode === 'prep' ? settings.immediatelyStartPrep : false}
                                    initialTime={timerMode === 'prep' ? settings.prepTime : settings.speakingTime}
                                    onComplete={() => timerMode === 'prep' && setTimerMode('speech')}
                                />
                            </div>

                            <button
                                onClick={() => {
                                    addToHistory();
                                    setTimerMode('none');
                                    setCurrentTopics([]);
                                }}
                                className="text-brand-text-muted hover:text-brand-text transition-colors font-medium px-6 py-2 rounded-full hover:bg-brand-surface"
                            >
                                ← Return to Home
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 border-t border-brand-border/50 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setShowAbout(true)}
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors"
                        >
                            About
                        </button>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors"
                        >
                            Source
                        </a>
                        <button
                            onClick={() => setShowConsentManager(true)}
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors"
                        >
                            Privacy
                        </button>
                    </div>
                    <p className="text-[10px] text-brand-text-muted/50 uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} NCFCA Practice Tool
                    </p>
                </div>
            </footer>

            {/* About Modal */}
            {showAbout && (
                <>
                    <div
                        className="fixed inset-0 z-[110] bg-brand-bg/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowAbout(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-[calc(100%-3rem)] max-w-lg bg-brand-bg border border-brand-text/10 p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 text-left">
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
            )}

            <ConsentManager
                onConsent={setCookieConsent}
                forceOpen={showConsentManager}
                onClose={() => setShowConsentManager(false)}
            />
        </div>
    );
};

export default App;
