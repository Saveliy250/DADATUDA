import { useEffect } from 'react';

import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { growthbookInit } from './growthbookInit.js';

export const GrowthbookProvider = ({ children }) => {
    useEffect(() => {
        growthbookInit.init({ streaming: true });
    }, []);

    return <GrowthBookProvider growthbook={growthbookInit}>{children}</GrowthBookProvider>;
};
