import React, { memo } from 'react';
import Timer from './Timer';

const TopicDisplay = ({
    timerMode,
    currentTopics,
    settings,
    onComplete,
    onReturn
}) => {
    if (timerMode === 'none' || currentTopics.length === 0) return null;

    return (
        <div className="w-full max-w-3xl flex flex-col items-center text-center animate-premium-in">
            <div className="mb-12 w-full space-y-6">
                {currentTopics.map((topic) => {
                    const isQuote = topic.category === 'Quotes' || topic.category.includes('Quotes');
                    return (
                        <div key={topic.text}>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border bg-brand-primary/20 text-brand-primary/80 border-brand-primary/30">
                                {topic.category}
                            </span>
                            <h2 className={`text-3xl md:text-4xl xl:text-5xl leading-tight text-brand-text font-bold ${isQuote ? 'italic' : ''}`}>
                                {isQuote && '"'}{topic.text}{isQuote && '"'}
                            </h2>
                        </div>
                    );
                })}
            </div>

            <div className="w-full bg-brand-surface border border-brand-border p-10 rounded-2xl shadow-md mb-8">
                <span className="text-sm font-bold text-brand-text-muted uppercase tracking-widest mb-4 block">
                    {timerMode === 'prep' ? 'Preparation Time' : 'Speaking Time'}
                </span>
                <Timer
                    key={timerMode}
                    mode={timerMode}
                    autoStart={timerMode === 'prep' ? settings.immediatelyStartPrep : false}
                    initialTime={timerMode === 'prep' ? settings.prepTime : settings.speakingTime}
                    onComplete={onComplete}
                    buzz={settings.buzzOnPrepOver}
                />
            </div>

            <button
                onClick={onReturn}
                className="text-brand-text-muted hover:text-brand-text transition-colors font-medium px-6 py-2 rounded-full hover:bg-brand-surface"
            >
                ← Return to Home
            </button>
        </div>
    );
};

export default memo(TopicDisplay);
