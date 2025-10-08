export const formatDate = (date: Date | null): string => {
    if (!date) {
        return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hour}:${minute}`;
};

export const formatEventDateTime = (dateString?: string): { date: string; time: string } => {
    try {
        const date = dateString ? new Date(dateString) : null;
        if (!date || isNaN(date.getTime())) return { date: '??.??', time: '??:??' };
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return { date: `${day}.${month}`, time: `${hours}:${minutes}` };
    } catch {
        return { date: '??.??', time: '??:??' };
    }
};