import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MantineProvider } from '@mantine/core';

import { GrowthbookProvider } from './growthbook/GrowthbookProvider.jsx';

import { BrowserRouter } from 'react-router-dom';

import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <StrictMode>
            <GrowthbookProvider>
                <MantineProvider defaultColorScheme="dark">
                    <App />
                </MantineProvider>
            </GrowthbookProvider>
        </StrictMode>
    </BrowserRouter>,
);
