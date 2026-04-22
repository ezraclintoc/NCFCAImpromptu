import React, { memo, useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { datasetManifest, datasetKeys, defaultDataset } from './data/datasets.js';
import Cookies from 'js-cookie';

// Lazy load non-critical components
const ConsentManager = lazy(() => import('./components/ConsentManager'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
const AboutModal = lazy(() => import('./components/AboutModal'));
const TopicDisplay = lazy(() => import('./components/TopicDisplay'));

const App = () => {
    // Dataset State
    const [selectedDataset, setSelectedDataset] = useState(() => {
        const saved = Cookies.get('selectedDataset');
        return (saved && datasetManifest[saved]) ? saved : defaultDataset;
    });

    const [topicsData, setTopicsData] = useState(null);
    const [loadingDataset, setLoadingDataset] = useState(true);
    const [categories, setCategories] = useState({});

    // Load dataset dynamically
    useEffect(() => {
        let isMounted = true;
        setLoadingDataset(true);

        // Use requestIdleCallback or a short timeout to prevent blocking initial paint
        const timeout = setTimeout(() => {
            datasetManifest[selectedDataset].loader().then(data => {
                if (isMounted) {
                    const topics = data.topics || data; // Fallback for safety
                    setTopicsData(topics);
                    setCategories(Object.keys(topics).reduce((acc, cat) => ({ ...acc, [cat]: true }), {}));
                    setLoadingDataset(false);
                }
            });
        }, 100);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
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
            forceSameCategory: false,
            buzzOnPrepOver: true
        };
        const savedSettings = Cookies.get('settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                const merged = { ...defaultSettings, ...parsed };
                if (!['sleek', 'ncfca-dark'].includes(merged.theme)) {
                    merged.theme = 'sleek';
                }
                return merged;
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

    const toggleCategory = useCallback((cat) => {
        setCategories(prev => {
            const activeCats = Object.keys(prev).filter(key => prev[key]);
            if (activeCats.length === 1 && prev[cat]) return prev;
            return { ...prev, [cat]: !prev[cat] };
        });
    }, []);

    const generateTopics = useCallback(() => {
        if (!topicsData) return;
        const activeCategories = Object.keys(categories).filter(cat => categories[cat] && topicsData[cat]);
        if (activeCategories.length === 0) return;

        const newTopics = [];
        let forceCat = null;
        if (settings.forceSameCategory) {
            forceCat = activeCategories[Math.floor(Math.random() * activeCategories.length)];
        }

        const usedTexts = new Set();
        let attempts = 0;

        while (newTopics.length < settings.promptAmount && attempts < 100) {
            attempts++;
            const randomCat = forceCat || activeCategories[Math.floor(Math.random() * activeCategories.length)];
            const topics = topicsData[randomCat];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];

            if (!usedTexts.has(randomTopic)) {
                newTopics.push({ category: randomCat, text: randomTopic });
                usedTexts.add(randomTopic);
            }
        }

        setCurrentTopics(newTopics);
        setTimerMode('prep');
    }, [categories, topicsData, settings.forceSameCategory, settings.promptAmount]);

    const addToHistory = useCallback(() => {
        const newEntry = {
            date: new Date().toISOString(),
            topics: currentTopics.map(t => ({ text: t.text, category: t.category })),
            dataset: datasetManifest[selectedDataset].name,
        };
        setHistory(prev => [newEntry, ...prev]);
    }, [currentTopics, selectedDataset]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        if (cookieConsent === 'all') {
            Cookies.remove('history');
        }
    }, [cookieConsent]);

    const replaySession = useCallback((entry) => {
        setCurrentTopics(entry.topics);
        setTimerMode('prep');
        setShowSettings(false);
    }, []);

    const handleReturn = useCallback(() => {
        addToHistory();
        setTimerMode('none');
        setCurrentTopics([]);
    }, [addToHistory]);

    return (
        <div
            className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-primary/30 transition-colors duration-500 flex flex-col"
        >
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 flex flex-col items-center flex-1 w-full">
                <header className="mb-12 text-center w-full relative z-10">
                    <div className="animate-premium-in">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-primary mb-3">
                            NCFCA Impromptu
                        </h1>
                        <p className="text-brand-text-muted text-xs tracking-[0.2em] uppercase">Practice like a champion.</p>
                    </div>

                    <button
                        id="settings-button"
                        aria-label="Settings"
                        aria-expanded={showSettings}
                        aria-controls="settings-panel"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`absolute right-0 top-0 p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 z-[90] animate-premium-in ${showSettings ? 'bg-brand-primary border-brand-primary shadow-lg text-white' : 'bg-brand-surface border-brand-border text-brand-text-muted hover:text-brand-text'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>

                    <Suspense fallback={null}>
                        <SettingsPanel
                            showSettings={showSettings}
                            setShowSettings={setShowSettings}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            settings={settings}
                            setSettings={setSettings}
                            selectedDataset={selectedDataset}
                            setSelectedDataset={setSelectedDataset}
                            datasetKeys={datasetKeys}
                            datasetManifest={datasetManifest}
                            loadingDataset={loadingDataset}
                            topicsData={topicsData}
                            categories={categories}
                            toggleCategory={toggleCategory}
                            cookieConsent={cookieConsent}
                            setShowConsentManager={setShowConsentManager}
                            history={history}
                            clearHistory={clearHistory}
                            replaySession={replaySession}
                        />
                    </Suspense>
                </header>

                <div className="flex-1 w-full flex flex-col items-center">
                    {timerMode === 'none' && (
                        <div className="flex flex-col items-center justify-center flex-1 w-full animate-premium-in">
                            <div className="mb-8 text-center">
                                <div className="inline-flex gap-2 mb-4 px-4 py-2 bg-brand-surface border border-brand-border rounded-full text-xs text-brand-text-muted">
                                    {loadingDataset ? (
                                        <span className="animate-pulse">Fetching dataset...</span>
                                    ) : (
                                        <>
                                            <span>{topicsData ? Object.keys(topicsData).length : 0} Categories</span>
                                            <span className="opacity-20" aria-hidden="true">|</span>
                                            <span>{settings.promptAmount} {settings.promptAmount === 1 ? 'Prompt' : 'Prompts'}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={generateTopics}
                                disabled={loadingDataset}
                                className={`relative w-full sm:w-auto px-8 py-5 sm:px-14 sm:py-7 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:shadow-brand-primary/30 active:scale-95 ${loadingDataset ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-2xl font-bold tracking-wide">
                                    {loadingDataset ? 'Loading...' : 'Generate Prompts'}
                                </span>
                            </button>

                        </div>
                    )}

                    <Suspense fallback={null}>
                        <TopicDisplay
                            timerMode={timerMode}
                            currentTopics={currentTopics}
                            settings={settings}
                            onComplete={() => setTimerMode('speech')}
                            onReturn={handleReturn}
                        />
                    </Suspense>
                </div>
            </main>

            <footer aria-hidden={showSettings} className={`relative z-20 w-full max-w-4xl mx-auto px-6 py-8 border-t border-brand-border/50 text-center transition-[filter,opacity] duration-300 ${showSettings ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setShowAbout(true)}
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors py-2 px-1"
                        >
                            About
                        </button>
                        <a
                            href="https://github.com/ezraclintoc/NCFCAImpromptu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors py-2 px-1"
                        >
                            Source
                        </a>
                        <button
                            onClick={() => setShowConsentManager(true)}
                            className="text-xs font-bold uppercase tracking-widest text-brand-text-muted hover:text-brand-primary transition-colors py-2 px-1"
                        >
                            Privacy
                        </button>
                    </div>
                    <p className="text-[10px] text-brand-text-muted uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} NCFCA Practice Tool
                    </p>
                </div>
            </footer>

            <Suspense fallback={null}>
                <AboutModal
                    showAbout={showAbout}
                    setShowAbout={setShowAbout}
                />
                <ConsentManager
                    onConsent={setCookieConsent}
                    forceOpen={showConsentManager}
                    onClose={() => setShowConsentManager(false)}
                />
            </Suspense>
        </div>
    );
};

export default memo(App);
