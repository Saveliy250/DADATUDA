import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MantineProvider } from '@mantine/core';

import { GrowthbookProvider } from './growthbook/GrowthbookProvider';

import { BrowserRouter } from 'react-router-dom';

import { App } from './App';

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <BrowserRouter>
            <StrictMode>
                <GrowthbookProvider>
                    <MantineProvider defaultColorScheme="light">
                        <App />
                    </MantineProvider>
                </GrowthbookProvider>
            </StrictMode>
        </BrowserRouter>,
    );
}
