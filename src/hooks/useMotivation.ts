import { useState, useMemo } from 'react';
import { MOTIVATION_QUOTES } from '@/constants';

export function useMotivation(): string {
    const [quote] = useState(() => {
        const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
        return MOTIVATION_QUOTES[randomIndex];
    });

    return useMemo(() => quote, [quote]);
}
