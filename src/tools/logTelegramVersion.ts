import WebApp from '@twa-dev/sdk';

export function logTelegramVersion(): void {
    // 1. то, что гарантировано есть в любом клиенте >= 6.0
    const apiVer: string = WebApp.version ?? 'unknown';
    const plat: string = WebApp.platform ?? 'unknown'; // "android" | "ios" | "tdesktop" | ...

    // 2. пробуем достать "настоящий" build-номер клиента
    const ua: string = navigator.userAgent;
    const match: RegExpMatchArray | null = ua.match(/Telegram(?:[^\d]*?)\/([\d.]+)/i);
    const clientVer: string = match ? match[1] : 'unparsed';

    console.log(`[TG-WebApp] API v${apiVer}, platform=${plat}, client=${clientVer}`);
}
