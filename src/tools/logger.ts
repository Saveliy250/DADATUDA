export const logger = {
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (e: unknown, msg?: string) => {
    console.error(msg ?? 'error', e);
  },
};
