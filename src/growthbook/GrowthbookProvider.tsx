import React, { useEffect, ReactNode } from 'react';

import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { growthbookInit } from './growthbookInit';

interface GrowthbookProviderProps {
    children: ReactNode;
}

export const GrowthbookProvider: React.FC<GrowthbookProviderProps> = ({ children }) => {
    useEffect(() => {
        void growthbookInit.init({ streaming: true });
    }, []);

    return <GrowthBookProvider growthbook={growthbookInit}>{children}</GrowthBookProvider>;
};