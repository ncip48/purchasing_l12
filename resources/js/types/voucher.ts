export type VoucherType = {
    id: string;
    name: string | null;
    price: number | null;
    duration: number | null;
    status: 'ACTIVE' | 'INACTIVE';
};
