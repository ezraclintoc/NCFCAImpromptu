import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ mode, onComplete, autoStart = false, initialTime = 120 }) => {
    const [time, setTime] = useState(mode === 'speech' ? 0 : initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);
    const autoStartTimeoutRef = useRef(null);

    // Handle auto-start with delay
    useEffect(() => {
        if (autoStart) {
            // Delay auto-start by 800ms to let the prompt animation complete
            autoStartTimeoutRef.current = setTimeout(() => {
                setIsRunning(true);
            }, 800);
        }

        return () => {
            if (autoStartTimeoutRef.current) {
                clearTimeout(autoStartTimeoutRef.current);
            }
        };
    }, [autoStart]);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime((prev) => {
                    if (mode === 'prep') {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            setIsRunning(false);
                            onComplete?.();
                            return 0;
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, mode, onComplete]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className={`text-7xl font-mono font-bold transition-colors ${mode === 'prep' && time < 15 ? 'text-red-500 animate-pulse' : 'text-brand-text'
                }`}>
                {formatTime(time)}
            </div>
            <div className="flex gap-4">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${isRunning
                        ? 'bg-brand-text/10 hover:bg-brand-text/20 text-brand-text'
                        : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20'
                        }`}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={() => {
                        setIsRunning(false);
                        setTime(mode === 'speech' ? 0 : initialTime);
                    }}
                    className="px-6 py-2 rounded-full border border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text/30 transition-all font-medium"
                >
                    Reset
                </button>
                {mode === 'prep' && (
                    <button
                        onClick={() => {
                            clearInterval(timerRef.current);
                            setIsRunning(false);
                            onComplete?.();
                        }}
                        className="px-6 py-2 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium"
                    >
                        Skip Prep
                    </button>
                )}
            </div>
        </div>
    );
};

export default Timer;
