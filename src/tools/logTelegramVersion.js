import WebApp from '@twa-dev/sdk';

export function logTelegramVersion() {
    // 1. то, что гарантировано есть в любом клиенте ≥ 6.0
    const apiVer  = WebApp.version ?? 'unknown';
    const plat    = WebApp.platform ?? 'unknown';   // "android" | "ios" | "tdesktop" | …

    // 2. пробуем достать «настоящий» build‑номер клиента
    const ua      = navigator.userAgent;
    const match   = ua.match(/Telegram(?:[^\d]*?)\/([\d.]+)/i);
    const clientVer = match ? match[1] : 'unparsed';

    console.log(`[TG‑WebApp] API v${apiVer}, platform=${plat}, client=${clientVer}`);
}

