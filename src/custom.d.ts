declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}

interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_GB_CLIENT_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
