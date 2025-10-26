declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}

declare module '*.css' {
    const classes: Record<string, string>;
    export default classes;
}

declare global {
    interface ImportMetaEnv {
        readonly VITE_BASE_URL: string;
        readonly VITE_GB_CLIENT_KEY: string;
        readonly VITE_METRICA_ID: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

declare global {
    interface Window {
        ym?: (id: number, method: string, ...args: any[]) => void;
    }
}

export {};
