export interface Event {
    id: number;
    name: string;
    date: string;
    dateEnd?: string;
    starred?: boolean;
    address: string;
    imageURL: string[];
    description?: string;
    referralLink?: string;
    price?: string;
    categories?: string[];
}
