import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SummaryResult {
    _id: string;
    title: string;
    summarization: string;
    transcript?: string;
    aiResponse?: string;
    url?: string;
    keyPoints?: string[];
    actionPoints?: string[];
}

interface SummaryContextType {
    lastSummary: SummaryResult | null;
    lastSource: 'pdf' | 'audio' | 'video' | 'text' | 'web' | null;
    setSummary: (summary: SummaryResult | null, source: 'pdf' | 'audio' | 'video' | 'text' | 'web' | null) => void;
    clearSummary: () => void;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export const SummaryProvider = ({ children }: { children: ReactNode }) => {
    const [lastSummary, setLastSummary] = useState<SummaryResult | null>(null);
    const [lastSource, setLastSource] = useState<'pdf' | 'audio' | 'video' | 'text' | 'web' | null>(null);

    const setSummary = (summary: SummaryResult | null, source: 'pdf' | 'audio' | 'video' | 'text' | 'web' | null) => {
        setLastSummary(summary);
        setLastSource(source);
    };

    const clearSummary = () => {
        setLastSummary(null);
        setLastSource(null);
    };

    return (
        <SummaryContext.Provider value={{ lastSummary, lastSource, setSummary, clearSummary }}>
            {children}
        </SummaryContext.Provider>
    );
};

export const useSummary = () => {
    const context = useContext(SummaryContext);
    if (context === undefined) {
        throw new Error('useSummary must be used within a SummaryProvider');
    }
    return context;
};
