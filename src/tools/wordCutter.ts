export const wordCutter = (str: string, max = 3): string => {
    if (!str) return '';

    const words = str.trim().split(/\s+/);
    if (words.length <= max) return str;

    return words.slice(0, max).join(' ') + '...';
};
