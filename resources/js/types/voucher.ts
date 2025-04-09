export type VoucherType = {
    id: string;
    name: string;
    price: number;
    duration: number;
    status: 'ACTIVE' | 'INACTIVE';
};
