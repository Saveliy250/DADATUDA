export interface Event {
    id: number;
    name: string;
    date: string;
    dateEnd?: string;
    address: string;
    imageURL: string[];
    isFavorite: boolean;
    description?: string;
    referralLink?: string;
    price?: string;
    categories?: string[];
}
